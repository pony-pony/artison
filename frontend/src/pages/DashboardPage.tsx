import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { useCreator } from '../features/creator';
import { ProfileForm } from '../features/creator/components/ProfileForm';
import { PlatformLinksManager } from '../features/creator/components/PlatformLinksManager';
import { supportService } from '../features/support/services/supportService';
import type { CreatorSupportSummary, SupporterSummary } from '../features/support/types';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    profile,
    isLoading: isCreatorLoading,
    error: creatorError,
    createProfile,
    fetchMyProfile,
    updateProfile,
    addPlatformLink,
    updatePlatformLink,
    deletePlatformLink,
    reorderPlatformLinks,
    clearError,
  } = useCreator();
  
  const [receivedSupports, setReceivedSupports] = useState<CreatorSupportSummary | null>(null);
  const [givenSupports, setGivenSupports] = useState<SupporterSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    userInfo: true,
    creatorProfile: false,
    platformLinks: false,
    publicPages: false,
    supportsGiven: true,
    supportsReceived: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (user?.is_creator) {
      fetchMyProfile();
    }
  }, [user, fetchMyProfile]);

  useEffect(() => {
    const fetchSupports = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const given = await supportService.getGivenSupports();
        setGivenSupports(given);

        if (user.is_creator) {
          const received = await supportService.getReceivedSupports();
          setReceivedSupports(received);
        }
      } catch (error) {
        console.error('Failed to fetch supports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupports();
  }, [user]);

  const handleProfileSubmit = async (data: any) => {
    if (profile) {
      await updateProfile(data);
    } else {
      await createProfile(data);
    }
  };

  const AccordionHeader = ({ title, subtitle, section, isOpen }: any) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full px-4 py-5 sm:px-6 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      {/* User Info Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <AccordionHeader
          title="User Information"
          subtitle="Personal details and account information"
          section="userInfo"
          isOpen={openSections.userInfo}
        />
        {openSections.userInfo && (
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.username}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Account type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.is_creator ? 'Creator' : 'Supporter'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Member since</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user?.created_at && new Date(user.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Creator Settings - Only for creators */}
      {user?.is_creator && (
        <>
          {/* Profile Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <AccordionHeader
              title="Creator Profile"
              subtitle="Manage your creator profile information"
              section="creatorProfile"
              isOpen={openSections.creatorProfile}
            />
            {openSections.creatorProfile && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <ProfileForm
                  initialData={profile || undefined}
                  onSubmit={handleProfileSubmit}
                  isLoading={isCreatorLoading}
                  error={creatorError}
                />
              </div>
            )}
          </div>

          {/* Platform Links - Only if profile exists */}
          {profile && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <AccordionHeader
                title="Platform Links"
                subtitle="Manage your social media and platform links"
                section="platformLinks"
                isOpen={openSections.platformLinks}
              />
              {openSections.platformLinks && (
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <PlatformLinksManager
                    links={profile.platform_links || []}
                    onAdd={addPlatformLink}
                    onUpdate={updatePlatformLink}
                    onDelete={deletePlatformLink}
                    onReorder={reorderPlatformLinks}
                    error={creatorError}
                  />
                </div>
              )}
            </div>
          )}

          {/* Public Pages - Only if profile exists */}
          {profile && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <AccordionHeader
                title="Public Pages"
                subtitle="Your public profile and links pages"
                section="publicPages"
                isOpen={openSections.publicPages}
              />
              {openSections.publicPages && (
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6 space-y-4">
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
              )}
            </div>
          )}
        </>
      )}

      {/* Support Summary Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Supports Given */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <AccordionHeader
            title="Supports Given"
            subtitle="Creators you have supported"
            section="supportsGiven"
            isOpen={openSections.supportsGiven}
          />
          {openSections.supportsGiven && (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : givenSupports ? (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600">
                        ¥{givenSupports.total_given.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Total Given</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600">
                        {givenSupports.creator_count}
                      </p>
                      <p className="text-sm text-gray-500">Creators Supported</p>
                    </div>
                  </div>
                  {givenSupports.recent_supports.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent</h4>
                      <div className="space-y-2">
                        {givenSupports.recent_supports.slice(0, 3).map((support) => (
                          <div key={support.id} className="text-sm">
                            <Link
                              to={`/creator/${support.creator_username}`}
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              {support.creator_display_name}
                            </Link>
                            <span className="text-gray-500 ml-2">
                              ¥{support.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No supports given yet</p>
              )}
            </div>
          )}
        </div>

        {/* Supports Received (for creators) */}
        {user?.is_creator && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <AccordionHeader
              title="Supports Received"
              subtitle="Support from your fans"
              section="supportsReceived"
              isOpen={openSections.supportsReceived}
            />
            {openSections.supportsReceived && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : receivedSupports ? (
                  <div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          ¥{receivedSupports.total_received.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Total Received</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {receivedSupports.supporter_count}
                        </p>
                        <p className="text-sm text-gray-500">Supporters</p>
                      </div>
                    </div>
                    {receivedSupports.recent_supports.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent</h4>
                        <div className="space-y-2">
                          {receivedSupports.recent_supports.slice(0, 3).map((support) => (
                            <div key={support.id} className="text-sm">
                              <span className="font-medium text-gray-900">
                                @{support.supporter_username}
                              </span>
                              <span className="text-gray-500 ml-2">
                                ¥{support.amount.toLocaleString()}
                              </span>
                              {support.message && (
                                <p className="text-gray-600 text-xs mt-1 italic">
                                  "{support.message}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No supports received yet</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
