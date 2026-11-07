"""AI providers. The rest of the app talks to the small `Provider` interface, so adding Gemini, OpenAI or a local
model means adding one class here and one line in `build_provider`; nothing else changes.

The provider key lives only in server environment variables. It is never sent to the browser or logged.
"""
import logging
from typing import Protocol

import httpx

from . import config

log = logging.getLogger("pls.assist")


class ProviderError(Exception):
    """Carries a SAFE message and an HTTP status for the caller. Never contains provider response bodies."""

    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status, self.code, self.message = status, code, message


class Provider(Protocol):
    def complete(self, system: str, messages: list[dict]) -> str: ...


class AnthropicProvider:
    URL = "https://api.anthropic.com/v1/messages"

    def __init__(self, api_key: str, model: str, max_tokens: int, transport: httpx.BaseTransport | None = None):
        self._key, self._model, self._max = api_key, model, max_tokens
        self._transport = transport

    def complete(self, system: str, messages: list[dict]) -> str:
        body = {"model": self._model, "max_tokens": self._max, "system": system, "messages": messages}
        headers = {"x-api-key": self._key, "anthropic-version": "2023-06-01", "content-type": "application/json"}
        try:
            with httpx.Client(timeout=30, transport=self._transport) as client:
                r = client.post(self.URL, json=body, headers=headers)
        except httpx.HTTPError:
            log.warning("assistant provider unreachable or timed out")
            raise ProviderError(502, "provider_unreachable", "The assistant could not be reached. Please try again shortly.") from None
        if r.status_code in (401, 403):
            log.error("assistant provider rejected the API key (check ANTHROPIC_API_KEY)")
            raise ProviderError(502, "provider_misconfigured", "The assistant is not set up correctly. Please contact support.")
        if r.status_code == 429:
            log.warning("assistant provider rate limited us")
            raise ProviderError(503, "provider_busy", "The assistant is very busy right now. Please try again in a minute.")
        if r.status_code >= 400:
            log.warning("assistant provider error status=%s", r.status_code)
            raise ProviderError(502, "provider_error", "The assistant had a problem. Please try again shortly.")
        try:
            blocks = r.json().get("content", [])
            text = "".join(b.get("text", "") for b in blocks if b.get("type") == "text").strip()
        except ValueError:
            text = ""
        if not text:
            raise ProviderError(502, "provider_empty", "The assistant did not return an answer. Please try again.")
        return text


def build_provider() -> Provider | None:
    """None means the assistant is off (no key configured or unknown provider)."""
    if config.provider_name() == "anthropic" and config.api_key():
        return AnthropicProvider(config.api_key(), config.model(), config.max_tokens())
    return None
