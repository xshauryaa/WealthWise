import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

# --- 1. THE COMPATIBILITY FIX (GUID Type) ---
# This allows us to use UUIDs in SQLite (tests) and Postgres (prod) transparently
class GUID(TypeDecorator):
    """Platform-independent GUID type."""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID())
        else:
            return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return "%.32x" % uuid.UUID(value).int
            else:
                return "%.32x" % value.int

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value

# --- 2. BASE CLASS ---
class Base(DeclarativeBase):
    pass

# --- 3. CONNECTION MANAGEMENT (Restoring Chunk 4 Logic) ---
_engine = None
_session_factory = None

def get_database_url():
    return os.getenv("DATABASE_URL", "postgresql://user:password@localhost/wealthwise")

def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(get_database_url())
    return _engine

def get_session() -> Session:
    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(bind=get_engine())
    return _session_factory()

@contextmanager
def get_session_context():
    session = get_session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()