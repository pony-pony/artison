from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.db import Base


class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class Support(Base):
    __tablename__ = "supports"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    supporter_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    creator_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # Amount in JPY
    message = Column(Text, nullable=True)
    
    # Stripe related fields
    stripe_payment_intent_id = Column(String(255), unique=True, nullable=True)
    stripe_checkout_session_id = Column(String(255), unique=True, nullable=True)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    supporter = relationship("User", foreign_keys=[supporter_id], backref="supports_given")
    creator = relationship("User", foreign_keys=[creator_id], backref="supports_received")
