from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import stripe

from app.core.db import get_db
from app.core.config import settings
from app.api.deps import get_current_active_user
from app.domains.auth.models import User
from app.domains.creator.models import CreatorProfile  # Fix import
from app.domains.support import schemas, service

router = APIRouter(prefix="/support", tags=["Support"])

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/checkout", response_model=schemas.CheckoutSessionResponse)
def create_checkout_session(
    creator_username: str,
    request_data: schemas.CreateCheckoutSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a Stripe checkout session for supporting a creator."""
    # Get creator by username
    creator = db.query(User).filter(User.username == creator_username).first()
    if not creator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator not found"
        )
    
    # Cannot support yourself
    if creator.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot support yourself"
        )
    
    # Validate amount
    if request_data.amount < settings.MINIMUM_SUPPORT_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum support amount is {settings.MINIMUM_SUPPORT_AMOUNT} JPY"
        )
    
    try:
        result = service.create_checkout_session(
            db=db,
            supporter_id=current_user.id,
            creator_id=creator.id,
            amount=request_data.amount,
            message=request_data.message,
            success_url=request_data.success_url,
            cancel_url=request_data.cancel_url
        )
        return result
    except ValueError as e:
        # Handle specific error for payment setup not completed
        if "payment setup" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This creator hasn't set up their payment account yet. They need to complete their payment setup before they can receive support."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session"
        )


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    if not sig_header:
        raise HTTPException(status_code=400, detail="No signature header")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        service.handle_checkout_completed(db, session)
    
    return {"status": "success"}


@router.get("/received", response_model=schemas.CreatorSupportSummary)
def get_received_supports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get supports received by the current user (creator)."""
    stats = service.get_creator_stats(db, current_user.id)
    
    return {
        'total_received': stats['total_amount'],
        'supporter_count': stats['total_supporters'],
        'recent_supports': stats['recent_supports']
    }


@router.get("/given", response_model=schemas.SupporterSummary)
def get_given_supports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get supports given by the current user."""
    supports = service.get_supporter_supports(db, current_user.id)
    
    # Calculate totals
    total_given = sum(s.amount for s in supports)
    creator_ids = list(set(s.creator_id for s in supports))
    
    # Convert to response format
    recent_supports = []
    for support in supports[:10]:  # Last 10 supports
        creator = db.query(User).filter(User.id == support.creator_id).first()
        creator_profile = db.query(CreatorProfile).filter(
            CreatorProfile.user_id == support.creator_id
        ).first()
        
        if creator and creator_profile:
            recent_supports.append({
                'id': support.id,
                'supporter_id': support.supporter_id,
                'creator_id': support.creator_id,
                'amount': support.amount,
                'message': support.message,
                'payment_status': support.payment_status,
                'created_at': support.created_at,
                'completed_at': support.completed_at,
                'supporter_username': current_user.username,
                'creator_username': creator.username,
                'creator_display_name': creator_profile.display_name
            })
    
    return {
        'total_given': total_given,
        'creator_count': len(creator_ids),
        'recent_supports': recent_supports
    }


@router.get("/creator/{username}/stats", response_model=schemas.SupportStats)
def get_creator_support_stats(
    username: str,
    db: Session = Depends(get_db)
):
    """Get public support statistics for a creator."""
    # Get creator by username
    creator = db.query(User).filter(User.username == username).first()
    if not creator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator not found"
        )
    
    stats = service.get_creator_stats(db, creator.id)
    
    # Add creator info to recent supports
    creator_profile = db.query(CreatorProfile).filter(
        CreatorProfile.user_id == creator.id
    ).first()
    
    if creator_profile:
        for support in stats['recent_supports']:
            support['creator_username'] = creator.username
            support['creator_display_name'] = creator_profile.display_name
    
    return stats


@router.get("/stripe/config")
def get_stripe_config():
    """Get Stripe publishable key for frontend."""
    return {
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY
    }
