// server/utils/SqliteQueue.ts
import Database from "better-sqlite3";
import path from "path";
import { RunCommand, RunQueue } from "@/types";
import SuperJSON from "superjson";
import { setRunStatusWithTimestamp } from "./HasRunStatus";

export type StoredRunCommand = Readonly<RunCommand & Required<Pick<RunCommand, "queueId">>>;

export default class SqliteQueue {
  private db: Database.Database;
  public queueName: string;

  constructor(dbPath: string, queueName: string) {
    this.queueName = queueName;

    // Initialize SQLite database
    this.db = new Database(dbPath);

    // Enable WAL mode for better concurrency
    this.db.pragma("journal_mode = WAL");

    // Initialize tables
    this.initializeTables();
  }

  private initializeTables() {
    // Commands table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.queueName}_commands (
        queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        command_data TEXT NOT NULL,
        status TEXT NOT NULL,
        position INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_${this.queueName}_run_id ON ${this.queueName}_commands(run_id);
      CREATE INDEX IF NOT EXISTS idx_${this.queueName}_status ON ${this.queueName}_commands(status);
      CREATE INDEX IF NOT EXISTS idx_${this.queueName}_position ON ${this.queueName}_commands(position);
    `);

    // Runs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.queueName}_runs (
        run_id TEXT PRIMARY KEY,
        run_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Queue position tracker
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.queueName}_queue (
        queue_id INTEGER PRIMARY KEY,
        position INTEGER NOT NULL UNIQUE
      );

      CREATE INDEX IF NOT EXISTS idx_${this.queueName}_queue_position ON ${this.queueName}_queue(position);
    `);
  }

  async push(item: RunCommand): Promise<void> {
    const db = this.db;

    db.transaction(() => {
      // Insert command
      const result = db
        .prepare(
          `
        INSERT INTO ${this.queueName}_commands (run_id, command_data, status)
        VALUES (?, ?, ?)
      `,
        )
        .run(item.runId, this._serialize(item), item.status || "CREATED");

      const queueId = result.lastInsertRowid as number;

      // Get next position
      const maxPos = db
        .prepare(
          `
        SELECT COALESCE(MAX(position), -1) as max_pos FROM ${this.queueName}_queue
      `,
        )
        .get() as { max_pos: number };

      // Add to queue
      db.prepare(
        `
        INSERT INTO ${this.queueName}_queue (queue_id, position)
        VALUES (?, ?)
      `,
      ).run(queueId, maxPos.max_pos + 1);
    })();
  }

  async runPush(runQueueId: string, runQueue: RunQueue): Promise<string> {
    this.db
      .prepare(
        `
      INSERT OR REPLACE INTO ${this.queueName}_runs (run_id, run_data)
      VALUES (?, ?)
    `,
      )
      .run(runQueueId, SuperJSON.stringify(runQueue));

    return runQueueId;
  }

  async startNext(): Promise<StoredRunCommand | false> {
    const db = this.db;
    let command: StoredRunCommand | false = false;

    db.transaction(() => {
      // Get next item from queue
      const queueItem = db
        .prepare(
          `
        SELECT queue_id FROM ${this.queueName}_queue
        ORDER BY position ASC
        LIMIT 1
      `,
        )
        .get() as { queue_id: number } | undefined;

      if (!queueItem) {
        return;
      }

      // Get command
      const item = this.find(queueItem.queue_id);
      if (!item) {
        // Remove invalid queue entry
        db.prepare(
          `
          DELETE FROM ${this.queueName}_queue WHERE queue_id = ?
        `,
        ).run(queueItem.queue_id);
        throw new Error(`Item ${queueItem.queue_id} not found, but is in queue`);
      }

      // Update status to STARTED
      this._updateItem(queueItem.queue_id, { status: "STARTED" });
      command = this.find(queueItem.queue_id);
    })();

    return command;
  }

  async gotoCommandByIndex(runId: string, targetIndex: number): Promise<boolean> {
    const db = this.db;

    return db.transaction(() => {
      if (!runId) {
        throw new Error("runId is required for gotoCommandByIndex");
      }

      // Get all commands for this run
      const allCommands = db
        .prepare(
          `
        SELECT queue_id, command_data FROM ${this.queueName}_commands
        WHERE run_id = ?
        ORDER BY queue_id ASC
      `,
        )
        .all(runId) as Array<{ queue_id: number; command_data: string }>;

      const commands = allCommands.map((row) => ({
        queueId: row.queue_id,
        ...this._deserialize(row.command_data),
      }));

      if (targetIndex < 0 || targetIndex >= commands.length) {
        throw new Error(
          `Invalid index ${targetIndex} for run ${runId}. Run has ${commands.length} commands.`,
        );
      }

      // Get commands from index onward
      const commandsToRequeue = commands.slice(targetIndex);

      // Remove these commands from queue if present
      const queueIds = commandsToRequeue.map((c) => c.queueId);
      db.prepare(
        `
        DELETE FROM ${this.queueName}_queue
        WHERE queue_id IN (${queueIds.map(() => "?").join(",")})
      `,
      ).run(...queueIds);

      // Add commands back to front of queue
      const minPos = db
        .prepare(
          `
        SELECT COALESCE(MIN(position), 0) as min_pos FROM ${this.queueName}_queue
      `,
        )
        .get() as { min_pos: number };

      commandsToRequeue.forEach((cmd, idx) => {
        // Update status to CREATED
        this._updateItem(cmd.queueId, { status: "CREATED" });

        // Insert at front of queue
        db.prepare(
          `
          INSERT INTO ${this.queueName}_queue (queue_id, position)
          VALUES (?, ?)
        `,
        ).run(cmd.queueId, minPos.min_pos - commandsToRequeue.length + idx);
      });

      return true;
    })();
  }

  async gotoCommand(targetId: number): Promise<boolean> {
    const db = this.db;

    return db.transaction(() => {
      const targetCommand = this.find(targetId);

      // Check if target is in queue
      const inQueue = db
        .prepare(
          `
        SELECT queue_id FROM ${this.queueName}_queue WHERE queue_id = ?
      `,
        )
        .get(targetId);

      if (!inQueue) {
        // Target not in queue, requeue it and subsequent commands
        const targetRunId = targetCommand.runId;
        if (!targetRunId) {
          throw new Error(`Target command ${targetId} has no runId`);
        }

        // Get all commands for this run
        const allCommands = db
          .prepare(
            `
          SELECT queue_id, command_data FROM ${this.queueName}_commands
          WHERE run_id = ? AND queue_id <= ?
          ORDER BY queue_id ASC
        `,
          )
          .all(targetRunId, targetId) as Array<{ queue_id: number; command_data: string }>;

        if (allCommands.length > 0) {
          const minPos = db
            .prepare(
              `
            SELECT COALESCE(MIN(position), 0) as min_pos FROM ${this.queueName}_queue
          `,
            )
            .get() as { min_pos: number };

          allCommands.forEach((cmd, idx) => {
            // Update status
            this._updateItem(cmd.queue_id, { status: "CREATED" });

            // Add to front of queue
            db.prepare(
              `
              INSERT INTO ${this.queueName}_queue (queue_id, position)
              VALUES (?, ?)
            `,
            ).run(cmd.queue_id, minPos.min_pos - allCommands.length + idx);
          });
        }
      } else {
        // Target in queue, just reorder
        const queueItems = db
          .prepare(
            `
          SELECT queue_id, position FROM ${this.queueName}_queue
          ORDER BY position ASC
        `,
          )
          .all() as Array<{ queue_id: number; position: number }>;

        const targetIdx = queueItems.findIndex((item) => item.queue_id === targetId);

        if (targetIdx > 0) {
          // Move items before target to end
          const itemsToMove = queueItems.slice(0, targetIdx);
          const maxPos = queueItems[queueItems.length - 1].position;

          itemsToMove.forEach((item, idx) => {
            db.prepare(
              `
              UPDATE ${this.queueName}_queue
              SET position = ?
              WHERE queue_id = ?
            `,
            ).run(maxPos + idx + 1, item.queue_id);
          });
        }
      }

      return true;
    })();
  }

  async clearCompleted(): Promise<void> {
    // Delete commands not in queue
    this.db
      .prepare(
        `
      DELETE FROM ${this.queueName}_commands
      WHERE queue_id NOT IN (
        SELECT queue_id FROM ${this.queueName}_queue
      )
    `,
      )
      .run();
  }

  async getRun(runId: string): Promise<RunQueue | false> {
    const row = this.db
      .prepare(
        `
      SELECT run_data FROM ${this.queueName}_runs WHERE run_id = ?
    `,
      )
      .get(runId) as { run_data: string } | undefined;

    if (!row) return false;
    return SuperJSON.parse(row.run_data);
  }

  async getAllRuns(): Promise<RunQueue[]> {
    const rows = this.db
      .prepare(
        `
      SELECT run_data FROM ${this.queueName}_runs
    `,
      )
      .all() as Array<{ run_data: string }>;

    return rows.map((row) => SuperJSON.parse(row.run_data));
  }

  async getTotalRuns(): Promise<number> {
    const result = this.db
      .prepare(
        `
      SELECT COUNT(*) as count FROM ${this.queueName}_runs
    `,
      )
      .get() as { count: number };

    return result.count;
  }

  async all(): Promise<StoredRunCommand[]> {
    const rows = this.db
      .prepare(
        `
      SELECT queue_id, command_data FROM ${this.queueName}_commands
      ORDER BY queue_id ASC
    `,
      )
      .all() as Array<{ queue_id: number; command_data: string }>;

    return rows.map((row) => ({
      queueId: row.queue_id,
      ...this._deserialize(row.command_data),
    }));
  }

  async getPaginated(offset: number = 0, limit: number = 20): Promise<StoredRunCommand[]> {
    const rows = this.db
      .prepare(
        `
      SELECT c.queue_id, c.command_data
      FROM ${this.queueName}_commands c
      INNER JOIN ${this.queueName}_queue q ON c.queue_id = q.queue_id
      ORDER BY q.position ASC
      LIMIT ? OFFSET ?
    `,
      )
      .all(limit, offset) as Array<{ queue_id: number; command_data: string }>;

    return rows.map((row) => ({
      queueId: row.queue_id,
      ...this._deserialize(row.command_data),
    }));
  }

  async clearAll(): Promise<void> {
    this.db.transaction(() => {
      this.db.prepare(`DELETE FROM ${this.queueName}_queue`).run();
      this.db.prepare(`DELETE FROM ${this.queueName}_commands`).run();
      this.db.prepare(`DELETE FROM ${this.queueName}_runs`).run();
    })();
  }

  async clearByRunId(runId: string): Promise<void> {
    if (!runId) return;

    this.db.transaction(() => {
      // Delete from runs
      this.db
        .prepare(
          `
        DELETE FROM ${this.queueName}_runs WHERE run_id = ?
      `,
        )
        .run(runId);

      // Get command IDs for this run
      const commandIds = this.db
        .prepare(
          `
        SELECT queue_id FROM ${this.queueName}_commands WHERE run_id = ?
      `,
        )
        .all(runId) as Array<{ queue_id: number }>;

      if (commandIds.length > 0) {
        const ids = commandIds.map((row) => row.queue_id);

        // Delete from queue
        this.db
          .prepare(
            `
          DELETE FROM ${this.queueName}_queue
          WHERE queue_id IN (${ids.map(() => "?").join(",")})
        `,
          )
          .run(...ids);

        // Delete commands
        this.db
          .prepare(
            `
          DELETE FROM ${this.queueName}_commands WHERE run_id = ?
        `,
          )
          .run(runId);
      }
    })();
  }

  async complete(id: number): Promise<void> {
    this.db.transaction(() => {
      this._updateItem(id, { status: "COMPLETED" });
      this.db
        .prepare(
          `
        DELETE FROM ${this.queueName}_queue WHERE queue_id = ?
      `,
        )
        .run(id);
    })();
  }

  async skip(id: number): Promise<void> {
    this.db.transaction(() => {
      this._updateItem(id, { status: "SKIPPED" });
      this.db
        .prepare(
          `
        DELETE FROM ${this.queueName}_queue WHERE queue_id = ?
      `,
        )
        .run(id);
    })();
  }

  async skipUntil(id: number): Promise<void> {
    const items = this.db
      .prepare(
        `
      SELECT q.queue_id FROM ${this.queueName}_queue q
      WHERE q.position < (
        SELECT position FROM ${this.queueName}_queue WHERE queue_id = ?
      )
    `,
      )
      .all(id) as Array<{ queue_id: number }>;

    for (const item of items) {
      await this.skip(item.queue_id);
    }
  }

  async fail(id: number, error: Error): Promise<void> {
    this._updateItem(id, { status: "FAILED", error });
  }

  private _updateItem(id: number, updates: Partial<RunCommand>): StoredRunCommand {
    const item = this.find(id);
    if (!item) {
      throw new Error(`Item ${id} not found`);
    }

    const newItem = { ...item, ...updates };

    if (updates.status) {
      setRunStatusWithTimestamp(newItem, updates.status);
    }

    this.db
      .prepare(
        `
      UPDATE ${this.queueName}_commands
      SET command_data = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE queue_id = ?
    `,
      )
      .run(this._serialize(newItem), newItem.status, id);

    return newItem;
  }

  find(id: number): StoredRunCommand {
    const row = this.db
      .prepare(
        `
      SELECT command_data FROM ${this.queueName}_commands WHERE queue_id = ?
    `,
      )
      .get(id) as { command_data: string } | undefined;

    if (!row) throw new Error(`Item ${id} not found`);

    return {
      queueId: id,
      ...this._deserialize(row.command_data),
    };
  }

  async remove(id: number): Promise<void> {
    if (!id) return;

    this.db.transaction(() => {
      this.db
        .prepare(
          `
        DELETE FROM ${this.queueName}_commands WHERE queue_id = ?
      `,
        )
        .run(id);
      this.db
        .prepare(
          `
        DELETE FROM ${this.queueName}_queue WHERE queue_id = ?
      `,
        )
        .run(id);
    })();
  }

  private _serialize(item: RunCommand): string {
    return SuperJSON.stringify(item);
  }

  private _deserialize(item: string): Omit<StoredRunCommand, "queueId"> {
    return SuperJSON.parse(item);
  }

  close() {
    this.db.close();
  }
}
