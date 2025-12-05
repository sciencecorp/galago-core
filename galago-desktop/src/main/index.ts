/**
 * Galago Desktop - Electron Main Process
 * 
 * This is the main orchestrator for the Galago desktop application.
 * It manages:
 * - Starting the FastAPI backend (galago-core)
 * - Starting the Next.js renderer process
 * - Managing application lifecycle
 * - IPC communication between main and renderer
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess, exec } from 'child_process';
import * as fs from 'fs';
import * as net from 'net';

// Development mode detection
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Store references to child processes
let mainWindow: BrowserWindow | null = null;
let coreProcess: ChildProcess | null = null;
let toolProcesses: Map<string, ChildProcess> = new Map();
let toolPorts: Map<string, number> = new Map();

// Port configuration
let corePort = 8000;
let rendererPort = 3010;

// Tool configuration (loaded from workcell config)
interface ToolDriverConfig {
  name: string;
  binaryName: string;
  defaultPort: number;
  is32bit?: boolean;  // Some tools need 32-bit for hardware compatibility
}

/**
 * Get the path to binary resources
 */
function getResourcePath(resourceName: string): string {
  if (isDev) {
    return path.join(__dirname, '../../resources', resourceName);
  }
  return path.join(process.resourcesPath, resourceName);
}

/**
 * Get the path to the Python executable
 */
function getPythonBinaryPath(): string {
  const platform = process.platform;
  const binaryDir = getResourcePath('binaries');
  
  if (platform === 'win32') {
    return path.join(binaryDir, 'galago-core', 'galago-core.exe');
  } else if (platform === 'darwin') {
    return path.join(binaryDir, 'galago-core', 'galago-core');
  } else {
    return path.join(binaryDir, 'galago-core', 'galago-core');
  }
}

/**
 * Get the path to a tool driver binary
 */
function getToolBinaryPath(toolName: string): string {
  const platform = process.platform;
  const binaryDir = getResourcePath('binaries');
  const ext = platform === 'win32' ? '.exe' : '';
  
  return path.join(binaryDir, 'tools', toolName, `${toolName}${ext}`);
}

/**
 * Start a tool driver process
 */
