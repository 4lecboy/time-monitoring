'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTimers, setActiveTimers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDbError, setHasDbError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Fetch active timers, campaigns, and activities
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch active timers
        const timersResponse = await fetch('/api/dashboard/active-timers');
        if (timersResponse.ok) {
          const timersData = await timersResponse.json();
          setActiveTimers(timersData);
        } else {
          throw new Error('Failed to fetch active timers');
        }

        // Fetch campaigns
        const campaignsResponse = await fetch('/api/campaigns');
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json();
          setCampaigns(campaignsData);
        } else {
          throw new Error('Failed to fetch campaigns');
        }

        // Fetch activities
        const activitiesResponse = await fetch('/api/activities');
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData);
        } else {
          throw new Error('Failed to fetch activities');
        }

        setHasDbError(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setHasDbError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Optional: polling interval for real-time updates
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Filter and search logic
  const filteredTimers = activeTimers.filter((timer) => {
    const matchesSearch = searchQuery
      ? timer.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        timer.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCampaign = campaignFilter ? timer.campaign === campaignFilter : true;
    const matchesActivity = activityFilter ? timer.activityName === activityFilter : true;

    return matchesSearch && matchesCampaign && matchesActivity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Time Monitoring Dashboard</h2>
            <p className="text-gray-600">Welcome, {session?.user?.name || 'User'}</p>
          </div>

          <Link 
            href="/timer"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Activity Timer
          </Link>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Search and Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by Name or Ashima ID */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search (Name or Ashima ID)
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter name or ID"
            />
          </div>

          {/* Filter by Campaign */}
          <div>
            <label htmlFor="campaignFilter" className="block text-sm font-medium text-gray-700">
              Filter by Campaign
            </label>
            <select
              id="campaignFilter"
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.name}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Activity */}
          <div>
            <label htmlFor="activityFilter" className="block text-sm font-medium text-gray-700">
              Filter by Activity
            </label>
            <select
              id="activityFilter"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Activities</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.name}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Timers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 bg-indigo-50 border-b border-indigo-100">
          <h3 className="text-xl font-bold text-indigo-800">Real-Time Activity Monitor</h3>
          <p className="text-indigo-600 text-sm mt-1">
            View and manage all active timers
          </p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredTimers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTimers.map((timer) => (
                    <tr key={timer.timerId || timer.userId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{timer.userName}</div>
                            <div className="text-sm text-gray-500">{timer.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{timer.campaign}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{timer.activityName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          timer.activityType === 'work' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {timer.activityType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {formatTime(timer.seconds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No results found
            </div>
          )}
        </div>
      </div>
      
      {/* Display database error if applicable */}
      {hasDbError && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400">
            <h3 className="text-xl font-bold text-yellow-800">Database Error</h3>
            <p className="mt-2">
              There was an issue fetching data from the database. Please contact the administrator.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}