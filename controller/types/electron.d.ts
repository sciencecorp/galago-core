/**
 * Type declarations for the Galago Desktop Electron bridge
 * 
 * This declares the window.galagoDesktop object that is exposed
 * by the Electron preload script.
 */

interface GalagoDesktopAPI {
  /**
   * Get API configuration (ports, hosts)
   */
  getApiConfig: () => Promise<{
    corePort: number;
    coreHost: string;
    apiBaseUrl: string;
  }>;

  /**
   * Get the application version
   */
  getAppVersion: () => Promise<string>;

  /**
   * Get the data directory path
   */
  getDataDirectory: () => Promise<string>;

  /**
   * Restart the core service
   */
  restartCoreService: () => Promise<{ success: boolean; port: number }>;

  /**
   * Start a tool driver on-demand
   */
  startTool: (toolName: string, port?: number) => Promise<{ 
    success: boolean; 
    port?: number; 
    error?: string; 
    alreadyRunning?: boolean 
  }>;

  /**
   * Stop a tool driver
   */
  stopTool: (toolName: string) => Promise<{ success: boolean; wasRunning: boolean }>;

  /**
   * Get all running tools and their ports
   */
  getRunningTools: () => Promise<Record<string, { port: number }>>;

  /**
   * Get tool ports
   */
  getToolPorts: () => Promise<Record<string, number>>;

  /**
   * Get list of installed tools
   */
  getInstalledTools: () => Promise<{ name: string; source: 'user' | 'bundled'; path: string }[]>;

  /**
   * Get tools directory path
   */
  getToolsDirectory: () => Promise<string>;

  /**
   * Install tools from a ZIP file
   */
  installToolsFromZip: (zipPath: string) => Promise<{ success: boolean; toolsDir?: string; error?: string }>;

  /**
   * Open dialog to select tools ZIP
   */
  selectToolsZip: () => Promise<{ success: boolean; path?: string; canceled?: boolean }>;

  /**
   * Check if a specific tool is installed
   */
  isToolInstalled: (toolName: string) => Promise<boolean>;

  /**
   * Whether running in Electron
   */
  isElectron: boolean;

  /**
   * Current platform
   */
  platform: NodeJS.Platform;
}

declare global {
  interface Window {
    galagoDesktop?: GalagoDesktopAPI;
    __GALAGO_API_BASE_URL__?: string;
  }
}

export {};

