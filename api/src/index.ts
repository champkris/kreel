import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import videoRoutes from './routes/videos';
import seriesRoutes from './routes/series';
import walletRoutes from './routes/wallet';
import socialRoutes from './routes/social';
import liveRoutes from './routes/live';
import forumRoutes from './routes/forum';
import challengeRoutes from './routes/challenges';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

console.log('Starting Kreels API...');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Initialize database
export const prisma = new PrismaClient();

// Initialize Redis (optional - app works without it)
export const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.log('Redis Client Error:', err));
redis.on('connect', () => console.log('Redis connected'));

// Connect Redis in background (don't block server startup)
redis.connect().catch((err) => {
  console.log('Redis connection failed, continuing without cache:', err.message);
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/challenges', challengeRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join video room for comments
  socket.on('join-video', (videoId) => {
    socket.join(`video-${videoId}`);
  });
  
  // Join live stream room
  socket.on('join-live', (liveStreamId) => {
    socket.join(`live-${liveStreamId}`);
  });
  
  // Handle live comments
  socket.on('live-comment', (data) => {
    io.to(`live-${data.liveStreamId}`).emit('new-comment', data);
  });
  
  // Handle gifts
  socket.on('send-gift', (data) => {
    io.to(`live-${data.liveStreamId}`).emit('new-gift', data);
  });

  // Challenge events
  socket.on('join-challenge', (challengeId) => {
    socket.join(`challenge-${challengeId}`);
  });

  socket.on('leave-challenge', (challengeId) => {
    socket.leave(`challenge-${challengeId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Kreels API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Socket.IO server ready for real-time features`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  await redis.disconnect();
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
