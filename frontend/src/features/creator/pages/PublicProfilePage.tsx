import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { creatorService } from '../services/creatorService';
import type { CreatorProfilePublic } from '../types';

export const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CreatorProfilePublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        setIsLoading(true);
        const data = await creatorService.getPublicProfile(username);
        setProfile(data);
      } catch (error: any) {
        setError(error.response?.data?.detail || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested profile does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-64 bg-gradient-to-r from-indigo-500 to-purple-600">
        {profile.header_image_url && (
          <img
            src={profile.header_image_url}
            alt="Header"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Profile Image and Name */}
            <div className="sm:flex sm:items-center sm:space-x-5">
              <div className="flex-shrink-0">
                {profile.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={profile.display_name}
                    className="h-24 w-24 rounded-full"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-600">
                      {profile.display_name[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
                <p className="text-sm text-gray-500">@{profile.username}</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-6">
                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Platform Links */}
            {profile.platform_links.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Find me on</h2>
                <div className="space-y-3">
                  {profile.platform_links
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((link) => (
                      <a
                        key={link.id}
                        href={link.platform_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-center font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        {link.platform_name}
                      </a>
                    ))}
                </div>
              </div>
            )}

            {/* Support Button - Placeholder for Phase 3 */}
            <div className="mt-8">
              <button
                disabled
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
              >
                Support Feature Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