async function startToolDriver(config: ToolDriverConfig): Promise<number> {
  const port = await findAvailablePort(config.defaultPort);
  console.log(`[Tool:${config.name}] Starting on port ${port}`);
  
  const binaryPath = getToolBinaryPath(config.binaryName);
  
  // Check if binary exists
  if (!fs.existsSync(binaryPath)) {
    console.warn(`[Tool:${config.name}] Binary not found at ${binaryPath}, skipping...`);
    return config.defaultPort; // Return default port, tool might be external
  }
  
  const toolProcess = spawn(binaryPath, [], {
    env: {
      ...process.env,
      GRPC_PORT: port.toString(),
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  
  toolProcess.stdout?.on('data', (data) => {
    console.log(`[Tool:${config.name}] ${data.toString().trim()}`);
  });
  
  toolProcess.stderr?.on('data', (data) => {
    console.error(`[Tool:${config.name} Error] ${data.toString().trim()}`);
  });
  
  toolProcess.on('error', (error) => {
    console.error(`[Tool:${config.name}] Failed to start:`, error);
  });
  
  toolProcess.on('exit', (code) => {
    console.log(`[Tool:${config.name}] Process exited with code ${code}`);
    toolProcesses.delete(config.name);
  });
  
  toolProcesses.set(config.name, toolProcess);
  
  // Wait for the service to be ready
  try {
    await waitForService(port, 30000);
    console.log(`[Tool:${config.name}] Service is ready on port ${port}`);
  } catch (error) {
    console.warn(`[Tool:${config.name}] Service may not be ready:`, error);
  }
  
  return port;
}

/**
 * Start all configured tool drivers
 * Tools can be loaded from a config file or environment
 */
async function startToolDrivers(): Promise<Map<string, number>> {
  const toolPorts = new Map<string, number>();
  
  // Check for user tools config file first
  const userToolsConfigPath = path.join(getDataDirectory(), 'tools-config.json');
  
  // Fall back to default config bundled with the app
  const defaultToolsConfigPath = getResourcePath('default-tools-config.json');
  
  let configPath: string | null = null;
  
  if (fs.existsSync(userToolsConfigPath)) {
    configPath = userToolsConfigPath;
    console.log('[Tools] Loading user tools config from:', configPath);
  } else if (fs.existsSync(defaultToolsConfigPath)) {
    configPath = defaultToolsConfigPath;
    console.log('[Tools] Loading default tools config from:', configPath);
    
    // Copy default config to user data directory for future customization
    try {
      const defaultConfig = fs.readFileSync(defaultToolsConfigPath, 'utf-8');
      fs.writeFileSync(userToolsConfigPath, defaultConfig);
      console.log('[Tools] Copied default config to user data directory');
    } catch (err) {
      console.warn('[Tools] Could not copy default config:', err);
    }
  }
  
  if (configPath) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      
      for (const tool of config.tools || []) {
        if (tool.managed) {  // Only start tools marked as managed by Electron
          const binaryPath = getToolBinaryPath(tool.binaryName || tool.name.toLowerCase());
          
          // Only try to start if the binary exists
          if (fs.existsSync(binaryPath)) {
            const port = await startToolDriver({
              name: tool.name,
              binaryName: tool.binaryName || tool.name.toLowerCase(),
              defaultPort: tool.port || 50051,
              is32bit: tool.is32bit,
            });
            toolPorts.set(tool.name, port);
          } else {
            console.log(`[Tools] Skipping ${tool.name}: binary not found at ${binaryPath}`);
          }
        }
      }
    } catch (error) {
      console.error('[Tools] Failed to load tools config:', error);
    }
  } else {
    console.log('[Tools] No tools-config.json found, tools will connect externally');
  }
  
  return toolPorts;
}

/**
 * Start tools that are already configured in workcells
 * Queries the backend API for existing tools and starts their drivers
 */
async function startWorkcellTools(): Promise<void> {
  console.log('[Tools] Checking for existing workcell tools...');
  
  try {
    // Query the backend for all tools
    const response = await fetch(`http://127.0.0.1:${corePort}/api/tools`);
    if (!response.ok) {
      console.warn('[Tools] Failed to fetch tools from backend');
      return;
    }
    
    const tools = await response.json() as Array<{ name?: string; port?: number }>;
    console.log(`[Tools] Found ${tools.length} tools in database`);
    
    // Load tools config to get binary mappings
    const toolsConfigPath = path.join(getDataDirectory(), 'tools-config.json');
    const defaultToolsConfigPath = getResourcePath('default-tools-config.json');
    
    let toolsConfig: any = { tools: [] };
    if (fs.existsSync(toolsConfigPath)) {
      toolsConfig = JSON.parse(fs.readFileSync(toolsConfigPath, 'utf-8'));
    } else if (fs.existsSync(defaultToolsConfigPath)) {
      toolsConfig = JSON.parse(fs.readFileSync(defaultToolsConfigPath, 'utf-8'));
    }
    
    // Start each tool that has a binary available
    for (const tool of tools) {
      const toolName = tool.name?.toLowerCase();
      if (!toolName) continue;
      
      // Find config for this tool
      const config = toolsConfig.tools?.find((t: any) => 
        t.name?.toLowerCase() === toolName || t.binaryName?.toLowerCase() === toolName
      );
      
      const binaryName = config?.binaryName || toolName;
      const binaryPath = getToolBinaryPath(binaryName);
      
      // Only start if binary exists
      if (fs.existsSync(binaryPath)) {
        console.log(`[Tools] Starting ${toolName} (port: ${tool.port || config?.port || 50051})`);
        try {
          const port = await startToolDriver({
            name: toolName,
            binaryName,
            defaultPort: tool.port || config?.port || 50051,
          });
          console.log(`[Tools] ${toolName} started on port ${port}`);
        } catch (error) {
          console.error(`[Tools] Failed to start ${toolName}:`, error);
        }
      } else {
        console.log(`[Tools] Skipping ${toolName}: binary not found at ${binaryPath}`);
      }
    }
    
    console.log(`[Tools] Started ${toolPorts.size} tool drivers`);
  } catch (error) {
    console.error('[Tools] Error starting workcell tools:', error);
  }
}

/**
 * Get the data directory for the application
 */
function getDataDirectory(): string {
  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  return dataDir;
}

/**
 * Check if a port is available
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, '127.0.0.1');
    server.on('listening', () => {
      server.close();
      resolve(true);
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Find an available port starting from the given port
 */
async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {
      throw new Error(`Could not find available port starting from ${startPort}`);
    }
  }
  return port;
}

/**
 * Wait for a service to be ready on a given port
 */
