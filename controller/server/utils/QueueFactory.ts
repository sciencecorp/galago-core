/**
 * Queue Factory
 * 
 * Creates either a Redis-based queue (for Docker deployments) or
 * a SQLite-based queue (for Electron desktop app).
 * 
 * The queue type is determined by the USE_SQLITE_QUEUE environment variable
 * or automatically based on whether Redis is available.
 */

import RedisQueue from "./RedisQueue";
import SqliteQueue from "./SqliteQueue";
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

let _useSqliteQueue: boolean | null = null;

/**
 * Determine whether to use SQLite queue based on environment
 */
function shouldUseSqliteQueue(): boolean {
  if (_useSqliteQueue !== null) {
    return _useSqliteQueue;
  }

  // Check environment variable first
  if (process.env.USE_SQLITE_QUEUE === 'true') {
    _useSqliteQueue = true;
    return true;
  }

  if (process.env.USE_SQLITE_QUEUE === 'false') {
    _useSqliteQueue = false;
    return false;
  }

  // Check if we're in Electron
  if (typeof process !== 'undefined' && process.versions && 'electron' in process.versions) {
    _useSqliteQueue = true;
    return true;
  }

  // Check if Redis host is configured
  if (!process.env.REDIS_HOST) {
    _useSqliteQueue = true;
    return true;
  }

  _useSqliteQueue = false;
  return false;
}

/**
 * Create a command queue instance
 * 
 * @param queueName - Name of the queue
 * @returns Either a RedisQueue or SqliteQueue instance
 */
export function createQueue(queueName: string): ICommandQueue {
  if (shouldUseSqliteQueue()) {
    console.log(`[QueueFactory] Creating SQLite queue: ${queueName}`);
    return new SqliteQueue(queueName);
  } else {
    console.log(`[QueueFactory] Creating Redis queue: ${queueName}`);
    // Import redis lazily to avoid loading it when not needed
    const redis = require("./redis").default;
    return new RedisQueue(redis, queueName);
  }
}

/**
 * Get the queue type being used
 */
export function getQueueType(): 'redis' | 'sqlite' {
  return shouldUseSqliteQueue() ? 'sqlite' : 'redis';
}

