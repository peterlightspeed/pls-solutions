"""Real client IP for rate limits.

Behind a proxy (Render, Vercel, Cloudflare) `request.client.host` is the PROXY's address, so every visitor would share
one rate-limit bucket. With TRUST_PROXY=1 we read X-Forwarded-For and take the RIGHTMOST entry: that is the address the
platform's own proxy appended, which a visitor cannot forge (the left side can be spoofed). Assumes ONE trusted proxy hop.
Without TRUST_PROXY we use the direct peer address (correct for local development).
"""
import os

from fastapi import Request


def client_ip(request: Request) -> str:
    if os.environ.get("TRUST_PROXY", "") == "1":
        xff = request.headers.get("x-forwarded-for", "")
        parts = [p.strip() for p in xff.split(",") if p.strip()]
        if parts:
            return parts[-1]
    return request.client.host if request.client else "unknown"