function waitForService(port: number, timeout: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkService = () => {
      const client = net.createConnection({ port, host: '127.0.0.1' }, () => {
        client.end();
        resolve();
      });
      
      client.on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Service on port ${port} did not start within ${timeout}ms`));
        } else {
          setTimeout(checkService, 500);
        }
      });
    };
    
    checkService();
  });
}

/**
 * Start the FastAPI backend (galago-core)
 */
async function startCoreService(): Promise<void> {
  // Find available port
  corePort = await findAvailablePort(8000);
  console.log(`[Core] Starting on port ${corePort}`);
  
  const pythonBinary = getPythonBinaryPath();
  const dataDir = getDataDirectory();
  
  // Check if we're in development mode or have the binary
  if (isDev || !fs.existsSync(pythonBinary)) {
    console.log('[Core] Running in development mode or binary not found');
    console.log('[Core] Attempting to start with uvicorn...');
    
    // In development, try to run uvicorn directly
    const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
    
    // In dev mode, __dirname is galago-desktop/dist/main/
    // We need to go up to galago-core/ which is ../../.. (3 levels)
    const projectRoot = path.join(__dirname, '../../..');
    console.log(`[Core] Project root: ${projectRoot}`);
    
    coreProcess = spawn(pythonPath, [
      '-m', 'uvicorn',
      'db.main:app',
      '--host', '127.0.0.1',
      '--port', corePort.toString(),
    ], {
      cwd: projectRoot,
      env: {
        ...process.env,
        PORT: corePort.toString(),
        INVENTORY_DB_PATH: path.join(dataDir, 'galago.db'),
        LOGS_DB_PATH: path.join(dataDir, 'logs.db'),
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } else {
    // Production mode - use compiled binary
    coreProcess = spawn(pythonBinary, [], {
      env: {
        ...process.env,
        PORT: corePort.toString(),
        INVENTORY_DB_PATH: path.join(dataDir, 'galago.db'),
        LOGS_DB_PATH: path.join(dataDir, 'logs.db'),
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  }
  
  // Log output from the core service
  coreProcess.stdout?.on('data', (data) => {
    console.log(`[Core] ${data.toString().trim()}`);
  });
  
  coreProcess.stderr?.on('data', (data) => {
    console.error(`[Core Error] ${data.toString().trim()}`);
  });
  
  coreProcess.on('error', (error) => {
    console.error('[Core] Failed to start:', error);
  });
  
  coreProcess.on('exit', (code) => {
    console.log(`[Core] Process exited with code ${code}`);
    coreProcess = null;
  });
  
  // Wait for the service to be ready
  try {
    await waitForService(corePort, 60000);
    console.log('[Core] Service is ready');
  } catch (error) {
    console.error('[Core] Service failed to start:', error);
    throw error;
  }
}

/**
 * Create the main application window
 */
async function createWindow(): Promise<void> {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false, // Don't show until ready
    backgroundColor: '#1a1a2e',
  });
  
  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });
  
  // Determine the URL to load
  let loadUrl: string;
  
  if (isDev) {
    // Development: Connect to the Next.js dev server
    loadUrl = `http://localhost:${rendererPort}`;
  } else {
    // Production: Load the exported Next.js app
    loadUrl = `file://${path.join(__dirname, '../renderer/out/index.html')}`;
  }
  
  // Add query parameters for API configuration
  const urlWithParams = `${loadUrl}?apiPort=${corePort}&apiHost=127.0.0.1`;
  
  console.log(`[Window] Loading URL: ${urlWithParams}`);
  
  // Load the URL
  try {
    await mainWindow.loadURL(urlWithParams);
  } catch (error) {
    console.error('[Window] Failed to load URL:', error);
    // Try to load a local error page or retry
    dialog.showErrorBox('Failed to Load', 
      `Could not load the application. Please ensure all services are running.\n\nError: ${error}`
    );
  }
  
  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

/**
 * Cleanup and shutdown all services
 */
async function cleanup(): Promise<void> {
  console.log('[App] Cleaning up...');
  
  // Kill tool processes
  for (const [name, toolProcess] of toolProcesses) {
    console.log(`[Tool:${name}] Stopping service...`);
    toolProcess.kill('SIGTERM');
  }
  
  // Wait a bit for tools to shutdown
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Force kill any remaining tool processes
  for (const [name, toolProcess] of toolProcesses) {
    if (!toolProcess.killed) {
      toolProcess.kill('SIGKILL');
    }
  }
  toolProcesses.clear();
  
  // Kill core process
  if (coreProcess) {
    console.log('[Core] Stopping service...');
    coreProcess.kill('SIGTERM');
    
    // Wait for graceful shutdown, then force kill
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (coreProcess) {
          coreProcess.kill('SIGKILL');
        }
        resolve();
      }, 5000);
      
      coreProcess?.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
    
    coreProcess = null;
  }
  
  console.log('[App] Cleanup complete');
}

