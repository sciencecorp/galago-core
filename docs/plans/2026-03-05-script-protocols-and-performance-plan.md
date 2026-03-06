# Script-Based Protocols and Performance Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add script-based protocol authoring with a `galago` JavaScript API and fix performance bottlenecks for long protocols (batch queuing, duplicate query removal, paginated run display).

**Architecture:** Script-mode protocols store JavaScript source in a new `scriptContent` field. At run time, the script executes in a sandboxed context with a `galago` command-builder API, producing a command array that feeds into the existing execution engine unchanged. Performance fixes target the SqliteQueue (batch insert), RunsComponent (duplicate query), and command queue router (pagination).

**Tech Stack:** TypeScript, Node.js `vm` module, Drizzle ORM (SQLite), tRPC, React, Chakra UI, Monaco Editor

---

## Phase 1: Performance Improvements

These are independent of scripting and benefit all protocols. Implement first.

---

### Task 1: Add `pushBatch()` to SqliteQueue

**Files:**
- Modify: `controller/server/utils/SqliteQueue.ts:64-97`
- Modify: `controller/server/command_queue.ts:1061-1080`

**Step 1: Add `pushBatch()` method to SqliteQueue**

Add this method after the existing `push()` method (after line 97) in `controller/server/utils/SqliteQueue.ts`:

```typescript
async pushBatch(items: RunCommand[]): Promise<void> {
  if (items.length === 0) return;

  const db = this.db;

  db.transaction(() => {
    // Get starting position
    const maxPos = db
      .prepare(
        `SELECT COALESCE(MAX(position), -1) as max_pos FROM ${this.queueName}_queue`,
      )
      .get() as { max_pos: number };

    let nextPosition = maxPos.max_pos + 1;

    const insertCommand = db.prepare(
      `INSERT INTO ${this.queueName}_commands (run_id, command_data, status) VALUES (?, ?, ?)`,
    );

    const insertQueue = db.prepare(
      `INSERT INTO ${this.queueName}_queue (queue_id, position) VALUES (?, ?)`,
    );

    for (const item of items) {
      const result = insertCommand.run(
        item.runId,
        this._serialize(item),
        item.status || "CREATED",
      );
      const queueId = result.lastInsertRowid as number;
      insertQueue.run(queueId, nextPosition);
      nextPosition++;
    }
  })();
}
```

Key differences from `push()`:
- Single transaction wrapping all inserts
- `SELECT MAX(position)` called once, then incremented in-memory
- Prepared statements reused across iterations

**Step 2: Update `enqueueRun()` to use `pushBatch()`**

In `controller/server/command_queue.ts`, replace lines 1073-1076:

```typescript
// OLD:
//Queue all commands in the run.
for (const c of run.commands) {
  await this.commands.push(c);
}

// NEW:
await this.commands.pushBatch(run.commands);
```

**Step 3: Verify**

Test by queuing a large protocol (the limecoli 1783-command protocol). Queuing should complete in under a second instead of several seconds.

**Step 4: Commit**

```bash
git add controller/server/utils/SqliteQueue.ts controller/server/command_queue.ts
git commit -m "perf: batch insert commands in single transaction for fast queuing"
```

---

### Task 2: Remove duplicate query in RunsComponent

**Files:**
- Modify: `controller/components/runs/RunsComponent.tsx:111,148`

**Step 1: Remove the duplicate query**

In `controller/components/runs/RunsComponent.tsx`, line 148 declares:

```typescript
const CommandInfo = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 1000 });
```

This duplicates line 111:

```typescript
const commandsAll = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 2000 });
```

Delete line 148 entirely. Then find all usages of `CommandInfo` in the file and replace them with `commandsAll`. The main usage is around line 328 in the `updateRunAttributes` effect — replace `CommandInfo.data` with `commandsAll.data`.

Search for all occurrences:
```
CommandInfo.data → commandsAll.data
CommandInfo.isLoading → commandsAll.isLoading
```

