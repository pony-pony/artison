export interface StripeConnectLinkRequest {
  return_url: string;
  refresh_url: string;
}

export interface StripeConnectLink {
  url: string;
  expires_at: string;
}

export interface StripeAccountStatus {
  user_id: string;
  stripe_account_id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  created_at: string;
}

export interface PayoutSettings {
  schedule_interval: 'manual' | 'daily' | 'weekly' | 'monthly';
  schedule_delay_days: number;
}
