'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Session Debug Page</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="font-medium">Session Status: 
          <span className={`ml-2 ${
            status === 'authenticated' ? 'text-green-600' : 
            status === 'loading' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {status}
          </span>
        </p>
      </div>
      
      {status === 'authenticated' && session ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-3 rounded-md">
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{session.user?.name || 'Not set'}</p>
              </div>
              
              <div className="border p-3 rounded-md">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{session.user?.email || 'Not set'}</p>
              </div>
              
              <div className="border p-3 rounded-md">
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium">{session.user?.employeeId || 'Not set'}</p>
              </div>
              
              <div className="border p-3 rounded-md">
                <p className="text-sm text-gray-500">Campaign</p>
                <p className="font-medium">{session.user?.campaign || 'Not set'}</p>
              </div>
              
              <div className="border p-3 rounded-md">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">{session.user?.role || 'Not set'}</p>
              </div>
              
              <div className="border p-3 rounded-md">
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium">{session.user?.id || 'Not set'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Full Session Data</h2>
              <button
                onClick={() => setShowToken(!showToken)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-medium"
              >
                {showToken ? 'Hide Token' : 'Show Token'}
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          {showToken && (
            <div className="bg-yellow-50 p-6 rounded-lg shadow-md border border-yellow-200">
              <h2 className="text-xl font-semibold mb-4">Session Token</h2>
              <p className="text-yellow-600 mb-4">Warning: This contains sensitive information. Never share this with anyone!</p>
              
              <div className="bg-white p-4 rounded-md overflow-auto text-xs">
                <code>{document.cookie}</code>
              </div>
            </div>
          )}
        </div>
      ) : status === 'unauthenticated' ? (
        <div className="bg-red-50 p-6 rounded-lg shadow-md border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Not Authenticated</h2>
          <p className="mb-4">You are not currently authenticated. Please sign in to see session data.</p>
          <a 
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Go to Login
          </a>
        </div>
      ) : (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}