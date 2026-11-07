from sqlalchemy import create_engine, inspect, text

from app.additive_migrate import add_missing_nullable_columns
from app.solutions.db import Base
from app.waitlist import models as _w  # noqa: F401


def test_adds_missing_nullable_columns_and_keeps_rows(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path}/old.db")
    with engine.begin() as c:  # the OLD waitlist table, before role/interest existed
        c.execute(text("CREATE TABLE waitlist_signups (id INTEGER PRIMARY KEY, email VARCHAR(254) NOT NULL, source VARCHAR(24), created_at DATETIME)"))
        c.execute(text("INSERT INTO waitlist_signups (email, source) VALUES ('keep@example.com', 'waitlist')"))
    added = add_missing_nullable_columns(engine, Base.metadata)
    assert {"waitlist_signups.role", "waitlist_signups.interest"} <= set(added)
    cols = {c["name"] for c in inspect(engine).get_columns("waitlist_signups")}
    assert {"role", "interest"} <= cols
    with engine.connect() as c:
        assert c.execute(text("SELECT email FROM waitlist_signups")).scalar() == "keep@example.com"
    assert add_missing_nullable_columns(engine, Base.metadata) == []  # idempotent
