'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function DebugSession() {
  const { data: session, status } = useSession();
  const [showDebug, setShowDebug] = useState(false);
  
  if (status === 'loading') {
    return <div>Loading session...</div>;
  }
  
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Session Debug Panel</h3>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showDebug ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {showDebug && (
        <div className="mt-4">
          <p>Session Status: <strong>{status}</strong></p>
          <p>User ID: <strong>{session?.user?.id || 'Missing'}</strong></p>
          <p>Name: <strong>{session?.user?.name || 'Missing'}</strong></p>
          <p>Email: <strong>{session?.user?.email || 'Missing'}</strong></p>
          <p>Employee ID: <strong>{session?.user?.employeeId || 'Missing'}</strong></p>
          <p>Campaign: <strong>{session?.user?.campaign || 'Missing'}</strong></p>
          <p>Role: <strong>{session?.user?.role || 'Missing'}</strong></p>
          
          <div className="mt-4">
            <p className="font-bold">Full Session Object:</p>
            <pre className="bg-gray-800 text-green-400 p-3 rounded overflow-auto max-h-40 text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/auth/session');
                  const data = await res.json();
                  console.log('Raw session data:', data);
                  alert('Raw session data logged to console');
                } catch (error) {
                  console.error('Error fetching session:', error);
                  alert('Error fetching session data');
                }
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Check Raw Session Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}