**Step 2: Verify**

Run the app and navigate to the Runs page. Verify that run queue display still works correctly — commands show up, progress updates, no errors in console.

**Step 3: Commit**

```bash
git add controller/components/runs/RunsComponent.tsx
git commit -m "perf: remove duplicate commandQueue.getAll query in RunsComponent"
```

---

### Task 3: Add `getQueueSummary` endpoint and paginated query usage

**Files:**
- Modify: `controller/server/routers/command_queue.ts`
- Modify: `controller/server/command_queue.ts`
- Modify: `controller/server/utils/SqliteQueue.ts`
- Modify: `controller/components/runs/RunsComponent.tsx`

**Step 1: Add `getQueueSummary()` to SqliteQueue**

Add this method to `controller/server/utils/SqliteQueue.ts`:

```typescript
getQueueSummary(): { total: number; completed: number; pending: number } {
  const total = this.db
    .prepare(`SELECT COUNT(*) as count FROM ${this.queueName}_commands`)
    .get() as { count: number };

  const completed = this.db
    .prepare(
      `SELECT COUNT(*) as count FROM ${this.queueName}_commands WHERE status = 'COMPLETED'`,
    )
    .get() as { count: number };

  return {
    total: total.count,
    completed: completed.count,
    pending: total.count - completed.count,
  };
}
```

**Step 2: Expose summary via CommandQueue**

Add to `controller/server/command_queue.ts` (as a method on the CommandQueue class):

```typescript
getQueueSummary() {
  return this.commands.getQueueSummary();
}
```

**Step 3: Add tRPC endpoint**

Add to `controller/server/routers/command_queue.ts`:

```typescript
getQueueSummary: procedure.query(async () => {
  return CommandQueue.global.getQueueSummary();
}),
```

**Step 4: Update RunsComponent to use paginated query + summary**

In `controller/components/runs/RunsComponent.tsx`, replace the `commandsAll` query (line 111):

```typescript
// OLD:
const commandsAll = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 2000 });

// NEW: Use paginated query for visible commands and summary for counts
const commandsPage = trpc.commandQueue.commands.useQuery(
  { limit: 50, offset: 0 },
  { refetchInterval: 2000 },
);
const queueSummary = trpc.commandQueue.getQueueSummary.useQuery(undefined, {
  refetchInterval: 2000,
});
```

Then update references from `commandsAll.data` to `commandsPage.data` throughout the file. For count-based logic that previously used the full array length, use `queueSummary.data` instead.

**Note:** This is a larger refactor — the component's `groupCommandsByRun()` and `runAttributesMap` logic currently operates on the full command array. The paginated approach may need the component to track which runs exist via `getAllRuns` and use counts from the summary. The exact refactor depends on what the component actually displays. Start with the backend endpoints, then incrementally migrate the frontend.

**Step 5: Verify**

Test with the Runs page during a protocol execution. Verify:
- Run progress displays correctly
- Command counts are accurate
- Network tab shows smaller payloads

**Step 6: Commit**

```bash
git add controller/server/utils/SqliteQueue.ts controller/server/command_queue.ts controller/server/routers/command_queue.ts controller/components/runs/RunsComponent.tsx
git commit -m "perf: add queue summary endpoint and paginated command fetching"
```

---

## Phase 2: Database Schema for Script Protocols

---

### Task 4: Add `mode` and `scriptContent` fields to protocols table

**Files:**
- Modify: `controller/db/schema/index.ts:204-215`
- Create: `controller/db/migrations/0010_*.sql` (generated by drizzle-kit)
- Modify: `controller/server/routers/protocol.ts:10-37`

**Step 1: Update the schema**

In `controller/db/schema/index.ts`, update the `protocols` table definition (lines 204-215):

