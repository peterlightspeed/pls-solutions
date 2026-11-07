import logging

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.audit import AuditEvent, record_audit_event
from app.security.permissions import Permission, Principal, Role, require_permission


def test_guest_can_browse_but_nothing_else():
    g = Principal()
    assert g.can(Permission.SOLUTION_BROWSE)
    for p in (Permission.SOLUTION_USE, Permission.INTEGRATION_MANAGE, Permission.AUDIT_READ):
        assert not g.can(p)


def test_roles_are_server_side_only_and_denied_by_default():
    app = FastAPI()

    @app.post("/x", dependencies=[Depends(require_permission(Permission.INTEGRATION_MANAGE))])
    def x():
        return {"ok": True}

    c = TestClient(app)
    # a client claiming to be an admin changes nothing
    r = c.post("/x", headers={"X-Role": "workspace_admin"}, json={"role": "staff"})
    assert r.status_code == 401


def test_admin_has_integration_permission_but_member_does_not():
    assert Principal(user_id="u", role=Role.WORKSPACE_ADMIN).can(Permission.INTEGRATION_MANAGE)
    assert not Principal(user_id="u", role=Role.MEMBER).can(Permission.INTEGRATION_MANAGE)


def test_audit_event_is_logged(caplog):
    with caplog.at_level(logging.INFO, logger="pls.audit"):
        record_audit_event(AuditEvent(action="solution.run", target="invoice-generator"))
    assert "solution.run" in caplog.text
