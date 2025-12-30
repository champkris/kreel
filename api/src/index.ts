// First thing - log that we're starting
console.log('=== KREELS API STARTING ===');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

console.log('Core imports loaded');

import { PrismaClient } from '@prisma/client';
import { createClient, RedisClientType } from 'redis';

console.log('DB imports loaded');

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import videoRoutes from './routes/videos';
import seriesRoutes from './routes/series';
import walletRoutes from './routes/wallet';
import socialRoutes from './routes/social';
import liveRoutes from './routes/live';
import forumRoutes from './routes/forum';
import clubRoutes from './routes/clubs';
import challengeRoutes from './routes/challenges';

console.log('Routes imported');

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

console.log('Middleware imported');

// Load environment variables
dotenv.config();

console.log('Starting Kreels API...');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REDIS_URL:', process.env.REDIS_URL ? 'SET' : 'NOT SET');

// Initialize database
export const prisma = new PrismaClient();

// Initialize Redis (optional - app works without it)
let redis: RedisClientType | null = null;
if (process.env.REDIS_URL) {
  redis = createClient({
    url: process.env.REDIS_URL
  });
  redis.on('error', (err) => console.log('Redis Client Error:', err));
  redis.on('connect', () => console.log('Redis connected'));
  redis.connect().catch((err) => {
    console.log('Redis connection failed, continuing without cache:', err.message);
  });
} else {
  console.log('REDIS_URL not set, skipping Redis');
}

export { redis };

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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      mediaSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "wss:", "ws:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
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

// Health check for /api/health (mobile app uses this)
app.get('/api/health', (req, res) => {
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
app.use('/api/clubs', clubRoutes);
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

// Serve static files from Expo web build
const webDistPath = path.join(__dirname, '../../KreelsMobile/dist');
app.use(express.static(webDistPath));

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }
  res.sendFile(path.join(webDistPath, 'index.html'));
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
  if (redis) await redis.disconnect();
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
