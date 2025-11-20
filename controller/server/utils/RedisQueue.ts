import { Run, RunCommand, RunQueue } from "@/types";
import { Redis } from "ioredis";
import SuperJSON from "superjson";
import { setRunStatusWithTimestamp } from "./HasRunStatus";

type RedisQueueKey = "queuedIds" | "itemJson" | "nextId" | "runs" | "errors";

// Once we store the RunCommand, we know the ID exists, but also don't want it
// to be mutated in memory.
export type StoredRunCommand = Readonly<
  RunCommand & Required<Pick<RunCommand, "queueId">>
>;

// A Queue stored in Redis. For now, each RunCommand is stored as a JSON string
// in Redis, with a list of IDs to process.
// We might want to use a sorted set or break it up into sublists later, but
// keeping it simple for now to lock in the interface with something working.
export default class RedisQueue {
  constructor(
    private redis: Redis,
    public queueName: string
  ) {}

  async push(item: RunCommand) {
    await this.redis.rpush(
      this._key("queuedIds"),
      await this._persistedId(item)
    );
  }

  async runPush(runQueueId: string, runQueue: RunQueue): Promise<string> {
    await this.redis.hset(
      this._key("runs"),
      runQueueId,
      SuperJSON.stringify(runQueue)
    );
    return runQueueId;
  }

  // We do not pop the item from the queue, because we want to be able to
  // re-run it if something goes wrong.
  async startNext(): Promise<StoredRunCommand | false> {
    const maybeId = await this.redis.lindex(this._key("queuedIds"), 0);
    if (!maybeId) return false;
    const item = await this.find(this._parseId(maybeId));
    if (!item) {
      // This is a weird situation, we should dequeue the key that doesn't exist but _also_ fail
      await this.redis.lpop(this._key("queuedIds"));
      throw new Error(`Item ${maybeId} not found, but is in queue`);
    }
    await this._updateItem(this._parseId(maybeId), { status: "STARTED" });
    return item;
  }

  async gotoCommandByIndex(
    runId: string,
    targetIndex: number
  ): Promise<boolean> {
    try {
      if (!runId) {
        throw new Error("runId is required for gotoCommandByIndex");
      }

      // Get all commands for this run (both in queue and already completed)
      const allCommandIds = await this.redis.hkeys(this._key("itemJson"));
      const allCommands: StoredRunCommand[] = [];

      // Get all command objects for this run
      await Promise.all(
        allCommandIds.map(async (id) => {
          const itemJson = await this.redis.hget(this._key("itemJson"), id);
          if (!itemJson) return;

          const item = await this._deserialize(itemJson);
          if (item.runId === runId) {
            allCommands.push(item);
          }
        })
      );

      // Sort commands by queueId to ensure they're in order
      allCommands.sort((a, b) => a.queueId - b.queueId);

      // Check if index is valid
      if (targetIndex < 0 || targetIndex >= allCommands.length) {
        throw new Error(
          `Invalid index ${targetIndex} for run ${runId}. Run has ${allCommands.length} commands.`
        );
      }

      // Get all commands from index onward
      const commandsToRequeue = allCommands.slice(targetIndex);

      // Get current queue state
      const queuedIds = await this.redis.lrange(this._key("queuedIds"), 0, -1);

      // Remove any of these commands that are already in the queue
      for (const cmd of commandsToRequeue) {
        const cmdIdStr = String(cmd.queueId);
        if (queuedIds.includes(cmdIdStr)) {
          await this.redis.lrem(this._key("queuedIds"), 0, cmdIdStr);
        }
      }

      // Add all commands back to the front of the queue in reverse order
      // (so they end up in the correct order)
      for (let i = commandsToRequeue.length - 1; i >= 0; i--) {
        const cmd = commandsToRequeue[i];

        // Set status to CREATED
        await this._updateItem(cmd.queueId, { status: "CREATED" });

        // Add to front of queue
        await this.redis.lpush(this._key("queuedIds"), String(cmd.queueId));
      }

      return true;
    } catch (error) {
      console.error(
        `Failed to goto index ${targetIndex} in run ${runId}:`,
        error
      );
      throw error;
    }
  }

