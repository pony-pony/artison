import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { useCreator } from '../hooks/useCreator';
import { ProfileForm } from '../components/ProfileForm';
import { PlatformLinksManager } from '../components/PlatformLinksManager';

export const CreatorSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  } = useCreator();

  useEffect(() => {
    if (user?.is_creator) {
      fetchMyProfile();
    }
  }, [user, fetchMyProfile]);

  useEffect(() => {
    if (user && !user.is_creator) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user?.is_creator) {
    return null;
  }

  const handleProfileSubmit = async (data: any) => {
    if (profile) {
      await updateProfile(data);
    } else {
      await createProfile(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your creator profile and platform links
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
          <ProfileForm
            initialData={profile || undefined}
            onSubmit={handleProfileSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Platform Links Section - Only show if profile exists */}
        {profile && (
          <div className="bg-white shadow rounded-lg p-6">
            <PlatformLinksManager
              links={profile.platform_links || []}
              onAdd={addPlatformLink}
              onUpdate={updatePlatformLink}
              onDelete={deletePlatformLink}
              onReorder={reorderPlatformLinks}
              error={error}
            />
          </div>
        )}

        {/* Public Pages Links */}
        {profile && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Public Pages</h2>
            <div className="space-y-4">
              {/* Full Profile Link */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Full Creator Profile</p>
                <p className="text-xs text-gray-500 mb-2">
                  Your complete profile with bio, images, and support options
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/creator/${user.username}`}
                    className="flex-1 rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/creator/${user.username}`);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => window.open(`/creator/${user.username}`, '_blank')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    View
                  </button>
                </div>
              </div>

              {/* Links Only Page */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Links Page (Lit.Link style)</p>
                <p className="text-xs text-gray-500 mb-2">
                  A simple page with just your links - perfect for social media bios
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/links/${user.username}`}
                    className="flex-1 rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/links/${user.username}`);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => window.open(`/links/${user.username}`, '_blank')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
