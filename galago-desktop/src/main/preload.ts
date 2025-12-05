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
   * Start a tool driver on-demand
   */
  startTool: (toolName: string, port?: number) => ipcRenderer.invoke('start-tool', toolName, port),
  
  /**
   * Stop a tool driver
   */
  stopTool: (toolName: string) => ipcRenderer.invoke('stop-tool', toolName),
  
  /**
   * Get all running tools and their ports
   */
  getRunningTools: () => ipcRenderer.invoke('get-running-tools'),
  
  /**
   * Get tool ports
   */
  getToolPorts: () => ipcRenderer.invoke('get-tool-ports'),
  
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
      startTool: (toolName: string, port?: number) => Promise<{ success: boolean; port?: number; error?: string; alreadyRunning?: boolean }>;
      stopTool: (toolName: string) => Promise<{ success: boolean; wasRunning: boolean }>;
      getRunningTools: () => Promise<Record<string, { port: number }>>;
      getToolPorts: () => Promise<Record<string, number>>;
      isElectron: boolean;
      platform: NodeJS.Platform;
    };
  }
}

