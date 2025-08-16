from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
import jwt

from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.domains.auth.models import User
from app.domains.auth.schemas import UserCreate


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(db: Session, user_create: UserCreate) -> User:
    """Create a new user."""
    # Check if user already exists
    if db.query(User).filter(User.email == user_create.email).first():
        raise ValueError("Email already registered")
    
    if db.query(User).filter(User.username == user_create.username).first():
        raise ValueError("Username already taken")
    
    # Create new user
    db_user = User(
        email=user_create.email,
        username=user_create.username,
        hashed_password=get_password_hash(user_create.password),
        is_creator=user_create.is_creator
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


def create_token(user_id: str) -> str:
    """Create access token for user."""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, 
        expires_delta=access_token_expires
    )
    return access_token


def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.PyJWTError:
        return None
