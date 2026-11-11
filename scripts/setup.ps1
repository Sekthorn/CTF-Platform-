# ==============================================================================
# WebSec CTF - Automated Windows Developer Onboarding Script
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   WebSec CTF — Developer Environment Setup (Win)   " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Prerequisite Checks
Write-Host "`n[1/4] Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH. Please install Docker Desktop."
    exit 1
}

Write-Host "✓ Docker detected." -ForegroundColor Green

# 2. Environment Configuration
Write-Host "`n[2/4] Configuring environment (.env)..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..."
    Copy-Item ".env.example" ".env"

    # Generate random tokens
    $jwtSec = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 })) -replace '[/+=]', 'x'
    $refSec = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 })) -replace '[/+=]', 'y'
    $dbPass = [Convert]::ToBase64String((1..16 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 })) -replace '[/+=]', 'z'

    (Get-Content ".env") |
        ForEach-Object { $_ -replace 'JWT_SECRET=.*', "JWT_SECRET=$jwtSec" } |
        ForEach-Object { $_ -replace 'JWT_REFRESH_SECRET=.*', "JWT_REFRESH_SECRET=$refSec" } |
        ForEach-Object { $_ -replace 'DB_PASSWORD=.*', "DB_PASSWORD=$dbPass" } |
        Set-Content ".env"

    Write-Host "✓ Generated secure random credentials in .env" -ForegroundColor Green
} else {
    Write-Host "✓ Existing .env file found. Preserving current configuration." -ForegroundColor Green
}

# 3. Build & Launch Docker Services
Write-Host "`n[3/4] Building and launching containers..." -ForegroundColor Yellow
docker compose up -d --build

# 4. Verification
Write-Host "`n[4/4] Verifying services health..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
docker compose ps

Write-Host "`n====================================================" -ForegroundColor Green
Write-Host "   WebSec CTF is now running!                       " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "Frontend UI:         http://localhost:5173"
Write-Host "Backend API Base:    http://localhost:3000/api/v1"
Write-Host "Swagger Docs:        http://localhost:3000/api/v1/docs"
Write-Host "Health Check:        http://localhost:3000/api/v1/health"
Write-Host "MySQL Port (Dev):    3307"
Write-Host "`nDefault Dev Accounts:"
Write-Host "  Admin:    admin / AdminSecurePass2026!"
Write-Host "  Student:  student_hacker / StudentPass2026!"
Write-Host "====================================================`n"
