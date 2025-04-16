'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState('');
  
  // Update time every second with the CURRENT date (not 2025)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Manual formatting to avoid any library issues
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      
      setCurrentTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    };
    
    updateTime(); // Initial call
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">Time Monitoring System</h1>
        </Link>
        
        <div className="flex items-center space-x-6">
          {/* Date and Time Display */}
          <div className="text-sm text-gray-600 border-r pr-6">
            <div className="font-semibold">Current Date and Time</div>
            <div>(UTC - YYYY-MM-DD HH:MM:SS formatted)</div>
            <div className="font-mono">{currentTime}</div>
          </div>
          
          {/* User Profile Section */}
          {session?.user && (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{session.user.name}</span>
                <span className="text-sm text-gray-500">ID: {session.user.employeeId || 'Unknown'}</span>
                <span className="text-xs text-gray-500">
                  {session.user.campaign} - 
                  <span className="font-semibold ml-1 text-blue-600">
                    {session.user.role || 'Unknown role'}
                  </span>
                </span>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/profile" 
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-center"
                >
                  Profile
                </Link>
                <Link 
                  href="/api/auth/signout" 
                  className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 text-center"
                >
                  Sign out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}