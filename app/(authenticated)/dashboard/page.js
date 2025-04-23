'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();
  const [activeTimers, setActiveTimers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDbError, setHasDbError] = useState(false);
  const [userActivity, setUserActivity] = useState(null);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Load active timers from localStorage when no database is available
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Try to fetch from API first
        const response = await fetch('/api/dashboard/active-timers');
        
        if (response.ok) {
          const data = await response.json();
          setActiveTimers(data);
          setHasDbError(false);
        } else {
          throw new Error('API error');
        }
      } catch (error) {
        console.error('Error fetching active timers:', error);
        setHasDbError(true);
        
        // Fallback to localStorage for current user's activity
        const storedTimers = localStorage.getItem(`timers_${session.user.id}`);
        const activeTimerId = localStorage.getItem(`activeTimer_${session.user.id}`);
        
        if (storedTimers && activeTimerId && activeTimerId !== 'null') {
          const timers = JSON.parse(storedTimers);
          
          // Define activity name and type based on ID
          const getActivityInfo = (id) => {
            const activityMap = {
              voice: { name: 'Voice', type: 'work' },
              email: { name: 'Email', type: 'work' },
              data: { name: 'Data', type: 'work' },
              chat: { name: 'Chat', type: 'work' },
              support: { name: 'Support', type: 'work' },
              break1: { name: 'Break 1', type: 'auxiliary' },
              lunch: { name: 'Lunch', type: 'auxiliary' },
              break2: { name: 'Break 2', type: 'auxiliary' },
              restroom: { name: 'Rest Room', type: 'auxiliary' },
              coaching: { name: 'Coaching', type: 'auxiliary' },
              training: { name: 'Training', type: 'auxiliary' },
              meeting: { name: 'Meeting', type: 'auxiliary' },
              technical: { name: 'Technical', type: 'auxiliary' },
            };
            
            return activityMap[id] || { name: 'Unknown', type: 'work' };
          };
          
          const activityInfo = getActivityInfo(activeTimerId);
          
          // Set user's active timer
          if (timers[activeTimerId]) {
            setUserActivity({
              userId: session.user.id,
              userName: session.user.name,
              activityId: activeTimerId,
              activityName: activityInfo.name,
              activityType: activityInfo.type,
              seconds: timers[activeTimerId].seconds || 0
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up polling interval if needed
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // Check if current user has an active timer from API data
  useEffect(() => {
    if (session?.user?.id && activeTimers.length > 0 && !hasDbError) {
      const userTimer = activeTimers.find(timer => timer.userId === session.user.id);
      setUserActivity(userTimer || null);
    }
  }, [session?.user?.id, activeTimers, hasDbError]);

  return (
    <div className="space-y-6">
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

      {/* Current User's Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Your Current Activity</h3>
        
        {userActivity ? (
          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <div>
              <p className="text-lg font-semibold">{userActivity.activityName}</p>
              <p className="text-sm text-gray-600">{userActivity.activityType === 'work' ? 'Work Task' : 'Auxiliary Activity'}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono">{formatTime(userActivity.seconds)}</p>
              <Link 
                href="/timer"
                className="text-blue-600 hover:underline text-sm"
              >
                Manage Timer →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500 mb-3">No active timer</p>
            <Link 
              href="/timer"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Start Timer
            </Link>
          </div>
        )}
      </div>
      
      {/* All Active Users (Admin/PDD only) */}
      {['admin', 'pdd'].includes(session?.user?.role) && !hasDbError && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 bg-indigo-50 border-b border-indigo-100">
            <h3 className="text-xl font-bold text-indigo-800">Real-Time Activity Monitor</h3>
            <p className="text-indigo-600 text-sm mt-1">
              All currently active users
            </p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center p-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : activeTimers.length > 0 ? (
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
                    {activeTimers.map((timer) => (
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
                No active timers currently
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Show this only for admin/pdd when there's a database error */}
      {['admin', 'pdd'].includes(session?.user?.role) && hasDbError && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400">
            <h3 className="text-xl font-bold text-yellow-800">Database Setup Required</h3>
            <p className="mt-2">
              The database tables needed for the activity monitor are not yet set up. 
              Please run the SQL scripts provided to create the necessary tables.
            </p>
            <div className="mt-4">
              <p className="font-semibold">Required tables:</p>
              <ul className="list-disc list-inside ml-4 mt-2 text-gray-700">
                <li>activities - Stores all available work and auxiliary activities</li>
                <li>timers - Tracks user activity timing information</li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              In the meantime, basic timer functionality will still work using browser localStorage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}