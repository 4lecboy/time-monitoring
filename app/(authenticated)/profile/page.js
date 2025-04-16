'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear messages when user types
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Simple validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      // Call the API to change the password
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      
      setSuccess('Password has been changed successfully.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to change password. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">User Profile</h2>
        <p>View your account information and change your password.</p>
      </div>
      
      {/* User Information Section - Read Only */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold">Personal Information</h3>
          <p className="text-gray-600 text-sm">Your account details (read-only)</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="mt-1">{session?.user?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email Address</p>
              <p className="mt-1">{session?.user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Employee ID</p>
              <p className="mt-1">{session?.user?.employeeId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Campaign/Department</p>
              <p className="mt-1">{session?.user?.campaign}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="mt-1 inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {session?.user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Password Change Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">Security</h3>
              <p className="text-gray-600 text-sm">Change your password</p>
            </div>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className={`px-4 py-2 rounded-md ${
                isChangingPassword 
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
                  <p>{error}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Update Password
                </button>
              </div>
            </form>
          ) : (
            <div>
              {success && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 text-green-700">
                  <p>{success}</p>
                </div>
              )}
              
              <p className="text-gray-600">
                Your password can be changed at any time for security reasons. We recommend using a strong, unique password that you don`&apos;`t use for other accounts.
              </p>
              <p className="mt-2 text-gray-600">
                Last password change: <span className="font-medium">Never</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}