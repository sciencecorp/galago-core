#!/usr/bin/env python3
"""
Galago Core Entry Point

This script serves as the main entry point for the Galago FastAPI server
when packaged as a standalone executable using PyInstaller.

It handles:
- Multiprocessing freeze support (required for Windows executables)
- Dynamic port configuration via environment variables
- Proper signal handling for graceful shutdown
"""

import os
import sys
import signal
from multiprocessing import freeze_support


def setup_paths():
    """
    Setup Python paths for bundled executable.
    When running as a PyInstaller bundle, we need to ensure
    the correct paths are in sys.path.
    """
    if getattr(sys, 'frozen', False):
        # Running as compiled executable
        bundle_dir = os.path.dirname(sys.executable)
        # Add the bundle directory to path
        if bundle_dir not in sys.path:
            sys.path.insert(0, bundle_dir)
    else:
        # Running as script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(script_dir)
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)


def get_data_directory():
    """
    Get the data directory for storing SQLite databases.
    
    In production (bundled), use a standard app data location.
    In development, use the local data directory.
    """
    if getattr(sys, 'frozen', False):
        # Production: Use app data directory
        if sys.platform == 'win32':
            app_data = os.environ.get('LOCALAPPDATA', os.path.expanduser('~'))
            return os.path.join(app_data, 'Galago', 'data')
        elif sys.platform == 'darwin':
            return os.path.expanduser('~/Library/Application Support/Galago/data')
        else:
            return os.path.expanduser('~/.galago/data')
    else:
        # Development: Use local data directory
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')


def setup_environment():
    """
    Setup environment variables for the FastAPI server.
    """
    # Set up data directory
    data_dir = get_data_directory()
    os.makedirs(data_dir, exist_ok=True)
    
    # Override database URLs if not already set
    if 'INVENTORY_DB_PATH' not in os.environ:
        os.environ['INVENTORY_DB_PATH'] = os.path.join(data_dir, 'galago.db')
    if 'LOGS_DB_PATH' not in os.environ:
        os.environ['LOGS_DB_PATH'] = os.path.join(data_dir, 'logs.db')


def main():
    """
    Main entry point for the Galago FastAPI server.
    """
    # Freeze support is required for Windows executables with multiprocessing
    freeze_support()
    
    # Setup paths and environment
    setup_paths()
    setup_environment()
    
    # Import uvicorn and the app after path setup
    import uvicorn
    from db.main import app
    
    # Get port from environment variable (controlled by Electron)
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    
    # Log level
    log_level = os.environ.get("LOG_LEVEL", "info").lower()
    
    print(f"Starting Galago Core on {host}:{port}")
    print(f"Data directory: {get_data_directory()}")
    
    # Run the server
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level=log_level,
        # Disable reload in production
        reload=False,
    )


if __name__ == "__main__":
    main()

