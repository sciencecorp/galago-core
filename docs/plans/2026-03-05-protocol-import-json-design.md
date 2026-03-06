# Protocol Import via JSON

## Problem

Protocols can be exported as JSON but there is no UI to import them back. The backend `protocol.import` endpoint already exists.

## Solution

Add an "Import Protocol" button in two locations with distinct behaviors.

### List Page Import (Create New)

- Add "Import Protocol" button (Upload icon) alongside existing "New Protocol" button
- Hidden file input accepting `.json`, same pattern as workcell import
- On file select: parse JSON, call `protocol.import` mutation with current workcellId
- If a protocol with the same name already exists, block import with error toast explaining user must rename in JSON or navigate to existing protocol to update it
- On success: success toast and refetch protocol list

### Detail Page Import (Update Existing)

- Add "Import Protocol" button (Upload icon) next to existing Export button
- On file select: parse JSON, then:
  - If imported name differs from current protocol name, show warning toast noting mismatch but proceed
  - Overwrite `commands`, `parameters`, `category`, `description` from imported JSON
  - Keep the existing protocol name
- Call existing `protocol.update` mutation (not `protocol.import`)
- On success: success toast and refetch protocol data

## Endpoints Used

- List page: `protocol.import` (creates new protocol)
- Detail page: `protocol.update` (updates existing protocol content)

## No Changes Needed

- No new tRPC endpoints
- No database changes
- Export format unchanged
