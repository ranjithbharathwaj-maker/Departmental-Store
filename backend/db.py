import os
try:
    import psycopg
    from psycopg.rows import dict_row
except ImportError:
    try:
        import psycopg2 as psycopg
        from psycopg2.extras import RealDictCursor as dict_row
    except ImportError:
        psycopg = None
        dict_row = None
from fastapi import HTTPException

def get_db():
    """One transaction per request: commits on success, rolls back on any error."""
    url = os.getenv("DATABASE_URL")
    if not url:
        raise HTTPException(503, "DATABASE_URL is not configured.")
    if not psycopg:
        raise HTTPException(503, "PostgreSQL driver (psycopg or psycopg2) is not installed.")
    with psycopg.connect(url, row_factory=dict_row) as conn:
        yield conn

