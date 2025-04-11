'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function UserManagement() {
  const { data: session } = useSession();
  
  // Only admin role should access this page
  const isAuthorized = session?.user?.role === 'admin';
  
  // Redirect unauthorized users
  useEffect(() => {
    if (session && !isAuthorized) {
      redirect('/dashboard');
    }
  }, [session, isAuthorized]);
  
  if (!isAuthorized) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Access Denied</p>
        <p>You don't have permission to access this page. Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <p>Manage users, campaigns, and roles here.</p>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold">User List</h3>
          <p className="text-gray-600 text-sm">Manage all users in the system</p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between mb-4">
            <input 
              type="text" 
              placeholder="Search users..."
              className="border rounded-md px-3 py-2 w-64"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Add New User
            </button>
          </div>
          
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Admin User</td>
                <td className="px-6 py-4 whitespace-nowrap">4lecboyadmin</td>
                <td className="px-6 py-4 whitespace-nowrap">Management</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    admin
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              {/* Example PDD user */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">PDD User</td>
                <td className="px-6 py-4 whitespace-nowrap">pdduser1</td>
                <td className="px-6 py-4 whitespace-nowrap">Planning</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    pdd
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}