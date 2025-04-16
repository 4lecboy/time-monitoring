'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TimerStats() {
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Format seconds as HH:MM:SS
  const formatTime = (seconds) => {
    if (typeof seconds !== 'number') return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // Fetch today's stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/timers/stats?date=${today}`);
        
        if (!response.ok) throw new Error('Failed to fetch timer stats');
        
        const data = await response.json();
        setTodayStats(data);
      } catch (error) {
        console.error('Error fetching timer stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-40">
        <p className="text-gray-500">Loading timer stats...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Today`&apos;`s Activity</h3>
        <Link 
          href="/timer"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Go to Timer →
        </Link>
      </div>
      
      {todayStats?.totalSeconds > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <div className="text-sm text-gray-500">Work Time</div>
              <div className="text-xl font-mono">{formatTime(todayStats.workSeconds)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Auxiliary Time</div>
              <div className="text-xl font-mono">{formatTime(todayStats.auxSeconds)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Time</div>
              <div className="text-xl font-mono">{formatTime(todayStats.totalSeconds)}</div>
            </div>
          </div>
          
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600" 
              style={{ width: `${todayStats.workPercent}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-500 flex justify-between">
            <div>Work: {todayStats.workPercent}%</div>
            <div>Aux: {todayStats.auxPercent}%</div>
          </div>
          
          {todayStats.currentActivity && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              <span className="text-xs font-medium text-gray-500">CURRENT ACTIVITY:</span>
              <span className="ml-2 font-medium text-blue-700">{todayStats.currentActivity}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No activity recorded today</p>
          <Link 
            href="/timer"
            className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Start Tracking Time
          </Link>
        </div>
      )}
    </div>
  );
}