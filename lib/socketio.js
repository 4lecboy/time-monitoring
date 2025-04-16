'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

let socket;

export const useSocketIO = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Initialize socket connection if it doesn't exist
    if (!socket) {
      const socketURL = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_SITE_URL 
        : 'http://localhost:3000';
        
      socket = io(socketURL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Join rooms
      if (userId) {
        socket.emit('join', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Connect if not already
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      // Don't disconnect on component unmount to keep the socket alive
      // Just clean up the event listeners
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [userId]);

  return { socket, isConnected };
};

// Custom hook for real-time active timers
export const useActiveTimers = () => {
  const [activeTimers, setActiveTimers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initialize socket if needed
    if (!socket) {
      const socketURL = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_SITE_URL 
        : 'http://localhost:3000';
        
      socket = io(socketURL);
    }
    
    // First load active timers from API
    const fetchInitialTimers = async () => {
      try {
        const response = await fetch('/api/dashboard/active-timers');
        if (response.ok) {
          const data = await response.json();
          setActiveTimers(data);
        }
      } catch (error) {
        console.error('Error fetching initial timers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialTimers();
    
    // Listen for real-time updates
    socket.on('dashboard:timer:update', (data) => {
      setActiveTimers(prev => {
        // Find if this user already has an active timer
        const existingIndex = prev.findIndex(item => item.userId === data.userId);
        
        if (existingIndex >= 0) {
          // If timer is stopping, remove the entry
          if (!data.isActive) {
            return prev.filter(item => item.userId !== data.userId);
          }
          
          // Update existing timer
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        } else if (data.isActive) {
          // Add new active timer
          return [...prev, data];
        }
        
        return prev;
      });
    });
    
    return () => {
      socket.off('dashboard:timer:update');
    };
  }, []);
  
  return { activeTimers, loading };
};