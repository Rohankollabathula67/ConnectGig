#!/bin/bash

echo "🚀 Setting up ConnectGig development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker Compose is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start database services
echo "🐘 Starting database services..."
cd docker
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check database connection
echo "🔍 Checking database connection..."
cd ..

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "✅ .env.local created. Please update the database credentials."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd packages/database
npm run db:generate

# Push database schema
echo "🗄️ Pushing database schema..."
npm run db:push

# Seed initial data
echo "🌱 Seeding initial data..."
npm run db:seed

cd ../..

echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys and configuration"
echo "2. Start the development servers:"
echo "   - npm run web:dev      # Web app"
echo "   - npm run mobile:dev   # Mobile app"
echo "   - npm run api:dev      # API server"
echo "   - npm run admin:dev    # Admin dashboard"
echo ""
echo "Database services are running at:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - pgAdmin: http://localhost:5050"
echo "   - Redis Commander: http://localhost:8081"
echo ""
echo "Happy coding! 🚀"
