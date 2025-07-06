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
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  transports: ['websocket'], // Force WebSocket only
  pingInterval: 15000, // Reduced to 15 seconds for faster detection
  pingTimeout: 10000, // Reduced to 10 seconds
  perMessageDeflate: false, // Disable compression to reduce processing overhead
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB with reconnection and timeout
connectDB().catch(err => console.error('MongoDB connection error:', err));

const ioMiddleware = initializeSocket(io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send initial state efficiently
  socket.emit('initialState', { message: 'Connected' });

  // Handle task updates with optimized broadcast
  socket.on('taskUpdate', async (data, callback) => {
    try {
      console.log('Task update received:', data.action, data.taskId);
      // Assume taskRoutes handles DB updates; broadcast immediately
      io.emit('taskUpdate', { action: data.action, taskId: data.taskId }); // Minimal data
      if (callback) callback({ success: true });
    } catch (error) {
      console.error('Task update error:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Heartbeat response
  socket.on('pong', () => console.log('Heartbeat from:', socket.id));
});

// Global ping with reduced interval
setInterval(() => io.emit('ping'), 15000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));