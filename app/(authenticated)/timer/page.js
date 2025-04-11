'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function TimerPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timers, setTimers] = useState({});
  const [syncMessage, setSyncMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Format time function
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // Load activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/activities');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        
        // If we don't get an array back, something's wrong
        if (!Array.isArray(data)) {
          console.error('Invalid activities data:', data);
          throw new Error('Invalid response format for activities');
        }
        
        setActivities(data);
        setError(null);
      } catch (error) {
        console.error('Error loading activities:', error);
        setError(`Failed to load activities: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  // Sync with database function
  const syncWithDatabase = useCallback(async () => {
    if (!session?.user?.id || syncStatus === 'syncing') return;
    
    try {
      setSyncStatus('syncing');
      
      // Convert timers object to array format expected by API
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const timerArray = [];
      
      Object.keys(timers).forEach(activityId => {
        if (timers[activityId]) {
          timerArray.push({
            activityId,
            seconds: timers[activityId].seconds || 0,
            isActive: activityId === activeTimer,
            date: today
          });
        }
      });
      
      // If no timers to sync, just update status and return
      if (timerArray.length === 0) {
        setSyncStatus('idle');
        return;
      }
      
      console.log('Syncing timers:', timerArray);
      
      const response = await fetch('/api/timers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timerArray),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      setSyncMessage('Timers synced with database');
      setSyncStatus('idle');
      setError(null);
      setTimeout(() => setSyncMessage(''), 2000);
    } catch (error) {
      console.error('Error syncing with database:', error);
      setSyncMessage(`Sync error: ${error.message}`);
      setSyncStatus('error');
      setError(`Failed to sync timers: ${error.message}`);
      
      // Retry after delay on error
      setTimeout(() => {
        setSyncStatus('idle');
      }, 5000);
    }
  }, [timers, activeTimer, session?.user?.id, syncStatus]);
  
  // Handle activity button click
  const handleActivityClick = (activityId) => {
    if (!session?.user?.id) return;
    
    const now = Date.now();
    
    setTimers(prevTimers => {
      const updatedTimers = { ...prevTimers };
      
      // Stop current active timer if any
      if (activeTimer && updatedTimers[activeTimer]) {
        updatedTimers[activeTimer] = {
          ...updatedTimers[activeTimer],
          isActive: false,
          startTime: null,
        };
      }
      
      // If clicking on a different timer, start it
      if (activityId !== activeTimer) {
        // Create or update the timer for this activity
        updatedTimers[activityId] = {
          seconds: updatedTimers[activityId]?.seconds || 0,
          isActive: true,
          startTime: now,
        };
        
        setActiveTimer(activityId);
        localStorage.setItem(`activeTimer_${session.user.id}`, activityId);
      } else {
        // If clicking the active timer, stop it
        setActiveTimer(null);
        localStorage.setItem(`activeTimer_${session.user.id}`, null);
      }
      
      // Save to localStorage
      localStorage.setItem(`timers_${session.user.id}`, JSON.stringify(updatedTimers));
      
      return updatedTimers;
    });
    
    // Sync immediately when changing activities
    syncWithDatabase();
  };
  
  // Load timers from localStorage
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const savedTimersJson = localStorage.getItem(`timers_${session.user.id}`);
    const savedActiveTimer = localStorage.getItem(`activeTimer_${session.user.id}`);
    
    if (savedTimersJson) {
      try {
        const savedTimers = JSON.parse(savedTimersJson);
        setTimers(savedTimers);
      } catch (e) {
        console.error('Error parsing saved timers:', e);
      }
    }
    
    if (savedActiveTimer && savedActiveTimer !== "null") {
      setActiveTimer(savedActiveTimer);
    }
    
  }, [session?.user?.id]);
  
  // Update active timer every second
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const timerInterval = setInterval(() => {
      if (activeTimer) {
        setTimers(prevTimers => {
          const updatedTimers = { ...prevTimers };
          
          if (updatedTimers[activeTimer]) {
            updatedTimers[activeTimer] = {
              ...updatedTimers[activeTimer],
              seconds: (updatedTimers[activeTimer].seconds || 0) + 1,
              isActive: true,
            };
          }
          
          // Save to localStorage on every tick
          localStorage.setItem(`timers_${session.user.id}`, JSON.stringify(updatedTimers));
          
          return updatedTimers;
        });
      }
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [activeTimer, session?.user?.id]);
  
  // Sync with database periodically
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const syncInterval = setInterval(() => {
      syncWithDatabase();
    }, 15000); // 15 seconds
    
    return () => clearInterval(syncInterval);
  }, [session?.user?.id, syncWithDatabase]);
  
  // Group activities by type
  const workActivities = activities.filter(a => a.type === 'work');
  const auxiliaryActivities = activities.filter(a => a.type === 'auxiliary');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
        <div className="flex">
          <div className="py-1">
            <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
            <button 
              className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Activity Timer</h2>
        <p className="text-gray-600">Track your work tasks and auxiliary activities. Only one timer can run at a time.</p>
        {error && (
          <div className="mt-2 py-1 px-3 bg-red-50 text-red-700 text-sm rounded-md inline-block">
            {error}
            <button 
              className="ml-2 underline"
              onClick={() => {
                setError(null);
                syncWithDatabase();
              }}
            >
              Retry
            </button>
          </div>
        )}
        {syncMessage && !error && (
          <div className="mt-2 py-1 px-3 bg-blue-50 text-blue-700 text-sm rounded-md inline-block">
            {syncMessage}
          </div>
        )}
      </div>
      
      {/* Work Tasks Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <h3 className="text-xl font-bold text-blue-800">Work Tasks</h3>
          <p className="text-blue-600 text-sm mt-1">Track time spent on primary work activities</p>
        </div>
        
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {workActivities.length > 0 ? (
            workActivities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => handleActivityClick(activity.id)}
                className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all min-h-[120px] ${
                  activeTimer === activity.id
                    ? 'bg-blue-600 text-white ring-4 ring-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <span className="font-bold mb-2">{activity.name}</span>
                <span className={`text-xl font-mono ${activeTimer === activity.id ? 'text-white' : 'text-gray-700'}`}>
                  {formatTime(timers[activity.id]?.seconds || 0)}
                </span>
                <span className={`text-xs mt-2 ${activeTimer === activity.id ? 'text-blue-200' : 'text-gray-500'}`}>
                  {activeTimer === activity.id ? 'ACTIVE' : 'Click to Start'}
                </span>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No work activities found. Please check your database setup.
            </div>
          )}
        </div>
      </div>
      
      {/* Auxiliary Activities Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 bg-yellow-50 border-b border-yellow-100">
          <h3 className="text-xl font-bold text-yellow-800">Auxiliary Activities</h3>
          <p className="text-yellow-600 text-sm mt-1">Track time spent on breaks and other non-work activities</p>
        </div>
        
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {auxiliaryActivities.length > 0 ? (
            auxiliaryActivities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => handleActivityClick(activity.id)}
                className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all min-h-[120px] ${
                  activeTimer === activity.id
                    ? 'bg-yellow-500 text-white ring-4 ring-yellow-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <span className="font-bold mb-2">{activity.name}</span>
                <span className={`text-xl font-mono ${activeTimer === activity.id ? 'text-white' : 'text-gray-700'}`}>
                  {formatTime(timers[activity.id]?.seconds || 0)}
                </span>
                <span className={`text-xs mt-2 ${activeTimer === activity.id ? 'text-yellow-100' : 'text-gray-500'}`}>
                  {activeTimer === activity.id ? 'ACTIVE' : 'Click to Start'}
                </span>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No auxiliary activities found. Please check your database setup.
            </div>
          )}
        </div>
      </div>
      
      {/* Daily Summary */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 bg-green-50 border-b border-green-100">
          <h3 className="text-xl font-bold text-green-800">Daily Summary</h3>
          <p className="text-green-600 text-sm mt-1">Overview of your activity today</p>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities
                  .filter(a => timers[a.id]?.seconds > 0)
                  .map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.type === 'work' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {formatTime(timers[activity.id]?.seconds || 0)}
                      </td>
                    </tr>
                ))}
                
                {Object.keys(timers).length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No activity recorded today
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <th scope="row" colSpan="2" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Time
                  </th>
                  <td className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    {formatTime(Object.values(timers).reduce((acc, timer) => acc + (timer?.seconds || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}