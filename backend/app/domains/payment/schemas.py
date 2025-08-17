from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# Request schemas
class StripeConnectLinkRequest(BaseModel):
    return_url: str
    refresh_url: str


# Response schemas
class StripeConnectLink(BaseModel):
    url: str
    expires_at: datetime


class StripeAccountStatus(BaseModel):
    user_id: str
    stripe_account_id: str
    charges_enabled: bool
    payouts_enabled: bool
    details_submitted: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class PayoutSettings(BaseModel):
    schedule_interval: str = "manual"  # "manual", "daily", "weekly", "monthly"
    schedule_delay_days: int = 7  # Days to hold funds before payout
