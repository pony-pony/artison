from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
import stripe

from app.core.config import settings
from app.domains.support.models import Support, PaymentStatus
from app.domains.support.schemas import CreateSupportRequest, SupportWithUsers
from app.domains.auth.models import User
from app.domains.creator.models import CreatorProfile

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(
    db: Session,
    supporter_id: str,
    creator_id: str,
    amount: int,
    message: Optional[str],
    success_url: str,
    cancel_url: str
) -> dict:
    """Create a Stripe checkout session for supporting a creator."""
    
    # Get creator information
    creator = db.query(User).filter(User.id == creator_id).first()
    if not creator:
        raise ValueError("Creator not found")
    
    creator_profile = db.query(CreatorProfile).filter(
        CreatorProfile.user_id == creator_id
    ).first()
    
    if not creator_profile:
        raise ValueError("Creator profile not found")
    
    # Create support record with pending status
    support = Support(
        supporter_id=supporter_id,
        creator_id=creator_id,
        amount=amount,
        message=message,
        payment_status=PaymentStatus.PENDING
    )
    db.add(support)
    db.commit()
    db.refresh(support)
    
    # Create Stripe checkout session
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'jpy',
                    'product_data': {
                        'name': f'Support for {creator_profile.display_name}',
                        'description': f'One-time support for @{creator.username}',
                    },
                    'unit_amount': amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=support.id,
            metadata={
                'support_id': support.id,
                'supporter_id': supporter_id,
                'creator_id': creator_id
            }
        )
        
        # Update support record with Stripe session ID
        support.stripe_checkout_session_id = session.id
        db.commit()
        
        return {
            'checkout_url': session.url,
            'session_id': session.id
        }
        
    except Exception as e:
        # If Stripe fails, mark support as failed
        support.payment_status = PaymentStatus.FAILED
        db.commit()
        raise e


def handle_checkout_completed(db: Session, session: dict) -> Optional[Support]:
    """Handle successful checkout completion from Stripe webhook."""
    support_id = session.get('client_reference_id')
    if not support_id:
        return None
    
    support = db.query(Support).filter(Support.id == support_id).first()
    if not support:
        return None
    
    # Update support status
    support.payment_status = PaymentStatus.COMPLETED
    support.completed_at = datetime.utcnow()
    support.stripe_payment_intent_id = session.get('payment_intent')
    
    db.commit()
    db.refresh(support)
    
    return support


def get_creator_supports(
    db: Session,
    creator_id: str,
    limit: int = 10,
    offset: int = 0
) -> List[Support]:
    """Get supports received by a creator."""
    return db.query(Support).filter(
        Support.creator_id == creator_id,
        Support.payment_status == PaymentStatus.COMPLETED
    ).order_by(desc(Support.completed_at)).offset(offset).limit(limit).all()


def get_supporter_supports(
    db: Session,
    supporter_id: str,
    limit: int = 10,
    offset: int = 0
) -> List[Support]:
    """Get supports given by a supporter."""
    return db.query(Support).filter(
        Support.supporter_id == supporter_id,
        Support.payment_status == PaymentStatus.COMPLETED
    ).order_by(desc(Support.completed_at)).offset(offset).limit(limit).all()


def get_creator_stats(db: Session, creator_id: str) -> dict:
    """Get support statistics for a creator."""
    result = db.query(
        func.count(Support.id).label('total_supporters'),
        func.sum(Support.amount).label('total_amount')
    ).filter(
        Support.creator_id == creator_id,
        Support.payment_status == PaymentStatus.COMPLETED
    ).first()
    
    recent_supports = db.query(Support).options(
        joinedload(Support.supporter)
    ).filter(
        Support.creator_id == creator_id,
        Support.payment_status == PaymentStatus.COMPLETED
    ).order_by(desc(Support.completed_at)).limit(5).all()
    
    # Convert to SupportWithUsers format
    recent_supports_with_users = []
    for support in recent_supports:
        support_dict = {
            'id': support.id,
            'supporter_id': support.supporter_id,
            'creator_id': support.creator_id,
            'amount': support.amount,
            'message': support.message,
            'payment_status': support.payment_status,
            'created_at': support.created_at,
            'completed_at': support.completed_at,
            'supporter_username': support.supporter.username,
            'creator_username': '',
            'creator_display_name': ''
        }
        recent_supports_with_users.append(support_dict)
    
    return {
        'total_supporters': result.total_supporters or 0,
        'total_amount': result.total_amount or 0,
        'recent_supports': recent_supports_with_users
    }


def get_support_by_id(db: Session, support_id: str) -> Optional[Support]:
    """Get a support by ID."""
    return db.query(Support).filter(Support.id == support_id).first()
