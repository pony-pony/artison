import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { supportService } from '../features/support/services/supportService';
import type { CreatorSupportSummary, SupporterSummary } from '../features/support/types';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [receivedSupports, setReceivedSupports] = useState<CreatorSupportSummary | null>(null);
  const [givenSupports, setGivenSupports] = useState<SupporterSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSupports = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch given supports for all users
        const given = await supportService.getGivenSupports();
        setGivenSupports(given);

        // Fetch received supports only for creators
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* User Info Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            User Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details and account information.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Username</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user?.username}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user?.email}
              </dd>
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
      </div>

      {/* Creator Section */}
      {user?.is_creator && (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Creator Tools
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your creator profile and settings.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-4">
              <Link
                to="/creator/settings"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Manage Creator Profile
              </Link>
              <p className="text-sm text-gray-600">
                Set up your profile, add platform links, and customize your public page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Support Summary Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Supports Given */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Supports Given
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Creators you have supported
            </p>
          </div>
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
        </div>

        {/* Supports Received (for creators) */}
        {user?.is_creator && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Supports Received
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Support from your fans
              </p>
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
};
