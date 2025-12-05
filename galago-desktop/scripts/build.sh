#!/bin/bash
#
# Galago Desktop Build Script
# 
# This script builds all components of the Galago Desktop application:
# 1. Python backend (galago-core) using PyInstaller
# 2. Next.js frontend for Electron (static export)
# 3. Electron main process
# 4. Final packaged application
#
# Usage:
#   ./scripts/build.sh [platform]
#
# Platforms: win, mac, linux, all (default: current platform)
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESKTOP_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DESKTOP_DIR")"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Galago Desktop Build Script${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Check for required tools
check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed${NC}"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        echo -e "${RED}Error: Python is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}All dependencies found!${NC}"
    echo ""
}

# Build Python backend
build_python() {
    echo -e "${YELLOW}Building Python backend (galago-core)...${NC}"
    
    cd "$PROJECT_ROOT/db"
    
    # Check if PyInstaller is installed
    if ! python3 -m PyInstaller --version &> /dev/null; then
        echo -e "${YELLOW}Installing PyInstaller...${NC}"
        pip install pyinstaller
    fi
    
    # Install Python dependencies
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Build with PyInstaller
    echo "Running PyInstaller..."
    python3 -m PyInstaller galago-core.spec --clean --noconfirm
    
    # Copy to resources
    echo "Copying binary to resources..."
    rm -rf "$DESKTOP_DIR/resources/binaries/galago-core"
    cp -r dist/galago-core "$DESKTOP_DIR/resources/binaries/"
    
    echo -e "${GREEN}Python backend built successfully!${NC}"
    echo ""
}

# Build Next.js frontend
build_frontend() {
    echo -e "${YELLOW}Building Next.js frontend...${NC}"
    
    cd "$PROJECT_ROOT/controller"
    
    # Install dependencies
    echo "Installing npm dependencies..."
    npm install
    
    # Build for Electron (static export)
    echo "Building frontend for Electron..."
    ELECTRON_BUILD=true npm run build
    
    # Copy to Electron renderer
    echo "Copying frontend to Electron..."
    rm -rf "$DESKTOP_DIR/dist/renderer"
    mkdir -p "$DESKTOP_DIR/dist/renderer"
    cp -r out/* "$DESKTOP_DIR/dist/renderer/"
    
    echo -e "${GREEN}Frontend built successfully!${NC}"
    echo ""
}

# Build Electron main process
build_electron() {
    echo -e "${YELLOW}Building Electron main process...${NC}"
    
    cd "$DESKTOP_DIR"
    
    # Install dependencies
    echo "Installing Electron dependencies..."
    npm install
    
    # Build TypeScript
    echo "Compiling TypeScript..."
    npm run build:main
    
    echo -e "${GREEN}Electron main process built successfully!${NC}"
    echo ""
}

# Package the application
package_app() {
    local platform=$1
    
    echo -e "${YELLOW}Packaging application for ${platform}...${NC}"
    
    cd "$DESKTOP_DIR"
    
    case $platform in
        win)
            npm run package:win
            ;;
        mac)
            npm run package:mac
            ;;
        linux)
            npm run package:linux
            ;;
        all)
            npm run package
            ;;
        *)
            echo -e "${RED}Unknown platform: $platform${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}Application packaged successfully!${NC}"
    echo "Output: $DESKTOP_DIR/release/"
    echo ""
}

# Main build process
main() {
    local platform=${1:-$(uname -s | tr '[:upper:]' '[:lower:]')}
    
    # Convert platform name
    case $platform in
        darwin|macos)
            platform="mac"
            ;;
        windows*|mingw*|cygwin*)
            platform="win"
            ;;
        linux*)
            platform="linux"
            ;;
    esac
    
    echo "Target platform: $platform"
    echo ""
    
    check_dependencies
    build_python
    build_frontend
    build_electron
    package_app "$platform"
    
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}  Build completed successfully!${NC}"
    echo -e "${GREEN}======================================${NC}"
    echo ""
    echo "The packaged application is available in:"
    echo "  $DESKTOP_DIR/release/"
}

# Run main with arguments
main "$@"

