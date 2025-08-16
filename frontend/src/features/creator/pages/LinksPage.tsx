import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { creatorService } from '../services/creatorService';
import type { CreatorProfilePublic } from '../types';

export const LinksPage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<CreatorProfilePublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        setIsLoading(true);
        const data = await creatorService.getPublicProfile(username);
        console.log('Profile data:', data); // Debug log
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
          <p className="text-gray-600">{error || 'The requested page does not exist.'}</p>
        </div>
      </div>
    );
  }

  // Get platform icon based on platform name
  const getPlatformIcon = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes('youtube')) return '📺';
    if (name.includes('twitter') || name.includes('x')) return '🐦';
    if (name.includes('instagram')) return '📷';
    if (name.includes('tiktok')) return '🎵';
    if (name.includes('twitch')) return '🎮';
    if (name.includes('github')) return '💻';
    if (name.includes('note')) return '📝';
    if (name.includes('discord')) return '💬';
    if (name.includes('facebook')) return '👥';
    if (name.includes('linkedin')) return '💼';
    if (name.includes('spotify')) return '🎧';
    if (name.includes('website') || name.includes('blog')) return '🌐';
    return '🔗';
  };

  // Ensure platform_links exists and is an array
  const links = profile.platform_links || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Profile Section */}
        <div className="text-center mb-8">
          {/* Profile Image */}
          <div className="mb-4">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.display_name}
                className="h-24 w-24 rounded-full mx-auto shadow-lg"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center mx-auto shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {profile.display_name[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name and Username */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.display_name}</h1>
          <p className="text-gray-600 mb-4">@{profile.username}</p>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-700 text-sm mb-6 max-w-sm mx-auto">{profile.bio}</p>
          )}
        </div>

        {/* Links Section */}
        <div className="space-y-3">
          {links.length > 0 ? (
            links
              .sort((a, b) => a.display_order - b.display_order)
              .map((link) => (
                <a
                  key={link.id}
                  href={link.platform_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-4 bg-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getPlatformIcon(link.platform_name)}</span>
                      <span className="font-medium text-gray-900">{link.platform_name}</span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </a>
              ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No links added yet</p>
            </div>
          )}
        </div>

        {/* Support Button */}
        <div className="mt-8">
          <a
            href={`/creator/${profile.username}`}
            className="block w-full p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-center font-medium"
          >
            View Full Profile & Support
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Artison
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
