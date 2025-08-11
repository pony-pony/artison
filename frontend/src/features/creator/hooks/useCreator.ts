import { useCreatorStore } from '../stores/creatorStore';

export const useCreator = () => {
  const {
    profile,
    isLoading,
    error,
    createProfile,
    fetchMyProfile,
    updateProfile,
    addPlatformLink,
    updatePlatformLink,
    deletePlatformLink,
    reorderPlatformLinks,
    clearError,
  } = useCreatorStore();

  return {
    profile,
    isLoading,
    error,
    createProfile,
    fetchMyProfile,
    updateProfile,
    addPlatformLink,
    updatePlatformLink,
    deletePlatformLink,
    reorderPlatformLinks,
    clearError,
  };
};
