# ConnectGig Web App Dependency Installation Script
# This script installs all dependencies for the web application

Write-Host "🚀 Installing ConnectGig Web App Dependencies..." -ForegroundColor Green

# Navigate to web app directory
Set-Location "apps/web"

# Install dependencies
Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Web app dependencies installed successfully!" -ForegroundColor Green
    
    # Build the web app
    Write-Host "🔨 Building web app..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Web app built successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Web app build failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Failed to install web app dependencies!" -ForegroundColor Red
}

# Return to root directory
Set-Location "../.."

Write-Host "🎉 Web app setup complete!" -ForegroundColor Green
Write-Host "💡 To start the web app, run: npm run web:dev" -ForegroundColor Cyan
