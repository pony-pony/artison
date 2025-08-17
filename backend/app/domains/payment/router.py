from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import stripe

from app.core.db import get_db
from app.core.config import settings
from app.api.deps import get_current_active_user, get_current_creator
from app.domains.auth.models import User
from app.domains.payment import schemas, service

router = APIRouter(prefix="/payment", tags=["Payment"])


@router.post("/connect/onboarding", response_model=schemas.StripeConnectLink)
def create_onboarding_link(
    data: schemas.StripeConnectLinkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    """Create a Stripe Connect onboarding link for the current creator."""
    try:
        result = service.create_account_link(
            db=db,
            user=current_user,
            return_url=data.return_url,
            refresh_url=data.refresh_url
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create onboarding link"
        )


@router.get("/connect/status", response_model=schemas.StripeAccountStatus)
def get_connect_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    """Get Stripe Connect account status for the current creator."""
    account = service.get_account_status(db, current_user.id)
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stripe account not found"
        )
    
    return account


@router.post("/connect/refresh", response_model=schemas.StripeConnectLink)
def refresh_onboarding_link(
    data: schemas.StripeConnectLinkRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    """Refresh the Stripe Connect onboarding link."""
    # This is the same as creating a new link
    try:
        result = service.create_account_link(
            db=db,
            user=current_user,
            return_url=data.return_url,
            refresh_url=data.refresh_url
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh onboarding link"
        )


@router.put("/connect/payout-settings")
def update_payout_settings(
    settings_data: schemas.PayoutSettings,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_creator)
):
    """Update payout settings for the creator's Stripe account."""
    success = service.update_payout_settings(
        db=db,
        user_id=current_user.id,
        schedule_interval=settings_data.schedule_interval,
        delay_days=settings_data.schedule_delay_days
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update payout settings"
        )
    
    return {"message": "Payout settings updated successfully"}


@router.post("/webhooks/stripe")
async def stripe_webhook_handler(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhooks for Connect accounts."""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    if not sig_header:
        raise HTTPException(status_code=400, detail="No signature header")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_CONNECT_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle account.updated event
    if event['type'] == 'account.updated':
        account = event['data']['object']
        service.handle_account_updated(db, account['id'])
    
    return {"status": "success"}
