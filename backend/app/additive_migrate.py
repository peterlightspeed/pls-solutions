"""Startup safety net: add NEW NULLABLE columns that exist in the models but not yet in the database.

create_all() never alters existing tables, so a deploy that adds a column would otherwise fail with a 500
until someone runs SQL by hand. This only ever ADDs nullable columns. It never drops, renames or rewrites data.
"""
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def add_missing_nullable_columns(engine: Engine, metadata) -> list[str]:
    added: list[str] = []
    insp = inspect(engine)
    prep = engine.dialect.identifier_preparer
    for table in metadata.sorted_tables:
        if not insp.has_table(table.name):
            continue
        have = {c["name"] for c in insp.get_columns(table.name)}
        for col in table.columns:
            if col.name in have or not col.nullable or col.primary_key:
                continue
            ddl = (
                f"ALTER TABLE {prep.format_table(table)} "
                f"ADD COLUMN {prep.format_column(col)} {col.type.compile(dialect=engine.dialect)}"
            )
            with engine.begin() as conn:
                conn.execute(text(ddl))
            added.append(f"{table.name}.{col.name}")
    return added
