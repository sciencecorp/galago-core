# **Galago Desktop Migration Guide**

**From Docker Containers to Single Executable**

This guide outlines the engineering steps required to convert the Galago web architecture into a standalone Electron Desktop Application. This approach eliminates the need for users to install Docker, Python, or Redis manually.

## **1\. High-Level Architecture**

Instead of Docker Compose managing three containers, the **Electron Main Process** will act as the orchestrator.

* **Old Architecture:** Docker Engine → (Next.js Container \+ FastAPI Container \+ Redis Container)  
* **New Architecture:** User PC → Galago.exe (Electron) → Spawns Child Processes:  
  1. galago-core.exe (64-bit FastAPI Server)  
  2. galago-tools.exe (32-bit gRPC Server)  
  3. sqlite.db (Replaces Redis for queue persistence)

## **2\. Directory Structure**

Create a new repository (or a new folder in galago-core) to house the Electron wrapper. You will likely pull in your existing code as submodules or subfolders.

galago-desktop/  
├── src/  
│   ├── main/  
│   │   └── index.ts          \# Electron Main Process (The "Orchestrator")  
│   └── renderer/             \# Your existing Next.js frontend code goes here  
├── resources/  
│   └── binaries/             \# Where we will put the compiled Python EXEs  
├── python-core/              \# Clone of galago-core repo  
└── python-tools/             \# Clone of galago-tools repo

## **3\. Step 1: Remove Redis Dependency (Python)**

Redis is too heavy to bundle. We will replace it with a file-based queue or an in-process queue.

**Target:** python-core

1. **Install huey:** A lightweight task queue that supports SQLite.  
   pip install huey

2. Update Queue Configuration:  
   Locate where you initialize your Redis connection (likely in services/queue.py or similar).  
   *Old (Redis):*  
   from redis import Redis  
   redis\_conn \= Redis(host='queue', port=6379)

   *New (SQLite):*  
   from huey import SqliteHuey  
   \# This creates a local file 'queue.db' inside the app data folder  
   task\_queue \= SqliteHuey(filename='galago\_queue.db')

## **4\. Step 2: Create Python Entry Points**

We need "One Script to Rule Them All" for each service to make compiling with PyInstaller easier.

A. Core Entry Point (python-core/entry\_point.py)  
This script must start the FastAPI server programmatically, not via CLI commands like uvicorn main:app.  
import uvicorn  
import os  
import sys  
\# Import your main FastAPI app  
from app.main import app 

if \_\_name\_\_ \== "\_\_main\_\_":  
    \# Allow port to be passed as env var (controlled by Electron)  
    port \= int(os.environ.get("PORT", 8000))  
      
    \# Freeze support is needed for Windows executables  
    from multiprocessing import freeze\_support  
    freeze\_support()  
      
    uvicorn.run(app, host="127.0.0.1", port=port, log\_level="info")

B. Tools Entry Point (python-tools/entry\_point.py)  
Similar logic for the gRPC server.  
import sys  
import os  
from galago\_tools.server import serve \# Assuming this exists in your lib

if \_\_name\_\_ \== "\_\_main\_\_":  
    port \= int(os.environ.get("GRPC\_PORT", 50051))  
    serve(port=port)

## **5\. Step 3: Compile Python Executables**

You must build these on a Windows machine. You need **two** virtual environments.

**Build 1: The Core (64-bit)**

1. Activate your standard Python 3.11 (64-bit) environment.  
2. Install pyinstaller.  
3. Build:  
   pyinstaller \--noconfirm \--onedir \--clean \--name galago-core \--distpath ../resources/binaries python-core/entry\_point.py

**Build 2: The Tools (32-bit)**

1. **Crucial:** Install Python 3.9 (32-bit version) from python.org.  
2. Create a virtual env using this specific python executable.  
3. Install pyinstaller and your tool dependencies.  
4. Build:  
   pyinstaller \--noconfirm \--onedir \--clean \--name galago-tools \--distpath ../resources/binaries python-tools/entry\_point.py

*Result:* You now have resources/binaries/galago-core/galago-core.exe and resources/binaries/galago-tools/galago-tools.exe.

## **6\. Step 4: Electron Orchestration**

Now we configure Electron to launch these EXEs in the background when the app starts.

**File:** src/main/index.ts

import { app, BrowserWindow } from 'electron';  
import path from 'path';  
import { spawn, ChildProcess } from 'child\_process';  
import getPort from 'get-port'; // Helper to find free ports