// Application ready
app.whenReady().then(async () => {
  console.log('[App] Starting Galago Desktop...');
  console.log(`[App] Running in ${isDev ? 'development' : 'production'} mode`);
  console.log(`[App] User data path: ${app.getPath('userData')}`);
  
  try {
    // Start backend services
    await startCoreService();
    
    // Start tools that are already configured in workcells
    await startWorkcellTools();
    
    // Create the window
    await createWindow();
  } catch (error) {
    console.error('[App] Failed to start:', error);
    dialog.showErrorBox('Startup Error', 
      `Failed to start Galago Desktop:\n\n${error}`
    );
    app.quit();
  }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create window on macOS when dock icon is clicked
app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

// Cleanup before quit
app.on('before-quit', async (event) => {
  event.preventDefault();
  await cleanup();
  app.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[App] Uncaught exception:', error);
  dialog.showErrorBox('Unexpected Error', 
    `An unexpected error occurred:\n\n${error.message}`
  );
});

// IPC Handlers
ipcMain.handle('get-api-config', () => {
  return {
    corePort,
    coreHost: '127.0.0.1',
    apiBaseUrl: `http://127.0.0.1:${corePort}/api`,
  };
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-data-directory', () => {
  return getDataDirectory();
});

ipcMain.handle('restart-core-service', async () => {
  console.log('[IPC] Restarting core service...');
  
  if (coreProcess) {
    coreProcess.kill('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  
  await startCoreService();
  return { success: true, port: corePort };
});

ipcMain.handle('get-tool-ports', () => {
  const ports: Record<string, number> = {};
  for (const [name, port] of toolPorts) {
    ports[name] = port;
  }
  return ports;
});

ipcMain.handle('get-tools-config-path', () => {
  return path.join(getDataDirectory(), 'tools-config.json');
});

// Start a specific tool driver on-demand
ipcMain.handle('start-tool', async (_event, toolName: string, port?: number) => {
  console.log(`[IPC] Request to start tool: ${toolName}`);
  
  // Check if already running
  if (toolProcesses.has(toolName)) {
    const existingPort = toolPorts.get(toolName);
    console.log(`[IPC] Tool ${toolName} already running on port ${existingPort}`);
    return { success: true, port: existingPort, alreadyRunning: true };
  }
  
  // Load tools config to get binary name and default port
  const toolsConfigPath = path.join(getDataDirectory(), 'tools-config.json');
  let toolConfig: any = null;
  
  if (fs.existsSync(toolsConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(toolsConfigPath, 'utf-8'));
      toolConfig = config.tools?.find((t: any) => t.name === toolName);
    } catch (error) {
      console.error('[IPC] Failed to load tools config:', error);
    }
  }
  
  const binaryName = toolConfig?.binaryName || toolName.toLowerCase();
  const defaultPort = port || toolConfig?.port || 50051;
  
  try {
    const actualPort = await startToolDriver({
      name: toolName,
      binaryName,
      defaultPort,
    });
    return { success: true, port: actualPort };
  } catch (error) {
    console.error(`[IPC] Failed to start tool ${toolName}:`, error);
    return { success: false, error: String(error) };
  }
});

// Stop a specific tool driver
ipcMain.handle('stop-tool', async (_event, toolName: string) => {
  console.log(`[IPC] Request to stop tool: ${toolName}`);
  
  const toolProcess = toolProcesses.get(toolName);
  if (!toolProcess) {
    console.log(`[IPC] Tool ${toolName} is not running`);
    return { success: true, wasRunning: false };
  }
  
  toolProcess.kill('SIGTERM');
  toolProcesses.delete(toolName);
  toolPorts.delete(toolName);
  
  console.log(`[IPC] Tool ${toolName} stopped`);
  return { success: true, wasRunning: true };
});

// Get status of all running tools
ipcMain.handle('get-running-tools', () => {
  const running: Record<string, { port: number }> = {};
  for (const [name, port] of toolPorts) {
    running[name] = { port };
  }
  return running;
});

