# ConnectGig Clean Development Environment Script for Windows
# Run this script in PowerShell

Write-Host "🧹 Cleaning ConnectGig development environment..." -ForegroundColor Yellow

# Stop Docker services
Write-Host "🐳 Stopping Docker services..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.yml down

# Clean build artifacts
Write-Host "🗑️  Cleaning build artifacts..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Removed dist" -ForegroundColor Green
}

if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Removed .next" -ForegroundColor Green
}

if (Test-Path "coverage") {
    Remove-Item -Recurse -Force "coverage"
    Write-Host "✅ Removed coverage" -ForegroundColor Green
}

# Clean package-specific build artifacts
Get-ChildItem -Path "packages" -Directory | ForEach-Object {
    $packagePath = $_.FullName
    if (Test-Path "$packagePath/node_modules") {
        Remove-Item -Recurse -Force "$packagePath/node_modules"
        Write-Host "✅ Removed $($_.Name)/node_modules" -ForegroundColor Green
    }
    if (Test-Path "$packagePath/dist") {
        Remove-Item -Recurse -Force "$packagePath/dist"
        Write-Host "✅ Removed $($_.Name)/dist" -ForegroundColor Green
    }
}

Get-ChildItem -Path "apps" -Directory | ForEach-Object {
    $appPath = $_.FullName
    if (Test-Path "$appPath/node_modules") {
        Remove-Item -Recurse -Force "$appPath/node_modules"
        Write-Host "✅ Removed $($_.Name)/node_modules" -ForegroundColor Green
    }
    if (Test-Path "$appPath/dist") {
        Remove-Item -Recurse -Force "$appPath/dist"
        Write-Host "✅ Removed $($_.Name)/dist" -ForegroundColor Green
    }
    if (Test-Path "$appPath/.next") {
        Remove-Item -Recurse -Force "$appPath/.next"
        Write-Host "✅ Removed $($_.Name)/.next" -ForegroundColor Green
    }
}

# Clean lock files (optional - uncomment if you want to start fresh)
# if (Test-Path "package-lock.json") {
#     Remove-Item "package-lock.json"
#     Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
# }

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host "💡 To start fresh, run: npm install" -ForegroundColor Cyan
