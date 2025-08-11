from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    is_creator: bool = False


# Request schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    is_creator: bool = False
    username: Optional[str] = None  # Make username optional


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Response schemas
class User(UserBase):
    id: int
    username: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
