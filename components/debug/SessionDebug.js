'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function SessionDebug() {
  const { data: session, status } = useSession();
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="bg-gray-100 p-4 my-4 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Session Status: {status}</h3>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
        >
          {showDebug ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {showDebug && (
        <div className="mt-4">
          <div className="bg-white p-3 rounded overflow-auto max-h-80 text-xs">
            <pre>{JSON.stringify(session, null, 2)}</pre>
          </div>
          
          <div className="mt-2 flex gap-2">
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/session');
                  const data = await res.json();
                  console.log('Custom session endpoint:', data);
                  alert('Check console for session data');
                } catch (error) {
                  console.error('Error fetching session:', error);
                  alert('Error fetching session, check console');
                }
              }}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
            >
              Test Custom Session API
            </button>
            
            <button
              onClick={() => signOut({ redirect: false })}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded"
            >
              Sign Out (No Redirect)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}