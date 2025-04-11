'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function SideNav({ currentDateTime }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Get user role
  const userRole = session?.user?.role || 'agent';
  
  // Navigation items with icons and allowed roles
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      roles: ['admin', 'pdd', 'agent'], // All roles can access
    },
    {
      name: 'User Management',
      href: '/user-management',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      roles: ['admin'], // Only admin can access
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-2-7a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      roles: ['admin', 'pdd'], // Admin and PDD can access
    },
    {
      name: 'Time Monitoring',
      href: '/timer',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      roles: ['admin', 'pdd', 'agent'], // All roles can access
    }
  ];

  return (
    <div className={`bg-gray-800 text-white h-screen transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-xl font-bold">Time Monitor</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-gray-700 focus:outline-none"
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M11.78 7.47a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 01-1.06-1.06l3.5-3.5a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="mt-8">
        <ul className="space-y-2 px-2">
          {navItems
            .filter(item => item.roles.includes(userRole)) // Only show nav items for this user role
            .map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                  pathname.startsWith(item.href) ? 'bg-blue-700' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {!collapsed && (
        <div className="absolute bottom-0 p-4 w-64">
          <div className="bg-gray-700 rounded-md p-3 text-xs">
            <p className="font-semibold">Current Date and Time (UTC):</p>
            <p className="text-gray-300">{currentDateTime}</p>
          </div>
        </div>
      )}
    </div>
  );
}