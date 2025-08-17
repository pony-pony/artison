import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { creatorService } from '../services/creatorService';
import { SupportForm, SupportStatsDisplay } from '../../support';
import type { CreatorProfilePublic } from '../types';
import type { SupportStats } from '../../support/types';

export const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CreatorProfilePublic | null>(null);
  const [supportStats, setSupportStats] = useState<SupportStats | null>(null);
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

  const handleStatsLoaded = (stats: SupportStats) => {
    setSupportStats(stats);
  };

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.platform_links
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((link) => (
                          <a
                            key={link.id}
                            href={link.platform_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            {link.platform_name}
                            <svg
                              className="ml-auto h-4 w-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Support Section */}
            <div className="space-y-6">
              {/* Support Stats */}
              {username && (
                <SupportStatsDisplay 
                  username={username} 
                  onStatsLoaded={handleStatsLoaded}
                />
              )}

              {/* Support Form */}
              {username && (
                <SupportForm
                  creatorUsername={username}
                  creatorDisplayName={profile.display_name}
                  canReceivePayments={supportStats?.can_receive_payments || false}
                />
              )}

              {/* Links Page Button */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Links</h3>
                <a
                  href={`/links/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Links Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