```typescript
export const protocols = sqliteTable("protocols", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  workcellId: integer("workcell_id").references(() => workcells.id, { onDelete: "cascade" }),
  description: text("description"),
  commands: text("commands", { mode: "json" }).notNull().$type<any[]>(),
  parameters: text("parameters", { mode: "json" }).$type<
    import("@/protocols/params").ProtocolParameter[]
  >(),
  mode: text("mode").notNull().default("visual"),
  scriptContent: text("script_content"),
  ...timestamps,
});
```

Also update the exported types at the bottom of the file — add after the existing `Protocol` type:

```typescript
export type Protocol = typeof protocols.$inferSelect;
export type NewProtocol = typeof protocols.$inferInsert;
```

(These should already exist — just verify `mode` and `scriptContent` are included via inference.)

**Step 2: Generate the migration**

```bash
cd controller && npx drizzle-kit generate
```

This creates a migration file in `controller/db/migrations/` that adds the two new columns.

**Step 3: Update Zod schemas in protocol router**

In `controller/server/routers/protocol.ts`, update the three Zod schemas:

`zProtocolCreate` (lines 10-17):
```typescript
const zProtocolCreate = z.object({
  name: z.string(),
  category: z.string(),
  workcellId: z.number().optional(),
  description: z.string().optional(),
  commands: z.array(z.any()).default([]),
  parameters: z.array(zProtocolParameter).nullable().optional(),
  mode: z.enum(["visual", "script"]).default("visual"),
  scriptContent: z.string().nullable().optional(),
});
```

`zProtocolUpdate` (lines 19-26):
```typescript
const zProtocolUpdate = z.object({
  id: z.number(),
  name: z.string().optional(),
  category: z.string().optional(),
  description: z.string().nullable().optional(),
  commands: z.array(z.any()).optional(),
  parameters: z.array(zProtocolParameter).nullable().optional(),
  mode: z.enum(["visual", "script"]).optional(),
  scriptContent: z.string().nullable().optional(),
});
```

`zProtocolImport` (lines 28-37):
```typescript
const zProtocolImport = z.object({
  workcellId: z.number(),
  protocol: z.object({
    name: z.string(),
    category: z.string().optional(),
    description: z.string().optional(),
    commands: z.array(z.any()).optional(),
    parameters: z.array(zProtocolParameter).nullable().optional(),
    mode: z.enum(["visual", "script"]).optional(),
    scriptContent: z.string().nullable().optional(),
  }),
});
```

**Step 4: Update create/update/export/import mutations**

In the `create` mutation (~line 115-124), add the new fields to the insert:

```typescript
.values({
  name: input.name,
  category: input.category,
  workcellId: workcellId,
  description: input.description || null,
  commands: input.commands,
  parameters: input.parameters ?? null,
  mode: input.mode || "visual",
  scriptContent: input.scriptContent ?? null,
})
```

In the `update` mutation (~line 148-156), add to the conditional spread:

```typescript
.set({
  ...(updateData.name !== undefined && { name: updateData.name }),
  ...(updateData.category !== undefined && { category: updateData.category }),
  ...(updateData.description !== undefined && { description: updateData.description }),
  ...(updateData.commands !== undefined && { commands: updateData.commands }),
  ...(updateData.parameters !== undefined && { parameters: updateData.parameters }),
  ...(updateData.mode !== undefined && { mode: updateData.mode }),
  ...(updateData.scriptContent !== undefined && { scriptContent: updateData.scriptContent }),
  updatedAt: new Date().toISOString(),
})
```

In the `export` query (~line 187-196), add to the return:

```typescript
return {
  protocol: {
    name: protocol.name,
    category: protocol.category,
    description: protocol.description,
    commands: protocol.commands,
    parameters: protocol.parameters ?? null,
    mode: protocol.mode || "visual",
    scriptContent: protocol.scriptContent ?? null,
  },
  exportedAt: new Date().toISOString(),
  version: "1.0",
};
```

