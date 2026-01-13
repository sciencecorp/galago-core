# Galago Hub Library (git-tracked)

This folder is a **curated, public library** of ready-to-load items (workcells, protocols, variables, scripts, labware, forms, etc.).

The UI can browse this folder and let users **Load into setup** or **Download JSON** without requiring any uploads.

## Structure

Each library item is a folder containing:

- `meta.json`: item metadata (type/name/tags/etc.)
- `payload.json`: the JSON payload that will be loaded (same shape as Hub items)

Recommended layout:

```
hub-library/
  workcells/
    my-workcell/
      meta.json
      payload.json
  protocols/
    my-protocol/
      meta.json
      payload.json
  variables/
    my-variables/
      meta.json
      payload.json
  ...
```

## `meta.json` schema

Example:

```json
{
  "type": "variables",
  "name": "Example Variables",
  "description": "A small starter set of variables.",
  "tags": ["example", "starter"],
  "payload": "payload.json"
}
```

Notes:

- `type` must be one of: `workcells`, `protocols`, `variables`, `scripts`, `labware`, `forms`, `inventory`
- `payload` is optional (defaults to `payload.json`)

## Adding items

Add a new folder + `meta.json` + `payload.json` in a PR. Keep payloads small when possible, and include tags + description for discoverability.
