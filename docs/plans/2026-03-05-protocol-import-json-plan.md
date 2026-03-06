# Protocol Import via JSON — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add UI buttons to import protocols from JSON on both the protocol list page (create new) and protocol detail page (update existing).

**Architecture:** No backend changes needed — reuse existing `protocol.import` and `protocol.update` tRPC endpoints. Add file input + handler logic to two existing React components following the established workcell import pattern (`useWorkcellIO.ts`).

**Tech Stack:** React, Chakra UI, tRPC, lucide-react icons, Zod (server-side validation already exists)

---

### Task 1: Add Import Button to Protocol List Page

**Files:**
- Modify: `controller/components/protocols/ProtocolPageComponent.tsx`

**Step 1: Add import for `useRef`, `Upload` icon, and `Input`**

At the top of `ProtocolPageComponent.tsx`, update existing imports:

```typescript
// Change line 47 from:
import { useState, useMemo } from "react";
// To:
import { useState, useMemo, useRef } from "react";

// Change line 52 from:
import { GitBranch, Plus, Play } from "lucide-react";
// To:
import { GitBranch, Plus, Play, Upload } from "lucide-react";
```

`Input` is already imported from `@chakra-ui/react` (line 7).

**Step 2: Add ref, mutation, and handler inside the component**

Inside `ProtocolPageComponent` (after line 89, after the `deleteMutation`), add:

```typescript
const fileInputRef = useRef<HTMLInputElement>(null);
const importMutation = trpc.protocol.import.useMutation({
  onSuccess: () => {
    successToast("Protocol imported", "Protocol has been created successfully.");
    refetch();
  },
  onError: (error) => {
    errorToast("Import failed", error.message || "Failed to import protocol.");
  },
});

const handleImportClick = () => {
  fileInputRef.current?.click();
};

const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const fileContent = await file.text();
    const data = JSON.parse(fileContent);

    // Validate basic structure (exported format wraps in { protocol: {...} })
    const protocolData = data.protocol ?? data;
    if (!protocolData.name) {
      errorToast("Invalid file", "The JSON file does not contain a valid protocol.");
      return;
    }

    // Check for duplicate name in current workcell
    const existingProtocol = protocols?.find(
      (p) => p.name.toLowerCase() === protocolData.name.toLowerCase(),
    );
    if (existingProtocol) {
      errorToast(
        "Protocol already exists",
        `A protocol named "${protocolData.name}" already exists. Rename it in the JSON file, or navigate to the existing protocol to update it.`,
      );
      return;
    }

    // Find workcellId from workcellName
    const selectedWorkcell = workcells?.find((w) => w.name === workcellName);
    if (!selectedWorkcell) {
      errorToast("No workcell selected", "Please select a workcell before importing.");
      return;
    }

    await importMutation.mutateAsync({
      workcellId: selectedWorkcell.id,
      protocol: {
        name: protocolData.name,
        category: protocolData.category,
        description: protocolData.description,
        commands: protocolData.commands,
        parameters: protocolData.parameters,
      },
    });
  } catch (error: any) {
    if (!importMutation.isError) {
      errorToast("Import failed", error.message || "Could not parse the JSON file.");
    }
  } finally {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
};
```

**Step 3: Add the Import button next to the New button**

In the `mainButton` prop of `PageHeader` (lines 208-222), change the `<HStack>` contents from:

```tsx
<HStack>
  <Tooltip
    label={!workcellName ? "Create or Select a Workcell to create a protocol" : ""}
    placement="top"
    hasArrow>
    <Button
      size="sm"
      isDisabled={!workcellName}
      colorScheme="teal"
      leftIcon={<Plus size={14} />}
      onClick={onNewProtocolOpen}>
      New
    </Button>
  </Tooltip>
</HStack>
```

To:

```tsx
<HStack>
  <Tooltip
    label={!workcellName ? "Create or Select a Workcell to import a protocol" : ""}
    placement="top"
    hasArrow>
    <Button
      size="sm"
      isDisabled={!workcellName}
      colorScheme="blue"
      variant="outline"
      leftIcon={<Upload size={14} />}
      onClick={handleImportClick}
      isLoading={importMutation.isLoading}>
      Import
    </Button>
  </Tooltip>
  <Tooltip
    label={!workcellName ? "Create or Select a Workcell to create a protocol" : ""}
    placement="top"
    hasArrow>
    <Button
      size="sm"
      isDisabled={!workcellName}
      colorScheme="teal"
      leftIcon={<Plus size={14} />}
      onClick={onNewProtocolOpen}>
      New
    </Button>
  </Tooltip>
</HStack>
```

**Step 4: Add hidden file input**

Right before the closing tag of the root component (find the final `</>` or closing element), add:

```tsx
<Input
  type="file"
  ref={fileInputRef}
  onChange={handleImportFileChange}
  style={{ display: "none" }}
  accept=".json"
/>
```

**Step 5: Verify in the browser**

Run: `docker-compose -f docker-compose.dev.yml up --build` (if not already running)

1. Navigate to the Protocols page
2. Verify "Import" button appears next to "New" button
3. Verify button is disabled when no workcell is selected
4. Export an existing protocol, then try importing it — should see "Protocol already exists" error
5. Rename the protocol in the JSON, import again — should succeed

