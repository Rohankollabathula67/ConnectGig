# ConnectGig Development Environment Setup Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "🚀 Setting up ConnectGig development environment..." -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if Docker Desktop is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop" -ForegroundColor Red
    exit 1
}

# Check Node.js version
$nodeVersion = (node --version).TrimStart('v')
$majorVersion = [int]($nodeVersion.Split('.')[0])
if ($majorVersion -lt 18) {
    Write-Host "❌ Node.js version $nodeVersion is too old. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version $nodeVersion is compatible" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Start Docker services
Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.yml up -d

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "🔧 Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env.local"
    Write-Host "⚠️  Please update .env.local with your actual configuration values" -ForegroundColor Yellow
}

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
cd packages/database
npm run db:generate
cd ../..

# Push database schema
Write-Host "🗄️  Pushing database schema..." -ForegroundColor Yellow
cd packages/database
npm run db:push
cd ../..

# Seed initial data
Write-Host "🌱 Seeding initial data..." -ForegroundColor Yellow
cd packages/database
npm run db:seed
cd ../..

Write-Host "✅ Development environment setup complete!" -ForegroundColor Green
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update .env.local with your configuration" -ForegroundColor White
Write-Host "   2. Run 'npm run dev:web' to start the web app" -ForegroundColor White
Write-Host "   3. Run 'npm run dev:api' to start the API" -ForegroundColor White
Write-Host "   4. Run 'npm run dev:mobile' to start the mobile app" -ForegroundColor White
