/**
 * Queue Factory
 * 
 * Creates either a Redis-based queue (for Docker deployments) or
 * a SQLite-based queue (for Electron desktop app), with an in-memory
 * fallback when native SQLite modules aren't available.
 * 
 * The queue type is determined by the USE_SQLITE_QUEUE environment variable
 * or automatically based on whether Redis is available.
 */

import RedisQueue from "./RedisQueue";
import InMemoryQueue from "./InMemoryQueue";
import type { StoredRunCommand } from "./RedisQueue";

// Re-export the type for use in other modules
export type { StoredRunCommand };

// Common interface for both queue implementations
export interface ICommandQueue {
  queueName: string;
  push(item: any): Promise<void>;
  runPush(runQueueId: string, runQueue: any): Promise<string>;
  startNext(): Promise<StoredRunCommand | false>;
  gotoCommandByIndex(runId: string, targetIndex: number): Promise<boolean>;
  gotoCommand(targetId: number): Promise<boolean>;
  clearCompleted(): Promise<void>;
  getRun(runId: string): Promise<any | false>;
  getAllRuns(): Promise<any[]>;
  getTotalRuns(): Promise<number>;
  all(): Promise<StoredRunCommand[]>;
  getPaginated(offset?: number, limit?: number): Promise<StoredRunCommand[]>;
  clearAll(): Promise<void>;
  clearByRunId(runId: string): Promise<void>;
  complete(id: number): Promise<void>;
  skip(id: number): Promise<void>;
  skipUntil(id: number): Promise<void>;
  fail(id: number, error: Error): Promise<void>;
  find(id: number): Promise<StoredRunCommand>;
  remove(id: number): Promise<void>;
}

let _queueType: 'redis' | 'sqlite' | 'memory' | null = null;

/**
 * Test if better-sqlite3 actually works (not just importable)
 */
function isSqliteAvailable(): boolean {
  try {
    const Database = require('better-sqlite3');
    // Actually try to create a database to verify native module works
    const testDb = new Database(':memory:');
    testDb.close();
    return true;
  } catch (e) {
    console.log('[QueueFactory] better-sqlite3 test failed:', (e as Error).message?.split('\n')[0]);
    return false;
  }
}

/**
 * Determine which queue type to use based on environment
 */
function determineQueueType(): 'redis' | 'sqlite' | 'memory' {
  if (_queueType !== null) {
    return _queueType;
  }

  // Force in-memory queue if explicitly requested
  if (process.env.USE_MEMORY_QUEUE === 'true') {
    console.log('[QueueFactory] Using in-memory queue (USE_MEMORY_QUEUE=true)');
    _queueType = 'memory';
    return 'memory';
  }

  // Check environment variable first
  if (process.env.USE_SQLITE_QUEUE === 'true') {
    // Try SQLite first, fall back to memory if it fails
    if (isSqliteAvailable()) {
      _queueType = 'sqlite';
      return 'sqlite';
    }
    console.log('[QueueFactory] SQLite requested but not available, using in-memory queue');
    _queueType = 'memory';
    return 'memory';
  }

  if (process.env.USE_SQLITE_QUEUE === 'false') {
    // Check if Redis is available
    if (process.env.REDIS_HOST) {
      _queueType = 'redis';
      return 'redis';
    }
    // Fall back to memory
    _queueType = 'memory';
    return 'memory';
  }

  // Check if we're in Electron or standalone environment
  if (typeof process !== 'undefined' && process.versions && 'electron' in process.versions) {
    // In Electron, try SQLite first
    if (isSqliteAvailable()) {
      _queueType = 'sqlite';
      return 'sqlite';
    }
    _queueType = 'memory';
    return 'memory';
  }

  // Check if Redis host is configured
  if (process.env.REDIS_HOST) {
    _queueType = 'redis';
    return 'redis';
  }

  // Default: try SQLite, fall back to memory
  if (isSqliteAvailable()) {
    _queueType = 'sqlite';
    return 'sqlite';
  }
  
  console.log('[QueueFactory] No SQLite or Redis available, using in-memory queue');
  _queueType = 'memory';
  return 'memory';
}

/**
 * Create a command queue instance
 * 
 * @param queueName - Name of the queue
 * @returns A RedisQueue, SqliteQueue, or InMemoryQueue instance
 */
export function createQueue(queueName: string): ICommandQueue {
  const queueType = determineQueueType();
  
  switch (queueType) {
    case 'redis':
      console.log(`[QueueFactory] Creating Redis queue: ${queueName}`);
      // Import redis lazily to avoid loading it when not needed
      const redis = require("./redis").default;
      return new RedisQueue(redis, queueName);
    
    case 'sqlite':
      console.log(`[QueueFactory] Creating SQLite queue: ${queueName}`);
      const SqliteQueue = require("./SqliteQueue").default;
      return new SqliteQueue(queueName);
    
    case 'memory':
    default:
      console.log(`[QueueFactory] Creating in-memory queue: ${queueName}`);
      return new InMemoryQueue(queueName);
  }
}

/**
 * Get the queue type being used
 */
export function getQueueType(): 'redis' | 'sqlite' | 'memory' {
  return determineQueueType();
}

