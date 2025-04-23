'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSocketIO } from '@/lib/socketio';

export default function TimerPage() {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocketIO(session?.user?.id);
  const [activities, setActivities] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timers, setTimers] = useState({});
  const [syncStatus, setSyncStatus] = useState('');
  
  // Function to format seconds as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // Load activities
  useEffect(() => {
    // Pre-defined activities
    const predefinedActivities = [
      // Work activities
      { id: 'voice', name: 'Voice', type: 'work' },
      { id: 'email', name: 'Email', type: 'work' },
      { id: 'data', name: 'Data', type: 'work' },
      { id: 'chat', name: 'Chat', type: 'work' },
      { id: 'support', name: 'Support', type: 'work' },
      
      // Auxiliary activities
      { id: 'break1', name: 'Break 1', type: 'auxiliary' },
      { id: 'lunch', name: 'Lunch', type: 'auxiliary' },
      { id: 'break2', name: 'Break 2', type: 'auxiliary' },
      { id: 'restroom', name: 'Rest Room', type: 'auxiliary' },
      { id: 'coaching', name: 'Coaching', type: 'auxiliary' },
      { id: 'training', name: 'Training', type: 'auxiliary' },
      { id: 'meeting', name: 'Meeting', type: 'auxiliary' },
      { id: 'technical', name: 'Technical', type: 'auxiliary' },
    ];
    
    setActivities(predefinedActivities);
  }, []);
  
  // Load timers state from localStorage when component mounts
  useEffect(() => {
    if (!session?.user?.id) return;
    
    // Load from localStorage
    const savedTimersJson = localStorage.getItem(`timers_${session.user.id}`);
    const savedActiveTimer = localStorage.getItem(`activeTimer_${session.user.id}`);
    
    if (savedTimersJson) {
      setTimers(JSON.parse(savedTimersJson));
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
          
          if (!updatedTimers[activeTimer]) {
            updatedTimers[activeTimer] = { seconds: 0 };
          }
          
          updatedTimers[activeTimer] = {
            ...updatedTimers[activeTimer],
            seconds: (updatedTimers[activeTimer].seconds || 0) + 1,
            isActive: true,
          };
          
          // Save to localStorage on every tick
          localStorage.setItem(`timers_${session.user.id}`, JSON.stringify(updatedTimers));
          
          return updatedTimers;
        });
      }
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [activeTimer, session?.user?.id]);
  
  // Emit timer update via Socket.IO whenever active timer changes
  useEffect(() => {
    if (!socket || !isConnected || !session?.user?.id) return;
    
    // Only send update if we have an active timer
    if (activeTimer) {
      const activity = activities.find(a => a.id === activeTimer);
      if (activity && timers[activeTimer]) {
        // Send update to server
        socket.emit('timer:update', {
          userId: session.user.id,
          userName: session.user.name,
          employeeId: session.user.employeeId,
          campaign: session.user.campaign,
          activityId: activeTimer,
          activityName: activity.name,
          activityType: activity.type,
          seconds: timers[activeTimer].seconds || 0,
          isActive: true,
          timestamp: new Date().toISOString()
        });
        
        setSyncStatus('');
        setTimeout(() => setSyncStatus(''), 2000);
      }
    } else {
      // Notify that timer was stopped
      socket.emit('timer:update', {
        userId: session.user.id,
        isActive: false,
        timestamp: new Date().toISOString()
      });
    }
  }, [activeTimer, activities, isConnected, session?.user, socket, timers]);
  
  // Handle activity button click
  const handleActivityClick = (activityId) => {
    if (!session?.user?.id) return;
    
    setTimers(prevTimers => {
      const updatedTimers = { ...prevTimers };
      
      // Stop current active timer if any
      if (activeTimer && updatedTimers[activeTimer]) {
        updatedTimers[activeTimer] = {
          ...updatedTimers[activeTimer],
          isActive: false,
        };
      }
      
      // If clicking on a different timer, start it
      if (activityId !== activeTimer) {
        // Create or update the timer for this activity
        if (!updatedTimers[activityId]) {
          updatedTimers[activityId] = { seconds: 0 };
        }
        
        updatedTimers[activityId] = {
          ...updatedTimers[activityId],
          isActive: true,
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
  };
  
  // Group activities by type
  const workActivities = activities.filter(a => a.type === 'work');
  const auxiliaryActivities = activities.filter(a => a.type === 'auxiliary');

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Activity Timer</h2>
            <p className="text-gray-600">Track your work tasks and auxiliary activities. Only one timer can run at a time.</p>
          </div>
          <div className="flex items-center">
            <span className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Live Sync On' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Work Tasks Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <h3 className="text-xl font-bold text-blue-800">Work Tasks</h3>
            <p className="text-blue-600 text-sm mt-1">Track time spent on primary work activities</p>
          </div>
          
          <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {workActivities.map((activity) => (
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
            ))}
          </div>
        </div>
        
        {/* Auxiliary Activities Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 bg-yellow-50 border-b border-yellow-100">
            <h3 className="text-xl font-bold text-yellow-800">Auxiliary Activities</h3>
            <p className="text-yellow-600 text-sm mt-1">Track time spent on breaks and other non-work activities</p>
          </div>
          
          <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {auxiliaryActivities.map((activity) => (
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
            ))}
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
                  {activities.filter(a => timers[a.id]?.seconds > 0).map((activity) => (
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
                  
                  {activities.filter(a => timers[a.id]?.seconds > 0).length === 0 && (
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
    </div>
  );
}