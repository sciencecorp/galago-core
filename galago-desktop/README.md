# Galago Desktop

Galago Desktop is the standalone Electron application that bundles the Galago lab automation platform into a single installable package.

## Architecture

```
galago-desktop/
├── src/
│   └── main/
│       ├── index.ts      # Electron main process (orchestrator)
│       └── preload.ts    # Preload script for IPC bridge
├── resources/
│   └── binaries/         # Compiled Python executables go here
├── dist/                 # Compiled TypeScript output
├── release/              # Packaged application output
└── package.json
```

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+ (for building the backend)
- **PyInstaller** (for compiling Python to executable)

## Development Setup

### 1. Install Dependencies

```bash
# Install Electron dependencies
cd galago-desktop
npm install

# Install controller dependencies (Next.js frontend)
cd ../controller
npm install

# Install Python dependencies
cd ../db
pip install -r requirements.txt
pip install pyinstaller
```

### 2. Development Mode

Run the application in development mode (uses local servers):

```bash
# Terminal 1: Start the FastAPI backend
cd db
uvicorn db.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Start the Next.js frontend
cd controller
npm run dev

# Terminal 3: Start Electron in dev mode
cd galago-desktop
npm run dev:electron
```

Or use the combined dev script:
```bash
cd galago-desktop
npm run dev
```

## Building for Production

### Step 1: Build the Python Executable

On Windows (64-bit Python required):
```bash
cd db
pyinstaller galago-core.spec
```

On macOS/Linux:
```bash
cd db
pyinstaller galago-core.spec
```

This creates `dist/galago-core/` containing the executable.

### Step 2: Copy Binary to Resources

```bash
# From the project root
cp -r db/dist/galago-core galago-desktop/resources/binaries/
```

### Step 3: Build the Next.js Frontend

```bash
cd controller
npm run build:electron
```

This creates the static export in `controller/out/`.

### Step 4: Copy Frontend to Electron

```bash
cp -r controller/out galago-desktop/dist/renderer/
```

### Step 5: Package the Electron App

```bash
cd galago-desktop

# For Windows
npm run package:win

# For macOS
npm run package:mac

# For Linux
npm run package:linux
```

## Build Scripts Summary

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev mode with hot reload |
| `npm run dev:electron` | Start only Electron (assumes servers running) |
| `npm run build` | Build main process TypeScript |
| `npm run package` | Package for current platform |
| `npm run package:win` | Package Windows installer (.exe) |
| `npm run package:mac` | Package macOS app (.dmg) |
| `npm run package:linux` | Package Linux app (.AppImage, .deb) |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_SQLITE_QUEUE` | Use SQLite queue | `true` in Electron |
| `PORT` | FastAPI server port | `8000` |
| `NODE_ENV` | Node environment | `production` |

## Queue System

The application uses SQLite for the command queue, which is automatically enabled when running in Electron or when `USE_SQLITE_QUEUE=true`.

The queue database is stored in the user's app data directory:
- **Windows**: `%LOCALAPPDATA%\Galago\data\queue.db`
- **macOS**: `~/Library/Application Support/Galago/data/queue.db`
- **Linux**: `~/.galago/data/queue.db`

## Troubleshooting

### Port Already in Use
If port 8000 is in use, the app will automatically find the next available port.

### Backend Won't Start
Check the console output for Python errors. Ensure all Python dependencies are installed.

### Blank Screen in Electron
Check if the backend is running by visiting `http://localhost:8000/api/health` in a browser.

## Release Checklist

1. [ ] Update version in `package.json`
2. [ ] Build Python executable
3. [ ] Build Next.js frontend
4. [ ] Copy binaries and frontend to correct locations
5. [ ] Run `npm run package` for target platform
6. [ ] Test the packaged application
7. [ ] Sign the application (for distribution)

