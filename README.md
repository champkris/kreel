# Kreels - Short-Form Video Platform

A TikTok-like vertical video platform with live streaming, social features, and TVOD monetization.

## 🚀 Features

- **Video Streaming**: Vertical short-form videos with adaptive bitrate streaming
- **Live Streaming**: Real-time streaming with chat and gift system
- **Social Features**: Comments, likes, forums, clubs
- **Monetization**: TVOD (pay-per-episode/series), wallet system, subscriptions
- **Multi-language**: Support for Thai, Korean, Chinese, Filipino, Indonesian, Japanese, Vietnamese
- **Mobile-First**: Optimized for mobile devices with responsive web interface

## 🛠️ Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** - REST API
- **Socket.io** - Real-time features
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Prisma** - Database ORM
- **JWT** - Authentication

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Router** - Navigation
- **Socket.io Client** - Real-time features

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy
- **Mux** - Video processing and streaming (recommended)

## 📦 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### 1. Clone and Setup
```bash
cd /Users/apichakriskalambasuta/Sites/localhost/kreels

# Copy environment files
cp api/.env.example api/.env
# Edit api/.env with your configuration
```

### 2. Start Development Environment
```bash
# Build and start all services
docker compose up --build

# Or run in background
docker compose up -d --build
```

### 3. Initialize Database
```bash
# Generate Prisma client and run migrations
docker compose exec api npx prisma migrate dev
docker compose exec api npx prisma generate

# Seed initial data (optional)
docker compose exec api npm run db:seed
```

### 4. Access Services
- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **Database**: postgres://kreels:kreels123@localhost:5432/kreels
- **Redis**: redis://localhost:6379

## 🔧 Development

### Local Development (without Docker)
```bash
# Install dependencies
cd api && npm install
cd ../web && npm install

# Start PostgreSQL and Redis locally
# Update api/.env with local database URLs

# Start API server
cd api
npm run dev

# Start web app (in another terminal)
cd web
npm start
```

### Database Management
```bash
# View database in browser
docker compose exec api npx prisma studio

# Reset database
docker compose exec api npx prisma migrate reset

# Generate new migration
docker compose exec api npx prisma migrate dev --name your_migration_name
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Videos (Coming Soon)
- `GET /api/videos` - List videos
- `POST /api/videos` - Upload video
- `GET /api/videos/:id` - Get video details

### Live Streaming (Coming Soon)
- `POST /api/live/start` - Start live stream
- `GET /api/live/:id` - Get live stream details

### Social Features (Coming Soon)
- `POST /api/social/like` - Like video
- `POST /api/social/comment` - Add comment
- `GET /api/social/feed` - Get user feed

## 🎥 Video Integration

### Recommended: Mux Integration
1. Sign up at [Mux.com](https://mux.com)
2. Get your API credentials
3. Add to `api/.env`:
```env
MUX_TOKEN_ID=your_token_id
MUX_TOKEN_SECRET=your_token_secret
```

### Alternative: Custom Video Processing
- FFmpeg for video transcoding
- AWS S3 + CloudFront for storage/CDN
- Custom HLS/DASH streaming implementation

## 💳 Payment Integration

### Stripe Setup
1. Get Stripe API keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Add to `api/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🌐 Deployment

### Production Setup
1. Update environment variables for production
2. Configure domain and SSL certificates
3. Use managed database services (AWS RDS, Google Cloud SQL)
4. Set up CDN for video delivery
5. Configure monitoring and logging

### Docker Production
```bash
# Build production images
docker compose -f docker-compose.prod.yml up --build
```

## 📊 Monitoring

### Health Checks
- API Health: `GET /health`
- Database connections via Docker health checks
- Redis connection monitoring

### Logs
```bash
# View API logs
docker compose logs -f api

# View all service logs
docker compose logs -f
```

## 🔒 Security

- JWT token authentication
- Rate limiting on API endpoints
- Input validation with express-validator
- Helmet.js for security headers
- CORS configuration
- Password hashing with bcrypt

## 🚧 Next Steps

1. **Complete Core Features**:
   - Video upload and processing
   - Video player with vertical scrolling
   - User profiles and settings

2. **Social Features**:
   - Comments and likes system
   - Forum and club functionality
   - Follow/following system

3. **Live Streaming**:
   - RTMP streaming setup
   - Real-time chat
   - Gift system implementation

4. **Monetization**:
   - Payment gateway integration
   - Subscription management
   - Wallet system completion

5. **Mobile Apps**:
   - React Native implementation
   - Push notifications
   - Offline capabilities

## 📄 License

This project is proprietary software for Kreels platform development.

## 🤝 Contributing

1. Create feature branches
2. Write tests for new features
3. Follow TypeScript and ESLint conventions
4. Update documentation

---

**Happy Coding! 🎬✨**
