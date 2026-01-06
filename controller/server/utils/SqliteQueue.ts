import { Run, RunCommand, RunQueue } from "@/types";
import SuperJSON from "superjson";
import { setRunStatusWithTimestamp } from "./HasRunStatus";
import Database from "better-sqlite3";
import path from "path";
import os from "os";
import fs from "fs";

// Once we store the RunCommand, we know the ID exists, but also don't want it
// to be mutated in memory.
export type StoredRunCommand = Readonly<RunCommand & Required<Pick<RunCommand, "queueId">>>;

/**
 * A Queue stored in SQLite for managing protocol execution and device coordination.
 * 
 * Database schema:
 * - queued_ids: stores the order of commands to be processed
 * - items: stores the actual command data as JSON
 * - runs: stores run metadata
 * - meta: stores queue metadata like next_id
 */
export default class SqliteQueue {
  private db: Database.Database;
  
  constructor(public queueName: string, dbPath?: string) {
    // Default to app data directory for production, or temp for dev
    const defaultDbPath = process.env.NODE_ENV === 'production'
      ? path.join(os.homedir(), '.galago', 'queue.db')
      : path.join(process.cwd(), 'queue.db');
    
    const finalDbPath = dbPath || process.env.QUEUE_DB_PATH || defaultDbPath;
    
    // Ensure directory exists
    const dbDir = path.dirname(finalDbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.db = new Database(finalDbPath);
    this._initTables();
  }

  private _initTables() {
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS queued_ids_${this.queueName} (
        position INTEGER PRIMARY KEY AUTOINCREMENT,
        queue_id INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS items_${this.queueName} (
        queue_id INTEGER PRIMARY KEY,
        item_json TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS runs_${this.queueName} (
        run_id TEXT PRIMARY KEY,
        run_json TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS meta_${this.queueName} (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    
    // Initialize next_id if not exists
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO meta_${this.queueName} (key, value) VALUES ('next_id', '0')
    `);
    stmt.run();
  }

  async push(item: RunCommand): Promise<void> {
    const id = await this._persistedId(item);
    const stmt = this.db.prepare(`INSERT INTO queued_ids_${this.queueName} (queue_id) VALUES (?)`);
    stmt.run(id);
  }

  async runPush(runQueueId: string, runQueue: RunQueue): Promise<string> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO runs_${this.queueName} (run_id, run_json) VALUES (?, ?)
    `);
    stmt.run(runQueueId, SuperJSON.stringify(runQueue));
    return runQueueId;
  }

  async startNext(): Promise<StoredRunCommand | false> {
    // Get the first queued ID
    const row = this.db.prepare(`
      SELECT queue_id FROM queued_ids_${this.queueName} ORDER BY position ASC LIMIT 1
    `).get() as { queue_id: number } | undefined;
    
    if (!row) return false;
    
    const item = await this.find(row.queue_id);
    if (!item) {
      // Remove orphaned queue entry
      this.db.prepare(`DELETE FROM queued_ids_${this.queueName} WHERE queue_id = ?`).run(row.queue_id);
      throw new Error(`Item ${row.queue_id} not found, but is in queue`);
    }
    
    await this._updateItem(row.queue_id, { status: "STARTED" });
    return item;
  }

  async gotoCommandByIndex(runId: string, targetIndex: number): Promise<boolean> {
    try {
      if (!runId) {
        throw new Error("runId is required for gotoCommandByIndex");
      }

      // Get all commands for this run
      const allItems = this.db.prepare(`
        SELECT queue_id, item_json FROM items_${this.queueName}
      `).all() as { queue_id: number; item_json: string }[];

      const allCommands: StoredRunCommand[] = [];
      for (const row of allItems) {
        const item = await this._deserialize(row.item_json);
        if (item.runId === runId) {
          allCommands.push(item);
        }
      }

      // Sort commands by queueId
      allCommands.sort((a, b) => a.queueId - b.queueId);

      if (targetIndex < 0 || targetIndex >= allCommands.length) {
        throw new Error(
          `Invalid index ${targetIndex} for run ${runId}. Run has ${allCommands.length} commands.`
        );
      }

      const commandsToRequeue = allCommands.slice(targetIndex);
      
      // Get current queued IDs
      const queuedRows = this.db.prepare(`
        SELECT queue_id FROM queued_ids_${this.queueName}
      `).all() as { queue_id: number }[];
      const queuedIds = queuedRows.map(r => r.queue_id);

      // Remove commands that are already in the queue
      for (const cmd of commandsToRequeue) {
        if (queuedIds.includes(cmd.queueId)) {
          this.db.prepare(`DELETE FROM queued_ids_${this.queueName} WHERE queue_id = ?`).run(cmd.queueId);
        }
      }

      // Add commands back to front of queue in reverse order
      const insertStmt = this.db.prepare(`
        INSERT INTO queued_ids_${this.queueName} (position, queue_id) VALUES (?, ?)
      `);
      
      // Get minimum position
      const minPos = this.db.prepare(`
        SELECT MIN(position) as min_pos FROM queued_ids_${this.queueName}
      `).get() as { min_pos: number | null };
      
      let startPos = (minPos?.min_pos ?? 0) - commandsToRequeue.length;
      
      for (const cmd of commandsToRequeue) {
        await this._updateItem(cmd.queueId, { status: "CREATED" });
        insertStmt.run(startPos++, cmd.queueId);
      }

      return true;
    } catch (error) {
      console.error(`Failed to goto index ${targetIndex} in run ${runId}:`, error);
      throw error;
    }
  }

  async gotoCommand(targetId: number): Promise<boolean> {
    try {
      const targetCommand = await this.find(targetId);
      
      const queuedRows = this.db.prepare(`
        SELECT queue_id FROM queued_ids_${this.queueName} ORDER BY position ASC
      `).all() as { queue_id: number }[];
      const queuedIds = queuedRows.map(r => r.queue_id);

      if (!queuedIds.includes(targetId)) {
        // Target not in queue, need to requeue
        const targetRunId = targetCommand.runId;
        if (!targetRunId) {
          throw new Error(`Target command ${targetId} has no runId`);
        }

        const allItems = this.db.prepare(`
          SELECT queue_id, item_json FROM items_${this.queueName}
        `).all() as { queue_id: number; item_json: string }[];

        const commandsToRequeue: number[] = [];
        
        for (const row of allItems) {
          if (!queuedIds.includes(row.queue_id)) {
            const item = await this._deserialize(row.item_json);
            if (item.runId === targetRunId && row.queue_id <= targetId) {
              commandsToRequeue.push(row.queue_id);
            }
          }
        }

        commandsToRequeue.sort((a, b) => a - b);

        if (commandsToRequeue.length > 0) {
          const minPos = this.db.prepare(`
            SELECT MIN(position) as min_pos FROM queued_ids_${this.queueName}
          `).get() as { min_pos: number | null };
          
          let startPos = (minPos?.min_pos ?? 0) - commandsToRequeue.length;
          
          for (const cmdId of commandsToRequeue) {
            await this._updateItem(cmdId, { status: "CREATED" });
            this.db.prepare(`
              INSERT INTO queued_ids_${this.queueName} (position, queue_id) VALUES (?, ?)
            `).run(startPos++, cmdId);
          }
        }

        return true;
      } else {
        // Target is in queue, rearrange
        const targetIndex = queuedIds.indexOf(targetId);
        
        if (targetIndex > 0) {
          const idsToMove = queuedIds.slice(0, targetIndex);
          
          // Remove them
          for (const id of idsToMove) {
            this.db.prepare(`DELETE FROM queued_ids_${this.queueName} WHERE queue_id = ?`).run(id);
          }
          
          // Add them back to end
          for (const id of idsToMove) {
            this.db.prepare(`INSERT INTO queued_ids_${this.queueName} (queue_id) VALUES (?)`).run(id);
          }
        }

        return true;
      }
    } catch (error) {
      console.error(`Failed to goto command ${targetId}:`, error);
      throw error;
    }
  }

  async clearCompleted(): Promise<void> {
    const queuedRows = this.db.prepare(`
      SELECT queue_id FROM queued_ids_${this.queueName}
    `).all() as { queue_id: number }[];
    const runningIds = queuedRows.map(r => r.queue_id);

    const allItems = this.db.prepare(`
      SELECT queue_id FROM items_${this.queueName}
    `).all() as { queue_id: number }[];
    
    const completedIds = allItems
      .map(r => r.queue_id)
      .filter(id => !runningIds.includes(id));

    if (completedIds.length > 0) {
      const placeholders = completedIds.map(() => '?').join(',');
      this.db.prepare(`
        DELETE FROM items_${this.queueName} WHERE queue_id IN (${placeholders})
      `).run(...completedIds);
    }
  }

  async getRun(runId: string): Promise<RunQueue | false> {
    const row = this.db.prepare(`
      SELECT run_json FROM runs_${this.queueName} WHERE run_id = ?
    `).get(runId) as { run_json: string } | undefined;
    
    if (!row) return false;
    return SuperJSON.parse(row.run_json);
  }

  async getAllRuns(): Promise<RunQueue[]> {
    const rows = this.db.prepare(`
      SELECT run_json FROM runs_${this.queueName}
    `).all() as { run_json: string }[];
    
    return rows.map(row => SuperJSON.parse(row.run_json) as RunQueue);
  }

  async getTotalRuns(): Promise<number> {
    const result = this.db.prepare(`
      SELECT COUNT(*) as count FROM runs_${this.queueName}
    `).get() as { count: number };
    return result.count;
  }

  async all(): Promise<StoredRunCommand[]> {
    const rows = this.db.prepare(`
      SELECT item_json FROM items_${this.queueName}
    `).all() as { item_json: string }[];
    
    const items = await Promise.all(
      rows.map(row => this._deserialize(row.item_json))
    );
    
    return items.sort((a, b) => a.queueId - b.queueId);
  }

  async getPaginated(offset: number = 0, limit: number = 20): Promise<StoredRunCommand[]> {
    const rows = this.db.prepare(`
      SELECT q.queue_id, i.item_json 
      FROM queued_ids_${this.queueName} q
      JOIN items_${this.queueName} i ON q.queue_id = i.queue_id
      ORDER BY q.position ASC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as { queue_id: number; item_json: string }[];

    if (rows.length === 0) return [];
    
    return Promise.all(
      rows.map(row => this._deserialize(row.item_json))
    );
  }

  async clearAll(): Promise<void> {
    this.db.prepare(`DELETE FROM queued_ids_${this.queueName}`).run();
    this.db.prepare(`DELETE FROM items_${this.queueName}`).run();
    this.db.prepare(`DELETE FROM runs_${this.queueName}`).run();
    this.db.prepare(`
      UPDATE meta_${this.queueName} SET value = '0' WHERE key = 'next_id'
    `).run();
  }

  async clearByRunId(runId: string): Promise<void> {
    if (!runId) return;

    // Delete the run
    this.db.prepare(`DELETE FROM runs_${this.queueName} WHERE run_id = ?`).run(runId);

    // Get all items for this run
    const rows = this.db.prepare(`
      SELECT queue_id, item_json FROM items_${this.queueName}
    `).all() as { queue_id: number; item_json: string }[];

    const idsToDelete: number[] = [];
    for (const row of rows) {
      const item = await this._deserialize(row.item_json);
      if (item.runId === runId) {
        idsToDelete.push(row.queue_id);
      }
    }

    if (idsToDelete.length > 0) {
      const placeholders = idsToDelete.map(() => '?').join(',');
      this.db.prepare(`
        DELETE FROM queued_ids_${this.queueName} WHERE queue_id IN (${placeholders})
      `).run(...idsToDelete);
      this.db.prepare(`
        DELETE FROM items_${this.queueName} WHERE queue_id IN (${placeholders})
      `).run(...idsToDelete);
    }
  }

  async complete(id: number): Promise<void> {
    await this._updateItem(id, { status: "COMPLETED" });
    this.db.prepare(`DELETE FROM queued_ids_${this.queueName} WHERE queue_id = ?`).run(id);
  }

  async skip(id: number): Promise<void> {
    await this._updateItem(id, { status: "SKIPPED" });
    this.db.prepare(`DELETE FROM queued_ids_${this.queueName} WHERE queue_id = ?`).run(id);
  }

  async skipUntil(id: number): Promise<void> {
    const rows = this.db.prepare(`
      SELECT queue_id FROM queued_ids_${this.queueName} ORDER BY position ASC
    `).all() as { queue_id: number }[];
    
    const ids = rows.map(r => r.queue_id);
    const targetIndex = ids.indexOf(id);
    const idsToSkip = ids.slice(0, targetIndex);
    
    for (const skipId of idsToSkip) {
      await this.skip(skipId);
    }
  }

  async fail(id: number, error: Error): Promise<void> {
    await this._updateItem(id, { status: "FAILED", error });
  }

  private async _updateItem(id: number, updates: Partial<RunCommand>): Promise<StoredRunCommand> {
    const item = await this.find(id);
    if (!item) {
      throw new Error(`Item ${id} not found`);
    }
    
    const newItem = { ...item, ...updates };
    if (updates.status) {
      setRunStatusWithTimestamp(newItem, updates.status);
    }
    
    this.db.prepare(`
      UPDATE items_${this.queueName} SET item_json = ? WHERE queue_id = ?
    `).run(this._serialize(newItem), id);
    
    return newItem;
  }

  async find(id: number): Promise<StoredRunCommand> {
    const row = this.db.prepare(`
      SELECT item_json FROM items_${this.queueName} WHERE queue_id = ?
    `).get(id) as { item_json: string } | undefined;
    
    if (!row) throw new Error(`Item ${id} not found`);
    return this._deserialize(row.item_json);
  }

  async remove(id: number): Promise<void> {
    if (!id) return;
    this.db.prepare(`DELETE FROM items_${this.queueName} WHERE queue_id = ?`).run(id);
    this.db.prepare(`DELETE FROM queued_ids_${this.queueName} WHERE queue_id = ?`).run(id);
  }

  private _nextId(): number {
    const result = this.db.prepare(`
      UPDATE meta_${this.queueName} SET value = value + 1 WHERE key = 'next_id' RETURNING value
    `).get() as { value: string };
    return parseInt(result.value, 10);
  }

  private async _persistedId(item: RunCommand): Promise<number> {
    if (!item.queueId) {
      item.queueId = this._nextId();
    }
    this.db.prepare(`
      INSERT OR REPLACE INTO items_${this.queueName} (queue_id, item_json) VALUES (?, ?)
    `).run(item.queueId, this._serialize(item));
    return item.queueId;
  }

  private _serialize(item: RunCommand): string {
    return SuperJSON.stringify(item);
  }

  private async _deserialize(item: string): Promise<StoredRunCommand> {
    return SuperJSON.parse(item);
  }

  // Clean up database connection
  close(): void {
    this.db.close();
  }
}

