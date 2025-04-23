'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import SideNav from '@/components/layout/SideNav';
import Header from '@/components/layout/Header';

export default function AuthenticatedLayout({ children }) {
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Check user role
  const userRole = session?.user?.role || 'agent'; // Default to 'agent' role if undefined
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Render SideNav only for non-agent roles */}
      {userRole !== 'agent' && <SideNav />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-auto px-4 py-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}