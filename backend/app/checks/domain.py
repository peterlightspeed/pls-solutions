"""Turns whatever a person pastes (link, domain, ad URL) into a safe, validated host. Standard library only.

Security: the host we later look up is restricted to letters, digits and hyphens, so it can never smuggle a path,
port, credentials or an internal address into an outbound request. IP addresses are recognised but never looked up.
"""
import ipaddress
import re
from dataclasses import dataclass
from urllib.parse import urlsplit

RESERVED_TLDS = {"local", "localhost", "internal", "test", "example", "invalid", "lan", "home", "corp", "intranet", "onion"}
# Second-level labels used under country endings, e.g. company.com.ng, shop.co.uk, store.co.za
SECOND_LEVEL = {"com", "co", "org", "net", "gov", "edu", "ac", "or", "sch", "mil"}

SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "cutt.ly", "rebrand.ly", "is.gd", "ow.ly", "buff.ly", "shorturl.at", "tiny.cc", "rb.gy"}
SOCIAL = {
    "instagram.com", "facebook.com", "fb.com", "fb.me", "tiktok.com", "x.com", "twitter.com", "t.me", "telegram.me",
    "wa.me", "whatsapp.com", "youtube.com", "youtu.be", "snapchat.com", "linkedin.com", "linktr.ee",
}
FREE_PLATFORMS = {
    "blogspot.com", "wixsite.com", "weebly.com", "wordpress.com", "github.io", "vercel.app", "netlify.app", "pages.dev",
    "web.app", "firebaseapp.com", "herokuapp.com", "carrd.co", "godaddysites.com", "webflow.io", "framer.app", "onrender.com",
}
INVESTMENT_WORDS = re.compile(r"(invest|profit|forex|crypto|wealth|fund|capital|trading|trader|roi|returns|mining|yield|ponzi)")


class InputError(ValueError):
    """Message is safe to show to the person."""


@dataclass
class Parsed:
    original: str
    host: str
    registrable: str | None  # None for IP addresses
    scheme: str | None
    has_userinfo: bool       # https://paypal.com@evil.com  -> the real host is evil.com
    is_ip: bool
    is_idn: bool             # typed with non-ASCII letters (converted to punycode)
    is_punycode: bool        # any label starts with xn--
    kind: str                # "ip" | "shortener" | "social" | "platform" | "domain"


def registrable_domain(host: str) -> str:
    labels = host.split(".")
    if len(labels) >= 3 and len(labels[-1]) == 2 and labels[-2] in SECOND_LEVEL:
        return ".".join(labels[-3:])
    return ".".join(labels[-2:])


def _valid_label(label: str) -> bool:
    return bool(re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label))


def parse_website(raw: str) -> Parsed:
    s = (raw or "").strip()
    if not s or len(s) > 300:
        raise InputError("Enter a website address, for example https://example.com")
    if any(ord(c) < 32 or c in " \t\r\n\\" for c in s):
        raise InputError("That doesn't look like a single web address. Paste just the link.")

    scheme = None
    rest = s
    if "://" in s:
        scheme, rest = s.split("://", 1)
        scheme = scheme.lower()
        if scheme not in ("http", "https"):
            raise InputError("Only web links (starting with http or https) can be checked.")

    authority = re.split(r"[/?#]", rest, maxsplit=1)[0]
    has_userinfo = "@" in authority
    hostport = authority.rsplit("@", 1)[-1].strip()

    m6 = re.fullmatch(r"\[([0-9a-fA-F:.]+)\](?::\d{1,5})?", hostport)
    host = m6.group(1) if m6 else re.sub(r":\d{1,5}$", "", hostport)
    host = host.strip(".").lower()
    if not host:
        raise InputError("Enter a website address, for example https://example.com")

    try:
        ipaddress.ip_address(host)
        return Parsed(s, host, None, scheme, has_userinfo, True, False, False, "ip")
    except ValueError:
        pass

    is_idn = False
    try:
        host.encode("ascii")
    except UnicodeEncodeError:
        try:
            host = host.encode("idna").decode("ascii")
            is_idn = True
        except UnicodeError:
            raise InputError("That address contains characters we can't read. Check it and try again.") from None

    labels = host.split(".")
    if len(host) > 253 or len(labels) < 2 or not all(_valid_label(lb) for lb in labels):
        raise InputError("That doesn't look like a valid website address. Check it and try again.")
    tld = labels[-1]
    if tld in RESERVED_TLDS or not (tld.isalpha() or tld.startswith("xn--")):
        raise InputError("That doesn't look like a public website address.")

    reg = registrable_domain(host)
    if reg in SHORTENERS:
        kind = "shortener"
    elif reg in SOCIAL:
        kind = "social"
    elif reg in FREE_PLATFORMS:
        kind = "platform"
    else:
        kind = "domain"
    return Parsed(s, host, reg, scheme, has_userinfo, False, is_idn, any(lb.startswith("xn--") for lb in labels), kind)
