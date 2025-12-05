#
# Galago Desktop Build Script for Windows
# 
# This script builds all components of the Galago Desktop application:
# 1. Python backend (galago-core) using PyInstaller
# 2. Next.js frontend for Electron (static export)
# 3. Electron main process
# 4. Final packaged application
#
# Usage:
#   .\scripts\build.ps1 [-Platform <win|mac|linux|all>]
#
# Requirements:
#   - Python 3.10+ with pip
#   - Node.js 18+ with npm
#   - PyInstaller
#

param(
    [string]$Platform = "win"
)

$ErrorActionPreference = "Stop"

# Script paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DesktopDir = Split-Path -Parent $ScriptDir
$ProjectRoot = Split-Path -Parent $DesktopDir

Write-Host "======================================" -ForegroundColor Green
Write-Host "  Galago Desktop Build Script" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

function Check-Dependencies {
    Write-Host "Checking dependencies..." -ForegroundColor Yellow
    
    # Check Node.js
    try {
        $null = & node --version 2>&1
        Write-Host "  Node.js: Found" -ForegroundColor Green
    } catch {
        Write-Host "  Node.js: NOT FOUND" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
    
    # Check npm
    try {
        $null = & npm --version 2>&1
        Write-Host "  npm: Found" -ForegroundColor Green
    } catch {
        Write-Host "  npm: NOT FOUND" -ForegroundColor Red
        exit 1
    }
    
    # Check Python
    try {
        $null = & python --version 2>&1
        Write-Host "  Python: Found" -ForegroundColor Green
    } catch {
        Write-Host "  Python: NOT FOUND" -ForegroundColor Red
        Write-Host "Please install Python from https://python.org/" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "All dependencies found!" -ForegroundColor Green
    Write-Host ""
}

function Build-Python {
    Write-Host "Building Python backend (galago-core)..." -ForegroundColor Yellow
    
    Set-Location "$ProjectRoot\db"
    
    # Check/Install PyInstaller
    try {
        $null = & python -m PyInstaller --version 2>&1
    } catch {
        Write-Host "Installing PyInstaller..." -ForegroundColor Yellow
        & pip install pyinstaller
    }
    
    # Install dependencies
    Write-Host "Installing Python dependencies..."
    & pip install -r requirements.txt
    
    # Build with PyInstaller
    Write-Host "Running PyInstaller..."
    & python -m PyInstaller galago-core.spec --clean --noconfirm
    
    # Copy to resources
    Write-Host "Copying binary to resources..."
    $targetDir = "$DesktopDir\resources\binaries\galago-core"
    if (Test-Path $targetDir) {
        Remove-Item -Path $targetDir -Recurse -Force
    }
    Copy-Item -Path "dist\galago-core" -Destination "$DesktopDir\resources\binaries\" -Recurse
    
    Write-Host "Python backend built successfully!" -ForegroundColor Green
    Write-Host ""
}

function Build-Frontend {
    Write-Host "Building Next.js frontend..." -ForegroundColor Yellow
    
    Set-Location "$ProjectRoot\controller"
    
    # Install dependencies
    Write-Host "Installing npm dependencies..."
    & npm install
    
    # Build for Electron
    Write-Host "Building frontend for Electron..."
    $env:ELECTRON_BUILD = "true"
    & npm run build
    
    # Copy to Electron renderer
    Write-Host "Copying frontend to Electron..."
    $rendererDir = "$DesktopDir\dist\renderer"
    if (Test-Path $rendererDir) {
        Remove-Item -Path $rendererDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $rendererDir -Force | Out-Null
    Copy-Item -Path "out\*" -Destination $rendererDir -Recurse
    
    Write-Host "Frontend built successfully!" -ForegroundColor Green
    Write-Host ""
}

function Build-Electron {
    Write-Host "Building Electron main process..." -ForegroundColor Yellow
    
    Set-Location $DesktopDir
    
    # Install dependencies
    Write-Host "Installing Electron dependencies..."
    & npm install
    
    # Build TypeScript
    Write-Host "Compiling TypeScript..."
    & npm run build:main
    
    Write-Host "Electron main process built successfully!" -ForegroundColor Green
    Write-Host ""
}

function Package-App {
    param([string]$TargetPlatform)
    
    Write-Host "Packaging application for $TargetPlatform..." -ForegroundColor Yellow
    
    Set-Location $DesktopDir
    
    switch ($TargetPlatform) {
        "win" {
            & npm run package:win
        }
        "mac" {
            & npm run package:mac
        }
        "linux" {
            & npm run package:linux
        }
        "all" {
            & npm run package
        }
        default {
            Write-Host "Unknown platform: $TargetPlatform" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "Application packaged successfully!" -ForegroundColor Green
    Write-Host "Output: $DesktopDir\release\"
    Write-Host ""
}

# Main
Write-Host "Target platform: $Platform"
Write-Host ""

Check-Dependencies
Build-Python
Build-Frontend
Build-Electron
Package-App -TargetPlatform $Platform

Write-Host "======================================" -ForegroundColor Green
Write-Host "  Build completed successfully!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "The packaged application is available in:"
Write-Host "  $DesktopDir\release\"

