import { useEffect, useState } from 'react';
import { supportService } from '../services/supportService';
import type { SupportStats } from '../types';

interface SupportStatsDisplayProps {
  username: string;
}

export const SupportStatsDisplay = ({ username }: SupportStatsDisplayProps) => {
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await supportService.getCreatorStats(username);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch support stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [username]);

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-indigo-600">
            {stats.total_supporters}
          </p>
          <p className="text-sm text-gray-600">Supporters</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-indigo-600">
            ¥{stats.total_amount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total Received</p>
        </div>
      </div>

      {stats.recent_supports.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Supporters</h3>
          <div className="space-y-2">
            {stats.recent_supports.slice(0, 3).map((support) => (
              <div key={support.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">@{support.supporter_username}</span>
                <span className="font-medium text-gray-900">¥{support.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
