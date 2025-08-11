import { create } from 'zustand';
import { creatorService } from '../services/creatorService';
import type {
  CreatorProfile,
  CreateProfileData,
  UpdateProfileData,
  CreatePlatformLinkData,
  UpdatePlatformLinkData,
} from '../types';

interface CreatorState {
  profile: CreatorProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface CreatorActions {
  createProfile: (data: CreateProfileData) => Promise<void>;
  fetchMyProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  addPlatformLink: (data: CreatePlatformLinkData) => Promise<void>;
  updatePlatformLink: (linkId: string, data: UpdatePlatformLinkData) => Promise<void>;
  deletePlatformLink: (linkId: string) => Promise<void>;
  reorderPlatformLinks: (linkIds: string[]) => Promise<void>;
  clearError: () => void;
}

export const useCreatorStore = create<CreatorState & CreatorActions>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  createProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await creatorService.createProfile(data);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create profile',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchMyProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await creatorService.getMyProfile();
      set({ profile, isLoading: false });
    } catch (error: any) {
      // 404 is expected if profile doesn't exist yet
      if (error.response?.status !== 404) {
        set({
          error: error.response?.data?.detail || 'Failed to fetch profile',
          isLoading: false,
        });
      } else {
        set({ profile: null, isLoading: false });
      }
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await creatorService.updateProfile(data);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update profile',
        isLoading: false,
      });
      throw error;
    }
  },

  addPlatformLink: async (data) => {
    set({ error: null });
    try {
      const newLink = await creatorService.addPlatformLink(data);
      const { profile } = get();
      if (profile) {
        set({
          profile: {
            ...profile,
            platform_links: [...profile.platform_links, newLink],
          },
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to add platform link',
      });
      throw error;
    }
  },

  updatePlatformLink: async (linkId, data) => {
    set({ error: null });
    try {
      const updatedLink = await creatorService.updatePlatformLink(linkId, data);
      const { profile } = get();
      if (profile) {
        set({
          profile: {
            ...profile,
            platform_links: profile.platform_links.map((link) =>
              link.id === linkId ? updatedLink : link
            ),
          },
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update platform link',
      });
      throw error;
    }
  },

  deletePlatformLink: async (linkId) => {
    set({ error: null });
    try {
      await creatorService.deletePlatformLink(linkId);
      const { profile } = get();
      if (profile) {
        set({
          profile: {
            ...profile,
            platform_links: profile.platform_links.filter((link) => link.id !== linkId),
          },
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete platform link',
      });
      throw error;
    }
  },

  reorderPlatformLinks: async (linkIds) => {
    set({ error: null });
    try {
      const reorderedLinks = await creatorService.reorderPlatformLinks(linkIds);
      const { profile } = get();
      if (profile) {
        set({
          profile: {
            ...profile,
            platform_links: reorderedLinks,
          },
        });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to reorder platform links',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
