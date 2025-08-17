import { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import type { StripeAccountStatus } from '../types';

export const StripeConnectSetup = () => {
  const [status, setStatus] = useState<StripeAccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const data = await paymentService.getConnectStatus();
      setStatus(data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Failed to fetch account status');
      }
      // 404 means no account yet, which is fine
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOnboarding = async () => {
    try {
      setIsLoading(true);
      const link = await paymentService.createOnboardingLink({
        return_url: `${window.location.origin}/dashboard?stripe=success`,
        refresh_url: `${window.location.origin}/dashboard?stripe=refresh`,
      });
      window.location.href = link.url;
    } catch (err) {
      setError('Failed to start onboarding');
      setIsLoading(false);
    }
  };

  const handleRefreshOnboarding = async () => {
    try {
      setIsLoading(true);
      const link = await paymentService.refreshOnboardingLink({
        return_url: `${window.location.origin}/dashboard?stripe=success`,
        refresh_url: `${window.location.origin}/dashboard?stripe=refresh`,
      });
      window.location.href = link.url;
    } catch (err) {
      setError('Failed to refresh onboarding');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Not connected yet
  if (!status) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connect Your Bank Account
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect your bank account to receive payments from your supporters. 
          This process is secure and handled by Stripe.
        </p>
        <button
          onClick={handleStartOnboarding}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Set Up Payouts
        </button>
      </div>
    );
  }

  // Connected but not fully onboarded
  if (!status.charges_enabled || !status.payouts_enabled) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Complete Your Account Setup
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Your account setup is incomplete. Please complete the onboarding process to start receiving payments.</p>
            </div>
            <div className="mt-4">
              <button
                onClick={handleRefreshOnboarding}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Continue Setup →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fully connected
  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Bank Account Connected
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>Your bank account is connected and ready to receive payments.</p>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Connected since: {new Date(status.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
