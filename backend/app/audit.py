"""Audit logging interface (scaffolding). Sensitive actions should call `record_audit_event`.

Today it only writes a structured log line. TODO(audit): persist to an append-only `audit_events` table
(who, workspace, action, target, outcome, time, request id). Never put secrets, tokens or document
contents in `detail`.
"""
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone

_log = logging.getLogger("pls.audit")


@dataclass(frozen=True)
class AuditEvent:
    action: str                      # e.g. "integration.connect", "solution.run", "permission.denied"
    actor_id: str | None = None
    workspace_id: str | None = None
    target: str | None = None        # e.g. a solution slug or connector id
    outcome: str = "success"         # success | denied | error
    detail: dict = field(default_factory=dict)
    at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


def record_audit_event(event: AuditEvent) -> None:
    _log.info("audit action=%s actor=%s workspace=%s target=%s outcome=%s",
              event.action, event.actor_id, event.workspace_id, event.target, event.outcome)
