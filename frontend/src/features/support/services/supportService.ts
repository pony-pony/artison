import { apiClient } from '../../../shared/services/apiClient';
import type {
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  SupportStats,
  CreatorSupportSummary,
  SupporterSummary,
  StripeConfig,
} from '../types';

export const supportService = {
  async createCheckoutSession(
    creatorUsername: string,
    data: CreateCheckoutSessionRequest
  ): Promise<CheckoutSessionResponse> {
    const response = await apiClient.post<CheckoutSessionResponse>(
      `/support/checkout?creator_username=${creatorUsername}`,
      data
    );
    return response.data;
  },

  async getReceivedSupports(): Promise<CreatorSupportSummary> {
    const response = await apiClient.get<CreatorSupportSummary>('/support/received');
    return response.data;
  },

  async getGivenSupports(): Promise<SupporterSummary> {
    const response = await apiClient.get<SupporterSummary>('/support/given');
    return response.data;
  },

  async getCreatorStats(username: string): Promise<SupportStats> {
    const response = await apiClient.get<SupportStats>(`/support/creator/${username}/stats`);
    return response.data;
  },

  async getStripeConfig(): Promise<StripeConfig> {
    const response = await apiClient.get<StripeConfig>('/support/stripe/config');
    return response.data;
  },
};
