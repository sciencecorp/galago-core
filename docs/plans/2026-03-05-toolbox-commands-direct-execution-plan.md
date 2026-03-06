# Tool Box Commands Direct Execution — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable Tool Box virtual commands (`show_message`, `pause`, `timer`, `user_form`, `note`, `variable_assignment`) to work from the tool detail page the same way they work during protocol runs.

**Architecture:** The `tool.runCommand` tRPC mutation currently sends all commands to gRPC, but Tool Box commands are virtual (no gRPC driver). During protocol runs, the command queue intercepts these and triggers UI modals via `CommandQueue.global`. The fix intercepts Tool Box commands in the `runCommand` mutation before they reach gRPC, delegating to `CommandQueue.global` methods instead.

**Tech Stack:** tRPC, CommandQueue singleton, Drizzle ORM (for variable_assignment)

---

## Root Cause

Two code paths execute commands:

1. **Command Queue** (`server/command_queue.ts:746-1014`) — Used during protocol runs. Checks `toolId === "Tool Box"` and handles commands internally via UI modals. Works correctly.

2. **Direct execution** (`server/routers/tool.ts:495-506` → `server/tools.ts:333`) — Used from the tool detail page. Sends commands straight to gRPC with no Tool Box handling. Causes `UNRECOGNIZED_COMMAND` errors.

## Command Behavior Matrix

| Command | Tool Detail Page Behavior | Mechanism |
|---------|--------------------------|-----------|
| `show_message` | Show message modal, wait for dismiss | `CommandQueue.global.showMessage(message, title)` |
| `pause` | Show pause modal, wait for resume | `CommandQueue.global.pause(message)` |
| `timer` | Show timer modal, wait for completion | `CommandQueue.global.startTimer(minutes, seconds, message)` |
| `user_form` | Show form modal, wait for submit | `CommandQueue.global.showUserForm(formName)` |
| `note` | No-op, return success immediately | Return directly |
| `variable_assignment` | Assign variable in DB | DB update via Drizzle |
| `run_script` | Already works (handled in tools.ts) | No change needed |
| `stop_run` | No run context — return error | Throw descriptive error |
| `goto` | No run context — return error | Throw descriptive error |
| `text_to_speech` | TBD — check if gRPC driver handles it | Investigate |

---

### Task 1: Handle Tool Box commands in runCommand mutation

**Files:**
- Modify: `controller/server/routers/tool.ts:495-506`

**What to change:**

In the `runCommand` mutation, before calling `Tool.executeCommand(input)`, add a check for Tool Box commands:

```typescript
import CommandQueue from "../command_queue";

// ... inside runCommand mutation, before Tool.executeCommand(input):

if (input.toolId === "Tool Box") {
  const params = input.params;

  switch (input.command) {
    case "show_message": {
      const message = (params.message as string) || "Please review and click Continue to proceed.";
      const title = (params.title as string) || "Message";
      await CommandQueue.global.showMessage(message, title);
      return { response: 1 }; // SUCCESS
    }
    case "pause": {
      const message = (params.message as string) || "Run is paused. Click Continue to resume.";
      await CommandQueue.global.pause(message);
      return { response: 1 };
    }
    case "timer": {
      const minutes = Number(params.minutes) || 0;
      const seconds = Number(params.seconds) || 30;
      const message = (params.message as string) || "Timer in progress...";
      await CommandQueue.global.startTimer(minutes, seconds, message);
      return { response: 1 };
    }
    case "user_form": {
      const formName = params.name as string;
      if (!formName) throw new Error("Form name is required for user_form command");
      await CommandQueue.global.showUserForm(formName);
      return { response: 1 };
    }
    case "note": {
      return { response: 1 }; // No-op
    }
    case "variable_assignment": {
      // Variable assignment needs DB access — see Task 2
      await handleVariableAssignment(params);
      return { response: 1 };
    }
    case "stop_run":
      throw new Error("The stop_run command can only be used during a protocol run.");
    case "goto":
      throw new Error("The goto command can only be used during a protocol run.");
    default:
      // Fall through to Tool.executeCommand for commands like run_script
      break;
  }
}

return await Tool.executeCommand(input);
```

