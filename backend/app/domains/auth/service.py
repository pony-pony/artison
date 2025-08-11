from datetime import timedelta
from typing import Optional
import secrets
import string
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.domains.auth.models import User
from app.domains.auth.schemas import UserCreate


def generate_unique_username(db: Session, email: str) -> str:
    """Generate a unique username based on email."""
    # Extract email prefix
    email_prefix = email.split('@')[0]
    # Remove special characters and limit length
    clean_prefix = ''.join(c for c in email_prefix if c.isalnum())[:10]
    
    # Generate random suffix
    random_suffix = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(6))
    username = f"{clean_prefix}_{random_suffix}"
    
    # Check if username exists and regenerate if necessary
    while get_user_by_username(db, username):
        random_suffix = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(6))
        username = f"{clean_prefix}_{random_suffix}"
    
    return username


def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get a user by username."""
    return db.query(User).filter(User.username == username).first()


def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user."""
    # Check if user already exists
    if get_user_by_email(db, email=user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate username if not provided
    if not user.username:
        username = generate_unique_username(db, user.email)
    else:
        username = user.username
        # Check if username is taken
        if get_user_by_username(db, username=username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=username,
        hashed_password=hashed_password,
        is_creator=user.is_creator
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user."""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_user_token(user: User) -> str:
    """Create an access token for a user."""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return access_token
