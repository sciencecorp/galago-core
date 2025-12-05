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

