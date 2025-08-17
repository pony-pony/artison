from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Connection arguments for PostgreSQL
connect_args = {}
engine_args = {}

if settings.DATABASE_URL.startswith("postgresql"):
    # Use NullPool for serverless environments
    engine_args["poolclass"] = NullPool
    connect_args = {
        "connect_timeout": 10,
        "options": "-c statement_timeout=30000"
    }
else:
    # SQLite doesn't need special handling
    pass

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