In the `import` mutation (~line 218-224), add to the insert:

```typescript
.values({
  name: input.protocol.name,
  category: input.protocol.category || "development",
  description: input.protocol.description || null,
  commands: input.protocol.commands || [],
  parameters: input.protocol.parameters ?? null,
  mode: input.protocol.mode || "visual",
  scriptContent: input.protocol.scriptContent ?? null,
  workcellId: input.workcellId,
})
```

**Step 5: Update workcell export/import**

In `controller/server/routers/workcell.ts`, update the protocol export mapping (~line 388):

```typescript
protocols: workcellProtocols.map(({ name, category, description, commands, parameters, mode, scriptContent }) => ({
  name,
  category,
  description,
  commands,
  parameters: parameters ?? null,
  mode: mode || "visual",
  scriptContent: scriptContent ?? null,
})),
```

Update the workcell import Zod schema for protocols (~line 542-550):

```typescript
protocols: z
  .array(
    z.object({
      name: z.string(),
      category: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      commands: z.any().optional(),
      parameters: z.array(zProtocolParameter).nullable().optional(),
      mode: z.enum(["visual", "script"]).optional(),
      scriptContent: z.string().nullable().optional(),
    }),
  )
  .optional(),
```

Update the workcell import insert (~line 767):

```typescript
input.protocols.map((p) => ({
  name: p.name,
  category: p.category ?? "",
  description: p.description ?? null,
  commands: p.commands ?? [],
  parameters: p.parameters ?? null,
  mode: p.mode || "visual",
  scriptContent: p.scriptContent ?? null,
  workcellId: newWorkcell.id,
})),
```

**Step 6: Run migration**

```bash
cd controller && npx drizzle-kit migrate
```

**Step 7: Commit**

```bash
git add controller/db/schema/index.ts controller/db/migrations/ controller/server/routers/protocol.ts controller/server/routers/workcell.ts
git commit -m "feat: add mode and scriptContent fields to protocols table"
```

---

## Phase 3: Script Execution Engine

---

### Task 5: Create the `galago` API and script executor

**Files:**
- Create: `controller/server/scripting/protocol-script-executor.ts`

**Step 1: Create the protocol script executor**

Create `controller/server/scripting/protocol-script-executor.ts`:

```typescript
import * as vm from "vm";
import { ToolCommandInfo } from "@/types";
import { logAction } from "@/server/utils/logging";

export interface ScriptExecutionResult {
  commands: ToolCommandInfo[];
  logs: string[];
  success: boolean;
  error?: string;
}

/**
 * Executes a protocol script in a sandboxed context.
 * The script uses a `galago` API to emit commands and receives
 * run parameters via a `params` object.
 */
export async function executeProtocolScript(
  scriptContent: string,
  params: Record<string, string>,
  timeout: number = 5000,
): Promise<ScriptExecutionResult> {
  const commands: ToolCommandInfo[] = [];
  const logs: string[] = [];

  // Build the galago API
  const galago = {
    command(toolId: string, command: string, cmdParams: Record<string, any> = {}) {
      commands.push({
        toolId,
        toolType: "unknown" as any, // Resolved later
        command,
        params: cmdParams,
        label: "",
        advancedParameters: {
          skipExecutionVariable: { variable: null, value: "" },
          runAsynchronously: false,
        },
      });
    },

    timer({ minutes = 0, seconds = 30, message = "Timer in progress..." } = {}) {
      this.command("Tool Box", "timer", { minutes, seconds, message });
    },

    pause(message = "Run is paused. Click Continue to resume.") {
      this.command("Tool Box", "pause", { message });
    },

    showMessage(message: string, title = "Message") {
      this.command("Tool Box", "show_message", { message, title });
    },

    note(message: string) {
      this.command("Tool Box", "note", { message });
    },

    assignVariable(name: string, value: string) {
      this.command("Tool Box", "variable_assignment", { name, value });
    },

    userForm(name: string) {
      this.command("Tool Box", "user_form", { name });
    },
  };

  // Build sandbox console
  const sandboxConsole = {
    log: (...args: any[]) => logs.push(args.map(String).join(" ")),
    warn: (...args: any[]) => logs.push("[WARN] " + args.map(String).join(" ")),
    error: (...args: any[]) => logs.push("[ERROR] " + args.map(String).join(" ")),
  };

  try {
    const sandbox = {
      galago,
      params,
      console: sandboxConsole,
      Math,
      Array,
      Object,
      String,
      Number,
      Boolean,
      JSON,
      Date,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    };

    const context = vm.createContext(sandbox);

    // Wrap in async IIFE to support top-level await if needed
    const wrappedScript = `(async () => {\n${scriptContent}\n})()`;

    const script = new vm.Script(wrappedScript, {
      filename: "protocol-script.js",
      timeout,
    });

    await script.runInContext(context);

    if (commands.length === 0) {
      return {
        commands: [],
        logs,
        success: false,
        error: "Script produced no commands. Use galago.command() to emit commands.",
      };
    }

    logAction({
      level: "info",
      action: "Protocol Script Execution",
      details: `Script generated ${commands.length} commands`,
    });

    return { commands, logs, success: true };
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    logAction({
      level: "error",
      action: "Protocol Script Error",
      details: `Script execution failed: ${errorMessage}`,
    });

    return {
      commands: [],
      logs,
      success: false,
      error: errorMessage,
    };
  }
}
```

