from fastapi import APIRouter, Depends, HTTPException, Request

from app.audit import AuditEvent, record_audit_event
from app.clientip import client_ip
from app.security.permissions import Principal, current_principal

from .limits import limits
from .prompt import build_system
from .providers import Provider, ProviderError, build_provider
from .redact import redact
from .schemas import AssistIn, AssistOut, StatusOut

router = APIRouter(prefix="/assist", tags=["assist"])


def get_provider() -> Provider | None:  # a dependency so tests can swap it
    return build_provider()


def _normalise(messages: list[dict]) -> list[dict]:
    """Provider APIs need user/assistant to alternate and start with the user."""
    out: list[dict] = []
    for m in messages:
        if not out and m["role"] != "user":
            continue
        if out and out[-1]["role"] == m["role"]:
            out[-1]["content"] += "\n\n" + m["content"]
        else:
            out.append(dict(m))
    return out


@router.get("/status", response_model=StatusOut)
def status(provider: Provider | None = Depends(get_provider)):
    return StatusOut(available=provider is not None)


@router.post("", response_model=AssistOut)
def assist(payload: AssistIn, request: Request, provider: Provider | None = Depends(get_provider),
           principal: Principal = Depends(current_principal)):
    """Context-aware help. Nothing the visitor types is stored; secrets are redacted before leaving this server."""
    if provider is None:
        raise HTTPException(503, detail={"code": "assistant_off", "message": "The assistant is not available yet."})
    if payload.messages[-1].role != "user":
        raise HTTPException(422, detail={"code": "bad_request", "message": "The last message must be yours."})

    blocked = limits.check(client_ip(request), principal.role.value)
    if blocked:
        record_audit_event(AuditEvent(action="assist.request", outcome="denied", detail={"reason": blocked[0]}))
        raise HTTPException(429, detail={"code": blocked[0], "message": blocked[1]})

    total = 0
    clean: list[dict] = []
    for m in payload.messages:
        text, n = redact(m.text)
        total += n
        clean.append({"role": m.role, "content": text})

    try:
        text = provider.complete(build_system(payload.context), _normalise(clean))
    except ProviderError as e:
        record_audit_event(AuditEvent(action="assist.request", outcome="error", detail={"code": e.code}))
        raise HTTPException(e.status, detail={"code": e.code, "message": e.message}) from None

    record_audit_event(AuditEvent(action="assist.request", outcome="success", detail={"redactions": total, "messages": len(clean)}))
    return AssistOut(text=text, redactions=total)
