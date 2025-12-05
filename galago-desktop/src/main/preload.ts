/**
 * Galago Desktop - Preload Script
 * 
 * This script runs in the renderer process before other scripts load.
 * It exposes a safe, limited API to the renderer process via contextBridge.
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('galagoDesktop', {
  /**
   * Get API configuration (ports, hosts)
   */
  getApiConfig: () => ipcRenderer.invoke('get-api-config'),
  
  /**
   * Get the application version
   */
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  /**
   * Get the data directory path
   */
  getDataDirectory: () => ipcRenderer.invoke('get-data-directory'),
  
  /**
   * Restart the core service
   */
  restartCoreService: () => ipcRenderer.invoke('restart-core-service'),
  
  /**
   * Check if running in Electron
   */
  isElectron: true,
  
  /**
   * Platform information
   */
  platform: process.platform,
});

// Type declarations for the exposed API
declare global {
  interface Window {
    galagoDesktop: {
      getApiConfig: () => Promise<{
        corePort: number;
        coreHost: string;
        apiBaseUrl: string;
      }>;
      getAppVersion: () => Promise<string>;
      getDataDirectory: () => Promise<string>;
      restartCoreService: () => Promise<{ success: boolean; port: number }>;
      isElectron: boolean;
      platform: NodeJS.Platform;
    };
  }
}