**Step 6: Commit**

```bash
git add controller/components/protocols/ProtocolPageComponent.tsx
git commit -m "feat: add protocol import button to protocol list page"
```

---

### Task 2: Add Import Button to Protocol Detail Page

**Files:**
- Modify: `controller/components/protocols/ProtocolDetailView.tsx`

**Step 1: Add import for `useRef` and `Upload` icon, and `Input`**

Update existing imports at the top of `ProtocolDetailView.tsx`:

```typescript
// Change line 25 from:
import { useState, useEffect } from "react";
// To:
import { useState, useEffect, useRef } from "react";

// Change line 40 from:
import { Play, Download, LogOut } from "lucide-react";
// To:
import { Play, Download, LogOut, Upload } from "lucide-react";
```

Add `Input` to the Chakra UI imports (line 1-23). It's not currently imported — add it to the existing destructure:

```typescript
// Add Input to the chakra imports, e.g. after IconButton:
  IconButton,
  Input,
  Divider,
```

**Step 2: Add ref, state, and handler inside the component**

After the `isExporting` state declaration (line 146), add:

```typescript
const [isImporting, setIsImporting] = useState(false);
const importFileInputRef = useRef<HTMLInputElement>(null);
```

After the `handleExport` function (after line 308), add:

```typescript
const handleImportClick = () => {
  importFileInputRef.current?.click();
};

const handleImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    setIsImporting(true);
    const fileContent = await file.text();
    const data = JSON.parse(fileContent);

    // Validate basic structure (exported format wraps in { protocol: {...} })
    const protocolData = data.protocol ?? data;
    if (!protocolData.commands && !protocolData.name) {
      errorToast("Invalid file", "The JSON file does not contain a valid protocol.");
      return;
    }

    // Warn if names don't match
    if (protocol && protocolData.name && protocolData.name !== protocol.name) {
      successToast(
        "Name mismatch",
        `Imported protocol name "${protocolData.name}" differs from "${protocol.name}". Keeping existing name.`,
      );
    }

    // Update existing protocol — keep current name, overwrite content
    await updateProtocol.mutateAsync({
      id,
      category: protocolData.category ?? protocol?.category,
      description: protocolData.description ?? protocol?.description ?? null,
      commands: protocolData.commands ?? protocol?.commands,
      parameters: protocolData.parameters ?? protocol?.parameters ?? null,
    });
  } catch (error: any) {
    errorToast("Import failed", error.message || "Could not parse the JSON file.");
  } finally {
    setIsImporting(false);
    if (importFileInputRef.current) {
      importFileInputRef.current.value = "";
    }
  }
};
```

Note: The `updateProtocol` mutation already exists (line 165-170) and already calls `successToast` + `refetch()` on success, so we don't need to duplicate that.

**Step 3: Add the Import button next to the Export button**

In the non-editing button group (lines 493-501), after the Export button, add the Import button:

```tsx
// Existing Export button (lines 494-501):
<Button
  leftIcon={<Download />}
  colorScheme="green"
  variant="outline"
  onClick={handleExport}
  isLoading={isExporting}>
  Export
</Button>
// Add Import button right after:
<Button
  leftIcon={<Upload />}
  colorScheme="blue"
  variant="outline"
  onClick={handleImportClick}
  isLoading={isImporting}>
  Import
</Button>
```

**Step 4: Add hidden file input**

Near the end of the component's JSX (before the final closing tags), add:

```tsx
<Input
  type="file"
  ref={importFileInputRef}
  onChange={handleImportFileChange}
  style={{ display: "none" }}
  accept=".json"
/>
```

**Step 5: Verify in the browser**

1. Navigate to a protocol's detail page
2. Verify "Import" button appears next to "Export" button
3. Export the protocol, edit the JSON to change commands/parameters
4. Import it back — should update and show "Protocol updated" toast
5. Export a different protocol, import it into this one — should show name mismatch warning but still update

**Step 6: Commit**

```bash
git add controller/components/protocols/ProtocolDetailView.tsx
git commit -m "feat: add protocol import button to protocol detail page"
```

---

### Task 3: Manual End-to-End Testing

**Step 1: Test list page import — new protocol**

1. Export an existing protocol from its detail page
2. Edit the JSON: change `"name"` to something unique
3. Go to Protocols list, click Import, select the file
4. Verify new protocol appears in the list
5. Open it and verify commands + parameters match the JSON

**Step 2: Test list page import — duplicate name blocked**

1. Try importing the same file again (without renaming)
2. Verify error toast: "Protocol already exists"

**Step 3: Test detail page import — update**

1. Export protocol A
2. Navigate to protocol B's detail page
3. Click Import, select protocol A's JSON
4. Verify warning toast about name mismatch
5. Verify protocol B's commands/parameters/category/description now match protocol A's export
6. Verify protocol B's name is unchanged

**Step 4: Test detail page import — same name**

1. Export a protocol
2. Edit the JSON to change some commands
3. Import it back into the same protocol's detail page
4. Verify no name mismatch warning
5. Verify commands updated

**Step 5: Commit (if any fixes needed)**

```bash
git commit -m "fix: address issues found in protocol import testing"
```
