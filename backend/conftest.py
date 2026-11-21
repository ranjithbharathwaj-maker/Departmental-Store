"""Tests run against a real embedded PostgreSQL (pgserver) with the project's migrations, or DATABASE_URL if set."""
import os, pathlib, tempfile
_srv = None
def pytest_configure(config):
    global _srv
    if os.getenv("DATABASE_URL"):
        return
    try:
        import pgserver, psycopg
    except ImportError:
        return
    _srv = pgserver.get_server(tempfile.mkdtemp())
    os.environ["DATABASE_URL"] = _srv.get_uri()
    root = pathlib.Path(__file__).parent.parent / "supabase"
    stub = "create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as 'select null::uuid';"
    with psycopg.connect(os.environ["DATABASE_URL"], autocommit=True) as c:
        c.execute(stub)
        for f in [*sorted((root / "migrations").glob("*.sql")), root / "seed_demo.sql"]:
            c.execute(f.read_text())