  async gotoCommand(targetId: number) {
    // First, check if the target command exists
    try {
      const targetCommand = await this.find(targetId);
      // Get all queued IDs
      const queuedIds = await this.redis.lrange(this._key("queuedIds"), 0, -1);

      if (!queuedIds.includes(String(targetId))) {
        // Target ID is not in the queue, it was likely already executed
        // We need to requeue it and all subsequent commands from the same run

        // Get the runId of the target command to find related commands
        const targetRunId = targetCommand.runId;
        if (!targetRunId) {
          throw new Error(`Target command ${targetId} has no runId`);
        }

        // Get all commands for this run (executed and queued)
        const allCommandIds = await this.redis.hkeys(this._key("itemJson"));
        const commandsToCheck = allCommandIds.filter(
          (id) => !queuedIds.includes(id)
        );

        // Commands to requeue (will be in reverse order to maintain correct sequence)
        const commandsToRequeue: number[] = [];

        // Process each command to find those in the same run
        await Promise.all(
          commandsToCheck.map(async (id) => {
            const itemJson = await this.redis.hget(this._key("itemJson"), id);
            if (!itemJson) return;

            const item = await this._deserialize(itemJson);

            // If this command belongs to the same run and has been executed
            if (item.runId === targetRunId) {
              const cmdId = this._parseId(id);

              // If command ID is less than or equal to our target, we want to requeue it
              if (cmdId <= targetId) {
                commandsToRequeue.push(cmdId);
              }
            }
          })
        );

        // Sort commands by ID (ascending) to maintain execution order
        commandsToRequeue.sort((a, b) => a - b);

        // Push these commands to the front of the queue in correct order
        if (commandsToRequeue.length > 0) {
          // We need to prepend in reverse order to maintain sequence
          for (let i = commandsToRequeue.length - 1; i >= 0; i--) {
            const cmdId = commandsToRequeue[i];

            // Update command status back to 'CREATED'
            await this._updateItem(cmdId, { status: "CREATED" });

            // Push to the front of the queue
            await this.redis.lpush(this._key("queuedIds"), String(cmdId));
          }
        }

        return true;
      } else {
        // Target is already in the queue, just need to rearrange
        // Get current position of targetId in the queue
        const targetIndex = queuedIds.indexOf(String(targetId));

        if (targetIndex > 0) {
          // Get all IDs before the target
          const idsToMove = queuedIds.slice(0, targetIndex);

          // Remove them from the queue
          for (const id of idsToMove) {
            await this.redis.lrem(this._key("queuedIds"), 1, id);
          }

          // Add them back to the end of the queue
          for (const id of idsToMove) {
            await this.redis.rpush(this._key("queuedIds"), id);
          }
        }

        return true;
      }
    } catch (error) {
      console.error(`Failed to goto command ${targetId}:`, error);
      throw error;
    }
  }

  async clearCompleted() {
    // This is super inefficient, and will almost certainly change
    //Well todate 04/15/24 it still hasn't changed. For sake of time will continue building on top of it.
    const runningIds = await this.redis.lrange(this._key("queuedIds"), 0, -1);
    const allIds = await this.redis.hkeys(this._key("itemJson"));
    const completedIds = allIds.filter((id) => !runningIds.includes(id));
    await this.redis.hdel(this._key("itemJson"), ...completedIds);
  }

  async getRun(runId: string): Promise<RunQueue | false> {
    let run = await this.redis.hget(this._key("runs"), runId);
    if (!run) {
      return false;
    } else {
      return SuperJSON.parse(run);
    }
  }

  async getAllRuns(): Promise<RunQueue[]> {
    const runsJson = await this.redis.hvals(this._key("runs"));
    const runsMap = runsJson.map((item) => SuperJSON.parse(item));
    const runs = (await Promise.all(runsMap)) as RunQueue[];
    return runs;
  }

  async getTotalRuns(): Promise<number> {
    const totalRuns = await this.redis.hlen(this._key("runs"));
    return totalRuns;
  }

  async all() {
    const itemsJson = await this.redis.hvals(this._key("itemJson"));
    const itemsP = itemsJson.map((item) => this._deserialize(item));
    const items = await Promise.all(itemsP);
    return items.sort((a, b) => a.queueId - b.queueId);
  }

