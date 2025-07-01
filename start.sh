#!/bin/bash

echo "🎬 Welcome to Kreels - Short-form Video Platform"
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "🔧 Setting up Kreels development environment..."

# Create .env file if it doesn't exist
if [ ! -f "api/.env" ]; then
    echo "📄 Creating API environment file..."
    cp api/.env.example api/.env
    echo "✅ Created api/.env from template"
    echo "⚠️  Please edit api/.env with your configuration (Mux, Stripe, etc.)"
fi

# Build and start services
echo "🚀 Building and starting services..."
docker compose up --build -d

echo ""
echo "✅ Kreels is now starting!"
echo ""
echo "🌐 Access your services:"
echo "   Web App:  http://localhost:3000"
echo "   API:      http://localhost:3001"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "📝 Useful Commands:"
echo "   View logs:     docker compose logs -f"
echo "   Stop services: docker compose down"
echo ""
echo "Happy coding! 🚀"
