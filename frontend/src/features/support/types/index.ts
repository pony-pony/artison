export interface Support {
  id: string;
  supporter_id: string;
  creator_id: string;
  amount: number;
  message?: string;
  payment_status: PaymentStatus;
  created_at: string;
  completed_at?: string;
}

export interface SupportWithUsers extends Support {
  supporter_username: string;
  creator_username: string;
  creator_display_name: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export const PaymentStatusValues = {
  PENDING: 'pending' as const,
  COMPLETED: 'completed' as const,
  FAILED: 'failed' as const,
  REFUNDED: 'refunded' as const,
};

export interface CreateCheckoutSessionRequest {
  amount: number;
  message?: string;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export interface SupportStats {
  total_supporters: number;
  total_amount: number;
  recent_supports: SupportWithUsers[];
  can_receive_payments: boolean;  // Added field
}

export interface CreatorSupportSummary {
  total_received: number;
  supporter_count: number;
  recent_supports: SupportWithUsers[];
}

export interface SupporterSummary {
  total_given: number;
  creator_count: number;
  recent_supports: SupportWithUsers[];
}

export interface StripeConfig {
  publishable_key: string;
}
