import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRouter.js';
import taskRoutes from './routes/tasksRouter.js';
import initializeSocket from './socket/socket.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.io with CORS and ping settings
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  transports: ['websocket'],
  pingInterval: 25000,
  pingTimeout: 20000,
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
connectDB().catch(err => console.error('MongoDB connection error:', err));

// Attach io to request object for route usage
const ioMiddleware = initializeSocket(io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ✅ Health check or base route
app.get('/', (req, res) => {
  res.send('Task Manager API is running...');
});

// Socket.io event handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Initial connection confirmation
  socket.emit('initialState', { message: 'Connected' });

  // Handle task updates from clients
  socket.on('taskUpdate', (data, callback) => {
    try {
      console.log('Task update received:', data);
      io.emit('taskUpdate', data); // Broadcast to all clients
      if (callback) callback({ success: true });
    } catch (error) {
      console.error('Task update error:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Heartbeat for keeping connection alive
  socket.on('pong', () => console.log('Heartbeat from:', socket.id));
});

// Global ping to all clients every 25s
setInterval(() => io.emit('ping'), 25000);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