**Step 2: Commit**

```bash
git add controller/server/scripting/protocol-script-executor.ts
git commit -m "feat: add protocol script executor with galago API"
```

---

### Task 6: Create toolType resolver

**Files:**
- Create: `controller/server/scripting/resolve-tool-types.ts`

**Step 1: Create the resolver**

Create `controller/server/scripting/resolve-tool-types.ts`:

```typescript
import { ToolCommandInfo } from "@/types";
import { db } from "@/db/client";
import { tools } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ToolType } from "gen-interfaces/controller";

/**
 * Resolves toolType for each command by looking up toolId in the workcell's tool list.
 * Tool Box commands get type "toolbox". Unknown tools throw an error.
 */
export async function resolveToolTypes(
  commands: ToolCommandInfo[],
  workcellId: number,
): Promise<ToolCommandInfo[]> {
  // Build a tool name → type map from the workcell
  const workcellTools = await db
    .select({ name: tools.name, type: tools.type })
    .from(tools)
    .where(eq(tools.workcellId, workcellId));

  const toolTypeMap = new Map<string, string>();
  toolTypeMap.set("Tool Box", "toolbox");
  for (const t of workcellTools) {
    toolTypeMap.set(t.name, t.type);
  }

  // Resolve each command's toolType
  const errors: string[] = [];
  const resolved = commands.map((cmd) => {
    const toolType = toolTypeMap.get(cmd.toolId);
    if (!toolType) {
      errors.push(`Tool "${cmd.toolId}" not found in workcell`);
      return cmd;
    }
    return {
      ...cmd,
      toolType: toolType as ToolType,
      tool_info: {
        type: toolType,
        imageUrl: toolType === "toolbox" ? "/tool_icons/toolbox.png" : undefined,
      },
    };
  });

  if (errors.length > 0) {
    throw new Error(`Unknown tools: ${[...new Set(errors)].join(", ")}`);
  }

  return resolved;
}
```

**Step 2: Commit**

```bash
git add controller/server/scripting/resolve-tool-types.ts
git commit -m "feat: add toolType resolver for script-generated commands"
```

---

### Task 7: Integrate script execution into run creation

**Files:**
- Modify: `controller/server/runs.ts:64-87,183-234`

**Step 1: Add script generation path to `createFromProtocol()`**

At the top of `controller/server/runs.ts`, add imports:

