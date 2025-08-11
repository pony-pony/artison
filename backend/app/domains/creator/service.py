from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.domains.creator.models import CreatorProfile, PlatformLink
from app.domains.creator.schemas import (
    CreatorProfileCreate, CreatorProfileUpdate,
    PlatformLinkCreate, PlatformLinkUpdate
)
from app.domains.auth.models import User


# Creator Profile Services
def get_creator_profile(db: Session, profile_id: str) -> Optional[CreatorProfile]:
    """Get a creator profile by ID."""
    return db.query(CreatorProfile).options(
        joinedload(CreatorProfile.platform_links)
    ).filter(CreatorProfile.id == profile_id).first()


def get_creator_profile_by_user_id(db: Session, user_id: str) -> Optional[CreatorProfile]:
    """Get a creator profile by user ID."""
    return db.query(CreatorProfile).options(
        joinedload(CreatorProfile.platform_links)
    ).filter(CreatorProfile.user_id == user_id).first()


def get_creator_profile_by_username(db: Session, username: str) -> Optional[CreatorProfile]:
    """Get a creator profile by username."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    return get_creator_profile_by_user_id(db, user.id)


def create_creator_profile(
    db: Session,
    user_id: str,
    profile: CreatorProfileCreate
) -> CreatorProfile:
    """Create a new creator profile."""
    # Check if profile already exists
    existing_profile = get_creator_profile_by_user_id(db, user_id)
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creator profile already exists"
        )
    
    # Check if user is a creator
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_creator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can create profiles"
        )
    
    db_profile = CreatorProfile(
        user_id=user_id,
        **profile.dict()
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


def update_creator_profile(
    db: Session,
    profile_id: str,
    profile_update: CreatorProfileUpdate
) -> Optional[CreatorProfile]:
    """Update a creator profile."""
    db_profile = get_creator_profile(db, profile_id)
    if not db_profile:
        return None
    
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile


# Platform Link Services
def create_platform_link(
    db: Session,
    creator_profile_id: str,
    link: PlatformLinkCreate
) -> PlatformLink:
    """Add a platform link to a creator profile."""
    # Verify profile exists
    profile = get_creator_profile(db, creator_profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found"
        )
    
    db_link = PlatformLink(
        creator_profile_id=creator_profile_id,
        **link.dict()
    )
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link


def update_platform_link(
    db: Session,
    link_id: str,
    link_update: PlatformLinkUpdate
) -> Optional[PlatformLink]:
    """Update a platform link."""
    db_link = db.query(PlatformLink).filter(PlatformLink.id == link_id).first()
    if not db_link:
        return None
    
    update_data = link_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_link, field, value)
    
    db.commit()
    db.refresh(db_link)
    return db_link


def delete_platform_link(db: Session, link_id: str) -> bool:
    """Delete a platform link."""
    db_link = db.query(PlatformLink).filter(PlatformLink.id == link_id).first()
    if not db_link:
        return False
    
    db.delete(db_link)
    db.commit()
    return True


def reorder_platform_links(
    db: Session,
    creator_profile_id: str,
    link_ids: List[str]
) -> List[PlatformLink]:
    """Reorder platform links."""
    links = db.query(PlatformLink).filter(
        PlatformLink.creator_profile_id == creator_profile_id
    ).all()
    
    # Create a mapping of link_id to link
    link_map = {link.id: link for link in links}
    
    # Update display_order based on the provided order
    for index, link_id in enumerate(link_ids):
        if link_id in link_map:
            link_map[link_id].display_order = index
    
    db.commit()
    
    # Return links in new order
    return [link_map[link_id] for link_id in link_ids if link_id in link_map]
