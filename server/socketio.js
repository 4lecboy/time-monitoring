import { Server } from 'socket.io';

// Global variable to store the Socket.IO instance
let io;

export function initializeSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    // Join a room based on user ID if authenticated
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
      }
      // Join the global room for dashboard updates
      socket.join('dashboard');
    });

    // Listen for timer updates
    socket.on('timer:update', (data) => {
      // Broadcast to the dashboard room
      io.to('dashboard').emit('dashboard:timer:update', data);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}