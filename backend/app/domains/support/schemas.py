from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


# Request schemas
class CreateSupportRequest(BaseModel):
    creator_id: str
    amount: int = Field(..., ge=150, description="Amount in JPY (minimum 150)")
    message: Optional[str] = Field(None, max_length=500)


class CreateCheckoutSessionRequest(BaseModel):
    amount: int = Field(..., ge=150, description="Amount in JPY (minimum 150)")
    message: Optional[str] = Field(None, max_length=500)
    success_url: str
    cancel_url: str


# Response schemas
class Support(BaseModel):
    id: str
    supporter_id: str
    creator_id: str
    amount: int
    message: Optional[str]
    payment_status: PaymentStatusEnum
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class SupportWithUsers(Support):
    supporter_username: str
    creator_username: str
    creator_display_name: str


class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str


class SupportStats(BaseModel):
    total_supporters: int
    total_amount: int
    recent_supports: List[SupportWithUsers]


class CreatorSupportSummary(BaseModel):
    total_received: int
    supporter_count: int
    recent_supports: List[SupportWithUsers]


class SupporterSummary(BaseModel):
    total_given: int
    creator_count: int
    recent_supports: List[SupportWithUsers]
