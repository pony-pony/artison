from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import stripe

from app.core.config import settings
from app.domains.payment.models import StripeAccount
from app.domains.auth.models import User

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


def create_connect_account(db: Session, user: User) -> StripeAccount:
    """Create a Stripe Connect account for a user."""
    # Check if account already exists
    existing = db.query(StripeAccount).filter(StripeAccount.user_id == user.id).first()
    if existing:
        return existing
    
    # Create Stripe Express account
    account = stripe.Account.create(
        type="express",
        country="JP",
        email=user.email,
        capabilities={
            "card_payments": {"requested": True},
            "transfers": {"requested": True},
        },
        business_type="individual",
        business_profile={
            "url": f"{settings.FRONTEND_URL}/creator/{user.username}",
            "mcc": "5815",  # Digital Goods Media
        },
    )
    
    # Save to database
    stripe_account = StripeAccount(
        user_id=user.id,
        stripe_account_id=account.id,
        country="JP",
        default_currency="jpy"
    )
    
    db.add(stripe_account)
    db.commit()
    db.refresh(stripe_account)
    
    return stripe_account


def create_account_link(
    db: Session,
    user: User,
    return_url: str,
    refresh_url: str
) -> dict:
    """Create an account link for Stripe Connect onboarding."""
    # Get or create stripe account
    stripe_account = db.query(StripeAccount).filter(
        StripeAccount.user_id == user.id
    ).first()
    
    if not stripe_account:
        stripe_account = create_connect_account(db, user)
    
    # Create account link
    account_link = stripe.AccountLink.create(
        account=stripe_account.stripe_account_id,
        refresh_url=refresh_url,
        return_url=return_url,
        type="account_onboarding",
    )
    
    return {
        "url": account_link.url,
        "expires_at": datetime.fromtimestamp(account_link.expires_at)
    }


def get_account_status(db: Session, user_id: str) -> Optional[StripeAccount]:
    """Get Stripe account status for a user."""
    stripe_account = db.query(StripeAccount).filter(
        StripeAccount.user_id == user_id
    ).first()
    
    if not stripe_account:
        return None
    
    # Fetch latest status from Stripe
    try:
        account = stripe.Account.retrieve(stripe_account.stripe_account_id)
        
        # Update local status
        stripe_account.charges_enabled = account.charges_enabled
        stripe_account.payouts_enabled = account.payouts_enabled
        stripe_account.details_submitted = account.details_submitted
        
        db.commit()
        db.refresh(stripe_account)
    except stripe.error.StripeError:
        pass
    
    return stripe_account


def update_payout_settings(
    db: Session,
    user_id: str,
    schedule_interval: str = "manual",
    delay_days: int = 7
) -> bool:
    """Update payout settings for a Stripe account."""
    stripe_account = db.query(StripeAccount).filter(
        StripeAccount.user_id == user_id
    ).first()
    
    if not stripe_account:
        return False
    
    try:
        stripe.Account.modify(
            stripe_account.stripe_account_id,
            settings={
                "payouts": {
                    "schedule": {
                        "interval": schedule_interval,
                        "delay_days": delay_days if schedule_interval != "manual" else None,
                    }
                }
            }
        )
        return True
    except stripe.error.StripeError:
        return False


def handle_account_updated(db: Session, account_id: str) -> Optional[StripeAccount]:
    """Handle account.updated webhook from Stripe."""
    stripe_account = db.query(StripeAccount).filter(
        StripeAccount.stripe_account_id == account_id
    ).first()
    
    if not stripe_account:
        return None
    
    # Fetch latest status
    try:
        account = stripe.Account.retrieve(account_id)
        
        stripe_account.charges_enabled = account.charges_enabled
        stripe_account.payouts_enabled = account.payouts_enabled
        stripe_account.details_submitted = account.details_submitted
        
        db.commit()
        db.refresh(stripe_account)
    except stripe.error.StripeError:
        pass
    
    return stripe_account
