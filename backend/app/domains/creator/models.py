from sqlalchemy import Column, String, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import DateTime
import uuid

from app.core.db import Base


class CreatorProfile(Base):
    __tablename__ = "creator_profiles"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    bio = Column(Text)
    profile_image_url = Column(String(500))
    header_image_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="creator_profile")
    platform_links = relationship("PlatformLink", back_populates="creator_profile", cascade="all, delete-orphan")


class PlatformLink(Base):
    __tablename__ = "platform_links"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    creator_profile_id = Column(String(36), ForeignKey("creator_profiles.id"), nullable=False)
    platform_name = Column(String(50), nullable=False)  # YouTube, Twitter, etc.
    platform_url = Column(String(500), nullable=False)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator_profile = relationship("CreatorProfile", back_populates="platform_links")
