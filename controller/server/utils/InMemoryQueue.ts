import { Run, RunCommand, RunQueue } from "@/types";
import SuperJSON from "superjson";
import { setRunStatusWithTimestamp } from "./HasRunStatus";

// Once we store the RunCommand, we know the ID exists, but also don't want it
// to be mutated in memory.
export type StoredRunCommand = Readonly<RunCommand & Required<Pick<RunCommand, "queueId">>>;

/**
 * An in-memory Queue implementation for Electron desktop application.
 * This is used as a fallback when SQLite native modules aren't available.
 * 
 * Note: Data is not persisted across app restarts, but the queue will work
 * correctly during the session.
 */
export default class InMemoryQueue {
  private queuedIds: number[] = [];
  private items: Map<number, StoredRunCommand> = new Map();
  private runs: Map<string, RunQueue> = new Map();
  private nextId: number = 0;

  constructor(public queueName: string) {
    console.log(`[InMemoryQueue] Created queue: ${queueName}`);
  }

  async push(item: RunCommand): Promise<void> {
    const id = this._persistedId(item);
    this.queuedIds.push(id);
  }

  async runPush(runQueueId: string, runQueue: RunQueue): Promise<string> {
    this.runs.set(runQueueId, runQueue);
    return runQueueId;
  }

  async startNext(): Promise<StoredRunCommand | false> {
    if (this.queuedIds.length === 0) return false;
    
    const id = this.queuedIds[0];
    const item = this.items.get(id);
    
    if (!item) {
      this.queuedIds.shift();
      throw new Error(`Item ${id} not found, but is in queue`);
    }
    
    this._updateItem(id, { status: "STARTED" });
    return item;
  }

  async gotoCommandByIndex(runId: string, targetIndex: number): Promise<boolean> {
    if (!runId) {
      throw new Error("runId is required for gotoCommandByIndex");
    }

    const allCommands = Array.from(this.items.values())
      .filter(item => item.runId === runId)
      .sort((a, b) => a.queueId - b.queueId);

    if (targetIndex < 0 || targetIndex >= allCommands.length) {
      throw new Error(
        `Invalid index ${targetIndex} for run ${runId}. Run has ${allCommands.length} commands.`
      );
    }

    const commandsToRequeue = allCommands.slice(targetIndex);
    
    for (const cmd of commandsToRequeue) {
      const idx = this.queuedIds.indexOf(cmd.queueId);
      if (idx !== -1) {
        this.queuedIds.splice(idx, 1);
      }
    }

    for (const cmd of [...commandsToRequeue].reverse()) {
      this._updateItem(cmd.queueId, { status: "CREATED" });
      this.queuedIds.unshift(cmd.queueId);
    }

    return true;
  }

  async gotoCommand(targetId: number): Promise<boolean> {
    const targetCommand = this.items.get(targetId);
    if (!targetCommand) {
      throw new Error(`Command ${targetId} not found`);
    }

    const idx = this.queuedIds.indexOf(targetId);
    
    if (idx === -1) {
      const targetRunId = targetCommand.runId;
      if (!targetRunId) {
        throw new Error(`Target command ${targetId} has no runId`);
      }

      const commandsToRequeue = Array.from(this.items.values())
        .filter(item => 
          item.runId === targetRunId && 
          item.queueId <= targetId && 
          !this.queuedIds.includes(item.queueId)
        )
        .sort((a, b) => a.queueId - b.queueId);

      for (const cmd of [...commandsToRequeue].reverse()) {
        this._updateItem(cmd.queueId, { status: "CREATED" });
        this.queuedIds.unshift(cmd.queueId);
      }
    } else if (idx > 0) {
      const idsToMove = this.queuedIds.splice(0, idx);
      this.queuedIds.push(...idsToMove);
    }

    return true;
  }

  async clearCompleted(): Promise<void> {
    const queuedSet = new Set(this.queuedIds);
    const toDelete: number[] = [];
    
    for (const [id] of this.items) {
      if (!queuedSet.has(id)) {
        toDelete.push(id);
      }
    }
    
    for (const id of toDelete) {
      this.items.delete(id);
    }
  }

  async getRun(runId: string): Promise<RunQueue | false> {
    return this.runs.get(runId) || false;
  }

  async getAllRuns(): Promise<RunQueue[]> {
    return Array.from(this.runs.values());
  }

  async getTotalRuns(): Promise<number> {
    return this.runs.size;
  }

  async all(): Promise<StoredRunCommand[]> {
    return Array.from(this.items.values()).sort((a, b) => a.queueId - b.queueId);
  }

  async getPaginated(offset: number = 0, limit: number = 20): Promise<StoredRunCommand[]> {
    const paginatedIds = this.queuedIds.slice(offset, offset + limit);
    return paginatedIds
      .map(id => this.items.get(id))
      .filter((item): item is StoredRunCommand => item !== undefined);
  }

  async clearAll(): Promise<void> {
    this.queuedIds = [];
    this.items.clear();
    this.runs.clear();
    this.nextId = 0;
  }

  async clearByRunId(runId: string): Promise<void> {
    if (!runId) return;

    this.runs.delete(runId);

    const idsToDelete: number[] = [];
    for (const [id, item] of this.items) {
      if (item.runId === runId) {
        idsToDelete.push(id);
      }
    }

    for (const id of idsToDelete) {
      this.items.delete(id);
      const idx = this.queuedIds.indexOf(id);
      if (idx !== -1) {
        this.queuedIds.splice(idx, 1);
      }
    }
  }

  async complete(id: number): Promise<void> {
    this._updateItem(id, { status: "COMPLETED" });
    const idx = this.queuedIds.indexOf(id);
    if (idx !== -1) {
      this.queuedIds.splice(idx, 1);
    }
  }

  async skip(id: number): Promise<void> {
    this._updateItem(id, { status: "SKIPPED" });
    const idx = this.queuedIds.indexOf(id);
    if (idx !== -1) {
      this.queuedIds.splice(idx, 1);
    }
  }

  async skipUntil(id: number): Promise<void> {
    const targetIndex = this.queuedIds.indexOf(id);
    const idsToSkip = this.queuedIds.slice(0, targetIndex);
    
    for (const skipId of idsToSkip) {
      await this.skip(skipId);
    }
  }

  async fail(id: number, error: Error): Promise<void> {
    this._updateItem(id, { status: "FAILED", error });
  }

  async find(id: number): Promise<StoredRunCommand> {
    const item = this.items.get(id);
    if (!item) throw new Error(`Item ${id} not found`);
    return item;
  }

  async remove(id: number): Promise<void> {
    if (!id) return;
    this.items.delete(id);
    const idx = this.queuedIds.indexOf(id);
    if (idx !== -1) {
      this.queuedIds.splice(idx, 1);
    }
  }

  private _updateItem(id: number, updates: Partial<RunCommand>): StoredRunCommand {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Item ${id} not found`);
    }
    
    const newItem = { ...item, ...updates } as StoredRunCommand;
    if (updates.status) {
      setRunStatusWithTimestamp(newItem, updates.status);
    }
    
    this.items.set(id, newItem);
    return newItem;
  }

  private _persistedId(item: RunCommand): number {
    if (!item.queueId) {
      item.queueId = ++this.nextId;
    }
    this.items.set(item.queueId, item as StoredRunCommand);
    return item.queueId;
  }

  close(): void {
    // No-op for in-memory queue
  }
}

