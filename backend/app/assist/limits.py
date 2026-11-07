"""Usage limits for the assistant: per-visitor per hour (by role) and one daily cap for the whole service.

Single-process, in-memory (same caveat as app/solutions/ratelimit.py): fine for one Render instance; use Redis before
running several workers. TODO(accounts): key by user id for signed-in members instead of IP.
"""
import threading
import time
from collections import defaultdict, deque
from datetime import date

from . import config


class AssistLimits:
    def __init__(self):
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._day = date.today()
        self._day_count = 0
        self._lock = threading.Lock()

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()
            self._day_count = 0
            self._day = date.today()

    def check(self, key: str, role: str) -> tuple[str, str] | None:
        """Record one call. Returns (code, safe_message) when blocked, else None."""
        now = time.monotonic()
        with self._lock:
            today = date.today()
            if today != self._day:
                self._day, self._day_count = today, 0
            if self._day_count >= config.daily_cap():
                return "daily_cap", "The assistant has reached today’s limit. Please try again tomorrow."
            hits = self._hits[key]
            while hits and now - hits[0] > 3600:
                hits.popleft()
            if len(hits) >= config.hourly_limit(role):
                return "hourly_limit", "You have used your assistant messages for this hour. Please try again later."
            hits.append(now)
            self._day_count += 1
            if len(self._hits) > 5000:  # keep memory bounded
                for k in [k for k, v in self._hits.items() if not v or now - v[-1] > 3600]:
                    del self._hits[k]
            return None


limits = AssistLimits()
