"""Minimal in-memory rate limiter.

DEV/SINGLE-PROCESS ONLY: state is per-process and lost on restart, so it does
not protect a multi-worker deployment. TODO: replace with Redis-backed limiting
(the architecture already calls for Redis). Behind a proxy set TRUST_PROXY=1
so each visitor gets their own limit (see app/clientip.py).
"""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from app.clientip import client_ip


class InMemoryRateLimiter:
    def __init__(self, max_calls: int, window_seconds: int):
        self.max_calls = max_calls
        self.window = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def reset(self) -> None:
        self._hits.clear()

    def __call__(self, request: Request) -> None:
        key = client_ip(request)  # real visitor IP behind a proxy when TRUST_PROXY=1 (see app/clientip.py)
        now = time.monotonic()
        hits = self._hits[key]
        while hits and now - hits[0] > self.window:
            hits.popleft()
        if len(hits) >= self.max_calls:
            raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
        hits.append(now)


# 5 solution requests per hour per IP.
request_limiter = InMemoryRateLimiter(max_calls=5, window_seconds=3600)
