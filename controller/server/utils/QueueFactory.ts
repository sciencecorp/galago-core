/**
 * Queue Factory
 * 
 * Creates a SQLite-based queue (default) or an in-memory fallback
 * when native SQLite modules aren't available.
 * 
 * The queue type is determined by the USE_MEMORY_QUEUE environment variable
 * or automatically based on whether SQLite is available.
 */

import InMemoryQueue from "./InMemoryQueue";
import type { RunCommand } from "@/types";

// Type for stored run commands with required queueId
export type StoredRunCommand = Readonly<RunCommand & Required<Pick<RunCommand, "queueId">>>;

// Common interface for queue implementations
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

let _queueType: 'sqlite' | 'memory' | null = null;

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
function determineQueueType(): 'sqlite' | 'memory' {
  if (_queueType !== null) {
    return _queueType;
  }

  // Force in-memory queue if explicitly requested
  if (process.env.USE_MEMORY_QUEUE === 'true') {
    console.log('[QueueFactory] Using in-memory queue (USE_MEMORY_QUEUE=true)');
    _queueType = 'memory';
    return 'memory';
  }

  // Default: try SQLite, fall back to memory
  if (isSqliteAvailable()) {
    _queueType = 'sqlite';
    return 'sqlite';
  }
  
  console.log('[QueueFactory] SQLite not available, using in-memory queue');
  _queueType = 'memory';
  return 'memory';
}

/**
 * Create a command queue instance
 * 
 * @param queueName - Name of the queue
 * @returns A SqliteQueue or InMemoryQueue instance
 */
export function createQueue(queueName: string): ICommandQueue {
  const queueType = determineQueueType();
  
  switch (queueType) {
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
export function getQueueType(): 'sqlite' | 'memory' {
  return determineQueueType();
}