```typescript
import { executeProtocolScript } from "@/server/scripting/protocol-script-executor";
import { resolveToolTypes } from "@/server/scripting/resolve-tool-types";
```

Replace the `generateCommandsFromProtocol()` function (lines 64-87) with a version that handles both modes:

```typescript
async function generateCommandsFromProtocol(
  protocol: any,
  paramValues?: Record<string, string>,
): Promise<ToolCommandInfo[]> {
  if (protocol.mode === "script") {
    if (!protocol.scriptContent || protocol.scriptContent.trim() === "") {
      throw new ProtocolGenerationFailedError(
        `Script protocol ${protocol.id} has no script content`,
      );
    }

    const result = await executeProtocolScript(
      protocol.scriptContent,
      paramValues || {},
    );

    if (!result.success) {
      throw new ProtocolGenerationFailedError(
        `Script execution failed: ${result.error}`,
      );
    }

    // Resolve tool types
    const resolved = await resolveToolTypes(result.commands, protocol.workcellId);
    return resolved;
  }

  // Visual mode (existing logic)
  if (!protocol.commands || protocol.commands.length === 0) {
    throw new ProtocolGenerationFailedError(`Protocol ${protocol.id} has no commands`);
  }

  return protocol.commands.map((cmd: any) => ({
    toolId: cmd.toolId,
    toolType: cmd.toolType,
    command: cmd.command,
    params: cmd.params || {},
    label: cmd.label || "",
    tool_info: cmd.tool_info || {
      type: cmd.toolType,
      imageUrl: cmd.toolType === "toolbox" ? "/tool_icons/toolbox.png" : undefined,
    },
    advancedParameters: cmd.advancedParameters || {
      skipExecutionVariable: {
        variable: null,
        value: "",
      },
      runAsynchronously: false,
    },
  }));
}
```

**Step 2: Update `createFromProtocol()` to pass params**

In `createFromProtocol()` (line 183), the function currently doesn't receive param values. Update the method signature and the call to `generateCommandsFromProtocol`:

```typescript
async createFromProtocol(protocolId: string, paramValues?: Record<string, string>): Promise<Run> {
  try {
    const protocol = await loadProtocolFromDatabase(protocolId);
    const commands = await generateCommandsFromProtocol(protocol, paramValues);
    // ... rest unchanged
```

Note: `generateCommandsFromProtocol` is now `async` due to `executeProtocolScript` and `resolveToolTypes`.

**Step 3: Update the run router to pass params through**

In `controller/server/routers/run.ts`, find where `createFromProtocol` is called and pass the parameter values through. The router already has `input.parameters` (a `Record<string, string>`). Pass it:

```typescript
const run = await RunStore.global.createFromProtocol(
  String(input.protocolId),
  input.parameters,
);
```

**Step 4: Commit**

```bash
git add controller/server/runs.ts controller/server/routers/run.ts controller/server/scripting/
git commit -m "feat: integrate script execution into run creation flow"
```

---

## Phase 4: Protocol Editor UI

---

### Task 8: Add mode selector to NewProtocolForm

**Files:**
- Modify: `controller/components/protocols/NewProtocolForm.tsx`

**Step 1: Add mode to form state**

Update the `formData` initial state (~line 33):

```typescript
const [formData, setFormData] = useState<ProtocolFormData>({
  name: "",
  category: "development",
  description: "",
  commands: [],
  mode: "visual",
});
```

Update the `ProtocolFormData` type if needed — it derives from `Protocol` so the new fields should be included automatically via the schema change. If not, extend it.

**Step 2: Add mode selector to the form**

After the Category `<FormControl>` (~line 134), add:

```tsx
<FormControl>
  <FormLabel>Mode</FormLabel>
  <Select name="mode" value={formData.mode || "visual"} onChange={handleChange}>
    <option value="visual">Visual</option>
    <option value="script">Script</option>
  </Select>
</FormControl>
```

