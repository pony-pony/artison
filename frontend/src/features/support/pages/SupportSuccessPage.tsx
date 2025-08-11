import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export const SupportSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const creatorUsername = searchParams.get('creator');

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      if (creatorUsername) {
        navigate(`/creator/${creatorUsername}`);
      } else {
        navigate('/dashboard');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [creatorUsername, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thank You for Your Support!
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully.
          {creatorUsername && ` @${creatorUsername} will be thrilled!`}
        </p>

        <div className="space-y-3">
          {creatorUsername && (
            <Link
              to={`/creator/${creatorUsername}`}
              className="block w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Creator Profile
            </Link>
          )}
          <Link
            to="/dashboard"
            className="block w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Go to Dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Redirecting automatically in 5 seconds...
        </p>
      </div>
    </div>
  );
};