let mainWindow: BrowserWindow;  
let coreProcess: ChildProcess | null \= null;  
let toolsProcess: ChildProcess | null \= null;

const isDev \= process.env.NODE\_ENV \=== 'development';

// Helper to get path to binaries (handles Dev vs Prod paths)  
const getBinaryPath \= (name: string) \=\> {  
  const basePath \= isDev  
    ? path.join(\_\_dirname, '../../resources/binaries')  
    : path.join(process.resourcesPath, 'binaries');  
      
  return path.join(basePath, name, \`${name}.exe\`);  
};

async function startBackendServices() {  
  // 1\. Find free ports dynamically  
  const corePort \= await getPort({ port: 8000 });  
  const toolsPort \= await getPort({ port: 50051 });

  // 2\. Spawn Core (64-bit)  
  console.log(\`Starting Core on port ${corePort}...\`);  
  coreProcess \= spawn(getBinaryPath('galago-core'), \[\], {  
    env: { ...process.env, PORT: corePort.toString() }  
  });

  // 3\. Spawn Tools (32-bit)  
  console.log(\`Starting Tools on port ${toolsPort}...\`);  
  toolsProcess \= spawn(getBinaryPath('galago-tools'), \[\], {  
    env: { ...process.env, GRPC\_PORT: toolsPort.toString() }  
  });

  // 4\. Log outputs for debugging  
  coreProcess.stdout?.on('data', (data) \=\> console.log(\`\[Core\]: ${data}\`));  
  toolsProcess.stdout?.on('data', (data) \=\> console.log(\`\[Tools\]: ${data}\`));

  return { corePort, toolsPort };  
}

async function createWindow() {  
  const ports \= await startBackendServices();

  mainWindow \= new BrowserWindow({  
    width: 1200,  
    height: 800,  
    webPreferences: {  
      nodeIntegration: false,  
      preload: path.join(\_\_dirname, 'preload.js'),  
    },  
  });

  // Pass the dynamic ports to the frontend via query params or cookies  
  const startUrl \= isDev   
    ? 'http://localhost:3000'   
    : \`file://${path.join(\_\_dirname, '../renderer/out/index.html')}\`;

  mainWindow.loadURL(\`${startUrl}?apiPort=${ports.corePort}\`);  
}

// CLEANUP: Kill Python processes when Electron quits  
app.on('before-quit', () \=\> {  
  coreProcess?.kill();  
  toolsProcess?.kill();  
});

app.on('ready', createWindow);

## **7\. Step 5: Frontend Updates (Next.js)**

Your Next.js app expects to talk to localhost:8000. In the desktop version, the port might change dynamically (to avoid conflicts) or remain static.

**Update your API Client (e.g., tRPC setup or Axios):**

// In your API utility file  
const getBaseUrl \= () \=\> {  
  if (typeof window \!== 'undefined') {  
    // Read the port we passed in the URL query param in Electron  
    const urlParams \= new URLSearchParams(window.location.search);  
    const apiPort \= urlParams.get('apiPort') || '8000';  
    return \`http://localhost:${apiPort}\`;  
  }  
  return 'http://localhost:8000';  
};

## **8\. Step 6: Packaging (package.json)**

Use electron-builder to bundle everything.

{  
  "name": "galago-desktop",  
  "version": "1.0.0",  
  "scripts": {  
    "dev": "nextron",  
    "build": "nextron build",  
    "postinstall": "electron-builder install-app-deps"  
  },  
  "build": {  
    "appId": "com.sciencecorp.galago",  
    "productName": "Galago",  
    "win": {  
      "target": "nsis"  
    },  
    "files": \[  
      "dist/main/\*\*/\*",  
      "dist/renderer/\*\*/\*",  
      "package.json"  
    \],  
    "extraResources": \[  
      {  
        "from": "resources/binaries",  
        "to": "binaries",  
        "filter": \["\*\*/\*"\]  
      }  
    \]  
  }  
}

## **Summary of Changes**

| Component | Old Method | New Desktop Method |
| :---- | :---- | :---- |
| **Orchestration** | Docker Compose | Electron Main Process (child\_process.spawn) |
| **Core Runtime** | Python Docker Image | galago-core.exe (PyInstaller 64-bit) |
| **Tools Runtime** | Python Docker Image | galago-tools.exe (PyInstaller 32-bit) |
| **Queue** | Redis Service | huey with SQLite (Local file) |
| **Installation** | Git Clone \+ Docker Build | Double-click Galago\_Setup.exe |

