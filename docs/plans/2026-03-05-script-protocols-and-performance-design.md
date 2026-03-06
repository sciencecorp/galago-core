# Script-Based Protocols and Performance Improvements

## Problem

Galago protocols are authored as flat command lists. A 1,783-step protocol that is logically 3 nested loops (plates × durations × wavelengths) with a ~12-command body must be written out command by command. This is tedious to author, hard to maintain, and causes performance issues — all commands are queued individually into SQLite with separate transactions, and the UI renders/polls the entire list at once.

## Solution

1. Add a script-based protocol authoring mode where protocols are written as JavaScript with a `galago` API that generates commands
2. Implement three performance improvements for long protocol queuing and execution

---

## Data Model

Add two nullable fields to the `protocols` table:

- `mode`: `text` — `"visual"` (default) or `"script"`. Determines which editor the UI shows and how commands are generated at run time.
- `scriptContent`: `text` — JavaScript source code for script-mode protocols. Null for visual protocols.

The existing `commands` field stays. For script-mode protocols, `commands` is populated at queue time (generation phase) rather than at authoring time. No migration of existing protocols needed — they are implicitly `mode: "visual"`.

---

## Script API

Scripts run in a JavaScript sandbox with two injected globals:

### `galago` — command builder

```javascript
galago.command(toolId, command, params)    // emit a tool command
galago.timer({ minutes, seconds, message }) // Tool Box: timer
galago.pause(message)                       // Tool Box: pause
galago.showMessage(message, title)          // Tool Box: show_message
galago.note(message)                        // Tool Box: note
galago.assignVariable(name, value)          // Tool Box: variable_assignment
galago.userForm(name)                       // Tool Box: user_form
```

Each call pushes a `ToolCommandInfo` onto an internal array. After the script finishes, that array becomes the protocol's command list.

### `params` — run parameters

Parameters defined via the same `ProtocolParameter` schema and `ProtocolParametersEditor` UI as visual protocols. At queue time, user-provided values are injected as `params`:

```javascript
const plateName = params.plate_name_1;  // "EXP-001"
const temp = Number(params.temperature); // 37
galago.command("ClarioStar", "set_temperature", { temperature: temp });
```

Generated commands can still contain `{{varName}}` references for deferred resolution at execution time if needed.

### `toolType` Resolution

Script authors specify tool names only (not types). After generation, `toolType` is resolved by looking up each `toolId` in the workcell's tool list. Unknown tool IDs surface as validation errors before queuing.

### Execution Context

Script runs server-side via `new Function()` with restricted scope:
- Access: `galago`, `params`, `console.log`, standard JS globals (Math, Array, String, JSON)
- No access: `require`, `import`, `process`, `fs`, network, Galago internals
- Timeout: 5 seconds (prevents infinite loops)

---

## Protocol Editor UI

### Mode Toggle

The protocol detail page header gets a Visual / Script toggle controlling which editor is shown.

### Visual Mode (unchanged)

Existing drag-and-drop command list. No changes.

### Script Mode

- Monaco editor (already in codebase for Scripts feature) replaces the command list area
- Language: JavaScript
- `ProtocolParametersEditor` stays visible in both modes
- **Preview button**: Executes the script and shows generated command count + scrollable command list for validation before running
- Save persists `scriptContent` to the database

### Creating New Protocols

"New Protocol" form gets a mode selector (Visual / Script). Default is Visual.

### Export/Import

Script-mode protocols export with `mode` and `scriptContent` in JSON. Import handles both modes. Workcell export includes these fields.

---

## Run-Time Generation Flow

### Visual protocols (unchanged)
```
Run → collect params → upsertParameterVariables()
  → read protocol.commands from DB
  → create Run with commands → enqueueRun() → execute
```

### Script protocols (new)
```
Run → collect params → upsertParameterVariables()
  → read protocol.scriptContent from DB
  → execute script with params → produces command array
  → resolve toolType for each command
  → validate
  → create Run with generated commands → enqueueRun() → execute
```

Divergence point: `runs.ts` `createFromProtocol()`. If `protocol.mode === "script"`, run the script to generate commands. Everything downstream is identical.

### Error Handling

- **Script syntax error**: Caught during generation, returned before queuing
- **Infinite loop**: 5-second timeout, fails with "Script timed out"
- **Empty command array**: Rejected with "Script produced no commands"
- **Unknown toolId**: Rejected with "Tool 'X' not found in workcell"
- **Runtime error**: Caught and returned with error message and line number

---

## Performance Improvements

### 1. Batch Insert for Command Queuing

Add `pushBatch()` to `SqliteQueue` — inserts all commands in a single SQLite transaction.

- File: `controller/server/utils/SqliteQueue.ts`
- Wrap all INSERTs in one `db.transaction()` call
- Compute positions incrementally (start from current max + 1) instead of `SELECT MAX(position)` per row
- Update `enqueueRun()` in `command_queue.ts` to call `pushBatch(run.commands)` instead of looping `push()`
- Expected: 1,783 commands from seconds to ~50ms

### 2. Remove Duplicate Query in RunsComponent

`RunsComponent.tsx` calls `trpc.commandQueue.getAll.useQuery()` at both line 111 (2000ms interval) and line 148 (1000ms interval). Remove the duplicate, use a single query reference.

- File: `controller/components/runs/RunsComponent.tsx`

### 3. Paginated Run Queue Display

Switch the runs UI from `getAll` (fetches entire queue every 1-2s) to the existing `getPaginated()` backend endpoint with a small limit.

- Add a lightweight `getQueueSummary` endpoint returning counts (total, completed, remaining) without full command payloads
- Use `getPaginated` with limit ~20 for the visible command list
- Files: `controller/server/routers/command_queue.ts`, `controller/components/runs/RunsComponent.tsx`
