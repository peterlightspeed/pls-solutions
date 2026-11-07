"""Assistant settings, read from environment variables at call time (so changes and tests take effect cleanly).

ANTHROPIC_API_KEY             required to turn the assistant on. If missing, the assistant is simply off.
ASSIST_PROVIDER               "anthropic" (default). Other providers can be added in providers.py.
ASSIST_MODEL                  model id, default "claude-haiku-5-5" (fast and low cost).
ASSIST_MAX_TOKENS             max reply length, default 700.
ASSIST_GUEST_LIMIT_PER_HOUR   messages per guest per hour, default 10.
ASSIST_MEMBER_LIMIT_PER_HOUR  messages per signed-in member per hour, default 40 (used once accounts exist).
ASSIST_DAILY_CAP              total assistant calls per day across everyone, default 300 (cost safety net).
TRUST_PROXY                   "1" on Render/Vercel-style hosts so the real client IP is read from X-Forwarded-For.
"""
import os


def _int(name: str, default: int) -> int:
    try:
        return max(1, int(os.environ.get(name, default)))
    except ValueError:
        return default


def api_key() -> str | None:
    return os.environ.get("ANTHROPIC_API_KEY") or None


def provider_name() -> str:
    return os.environ.get("ASSIST_PROVIDER", "anthropic").lower()


def model() -> str:
    return os.environ.get("ASSIST_MODEL", "claude-haiku-5-5")


def max_tokens() -> int:
    return _int("ASSIST_MAX_TOKENS", 700)


def hourly_limit(role: str) -> int:
    if role == "guest":
        return _int("ASSIST_GUEST_LIMIT_PER_HOUR", 10)
    return _int("ASSIST_MEMBER_LIMIT_PER_HOUR", 40)


def daily_cap() -> int:
    return _int("ASSIST_DAILY_CAP", 300)


def trust_proxy() -> bool:
    return os.environ.get("TRUST_PROXY", "") == "1"
