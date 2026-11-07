"""Rule-based assessment. Standard library only.

Every flag comes from a visible rule with evidence. There is NO percentage and no "scam" verdict: we have no data to
calibrate a probability, and calling a real business a scam is a serious claim. The output is a risk LEVEL plus the
list of warning signs that led to it, so a person can see exactly why.
"""
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone

from .domain import INVESTMENT_WORDS, Parsed
from .rdap import Registration

DISCLAIMER = (
    "This tool reports warning signs from public records and the text you give it. It is not legal or financial "
    "advice, and it is not a verdict about any business. Registered does not mean trustworthy, and not found does not "
    "prove fraud (spelling, brand-new registrations and lookup gaps happen)."
)

# (id, severity, title, regex). Matched against lower-cased text with curly quotes normalised.
OFFER_RULES = [
    ("guaranteed", "high", "Promises guaranteed or risk-free returns",
     r"\b(?:guarantee[ds]?|assured (?:profit|return)s?|risk[- ]?free|no[- ]risk|zero[- ]risk|100\s*%\s*(?:safe|profit|return)s?)\b"),
    ("fixed_returns", "high", "Promises a fixed, high return over a short time",
     r"\b\d{1,4}\s*%\s*(?:daily|per day|a day|weekly|per week|a week|monthly|per month|a month)\b"),
    ("double_money", "high", "Promises to double or multiply your money",
     r"\b(?:double|triple|multiply)\s+(?:your\s+)?(?:money|investment|capital)\b|\b[2-9]x\s+(?:your\s+)?(?:money|returns?)\b|\bdoubl\w*\s+in\s+\d+\s*(?:days?|weeks?|hours?)\b"),
    ("pressure", "medium", "Uses pressure to make you act fast",
     r"\b(?:limited (?:slots?|spots?)|only \d+ (?:slots?|spots?)|act now|last chance|today only|hurry|closing soon|don't miss|expires (?:today|tonight))\b"),
    ("recruit", "medium", "Rewards you for bringing in other people",
     r"\b(?:referral[s]?|downline|recruit\w*|refer (?:your |a )?friends?|invite (?:your )?friends|bring (?:your )?friends|team bonus)\b"),
    ("personal_account", "medium", "Asks you to pay a personal account, crypto or gift cards",
     r"\b(?:personal account|send (?:it )?to (?:this|my) account|usdt|bitcoin|btc|gift ?cards?)\b"),
    ("secrecy", "low", "Asks you to keep it secret",
     r"\b(?:don't tell|keep (?:it )?secret|confidential opportunity|insider)\b"),
    ("claims_approval", "info", "Claims approval or a licence: verify it yourself",
     r"\b(?:sec|cbn|cac|nafdac)[- ]?(?:approved|registered|licen[cs]ed|certified)\b|\blicen[cs]ed by (?:the )?(?:sec|cbn)\b"),
]
INVESTMENT_RULE_IDS = {"guaranteed", "fixed_returns", "double_money"}
SEVERITY_ORDER = {"high": 0, "medium": 1, "low": 2, "info": 3}


@dataclass
class Flag:
    id: str
    severity: str
    title: str
    detail: str
    evidence: str | None = None


@dataclass
class Check:
    id: str
    title: str
    state: str  # ok | flagged | unknown | todo
    summary: str


def age_text(days: int) -> str:
    if days < 1:
        return "less than a day"
    if days < 60:
        return f"{days} day{'s' if days != 1 else ''}"
    if days < 730:
        months = days // 30
        return f"{months} months"
    return f"{days // 365} years"


def _snippet(text: str, m: re.Match, original: str | None = None) -> str:
    src = original if original is not None and len(original) == len(text) else text  # keep the person's capitalisation
    s = max(0, m.start() - 15)
    out = src[s:m.end() + 15].replace("\n", " ").strip()
    return ("…" if s else "") + out[:90]


def scan_offer(text: str) -> tuple[list[Flag], bool]:
    t = text.lower().replace("’", "'").replace("‘", "'")
    flags: list[Flag] = []
    for rid, sev, title, rx in OFFER_RULES:
        m = re.search(rx, t)
        if m:
            flags.append(Flag(rid, sev, title, "Found in the text you pasted.", _snippet(t, m, text)))
    investment_like = any(f.id in INVESTMENT_RULE_IDS for f in flags) or bool(re.search(r"\binvest", t))
    return flags, investment_like


