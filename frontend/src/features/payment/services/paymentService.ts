import { apiClient } from '../../../shared/services/apiClient';
import type {
  StripeConnectLinkRequest,
  StripeConnectLink,
  StripeAccountStatus,
  PayoutSettings,
} from '../types';

export const paymentService = {
  async createOnboardingLink(data: StripeConnectLinkRequest): Promise<StripeConnectLink> {
    const response = await apiClient.post<StripeConnectLink>(
      '/payment/connect/onboarding',
      data
    );
    return response.data;
  },

  async getConnectStatus(): Promise<StripeAccountStatus> {
    const response = await apiClient.get<StripeAccountStatus>('/payment/connect/status');
    return response.data;
  },

  async refreshOnboardingLink(data: StripeConnectLinkRequest): Promise<StripeConnectLink> {
    const response = await apiClient.post<StripeConnectLink>(
      '/payment/connect/refresh',
      data
    );
    return response.data;
  },

  async updatePayoutSettings(settings: PayoutSettings): Promise<void> {
    await apiClient.put('/payment/connect/payout-settings', settings);
  },
};
