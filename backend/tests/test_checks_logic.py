"""Pure-logic tests for the business check (no FastAPI, no network)."""
import urllib.error
from datetime import datetime, timedelta, timezone

from app.checks import rdap
from app.checks.assess import assess, scan_offer
from app.checks.domain import InputError, parse_website, registrable_domain
from app.checks.rdap import Registration

NOW = datetime(2026, 11, 7, tzinfo=timezone.utc)


def _reg(days):
    return Registration("ok", NOW - timedelta(days=days), NOW + timedelta(days=300), "Example Registrar")


def _raises(fn, *a):
    try:
        fn(*a)
    except InputError:
        return True
    return False


def test_parse_basic_url():
    p = parse_website("https://www.Example.com/path?x=1#y")
    assert (p.host, p.registrable, p.scheme, p.kind) == ("www.example.com", "example.com", "https", "domain")


def test_registrable_domain_country_endings():
    assert registrable_domain("shop.example.com.ng") == "example.com.ng"
    assert registrable_domain("a.b.co.uk") == "b.co.uk"
    assert registrable_domain("www.example.org") == "example.org"


def test_userinfo_trick_uses_real_host():
    p = parse_website("https://paypal.com@evil.com/login")
    assert p.host == "evil.com" and p.has_userinfo


def test_ip_addresses_are_never_domains():
    for raw in ("http://192.168.0.1/x", "http://[::1]/", "10.0.0.5"):
        p = parse_website(raw)
        assert p.is_ip and p.kind == "ip" and p.registrable is None


def test_rejects_bad_input():
    for raw in ("", "ftp://x.com", "localhost", "x.local", "exa mple.com", "javascript:alert(1)", "http://", "a" * 400, "x.123"):
        assert _raises(parse_website, raw), raw


def test_idn_becomes_punycode_and_is_flagged():
    p = parse_website("https://exämple.com")
    assert p.host.startswith("xn--") and p.is_idn
    out = assess(p, _reg(900), None, "not_checked", "not_checked", NOW)
    assert "lookalike" in {f["id"] for f in out["flags"]}


def test_kinds():
    assert parse_website("https://bit.ly/abc").kind == "shortener"
    assert parse_website("https://instagram.com/somebody").kind == "social"
    assert parse_website("https://my-shop.vercel.app").kind == "platform"


def test_parse_rdap_and_cache():
    data = {
        "events": [{"eventAction": "registration", "eventDate": "2020-01-02T03:04:05Z"}, {"eventAction": "expiration", "eventDate": "2027-01-02T00:00:00Z"}],
        "entities": [{"roles": ["registrar"], "vcardArray": ["vcard", [["version", {}, "text", "4.0"], ["fn", {}, "text", "Acme Registrar"]]]}],
    }
    r = rdap.parse_rdap(data)
    assert r.status == "ok" and r.registered.year == 2020 and r.registrar == "Acme Registrar"
    assert rdap.parse_rdap({"events": []}).status == "unavailable"

    rdap.clear_cache()
    calls = []

    def fetch(url):
        calls.append(url)
        return data

    assert rdap.lookup("example.com", fetch=fetch).status == "ok"
    assert rdap.lookup("example.com", fetch=fetch).status == "ok"
    assert len(calls) == 1 and calls[0].endswith("/example.com")


def test_rdap_failure_never_raises():
    rdap.clear_cache()

    def boom(url):
        raise urllib.error.URLError("down")

    assert rdap.lookup("nope.example", fetch=boom).status == "unavailable"


def test_new_domain_is_high_risk():
    out = assess(parse_website("https://new-site.com"), _reg(10), None, "not_checked", "not_checked", NOW)
    assert out["summary"]["level"] == "high" and out["summary"]["counts"]["high"] >= 1
    assert out["website"]["age_days"] == 10 and out["website"]["lookup"] == "ok"


def test_clear_requires_age_cac_and_sec():
    p = parse_website("https://old-business.com")
    out = assess(p, _reg(2000), None, "found_active", "not_applicable", NOW)
    assert out["summary"]["level"] == "clear" and "not a guarantee" in out["summary"]["message"]
    out = assess(p, _reg(2000), None, "not_checked", "not_applicable", NOW)
    assert out["summary"]["level"] == "incomplete"


def test_unavailable_lookup_is_unknown_not_a_flag():
    out = assess(parse_website("https://some-site.ng"), Registration("unavailable"), None, "found_active", "not_applicable", NOW)
    states = {c["id"]: c["state"] for c in out["checks"]}
    assert states["website_age"] == "unknown" and out["summary"]["counts"]["high"] == 0


def test_offer_text_rules_and_evidence():
    text = "Invest N50,000 and get 30% weekly, guaranteed! Limited slots. Refer friends for a referral bonus. Send to my account."
    flags, investment_like = scan_offer(text)
    ids = {f.id for f in flags}
    assert {"guaranteed", "fixed_returns", "pressure", "recruit", "personal_account"} <= ids and investment_like
    assert all(f.evidence and len(f.evidence) <= 100 for f in flags)
    assert scan_offer("We sell shoes. Delivery in 3 days.")[0] == []
    assert "recruit" in {f.id for f in scan_offer("Refer friends and earn")[0]}
    assert "Guaranteed" in next(f.evidence for f in scan_offer("Profit Is Guaranteed Today")[0] if f.id == "guaranteed")


def test_sec_not_found_is_high_only_for_investment_offers():
    shop = assess(None, None, "We sell shoes", "found_active", "not_found", NOW)
    inv = assess(None, None, "Guaranteed 20% monthly returns", "found_active", "not_found", NOW)
    sev = lambda out: next(f["severity"] for f in out["flags"] if f["id"] == "sec_not_found")
    assert sev(shop) == "medium" and sev(inv) == "high"


def test_cac_results_flow_through():
    assert assess(None, None, None, "not_found", "not_checked", NOW)["summary"]["level"] == "high"
    assert assess(None, None, None, "found_inactive", "not_checked", NOW)["summary"]["level"] == "high"


def test_two_low_flags_give_caution():
    p = parse_website("http://my-fast-cash-now.example.com")
    out = assess(p, _reg(2000), None, "found_active", "not_applicable", NOW)
    assert out["summary"]["level"] == "caution"


def test_no_percentage_or_scam_verdict_in_output():
    out = assess(parse_website("https://new-site.com"), _reg(5), "guaranteed returns", "not_found", "warned", NOW)
    blob = repr(out).lower()
    assert "percent" not in blob and "score" not in blob and "is a scam" not in blob
    assert out["disclaimer"]
