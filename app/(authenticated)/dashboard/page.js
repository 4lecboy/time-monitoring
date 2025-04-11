'use client';

import { useSession } from 'next-auth/react';
import DebugSession from '@/components/DebugSession';

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to the Dashboard!</h2>
        <p>You are logged in as <strong>{session?.user?.role || 'Unknown Role'}</strong>.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold mb-2">Your Information</h3>
          <ul className="space-y-1">
            <li><span className="font-medium">Name:</span> {session?.user?.name}</li>
            <li><span className="font-medium">Employee ID:</span> {session?.user?.employeeId || 'Not available'}</li>
            <li><span className="font-medium">Campaign:</span> {session?.user?.campaign || 'Not available'}</li>
            <li><span className="font-medium">Role:</span> {session?.user?.role || 'Not available'}</li>
          </ul>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded">
              Start Timer
            </button>
            <button className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-2 px-4 rounded">
              Generate Report
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold mb-2">System Status</h3>
          <div className="space-y-1">
            <p><span className="font-medium">Status:</span> <span className="text-green-600">Online</span></p>
            <p><span className="font-medium">Version:</span> 1.0.0</p>
            <p><span className="font-medium">Last Update:</span> {new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>
      </div>
      
      {/* Add the debug component */}
      <DebugSession />
    </div>
  );
}