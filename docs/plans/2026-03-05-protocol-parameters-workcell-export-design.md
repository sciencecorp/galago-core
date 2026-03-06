# Protocol Parameters in Workcell Import/Export

## Problem

Protocol parameters (queue-time run parameters) can be configured in the UI but are dropped during workcell export/import. The export maps protocols with only `{ name, category, description, commands }`, omitting the `parameters` field.

## Solution

Add `parameters` to the workcell export and import in `controller/server/routers/workcell.ts`. Reuse the existing `zProtocolParameter` Zod schema from `protocols/params.ts`.

## Changes (single file: `controller/server/routers/workcell.ts`)

1. **Export** (~line 387): Include `parameters` in protocol mapping (1:1, as-is)
2. **Import validation** (~line 540): Add `parameters: z.array(zProtocolParameter).nullable().optional()` to protocol schema
3. **Import insert** (~line 764): Pass `parameters ?? null` to DB insert

## Constraints

- No database migration needed (`parameters` column already exists)
- No UI changes needed
- Backward compatible: older exports without `parameters` import as no-parameters (field is optional)
- Export version stays at 2 (additive change)
