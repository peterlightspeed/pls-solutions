"""Domain registration date via RDAP (the public, free system behind lookup.icann.org). Standard library only.

Safety:
  * Only a validated domain (letters, digits, hyphens, dots) is ever placed in the request path.
  * Redirects are followed only to https hosts that are not raw IP addresses.
  * Response size and time are capped. Failures never raise: they return status "unavailable".
  * Results are cached in memory (not stored anywhere). Nothing a visitor types is logged or saved.
"""
import ipaddress
import json
import os
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone

RDAP_BASE = os.environ.get("RDAP_BASE", "https://rdap.org/domain/")
TIMEOUT = 6
MAX_BYTES = 512 * 1024
OK_TTL = 6 * 3600
FAIL_TTL = 300
MAX_CACHE = 512


@dataclass
class Registration:
    status: str  # "ok" | "unavailable"
    registered: datetime | None = None
    expires: datetime | None = None
    registrar: str | None = None


class _SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        u = urllib.parse.urlsplit(newurl)
        host = u.hostname or ""
        try:
            ipaddress.ip_address(host)
            raise urllib.error.URLError("redirect to an IP address blocked")
        except ValueError:
            pass
        if u.scheme != "https" or not host:
            raise urllib.error.URLError("redirect blocked")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def _fetch_json(url: str) -> dict:
    opener = urllib.request.build_opener(_SafeRedirect)
    req = urllib.request.Request(url, headers={"Accept": "application/rdap+json, application/json", "User-Agent": "PLS-Tech-Checker/1.0"})
    with opener.open(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read(MAX_BYTES).decode("utf-8", "replace"))


def _parse_date(value) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        d = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def parse_rdap(data: dict) -> Registration:
    registered = expires = None
    for ev in data.get("events", []) or []:
        action = (ev.get("eventAction") or "").lower()
        if action == "registration" and registered is None:
            registered = _parse_date(ev.get("eventDate"))
        elif action == "expiration" and expires is None:
            expires = _parse_date(ev.get("eventDate"))
    registrar = None
    try:
        for ent in data.get("entities", []) or []:
            if "registrar" in (ent.get("roles") or []):
                for item in ent["vcardArray"][1]:
                    if item[0] == "fn":
                        registrar = str(item[3])[:120]
                        break
    except (KeyError, IndexError, TypeError):
        registrar = None
    if registered is None:
        return Registration("unavailable")
    return Registration("ok", registered, expires, registrar)


_cache: dict[str, tuple[float, Registration]] = {}
_lock = threading.Lock()


def lookup(domain: str, fetch=_fetch_json, clock=time.monotonic) -> Registration:
    now = clock()
    with _lock:
        hit = _cache.get(domain)
        if hit and hit[0] > now:
            return hit[1]
    try:
        result = parse_rdap(fetch(RDAP_BASE + urllib.parse.quote(domain, safe="")))
    except (urllib.error.URLError, OSError, ValueError, TimeoutError):
        result = Registration("unavailable")
    ttl = OK_TTL if result.status == "ok" else FAIL_TTL
    with _lock:
        if len(_cache) >= MAX_CACHE:
            _cache.pop(next(iter(_cache)))
        _cache[domain] = (now + ttl, result)
    return result


def clear_cache() -> None:
    with _lock:
        _cache.clear()
