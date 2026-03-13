# Script-Based Protocols

## Overview

Galago supports two protocol authoring modes:

- **Visual mode** (default) — build protocols by dragging and dropping individual tool commands in the UI. Each command is manually configured one at a time.
- **Script mode** — write JavaScript that programmatically generates commands. The script runs at queue time and produces the same command list that visual mode would, but with the full power of loops, conditionals, functions, and parameters.

Script mode is ideal for protocols that are repetitive, parameterized, or complex. A 1000+ command visual protocol can often be expressed in under 100 lines of script.

### How It Works

1. You write JavaScript in the built-in Monaco editor on the protocol detail page
2. You define **parameters** (inputs the user fills in before each run)
3. When a run is queued, the script executes in a sandboxed environment with access to the `galago` API and the user-provided `params`
4. The script generates a list of commands (identical in structure to visual-mode commands)
5. Tool types are resolved against the workcell, and the commands are enqueued for execution

The command queue executes script-generated commands identically to visual-mode commands. There is no runtime difference.

## Quick Start

### Minimal Example

A script that reads a plate, waits 5 minutes, then reads again:

```javascript
galago.command("Clariostar", "start_read", {
  protocol_name: "OD600-384",
  plate_id: params.plate_name,
  timepoint: "T0",
});

galago.timer({ minutes: 5, message: "Incubating..." });

galago.command("Clariostar", "start_read", {
  protocol_name: "OD600-384",
  plate_id: params.plate_name,
  timepoint: "T5",
});
```

With one parameter defined:

| Name         | Label      | Type   | Default   |
| ------------ | ---------- | ------ | --------- |
| `plate_name` | Plate Name | string | `EXP-001` |

### Using Loops

Read a plate every 10 minutes for an hour:

```javascript
var intervals = 6;

for (var i = 0; i < intervals; i++) {
  if (i > 0) {
    galago.timer({ minutes: 10, message: "Waiting for next read..." });
  }
  galago.command("Clariostar", "start_read", {
    protocol_name: "OD600-384",
    plate_id: params.plate_name,
    timepoint: "T" + i * 10,
  });
}
```

This generates 6 reads and 5 timers — 11 commands instead of building each one by hand.

### Using Functions

For protocols with repeated sequences, define helper functions:

```javascript
function transferToReader(hotelSlot) {
  galago.command("Clariostar", "open_carrier", {});
  galago.command("Pf400", "run_sequence", {
    labware: "default",
    sequence_name: "transfer-hotel-1-slot-" + hotelSlot + "-to-clariostar",
  });
  galago.command("Clariostar", "close_carrier", {});
}

function returnToHotel(hotelSlot) {
  galago.command("Clariostar", "open_carrier", {});
  galago.command("Pf400", "run_sequence", {
    labware: "default",
    sequence_name: "transfer-clariostar-to-hotel-1-slot-" + hotelSlot,
  });
  galago.command("Clariostar", "close_carrier", {});
}

// Use them
transferToReader(5);
galago.command("Clariostar", "start_read", {
  protocol_name: "OD600-384",
  plate_id: params.plate_name,
  timepoint: "Baseline",
});
returnToHotel(5);
```

## API Reference

### `galago.command(toolId, command, params)`

Emit a command to any tool in the workcell.

| Argument  | Type     | Description                                                                   |
| --------- | -------- | ----------------------------------------------------------------------------- |
| `toolId`  | `string` | The tool name as it appears in the workcell (e.g., `"Clariostar"`, `"Pf400"`) |
| `command` | `string` | The command name (e.g., `"start_read"`, `"run_sequence"`)                     |
| `params`  | `object` | Command parameters (tool-specific)                                            |

```javascript
galago.command("Clariostar", "set_temperature", { temperature: 37 });
galago.command("Pf400", "run_sequence", {
  labware: "default",
  sequence_name: "transfer-hotel-1-slot-5-to-clariostar",
});
galago.command("Tool Box", "text_to_speech", { text: "Protocol complete!" });
```

The `toolId` must match a tool registered in the workcell. Unknown tool IDs will cause an error at queue time. `"Tool Box"` is always available as a virtual tool.

### `galago.timer(options)`

Pause execution for a specified duration. A countdown modal appears in the UI.

| Option    | Type     | Default                  | Description                    |
| --------- | -------- | ------------------------ | ------------------------------ |
| `minutes` | `number` | `0`                      | Minutes to wait                |
| `seconds` | `number` | `30`                     | Seconds to wait                |
| `message` | `string` | `"Timer in progress..."` | Message shown during countdown |

```javascript
galago.timer({ minutes: 5, message: "Incubating plate..." });
galago.timer({ seconds: 90, message: "Cooling down..." });
galago.timer({ minutes: 1, seconds: 30 }); // 1m 30s
```

The timer is enforced server-side. Users can manually skip via the "Skip Timer" button.

### `galago.pause(message)`

Pause execution and wait for the user to click Continue.

| Argument  | Type     | Default                                      | Description                      |
| --------- | -------- | -------------------------------------------- | -------------------------------- |
| `message` | `string` | `"Run is paused. Click Continue to resume."` | Message shown in the pause modal |

```javascript
galago.pause("Load the plate into hotel slot 5, then click Continue.");
```

### `galago.showMessage(message, title)`

Display an informational message. The user must click Continue to proceed.

| Argument  | Type     | Default     | Description  |
| --------- | -------- | ----------- | ------------ |
| `message` | `string` | (required)  | Message body |
| `title`   | `string` | `"Message"` | Modal title  |

