// tests/sqlite-queue.test.ts
// Simple test file to verify SQLite queue functionality

import SqliteQueue from "../../server/utils/SqliteQueue";
import { RunCommand, RunQueue } from "@/types";
import path from "path";
import fs from "fs";

describe("SqliteQueue", () => {
  let queue: SqliteQueue;
  const testDbPath = path.join(__dirname, "test-queue.db");

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    queue = new SqliteQueue(testDbPath, "test_queue");
  });

  afterEach(() => {
    queue.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test("should push and retrieve commands", async () => {
    const command: RunCommand = {
      runId: "test-run-1",
      commandInfo: {
        toolId: "test-tool",
        toolType: "toolbox" as any,
        command: "test_command",
        params: { test: "value" },
      },
      status: "CREATED",
    };

    await queue.push(command);
    const all = await queue.all();

    expect(all.length).toBe(1);
    expect(all[0].runId).toBe("test-run-1");
    expect(all[0].queueId).toBeDefined();
  });

  test("should start next command", async () => {
    const command: RunCommand = {
      runId: "test-run-1",
      commandInfo: {
        toolId: "test-tool",
        toolType: "toolbox" as any,
        command: "test_command",
        params: {},
      },
      status: "CREATED",
    };

    await queue.push(command);
    const next = await queue.startNext();

    expect(next).toBeTruthy();
    if (next) {
      expect(next.status).toBe("STARTED");
      expect(next.runId).toBe("test-run-1");
    }
  });

  test("should complete commands", async () => {
    const command: RunCommand = {
      runId: "test-run-1",
      commandInfo: {
        toolId: "test-tool",
        toolType: "toolbox" as any,
        command: "test_command",
        params: {},
      },
      status: "CREATED",
    };

    await queue.push(command);
    const next = await queue.startNext();

    if (next) {
      await queue.complete(next.queueId);
      const found = queue.find(next.queueId);
      expect(found.status).toBe("COMPLETED");
    }
  });

  test("should manage runs", async () => {
    const run: RunQueue = {
      id: "test-run-1",
      run_type: "test-protocol",
      commands_count: 3,
      status: "CREATED",
    };

    await queue.runPush("test-run-1", run);
    const retrieved = await queue.getRun("test-run-1");

    expect(retrieved).toBeTruthy();
    if (retrieved) {
      expect(retrieved.id).toBe("test-run-1");
      expect(retrieved.commands_count).toBe(3);
    }
  });

  test("should clear by run ID", async () => {
    // Add commands for two different runs
    await queue.push({
      runId: "run-1",
      commandInfo: {
        toolId: "test-tool",
        toolType: "toolbox" as any,
        command: "cmd1",
        params: {},
      },
      status: "CREATED",
    });

    await queue.push({
      runId: "run-2",
      commandInfo: {
        toolId: "test-tool",
        toolType: "toolbox" as any,
        command: "cmd2",
        params: {},
      },
      status: "CREATED",
    });

    // Clear run-1
    await queue.clearByRunId("run-1");

    const all = await queue.all();
    expect(all.length).toBe(1);
    expect(all[0].runId).toBe("run-2");
  });

  test("should goto command by index", async () => {
    const runId = "test-run-1";

    // Add 3 commands
    for (let i = 0; i < 3; i++) {
      await queue.push({
        runId,
        commandInfo: {
          toolId: "test-tool",
          toolType: "toolbox" as any,
          command: `cmd${i}`,
          params: {},
        },
        status: "CREATED",
      });
    }

    // Execute first command
    const first = await queue.startNext();
    if (first) await queue.complete(first.queueId);

    // Goto index 0 (restart from beginning)
    await queue.gotoCommandByIndex(runId, 0);

    const next = await queue.startNext();
    expect(next).toBeTruthy();
    if (next) {
      expect(next.commandInfo.command).toBe("cmd0");
    }
  });

  test("should paginate results", async () => {
    // Add 25 commands
    for (let i = 0; i < 25; i++) {
      await queue.push({
        runId: "test-run",
        commandInfo: {
          toolId: "test-tool",
          toolType: "toolbox" as any,
          command: `cmd${i}`,
          params: {},
        },
        status: "CREATED",
      });
    }

    const page1 = await queue.getPaginated(0, 10);
    const page2 = await queue.getPaginated(10, 10);
    const page3 = await queue.getPaginated(20, 10);

    expect(page1.length).toBe(10);
    expect(page2.length).toBe(10);
    expect(page3.length).toBe(5);
  });

  test("should skip commands", async () => {
    const command: RunCommand = {
      runId: "test-run-1",
      commandInfo: {
        toolId: "test-tool",
        toolType: "toolbox" as any,
        command: "test_command",
        params: {},
      },
      status: "CREATED",
    };

    await queue.push(command);
    const next = await queue.startNext();

    if (next) {
      await queue.skip(next.queueId);
      const found = queue.find(next.queueId);
      expect(found.status).toBe("SKIPPED");
    }
  });
});

// Run tests with: npm test
// Or with specific test: npm test -- sqlite-queue.test.ts
