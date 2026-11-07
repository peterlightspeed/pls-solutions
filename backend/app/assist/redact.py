"""Best-effort removal of secrets from text BEFORE it leaves our server for an AI provider.

This is a safety net, not a guarantee. People are also told not to paste secrets. Add patterns as you meet new ones.
Deliberately does not touch 40-character hex strings, because git commit hashes look the same and are commonly pasted.
"""
import re

_PRIVATE_KEY = re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----.*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)", re.S)
_URL_CREDS = re.compile(r"(\b[a-zA-Z][a-zA-Z0-9+.-]*://[^\s:/@]+:)([^\s@/]+)(@)")
_KV = re.compile(
    r"(?i)\b(password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key|client[_-]?secret|private[_-]?key)\b"
    r"(\s*[:=]\s*)([\"']?)([^\s\"']{4,})(\3)"
)
_TOKENS = [
    re.compile(r"\bsk-[A-Za-z0-9_-]{16,}"),                       # OpenAI / Anthropic style keys
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),                          # AWS access key id
    re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}"),                  # GitHub tokens
    re.compile(r"\bglpat-[A-Za-z0-9_-]{16,}"),                    # GitLab tokens
    re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}"),                # Slack tokens
    re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"),                     # Google API keys
    re.compile(r"\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}"),  # JWTs
    re.compile(r"(?i)\bBearer\s+[A-Za-z0-9._~+/=-]{16,}"),        # bearer tokens
]


def redact(text: str) -> tuple[str, int]:
    """Return (clean_text, number_of_redactions)."""
    count = 0

    def sub(pattern, repl, s):
        nonlocal count
        s, n = pattern.subn(repl, s)
        count += n
        return s

    text = sub(_PRIVATE_KEY, "[REDACTED_PRIVATE_KEY]", text)
    text = sub(_URL_CREDS, r"\1[REDACTED]\3", text)
    for p in _TOKENS:
        text = sub(p, "[REDACTED_TOKEN]", text)
    text = sub(_KV, lambda m: f"{m.group(1)}{m.group(2)}{m.group(3)}[REDACTED]{m.group(5)}", text)
    return text, count
