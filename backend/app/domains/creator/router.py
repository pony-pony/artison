from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.api.deps import get_current_active_user
from app.domains.auth.models import User
from app.domains.creator import schemas, service
from app.domains.creator.models import CreatorProfile, PlatformLink

router = APIRouter(prefix="/creators", tags=["Creators"])


@router.post("/profile", response_model=schemas.CreatorProfile)
def create_profile(
    profile_data: schemas.CreatorProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a creator profile for the current user."""
    return service.create_creator_profile(db, current_user.id, profile_data)


@router.get("/profile/me", response_model=schemas.CreatorProfile)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the current user's creator profile."""
    profile = service.get_creator_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found"
        )
    return profile


@router.get("/profile/{username}", response_model=schemas.CreatorProfilePublic)
def get_public_profile(
    username: str,
    db: Session = Depends(get_db)
):
    """Get a creator's public profile by username."""
    # First get the user
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Then get the profile with platform_links eagerly loaded
    profile = db.query(CreatorProfile).options(
        joinedload(CreatorProfile.platform_links)
    ).filter(CreatorProfile.user_id == user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found"
        )
    
    # Convert to dict and add username
    profile_dict = {
        "id": profile.id,
        "user_id": profile.user_id,
        "display_name": profile.display_name,
        "bio": profile.bio,
        "profile_image_url": profile.profile_image_url,
        "header_image_url": profile.header_image_url,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
        "username": user.username,
        "platform_links": [
            {
                "id": link.id,
                "creator_profile_id": link.creator_profile_id,
                "platform_name": link.platform_name,
                "platform_url": link.platform_url,
                "display_order": link.display_order,
                "created_at": link.created_at,
                "updated_at": link.updated_at
            }
            for link in profile.platform_links
        ]
    }
    
    return profile_dict


@router.put("/profile", response_model=schemas.CreatorProfile)
def update_profile(
    profile_update: schemas.CreatorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update the current user's creator profile."""
    profile = service.get_creator_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found"
        )
    
    updated_profile = service.update_creator_profile(db, profile.id, profile_update)
    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to update profile"
        )
    return updated_profile


# Platform Links endpoints
@router.post("/profile/links", response_model=schemas.PlatformLink)
def add_platform_link(
    link_data: schemas.PlatformLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a platform link to the creator profile."""
    profile = service.get_creator_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found"
        )
    
    return service.create_platform_link(db, profile.id, link_data)


@router.put("/profile/links/{link_id}", response_model=schemas.PlatformLink)
def update_platform_link(
    link_id: str,
    link_update: schemas.PlatformLinkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a platform link."""
    # Verify ownership
    profile = service.get_creator_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found"
        )
    
    # Check if link belongs to user's profile
    link = db.query(PlatformLink).filter(
        PlatformLink.id == link_id,
        PlatformLink.creator_profile_id == profile.id
    ).first()
    
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform link not found"
        )
    
    updated_link = service.update_platform_link(db, link_id, link_update)
    if not updated_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to update link"
        )
    return updated_link


@router.delete("/profile/links/{link_id}")
def delete_platform_link(
    link_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a platform link."""
    # Verify ownership
    profile = service.get_creator_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found"
        )
    
    # Check if link belongs to user's profile
    link = db.query(PlatformLink).filter(
        PlatformLink.id == link_id,
        PlatformLink.creator_profile_id == profile.id
    ).first()
    
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform link not found"
        )
    
    if not service.delete_platform_link(db, link_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete link"
        )
    
    return {"message": "Platform link deleted successfully"}


@router.put("/profile/links/reorder", response_model=List[schemas.PlatformLink])
def reorder_platform_links(
    link_ids: List[str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Reorder platform links."""
    profile = service.get_creator_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator profile not found"
        )
    
    return service.reorder_platform_links(db, profile.id, link_ids)
