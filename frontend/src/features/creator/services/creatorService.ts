import { apiClient } from '../../../shared/services/apiClient';
import type {
  CreatorProfile,
  CreatorProfilePublic,
  CreateProfileData,
  UpdateProfileData,
  PlatformLink,
  CreatePlatformLinkData,
  UpdatePlatformLinkData,
} from '../types';

export const creatorService = {
  // Profile methods
  async createProfile(data: CreateProfileData): Promise<CreatorProfile> {
    const response = await apiClient.post<CreatorProfile>('/creators/profile', data);
    return response.data;
  },

  async getMyProfile(): Promise<CreatorProfile> {
    const response = await apiClient.get<CreatorProfile>('/creators/profile/me');
    return response.data;
  },

  async getPublicProfile(username: string): Promise<CreatorProfilePublic> {
    const response = await apiClient.get<CreatorProfilePublic>(`/creators/profile/${username}`);
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<CreatorProfile> {
    const response = await apiClient.put<CreatorProfile>('/creators/profile', data);
    return response.data;
  },

  // Platform link methods
  async addPlatformLink(data: CreatePlatformLinkData): Promise<PlatformLink> {
    const response = await apiClient.post<PlatformLink>('/creators/profile/links', data);
    return response.data;
  },

  async updatePlatformLink(linkId: string, data: UpdatePlatformLinkData): Promise<PlatformLink> {
    const response = await apiClient.put<PlatformLink>(`/creators/profile/links/${linkId}`, data);
    return response.data;
  },

  async deletePlatformLink(linkId: string): Promise<void> {
    await apiClient.delete(`/creators/profile/links/${linkId}`);
  },

  async reorderPlatformLinks(linkIds: string[]): Promise<PlatformLink[]> {
    const response = await apiClient.put<PlatformLink[]>('/creators/profile/links/reorder', linkIds);
    return response.data;
  },
};
