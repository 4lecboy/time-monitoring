'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Signing in with:', { employeeId, password: '***' });

      const result = await signIn('credentials', {
        redirect: false,
        employeeId,
        password,
      });

      console.log('Sign-in result:', result);

      if (result?.error) {
        setError(`Authentication failed: ${result.error}`);
      } else {
        // Fetch session to check user role
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();

        console.log('Session data:', sessionData);

        // Redirect based on role
        if (sessionData?.user?.role === 'agent') {
          router.push('/timer'); // Redirect agents to Time Monitoring
        } else {
          router.push('/dashboard'); // Redirect others to Dashboard
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(`An error occurred during login: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Time Monitoring System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in with your employee ID
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="employeeId" className="sr-only">
                Employee ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Employee ID"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Contact your administrator for login credentials.</p>
        </div>
      </div>
    </div>
  );
}