def assess(
    parsed: Parsed | None,
    reg: Registration | None,
    offer_text: str | None,
    cac: str,
    sec: str,
    now: datetime | None = None,
) -> dict:
    now = now or datetime.now(timezone.utc)
    flags: list[Flag] = []
    checks: list[Check] = []
    web_info = None
    investment_like = False

    # ---- 1 & 2: website age and link safety -------------------------------------------------------------------
    link_flags: list[Flag] = []
    if parsed is None:
        checks.append(Check("website_age", "Website age", "todo", "Add the website address to check how old it is."))
        checks.append(Check("link_safety", "Link safety", "todo", "Add the website address to check the link itself."))
    else:
        if parsed.has_userinfo:
            link_flags.append(Flag("userinfo", "high", "The link hides its real destination",
                                   "Text before an @ sign in a link is not the website. The real site is the part after it.", parsed.host))
        if parsed.is_ip:
            link_flags.append(Flag("ip_address", "medium", "The link uses a number address, not a website name", "Real businesses almost always use a proper name.", parsed.host))
        if parsed.kind == "shortener":
            link_flags.append(Flag("shortener", "medium", "Shortened link hides where it goes", "Open it carefully, or ask for the full address.", parsed.host))
        if parsed.kind == "social":
            link_flags.append(Flag("social_profile", "low", "This is a social or chat profile, not a business website",
                                   "Anyone can create one in minutes. Ask for the official website and registration details.", parsed.host))
        if parsed.kind == "platform":
            link_flags.append(Flag("free_platform", "low", "Hosted on a free page platform",
                                   "The address says nothing about the business's age. Free pages are quick to create.", parsed.host))
        if parsed.is_punycode or parsed.is_idn:
            link_flags.append(Flag("lookalike", "medium", "Address uses special characters",
                                   "Some letters can imitate others to copy a known brand. Compare the address carefully.", parsed.host))
        if parsed.scheme == "http":
            link_flags.append(Flag("insecure", "low", "The link is not encrypted (http)", "Do not enter passwords or card details on it.", parsed.host))
        first_label = parsed.host.split(".")[0]
        if first_label.count("-") >= 3:
            link_flags.append(Flag("many_hyphens", "low", "Many hyphens in the address", "Throwaway sites often use long hyphenated names.", parsed.host))
        if INVESTMENT_WORDS.search(parsed.registrable or ""):
            investment_like = True
            link_flags.append(Flag("investment_name", "info", "The name sounds like an investment business",
                                   "Businesses that take investments must be registered with the SEC. Check the SEC register.", parsed.registrable))
        flags += link_flags

        skip_age = parsed.is_ip or parsed.kind in ("shortener", "social", "platform")
        web_info = {
            "input": parsed.original[:300], "host": parsed.host, "registrable_domain": parsed.registrable,
            "registered_on": None, "expires_on": None, "age_days": None, "age_text": None, "registrar": None,
            "lookup": "skipped" if skip_age else "unavailable",
        }
        if skip_age:
            checks.append(Check("website_age", "Website age", "unknown", "Not applicable: this address doesn't belong to the business itself."))
        elif reg and reg.status == "ok" and reg.registered:
            days = max(0, (now - reg.registered).days)
            web_info.update(lookup="ok", registered_on=reg.registered.date().isoformat(), age_days=days, age_text=age_text(days),
                            expires_on=reg.expires.date().isoformat() if reg.expires else None, registrar=reg.registrar)
            ev = f"Registered {reg.registered.date().isoformat()} ({age_text(days)} ago)"
            if days < 30:
                flags.append(Flag("new_domain", "high", "The website was created less than a month ago", "Brand-new sites are the most common mark of a throwaway scam page.", ev))
                checks.append(Check("website_age", "Website age", "flagged", f"Only {age_text(days)} old."))
            elif days < 180:
                flags.append(Flag("young_domain", "medium", "The website is under 6 months old", "Real businesses can be new too, but ask what else proves they exist.", ev))
                checks.append(Check("website_age", "Website age", "flagged", f"{age_text(days)} old."))
            elif days < 365:
                flags.append(Flag("recent_domain", "low", "The website is under a year old", "Not alarming alone. Look at the other checks.", ev))
                checks.append(Check("website_age", "Website age", "flagged", f"{age_text(days)} old."))
            else:
                checks.append(Check("website_age", "Website age", "ok", f"Registered {age_text(days)} ago. Age alone proves nothing: old domains can be bought."))
        else:
            checks.append(Check("website_age", "Website age", "unknown",
                                "We couldn't read the registration date. Some domain endings don't publish it. Try lookup.icann.org yourself."))
        if any(f.severity in ("high", "medium", "low") for f in link_flags):
            checks.append(Check("link_safety", "Link safety", "flagged", f"{sum(1 for f in link_flags if f.severity != 'info')} warning sign(s) in the link."))
        else:
            checks.append(Check("link_safety", "Link safety", "ok", "Nothing unusual in the link itself."))

    # ---- 3: offer wording --------------------------------------------------------------------------------------
    text = (offer_text or "").strip()
    if not text:
        checks.append(Check("offer_wording", "Offer wording", "todo", "Paste what they promised (ad, DM or message) to scan it for warning phrases."))
    else:
        offer_flags, offer_invest = scan_offer(text)
        investment_like = investment_like or offer_invest
        flags += offer_flags
        warn = [f for f in offer_flags if f.severity in ("high", "medium", "low")]
        if warn:
            checks.append(Check("offer_wording", "Offer wording", "flagged", f"{len(warn)} warning phrase type(s) found."))
        else:
            checks.append(Check("offer_wording", "Offer wording", "ok", "No common warning phrases found. That is not proof it's safe."))

    # ---- 4: CAC (person-reported) -----------------------------------------------------------------------------
    if cac == "found_active":
        checks.append(Check("cac", "CAC registration", "ok", "You found it as registered and active."))
    elif cac == "found_inactive":
        flags.append(Flag("cac_inactive", "high", "The company is registered but not active", "You reported the CAC record is not active.", None))
        checks.append(Check("cac", "CAC registration", "flagged", "Found, but not active."))
    elif cac == "not_found":
        flags.append(Flag("cac_not_found", "high", "No CAC record found", "Try other spellings and the RC number first. If it still isn't there, don't send money.", None))
        checks.append(Check("cac", "CAC registration", "flagged", "No record found."))
    else:
        checks.append(Check("cac", "CAC registration", "todo", "Search the company on the CAC public search, then tell us what you found."))

    # ---- 5: SEC (person-reported) -----------------------------------------------------------------------------
    if sec == "registered":
        checks.append(Check("sec", "SEC registration", "ok", "You found it on the SEC register."))
    elif sec == "not_applicable":
        checks.append(Check("sec", "SEC registration", "ok", "Not an investment business, so SEC registration isn't needed."))
    elif sec == "warned":
        flags.append(Flag("sec_warned", "high", "Listed in an SEC warning or enforcement list", "You reported the SEC has publicly flagged it.", None))
        checks.append(Check("sec", "SEC registration", "flagged", "Flagged by the SEC."))
    elif sec == "not_found":
        sev = "high" if investment_like else "medium"
        flags.append(Flag("sec_not_found", sev, "Not found on the SEC register",
                          "Only SEC-registered operators may take investments in Nigeria." if investment_like else "Only matters if they take investments or promise returns.", None))
        checks.append(Check("sec", "SEC registration", "flagged", "Not found."))
    else:
        note = "This looks like an investment offer: check the SEC register before sending money." if investment_like \
            else "Only needed if they take investments or promise returns."
        checks.append(Check("sec", "SEC registration", "todo", note))

    # ---- summary ---------------------------------------------------------------------------------------------
    flags.sort(key=lambda f: SEVERITY_ORDER[f.severity])
    counts = {s: sum(1 for f in flags if f.severity == s) for s in ("high", "medium", "low")}
    by_id = {c.id: c for c in checks}
    required_todo = [i for i in ("website_age", "cac", "sec") if by_id[i].state == "todo"]
    done = sum(1 for c in checks if c.state != "todo")

    if counts["high"]:
        level, label = "high", "High risk signals"
        msg = f"{counts['high']} serious warning sign{'s' if counts['high'] != 1 else ''} found. Don't send money until you can explain each one."
    elif counts["medium"] or counts["low"] >= 2:
        level, label = "caution", "Some concerns"
        msg = "Something here needs a closer look before you pay. Ask the business to explain it."
    elif required_todo:
        level, label = "incomplete", "Not enough checked yet"
        msg = f"{len(checks) - done} of {len(checks)} checks still to do. Finish them before you trust this business."
    else:
        level, label = "clear", "No red flags found"
        msg = "No red flags in the checks you completed. This is not a guarantee: stay careful before sending money."

    return {
        "summary": {"level": level, "label": label, "message": msg, "counts": counts, "checks_done": done, "checks_total": len(checks)},
        "flags": [f.__dict__ for f in flags],
        "checks": [c.__dict__ for c in checks],
        "website": web_info,
        "disclaimer": DISCLAIMER,
    }
