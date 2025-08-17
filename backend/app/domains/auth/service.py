from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
import jwt
import re

from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.domains.auth.models import User
from app.domains.auth.schemas import UserCreate


def generate_username_from_email(email: str) -> str:
    """Generate a username from email address."""
    # Extract the part before @ and remove non-alphanumeric characters
    base_username = email.split('@')[0]
    base_username = re.sub(r'[^a-zA-Z0-9]', '', base_username)
    
    # Ensure minimum length
    if len(base_username) < 3:
        base_username = f"user{base_username}"
    
    return base_username.lower()


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
    
    # Generate username if not provided
    if not user_create.username:
        base_username = generate_username_from_email(user_create.email)
        username = base_username
        counter = 1
        
        # Ensure username is unique
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1
        
        user_create.username = username
    else:
        # Check if provided username is already taken
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
