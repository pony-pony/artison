from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.db import Base, engine
from app.domains.auth.router import router as auth_router
from app.domains.creator.router import router as creator_router
from app.domains.support.router import router as support_router

# Import startup script
import app.startup

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Artison API",
    description="Platform for supporting creators",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(creator_router)
app.include_router(support_router)


@app.get("/")
def root():
    return {"message": "Welcome to Artison API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