  async getPaginated(
    offset: number = 0,
    limit: number = 20
  ): Promise<StoredRunCommand[]> {
    // Get the specified range of IDs from the queuedIds list.
    const ids = await this.redis.lrange(
      this._key("queuedIds"),
      offset,
      offset + limit - 1
    );
    if (ids.length === 0) {
      return [];
    }
    // Get the corresponding commands from the itemJson hash map.
    const commandsJson = await this.redis.hmget(this._key("itemJson"), ...ids);
    const commands = await Promise.all(
      commandsJson
        .filter((json) => json !== null)
        .map((json) => this._deserialize(json!))
    );
    return commands;
  }

  async clearAll() {
    await this.redis.del(this._key("queuedIds"));
    await this.redis.del(this._key("itemJson"));
    await this.redis.del(this._key("runs"));
    await this.redis.del(this._key("nextId"));
  }

  async clearByRunId(runId: string) {
    if (!runId) return;

    // Delete the run from the runs hash
    await this.redis.hdel(this._key("runs"), String(runId));

    // Get ALL commands from itemJson
    const allIds = await this.redis.hkeys(this._key("itemJson"));

    // Process each command to find those with matching runId
    const idsToDelete: string[] = [];

    await Promise.all(
      allIds.map(async (id) => {
        // Get and parse the command
        const itemJson = await this.redis.hget(this._key("itemJson"), id);
        if (!itemJson) return;

        const item = await this._deserialize(itemJson);
        // If this command belongs to the run we're deleting, add it to our delete list
        if (item.runId === runId) {
          idsToDelete.push(id);
          // Also remove from queuedIds if it's still there
          await this.redis.lrem(this._key("queuedIds"), 0, id);
        }
      })
    );

    // Delete all matching commands from itemJson
    if (idsToDelete.length > 0) {
      await this.redis.hdel(this._key("itemJson"), ...idsToDelete);
    }
  }

  async complete(id: number) {
    await this._updateItem(id, { status: "COMPLETED" });
    await this.redis.lrem(this._key("queuedIds"), 0, id);
  }

  async skip(id: number) {
    await this._updateItem(id, { status: "SKIPPED" });
    await this.redis.lrem(this._key("queuedIds"), 0, id);
  }

  async skipUntil(id: number) {
    // Skip all commands previous to the given command ID
    const ids = await this.redis.lrange(this._key("queuedIds"), 0, -1);
    const idsToSkip = ids.slice(0, ids.indexOf(String(id)));
    await Promise.all(
      idsToSkip.map(async (id) => {
        await this.skip(this._parseId(id));
      })
    );
  }

  async fail(id: number, error: Error) {
    await this._updateItem(id, { status: "FAILED", error });
  }

  private async _updateItem(
    id: number,
    updates: Partial<RunCommand>
  ): Promise<StoredRunCommand> {
    const item = await this.find(id);
    if (!item) {
      throw new Error(`Item ${id} not found`);
    }
    const newItem = {
      ...item,
      ...updates,
    };
    if (updates.status) {
      setRunStatusWithTimestamp(newItem, updates.status);
    }
    await this.redis.hset(this._key("itemJson"), id, this._serialize(newItem));
    return newItem;
  }

  async find(id: number): Promise<StoredRunCommand> {
    const json = await this.redis.hget(this._key("itemJson"), String(id));
    if (!json) throw new Error(`Item ${id} not found`);
    return await this._deserialize(json);
  }

  async remove(id: number): Promise<void> {
    if (!id) return;
    await this.redis.hdel(this._key("itemJson"), String(id));
    await this.redis.lrem(this._key("queuedIds"), 0, id);
  }

  private _key(key: RedisQueueKey): string {
    return ["queue", this.queueName, key].join(":");
  }

  private async _nextId(): Promise<number> {
    return this.redis.incr(this._key("nextId"));
  }

  private async _persistedId(item: RunCommand): Promise<number> {
    if (!item.queueId) {
      item.queueId = await this._nextId();
    }
    await this.redis.hset(
      this._key("itemJson"),
      item.queueId,
      this._serialize(item)
    );
    return item.queueId;
  }

  private _parseId(id: string): number {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw new Error(`Invalid queue ID: ${id}`);
    }
    return parsed;
  }

  private _serialize(item: RunCommand): string {
    // TODO: serialization should be safer, either with protobuf or zod
    return SuperJSON.stringify(item);
  }

  private async _deserialize(item: string): Promise<StoredRunCommand> {
    // TODO: deserialization should be safer, either with protobuf or zod
    return SuperJSON.parse(item);
  }
}