```javascript
galago.showMessage("Starting illumination cycle 3 of 5", "Progress Update");
```

### `galago.note(message)`

Log a note to the run record. Does not pause execution or show any UI.

| Argument  | Type     | Description |
| --------- | -------- | ----------- |
| `message` | `string` | Note text   |

```javascript
galago.note("Plate " + params.plate_name + " loaded at " + new Date().toISOString());
```

### `galago.assignVariable(name, value)`

Set a Galago variable's value. The variable must already exist in the workcell.

| Argument | Type     | Description   |
| -------- | -------- | ------------- |
| `name`   | `string` | Variable name |
| `value`  | `string` | New value     |

```javascript
galago.assignVariable("protocol_status", "in_progress");
galago.assignVariable("last_plate_read", params.plate_name);
```

### `galago.userForm(name)`

Show a user form and wait for submission before continuing. The form must already exist in Galago.

| Argument | Type     | Description |
| -------- | -------- | ----------- |
| `name`   | `string` | Form name   |

```javascript
galago.userForm("pre_run_checklist");
```

## Parameters

Parameters are defined in the protocol's Parameters panel and collected from the user at queue time. Inside the script, all parameter values are available as strings on the `params` object.

### Parameter Types

| Type      | UI Control   | Notes                                                         |
| --------- | ------------ | ------------------------------------------------------------- |
| `string`  | Text input   | Value is a string                                             |
| `number`  | Number input | Value is a string — use `Number(params.x)` to convert         |
| `boolean` | Checkbox     | Value is `"true"` or `"false"` — compare as string            |
| `select`  | Dropdown     | Requires `options` array; value is the selected option string |

### Example

Parameters defined in the UI:

| Name            | Label           | Type   | Default     | Required |
| --------------- | --------------- | ------ | ----------- | -------- |
| `plate_name`    | Plate Name      | string | `EXP-001`   | yes      |
| `temperature`   | Temperature (C) | number | `37`        | yes      |
| `read_count`    | Number of Reads | number | `5`         | no       |
| `protocol_type` | Protocol        | select | `OD600-384` | yes      |

Options for `protocol_type`: `OD600-384`, `Lime-384-noorbital`

Script usage:

```javascript
var plateName = params.plate_name;
var temperature = Number(params.temperature) || 37;
var readCount = Number(params.read_count) || 5;
var protocolType = params.protocol_type;

galago.command("Clariostar", "set_temperature", { temperature: temperature });

for (var i = 0; i < readCount; i++) {
  galago.command("Clariostar", "start_read", {
    protocol_name: protocolType,
    plate_id: plateName,
    timepoint: "T" + i,
  });
}
```

## Sandbox Environment

Scripts run in a Node.js `vm` sandbox with a 5-second timeout. The following globals are available:

| Global                                           | Description                                  |
| ------------------------------------------------ | -------------------------------------------- |
| `galago`                                         | Command builder API (see above)              |
| `params`                                         | User-provided parameter values (all strings) |
| `console.log()`, `.warn()`, `.error()`           | Logging (visible in preview output)          |
| `Math`                                           | Full Math object                             |
| `Array`, `Object`, `String`, `Number`, `Boolean` | Built-in constructors                        |
| `JSON`                                           | JSON.parse / JSON.stringify                  |
| `Date`                                           | Date constructor                             |
| `parseInt`, `parseFloat`, `isNaN`, `isFinite`    | Number utilities                             |

**Not available:** `require`, `import`, `process`, `fs`, `fetch`, network access, or any Node.js APIs. Scripts cannot access the filesystem, make HTTP requests, or interact with the system.

## Preview

The protocol detail page has a **Preview** button that executes the script and shows the generated command list without queuing a run. Use this to verify your script produces the expected commands before running it on actual hardware.

Preview uses the default parameter values, so make sure those are set to representative values.

## Import / Export

Script protocols can be exported and imported as JSON files. The format:

```json
{
  "protocol": {
    "name": "My Protocol",
    "category": "production",
    "description": "Protocol description",
    "mode": "script",
    "scriptContent": "galago.command(...);",
    "parameters": [
      {
        "name": "plate_name",
        "label": "Plate Name",
        "type": "string",
        "defaultValue": "EXP-001",
        "required": true,
        "description": "Plate identifier"
      }
    ],
    "commands": []
  },
  "exportedAt": "2026-03-06T00:00:00.000Z",
  "version": "1.0"
}
```

For script-mode protocols, `commands` is always `[]` in the export — commands are generated at runtime from `scriptContent`.

## Tips

- **Always convert numeric params:** `params` values are strings. Use `Number(params.x)` with a fallback: `Number(params.x) || defaultValue`.
- **Use `var` instead of `const`/`let`:** The sandbox runs in strict mode within a `vm.Script`. Using `var` avoids scoping issues in some edge cases with function declarations.
- **Keep scripts under 5 seconds:** The sandbox enforces a 5-second timeout. Avoid unbounded loops. For a protocol with thousands of commands, this is typically not an issue — command generation is fast.
- **Test with Preview first:** Always preview before queuing a run. The preview shows the exact command sequence that will be enqueued.
- **Use functions for repeated sequences:** If you find yourself copy-pasting a block of commands, extract it into a function. This reduces errors and makes the script easier to modify.
- **Variable references in visual mode vs. script mode:** In visual mode, you use `{{variable_name}}` syntax in command parameters to reference Galago variables. In script mode, you can use the same syntax in string values passed to `galago.command()`, and they will be resolved at execution time by the command queue.
