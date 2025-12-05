# GatherNote Server Quick Start

Write-Host "🚀 Starting GatherNote Server Setup..." -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`n📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "`n📦 Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`n📥 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Check if .env exists
Write-Host "`n🔧 Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Please create one with:" -ForegroundColor Yellow
    Write-Host @"
DATABASE_URL="mysql://username:password@localhost:3306/gathernote_db"
PORT=3001
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
"@ -ForegroundColor Cyan
    $continue = Read-Host "`nDo you want to continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}
else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}

# Generate Prisma Client
Write-Host "`n🔨 Generating Prisma Client..." -ForegroundColor Yellow
npm run db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated" -ForegroundColor Green

# Ask to push database schema
Write-Host "`n🗄️  Database Setup" -ForegroundColor Yellow
$pushDb = Read-Host "Do you want to push the database schema now? (y/n)"
if ($pushDb -eq "y") {
    npm run db:push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema pushed successfully" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Database push failed. You may need to configure your database first." -ForegroundColor Yellow
    }
}

# Display success message
Write-Host "`n✨ Setup complete!" -ForegroundColor Green
Write-Host "`nTo start the server:" -ForegroundColor Cyan
Write-Host "  Development mode: npm run dev" -ForegroundColor White
Write-Host "  Production mode:  npm start" -ForegroundColor White
Write-Host "`nAPI will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "`n📖 Check README.md for API documentation" -ForegroundColor Yellow
Write-Host "📝 Check API_TESTING.md for testing guide" -ForegroundColor Yellow

# Ask to start server
Write-Host ""
$startServer = Read-Host "Do you want to start the development server now? (y/n)"
if ($startServer -eq "y") {
    Write-Host "`n🚀 Starting development server..." -ForegroundColor Green
    npm run dev
}
