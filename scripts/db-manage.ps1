# ConnectGig Database Management Script for Windows
# Run this script in PowerShell

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("status", "reset", "seed", "studio", "migrate", "push")]
    [string]$Action = "status"
)

Write-Host "🗄️  ConnectGig Database Management" -ForegroundColor Cyan

# Change to database package directory
Set-Location packages/database

switch ($Action) {
    "status" {
        Write-Host "📊 Checking database status..." -ForegroundColor Yellow
        npm run db:status
    }
    "reset" {
        Write-Host "🔄 Resetting database..." -ForegroundColor Yellow
        Write-Host "⚠️  This will delete all data and recreate the database!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            npm run db:reset
        } else {
            Write-Host "❌ Database reset cancelled" -ForegroundColor Yellow
        }
    }
    "seed" {
        Write-Host "🌱 Seeding database with initial data..." -ForegroundColor Yellow
        npm run db:seed
    }
    "studio" {
        Write-Host "🎨 Opening Prisma Studio..." -ForegroundColor Yellow
        npm run db:studio
    }
    "migrate" {
        Write-Host "📝 Running database migrations..." -ForegroundColor Yellow
        npm run db:migrate
    }
    "push" {
        Write-Host "🚀 Pushing schema changes to database..." -ForegroundColor Yellow
        npm run db:push
    }
}

# Return to root directory
Set-Location ../..

Write-Host "✅ Database operation completed!" -ForegroundColor Green
