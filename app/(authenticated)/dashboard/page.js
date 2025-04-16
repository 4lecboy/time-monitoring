'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useActiveTimers, useSocketIO } from '@/lib/socketio';


export default function Dashboard() {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocketIO(session?.user?.id);
  const { activeTimers, loading } = useActiveTimers();
  const [userActivity, setUserActivity] = useState(null);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Check if current user has an active timer
  useEffect(() => {
    if (session?.user?.id && activeTimers.length > 0) {
      const userTimer = activeTimers.find(timer => timer.userId === session.user.id);
      setUserActivity(userTimer || null);
    } else {
      setUserActivity(null);
    }
  }, [session?.user?.id, activeTimers]);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">

          <div className="flex items-center">
            <span className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
      
      {/* All Active Users (Admin/PDD only) */}
      {['admin', 'pdd'].includes(session?.user?.role) && (
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
                      <tr key={timer.timerId}>
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
    </div>
  );
}