**Step 3: Include mode in submit**

The `handleSubmit` function (~line 87-93) already spreads `formData`, so `mode` will be included. Verify the `createProtocol.mutateAsync(protocolData)` call passes it through.

**Step 4: Commit**

```bash
git add controller/components/protocols/NewProtocolForm.tsx
git commit -m "feat: add mode selector to new protocol form"
```

---

### Task 9: Add script editor to ProtocolDetailView

**Files:**
- Modify: `controller/components/protocols/ProtocolDetailView.tsx`

This is the largest UI task. The protocol detail page needs to show the Monaco editor when `protocol.mode === "script"` instead of the visual command swimlane.

**Step 1: Add imports**

Add to the imports at the top of `controller/components/protocols/ProtocolDetailView.tsx`:

```typescript
import dynamic from "next/dynamic";

// Dynamic import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
```

**Step 2: Add script state**

After the existing state declarations (~line 146), add:

```typescript
const [scriptContent, setScriptContent] = useState<string>("");
const [previewCommands, setPreviewCommands] = useState<any[] | null>(null);
const [isPreviewLoading, setIsPreviewLoading] = useState(false);
```

Add an effect to initialize scriptContent from protocol data:

```typescript
useEffect(() => {
  if (protocol?.scriptContent) {
    setScriptContent(protocol.scriptContent);
  }
}, [protocol?.scriptContent]);
```

**Step 3: Add preview mutation**

Add a tRPC endpoint for previewing script output (or handle client-side). Since the script runs server-side, add a new tRPC endpoint. In `controller/server/routers/protocol.ts`, add:

```typescript
preview: procedure
  .input(
    z.object({
      scriptContent: z.string(),
      params: z.record(z.string(), z.string()).optional(),
      workcellId: z.number(),
    }),
  )
  .mutation(async ({ input }) => {
    const { executeProtocolScript } = await import("@/server/scripting/protocol-script-executor");
    const { resolveToolTypes } = await import("@/server/scripting/resolve-tool-types");

    const result = await executeProtocolScript(
      input.scriptContent,
      input.params || {},
    );

    if (!result.success) {
      return { success: false, error: result.error, logs: result.logs, commands: [], commandCount: 0 };
    }

    try {
      const resolved = await resolveToolTypes(result.commands, input.workcellId);
      return { success: true, commands: resolved, commandCount: resolved.length, logs: result.logs };
    } catch (error: any) {
      return { success: false, error: error.message, logs: result.logs, commands: result.commands, commandCount: result.commands.length };
    }
  }),
```

Back in `ProtocolDetailView.tsx`, add the mutation:

```typescript
const previewMutation = trpc.protocol.preview.useMutation();
```

**Step 4: Add preview handler**

```typescript
const handlePreview = async () => {
  if (!protocol) return;
  setIsPreviewLoading(true);
  try {
    const result = await previewMutation.mutateAsync({
      scriptContent,
      workcellId: protocol.workcellId!,
      params: {},
    });
    if (result.success) {
      setPreviewCommands(result.commands);
      successToast("Preview generated", `${result.commandCount} commands generated`);
    } else {
      setPreviewCommands(null);
      errorToast("Script error", result.error || "Unknown error");
    }
    if (result.logs.length > 0) {
      console.log("Script logs:", result.logs);
    }
  } catch (error: any) {
    errorToast("Preview failed", error.message);
  } finally {
    setIsPreviewLoading(false);
  }
};
```

**Step 5: Add save handler for script mode**

```typescript
const handleSaveScript = () => {
  if (!protocol) return;
  updateProtocol.mutate({
    id: protocol.id,
    scriptContent,
  });
};
```

**Step 6: Render script editor conditionally**

In the JSX where the command swimlane is rendered (~lines 420-506), wrap it in a mode check:

