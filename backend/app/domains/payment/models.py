from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.db import Base


class StripeAccount(Base):
    __tablename__ = "stripe_accounts"
    
    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    stripe_account_id = Column(String(255), unique=True, nullable=False)
    
    # Stripe Connect status
    charges_enabled = Column(Boolean, default=False)
    payouts_enabled = Column(Boolean, default=False)
    details_submitted = Column(Boolean, default=False)
    
    # Additional info
    country = Column(String(2), default="JP")
    default_currency = Column(String(3), default="jpy")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="stripe_account", uselist=False)