**Key details:**
- The `showMessage`, `pause`, `startTimer`, `showUserForm` methods return promises that resolve when the user dismisses the modal. This means the mutation awaits until the user interacts, keeping the loading toast spinning on the tool page.
- `_ensureModalReady()` is called internally by each method, so if a modal is already showing it gets safely resolved first.
- `run_script` falls through to the existing `Tool.executeCommand` path which already handles script execution.

**Commit:**
```bash
git add controller/server/routers/tool.ts
git commit -m "feat: handle Tool Box virtual commands in direct execution path"
```

---

### Task 2: Implement variable_assignment handler

**Files:**
- Modify: `controller/server/routers/tool.ts`

**What to change:**

Add a helper function (in the same file or imported) that replicates the variable assignment logic from `command_queue.ts:948-1009`:

```typescript
import { db } from "@/db/client";
import { variables } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSelectedWorkcellId } from "@/server/utils/workcell"; // check exact import path

async function handleVariableAssignment(params: Record<string, any>) {
  let variableName = params.name as string;
  const expressionValue = params.value;

  if (!variableName) {
    throw new Error("Variable name is required for assignment");
  }

  // Strip legacy {{}} syntax
  if (variableName.startsWith("{{") && variableName.endsWith("}}")) {
    variableName = variableName.slice(2, -2).trim();
  }

  const workcellId = await getSelectedWorkcellId();
  const targetVariable = await db
    .select()
    .from(variables)
    .where(and(eq(variables.name, variableName), eq(variables.workcellId, workcellId)))
    .limit(1)
    .then((rows) => rows[0]);

  if (!targetVariable) {
    throw new Error(`Variable "${variableName}" not found`);
  }

  await db
    .update(variables)
    .set({ value: String(expressionValue), updatedAt: new Date() })
    .where(eq(variables.id, targetVariable.id));
}
```

**Note:** This is a simplified version that assigns the raw value. The command queue version uses `evaluateExpression()` for arithmetic/variable substitution. If you need that from the tool page, you'd need to extract `evaluateExpression` from CommandQueue into a shared utility. For basic testing, direct assignment is sufficient.

**Commit:**
```bash
git add controller/server/routers/tool.ts
git commit -m "feat: support variable_assignment from tool detail page"
```

---

### Task 3: Verify return type compatibility

**Files:**
- Read: `controller/server/tools.ts` (ExecuteCommandReply type)
- Read: `controller/pages/tools/[id].tsx` (how mutation result is used)

**What to check:**

The `runCommand` mutation currently returns `tool_base.ExecuteCommandReply`. The tool page uses it inside a `loadingToast` promise — it only checks success/error, not the response shape. Verify that returning `{ response: 1 }` from the Tool Box handler doesn't cause type errors. If it does, return the proper `ExecuteCommandReply` shape:

```typescript
return {
  response: 1, // SUCCESS
  return_reply: true,
  meta_data: {} as any,
} as tool_base.ExecuteCommandReply;
```

---

### Task 4: Manual testing

1. Navigate to a workcell's Tools page, click on "Tool Box"
2. Test each command:
   - **show_message**: Select, fill in message/title, click Execute → modal should appear, click Continue → success toast
   - **pause**: Execute → pause modal appears, click Continue → success toast
   - **timer**: Set minutes/seconds, execute → timer modal counts down, completes → success toast
   - **note**: Execute → immediate success toast (no modal)
   - **variable_assignment**: Create a variable first, then assign via Tool Box → verify value changed in Variables page
   - **stop_run**: Execute → should show error toast "can only be used during a protocol run"
   - **goto**: Execute → should show error toast "can only be used during a protocol run"
3. Verify these same commands still work correctly during a protocol run (regression test)
