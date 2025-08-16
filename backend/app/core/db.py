from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# SQLAlchemy setup - PostgreSQL対応
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite用設定（ローカル開発）
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL用設定（本番環境）
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,  # 接続プールの健全性チェック
        pool_recycle=300,    # 5分で接続をリサイクル
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
