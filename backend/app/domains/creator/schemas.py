from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl


# Platform Link schemas
class PlatformLinkBase(BaseModel):
    platform_name: str = Field(..., max_length=50)
    platform_url: str = Field(..., max_length=500)
    display_order: int = Field(default=0)


class PlatformLinkCreate(PlatformLinkBase):
    pass


class PlatformLinkUpdate(BaseModel):
    platform_name: Optional[str] = Field(None, max_length=50)
    platform_url: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = None


class PlatformLink(PlatformLinkBase):
    id: str
    creator_profile_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Creator Profile schemas
class CreatorProfileBase(BaseModel):
    display_name: str = Field(..., max_length=100)
    bio: Optional[str] = None
    profile_image_url: Optional[str] = Field(None, max_length=500)
    header_image_url: Optional[str] = Field(None, max_length=500)


class CreatorProfileCreate(CreatorProfileBase):
    pass


class CreatorProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    profile_image_url: Optional[str] = Field(None, max_length=500)
    header_image_url: Optional[str] = Field(None, max_length=500)


class CreatorProfile(CreatorProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    platform_links: List[PlatformLink] = []
    
    class Config:
        from_attributes = True


class CreatorProfilePublic(CreatorProfile):
    """Public view of creator profile with user info"""
    username: str
    
    class Config:
        from_attributes = True
