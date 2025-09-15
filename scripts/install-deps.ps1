# ConnectGig Install Dependencies Script for Windows
# Run this script in PowerShell

Write-Host "📦 Installing ConnectGig dependencies..." -ForegroundColor Green

# Install root dependencies
Write-Host "🔧 Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install package dependencies
Write-Host "📚 Installing package dependencies..." -ForegroundColor Yellow

# Types package
Write-Host "  - Installing @connectgig/types..." -ForegroundColor Cyan
cd packages/types
npm install
cd ../..

# Database package
Write-Host "  - Installing @connectgig/database..." -ForegroundColor Cyan
cd packages/database
npm install
cd ../..

# UI package
Write-Host "  - Installing @connectgig/ui..." -ForegroundColor Cyan
cd packages/ui
npm install
cd ../..

# Utils package
Write-Host "  - Installing @connectgig/utils..." -ForegroundColor Cyan
cd packages/utils
npm install
cd ../..

# Build all packages
Write-Host "🏗️  Building all packages..." -ForegroundColor Yellow
npm run build

Write-Host "✅ All dependencies installed and packages built!" -ForegroundColor Green
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run 'npm run dev:setup' to set up the development environment" -ForegroundColor White
Write-Host "   2. Run 'npm run dev:web' to start the web app" -ForegroundColor White
Write-Host "   3. Run 'npm run dev:api' to start the API" -ForegroundColor White