```tsx
{protocol.mode === "script" ? (
  <VStack spacing={4} align="stretch" flex={1}>
    <Box borderWidth={1} borderColor={borderColor} borderRadius="md" overflow="hidden" height="500px">
      <MonacoEditor
        height="500px"
        language="javascript"
        theme={useColorModeValue("light", "vs-dark")}
        value={scriptContent}
        onChange={(value) => setScriptContent(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          scrollBeyondLastLine: false,
        }}
      />
    </Box>
    <HStack>
      <Button
        colorScheme="teal"
        onClick={handleSaveScript}
        isLoading={updateProtocol.isLoading}
        leftIcon={<SaveIcon />}>
        Save Script
      </Button>
      <Button
        colorScheme="blue"
        variant="outline"
        onClick={handlePreview}
        isLoading={isPreviewLoading}>
        Preview ({previewCommands ? `${previewCommands.length} commands` : "..."})
      </Button>
    </HStack>
    {previewCommands && (
      <Box maxHeight="300px" overflowY="auto" borderWidth={1} borderColor={borderColor} borderRadius="md" p={2} fontSize="sm">
        <Text fontWeight="bold" mb={2}>{previewCommands.length} commands generated:</Text>
        {previewCommands.map((cmd, i) => (
          <Text key={i} fontFamily="mono" fontSize="xs">
            {i + 1}. [{cmd.toolId}] {cmd.command} {JSON.stringify(cmd.params)}
          </Text>
        ))}
      </Box>
    )}
  </VStack>
) : (
  /* existing visual command swimlane JSX (~lines 420-506) */
)}
```

**Step 7: Update the header buttons for script mode**

The Edit button (~line 502-506) should be hidden for script protocols since the Monaco editor is always editable. The Export/Import buttons stay.

```tsx
{protocol.mode !== "script" && (
  <Button leftIcon={<EditIcon />} colorScheme="teal" onClick={() => setIsEditing(true)}>
    Edit
  </Button>
)}
```

**Step 8: Commit**

```bash
git add controller/components/protocols/ProtocolDetailView.tsx controller/server/routers/protocol.ts
git commit -m "feat: add script editor with preview to protocol detail page"
```

---

### Task 10: End-to-end testing

**Step 1: Test performance improvements**

1. Queue the limecoli 1783-command protocol — verify it queues near-instantly (pushBatch)
2. Open the Runs page — verify no duplicate network requests in browser DevTools (duplicate query fix)
3. During a run, verify the Runs page loads quickly and shows correct progress

**Step 2: Test script protocol creation**

1. Create a new protocol with mode "Script"
2. Navigate to its detail page — verify Monaco editor appears
3. Enter a simple script:
   ```javascript
   for (let i = 0; i < 5; i++) {
     galago.command("ClarioStar", "start_read", { timepoint: `read_${i}` });
   }
   ```
4. Click Preview — verify "5 commands generated" with correct content
5. Click Save Script — verify success toast
6. Click Run — verify run creates and commands execute

**Step 3: Test script protocols with parameters**

1. Add parameters to the script protocol (e.g., `plate_name` of type string)
2. Update the script to use `params.plate_name`
3. Run the protocol, set the parameter in the run modal
4. Verify the generated commands contain the parameter value

**Step 4: Test export/import of script protocols**

1. Export a script protocol — verify JSON contains `mode: "script"` and `scriptContent`
2. Import it into another workcell — verify it creates correctly with script content preserved
3. Export a workcell containing script protocols — verify they're included

**Step 5: Test visual protocols unchanged**

1. Open an existing visual protocol — verify the swimlane editor still works
2. Create a new visual protocol — verify default mode is "visual"
3. Run a visual protocol — verify no regressions

**Step 6: Test error cases**

1. Script with syntax error → verify clear error at preview/run time
2. Script that references unknown tool → verify "Tool not found" error
3. Script that produces no commands → verify "Script produced no commands" error
4. Script with infinite loop → verify timeout error after 5 seconds
