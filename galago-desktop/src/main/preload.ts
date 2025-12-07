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
   * Get list of installed tools
   */
  getInstalledTools: () => ipcRenderer.invoke('get-installed-tools'),
  
  /**
   * Get tools directory path
   */
  getToolsDirectory: () => ipcRenderer.invoke('get-tools-directory'),
  
  /**
   * Install tools from a ZIP file
   */
  installToolsFromZip: (zipPath: string) => ipcRenderer.invoke('install-tools-from-zip', zipPath),
  
  /**
   * Open dialog to select tools ZIP
   */
  selectToolsZip: () => ipcRenderer.invoke('select-tools-zip'),
  
  /**
   * Check if a specific tool is installed
   */
  isToolInstalled: (toolName: string) => ipcRenderer.invoke('is-tool-installed', toolName),
  
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
      getInstalledTools: () => Promise<{ name: string; source: 'user' | 'bundled'; path: string }[]>;
      getToolsDirectory: () => Promise<string>;
      installToolsFromZip: (zipPath: string) => Promise<{ success: boolean; toolsDir?: string; error?: string }>;
      selectToolsZip: () => Promise<{ success: boolean; path?: string; canceled?: boolean }>;
      isToolInstalled: (toolName: string) => Promise<boolean>;
      isElectron: boolean;
      platform: NodeJS.Platform;
    };
  }
}

