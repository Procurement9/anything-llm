<#
.SYNOPSIS
    Automated Windows Installation and Deployment Script for AnythingLLM
    Repository: Procurement9/anything-llm

.DESCRIPTION
    This script performs a full local installation of AnythingLLM on Windows.
    It handles:
    1. Prerequisites checking (Node.js, Yarn, Git)
    2. Cloning the specific GitHub repository (Procurement9/anything-llm)
    3. Installing dependencies for frontend, server, and collector
    4. Setting up environment variables (.env files)
    5. Initializing the Prisma database
    6. Building the frontend for production
    7. Creating a desktop shortcut to launch the application
    8. Providing instructions for starting the service locally

.NOTES
    Author: Manus AI
    Date: July 6, 2026
    Requires: Run as Administrator (for shortcut creation and global yarn installs if needed)
#>

# Requires Run as Administrator
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run this script as an Administrator."
    Write-Host "Right-click PowerShell and select 'Run as Administrator'."
    Pause
    exit
}

$InstallDir = "C:\AnythingLLM"
$RepoUrl = "https://github.com/Procurement9/anything-llm.git"
$NodeVersion = "18.x"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   AnythingLLM Windows Local Installation Script" -ForegroundColor Cyan
Write-Host "   Repository: Procurement9/anything-llm" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Function to check prerequisites
function Check-Command {
    param ([string]$CommandName)
    try {
        $null = Get-Command $CommandName -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# 1. Check Prerequisites
Write-Host "[1/8] Checking Prerequisites..." -ForegroundColor Yellow

if (-not (Check-Command "git")) {
    Write-Error "Git is not installed or not in PATH. Please install Git for Windows: https://git-scm.com/download/win"
    exit
}

if (-not (Check-Command "node")) {
    Write-Error "Node.js is not installed. Please install Node.js (v18 or higher): https://nodejs.org/"
    exit
}

if (-not (Check-Command "yarn")) {
    Write-Host "Yarn is not installed. Installing yarn globally via npm..." -ForegroundColor Cyan
    npm install -g yarn
}

Write-Host "Prerequisites met." -ForegroundColor Green

# 2. Setup Directory and Clone Repository
Write-Host "`n[2/8] Setting up installation directory and cloning repository..." -ForegroundColor Yellow

if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

Set-Location $InstallDir

if (Test-Path "$InstallDir\anything-llm") {
    Write-Host "Directory 'anything-llm' already exists. Pulling latest changes..." -ForegroundColor Cyan
    Set-Location "$InstallDir\anything-llm"
    git pull origin master
} else {
    Write-Host "Cloning $RepoUrl..." -ForegroundColor Cyan
    git clone $RepoUrl anything-llm
    Set-Location "$InstallDir\anything-llm"
}

# 3. Setup Environment Variables
Write-Host "`n[3/8] Configuring Environment Variables..." -ForegroundColor Yellow

# Copy .env.example to .env for all modules
Copy-Item -Path "frontend\.env.example" -Destination "frontend\.env" -Force
Copy-Item -Path "server\.env.example" -Destination "server\.env.development" -Force
Copy-Item -Path "collector\.env.example" -Destination "collector\.env" -Force
Copy-Item -Path "docker\.env.example" -Destination "docker\.env" -Force

# Generate random secrets for server/.env.development
$JWT_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
$SIG_KEY = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
$SIG_SALT = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

$EnvFile = "server\.env.development"
(Get-Content $EnvFile) -replace 'JWT_SECRET=".*"', "JWT_SECRET=`"$JWT_SECRET`"" | Set-Content $EnvFile
(Get-Content $EnvFile) -replace "SIG_KEY='.*'", "SIG_KEY='$SIG_KEY'" | Set-Content $EnvFile
(Get-Content $EnvFile) -replace "SIG_SALT='.*'", "SIG_SALT='$SIG_SALT'" | Set-Content $EnvFile

Write-Host "Environment variables configured with secure random keys." -ForegroundColor Green

# 4. Install Dependencies
Write-Host "`n[4/8] Installing Dependencies (This may take a few minutes)..." -ForegroundColor Yellow

Write-Host "Installing Server dependencies..." -ForegroundColor Cyan
Set-Location "$InstallDir\anything-llm\server"
yarn install

Write-Host "Installing Collector dependencies..." -ForegroundColor Cyan
Set-Location "$InstallDir\anything-llm\collector"
yarn install

Write-Host "Installing Frontend dependencies..." -ForegroundColor Cyan
Set-Location "$InstallDir\anything-llm\frontend"
yarn install

# 5. Database Setup (Prisma)
Write-Host "`n[5/8] Initializing Local Database (SQLite via Prisma)..." -ForegroundColor Yellow
Set-Location "$InstallDir\anything-llm\server"
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# 6. Build Frontend for Production
Write-Host "`n[6/8] Building Frontend for Local Deployment..." -ForegroundColor Yellow
Set-Location "$InstallDir\anything-llm\frontend"
yarn build

Write-Host "Copying frontend build to server public directory..." -ForegroundColor Cyan
Set-Location "$InstallDir\anything-llm"
if (Test-Path "server\public") { Remove-Item -Recurse -Force "server\public" }
Copy-Item -Path "frontend\dist" -Destination "server\public" -Recurse

# 7. Create Launch Script
Write-Host "`n[7/8] Creating Windows Launch Script..." -ForegroundColor Yellow
Set-Location $InstallDir

$LauncherScript = @"
@echo off
title AnythingLLM Local Server
color 0A
echo ========================================================
echo Starting AnythingLLM Local Instance
echo ========================================================
echo.

cd /d "%~dp0anything-llm"

echo Starting Collector...
start "AnythingLLM Collector" cmd /c "cd collector && set NODE_ENV=production && node index.js"

echo Starting Server...
start "AnythingLLM Server" cmd /c "cd server && set NODE_ENV=production && node index.js"

echo.
echo Services are starting in background windows.
echo Waiting 10 seconds for services to initialize...
timeout /t 10 /nobreak > nul

echo.
echo Launching AnythingLLM UI in your default browser...
start http://localhost:3001

echo.
echo Keep this window open. Close this window to stop the services.
pause
taskkill /fi "WindowTitle eq AnythingLLM Collector*" /t /f > nul 2>&1
taskkill /fi "WindowTitle eq AnythingLLM Server*" /t /f > nul 2>&1
"@

Set-Content -Path "$InstallDir\Start-AnythingLLM.bat" -Value $LauncherScript

# 8. Create Desktop Shortcut
Write-Host "`n[8/8] Creating Desktop Shortcut..." -ForegroundColor Yellow
$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\AnythingLLM.lnk")
$Shortcut.TargetPath = "$InstallDir\Start-AnythingLLM.bat"
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.Description = "Launch AnythingLLM Local Server"
# Try to use a generic icon
$Shortcut.IconLocation = "shell32.dll, 14"
$Shortcut.Save()

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   Installation Complete!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "AnythingLLM has been successfully installed to: $InstallDir"
Write-Host "A shortcut has been placed on your Desktop: 'AnythingLLM'"
Write-Host ""
Write-Host "To start the application:"
Write-Host "1. Double-click the 'AnythingLLM' shortcut on your Desktop."
Write-Host "2. The local server will start, and your browser will open to http://localhost:3001"
Write-Host ""
Write-Host "Note: By default, AnythingLLM runs using a local SQLite database and local storage."
Write-Host "To configure specific LLMs (OpenAI, LocalAI, Ollama, etc.), open the UI in your browser and use the settings panel."
Write-Host "========================================================" -ForegroundColor Green
