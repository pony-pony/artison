import os

# Check if we need to create database tables on startup
if os.getenv("CREATE_DB_TABLES", "false").lower() == "true":
    from app.core.db import engine, Base
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
