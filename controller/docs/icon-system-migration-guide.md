# Icon System Migration Guide

This guide explains how to migrate from directly imported icons to our new centralized icon system.

## Overview

We've created a centralized icon system in `components/ui/Icons.tsx` that provides:

1. Categorized icon groups for different use cases
2. Individual icon exports with consistent naming
3. Custom icon components like WellPlateIcon
4. TypeScript type definitions

## How to Migrate

### Step 1: Import from the centralized icon system

```tsx
// Before - importing directly from libraries
import { SearchIcon } from "@chakra-ui/icons";
import { FaPlay } from "react-icons/fa";

// After - importing from our centralized system
import { SearchIcon, PlayIcon } from "../../components/ui/Icons";
// OR use categorized imports
import { SearchIcons, ActionIcons } from "../../components/ui/Icons";
```

### Step 2: Use the imported icons

#### Using individual icons

Before:

```tsx
<SearchIcon color="gray.300" />
<FaPlay />
```

After:

```tsx
<SearchIcon color={semantic.text.secondary.light} />
<PlayIcon />
```

#### Using categorized icon groups

```tsx
<Icon as={ActionIcons.Play} />
<Icon as={SearchIcons.Search} />
```

### Step 3: Use the Icon component for consistent styling

```tsx
import { Icon } from "../../components/ui/Icons";

// With individual icon
<Icon as={PlayIcon} color={semantic.status.success.light} boxSize={5} />

// With categorized icon
<Icon as={ActionIcons.Play} color={semantic.status.success.light} boxSize={5} />
```

## Icon System Structure

### Categorized Icon Groups

The icon system organizes icons into logical categories:

```tsx
// Script-related icons
ScriptIcons.Python;
ScriptIcons.Code;
ScriptIcons.Play;
ScriptIcons.Save;

// Folder-related icons
FolderIcons.Folder;
FolderIcons.FolderOpen;
FolderIcons.FolderAdd;

// Action icons
ActionIcons.Edit;
ActionIcons.Delete;
ActionIcons.Menu;
ActionIcons.Add;
ActionIcons.Play;
ActionIcons.Pause;
ActionIcons.Stop;

// Navigation icons
NavigationIcons.ArrowLeft;
NavigationIcons.ArrowRight;
NavigationIcons.ChevronUp;
NavigationIcons.ChevronDown;

// Status icons
StatusIcons.Warning;
StatusIcons.Info;
StatusIcons.Question;

// Theme icons
ThemeIcons.Moon;
ThemeIcons.Sun;

// Search icons
SearchIcons.Search;
SearchIcons.Search2;

// Tool icons
ToolIcons.Tools;
ToolIcons.Toolbox;
ToolIcons.Robot;

// Section icons
SectionIcons.Labware;
SectionIcons.Inventory;
SectionIcons.Protocol;
SectionIcons.Workcell;
SectionIcons.Variables;
SectionIcons.Logs;

// Run icons
RunIcons.PlaySkipForward;
RunIcons.SkipForward;
RunIcons.RunBelow;

// Inventory icons
InventoryIcons.Grid;
InventoryIcons.Flask;
InventoryIcons.Location;

// TeachPendant icons
TeachPendantIcons.Record;
TeachPendantIcons.Replay;
TeachPendantIcons.ArrowRight;

// Form icons
FormIcons.Check;
FormIcons.Close;
FormIcons.Edit;
FormIcons.Add;
FormIcons.Delete;

// Variable icons
VariableIcons.String;
VariableIcons.Number;
VariableIcons.Boolean;
VariableIcons.Variable;

// Sidebar icons
SidebarIcons.Sidebar;
SidebarIcons.Transit;
SidebarIcons.Calendar;

// Time icons
TimeIcons.Time;
TimeIcons.Clock;
```

### Individual Icon Exports

All icons are also exported individually with consistent naming:

```tsx
// Chakra UI icons
SearchIcon;
AddIcon;
CloseIcon;
CheckIcon;
ArrowLeftIcon;
ChevronUpIcon;
WarningIcon;

// React Icons
PythonIcon;
CodeIcon;
PlayIcon;
SaveIcon;
FolderIcon;
EditIcon;
DeleteIcon;
MenuIcon;
FileAddIcon;
```

### Custom Icon Components

The icon system includes custom icon components:

```tsx
// WellPlateIcon for displaying well plates
<WellPlateIcon rows={8} columns={12} size="48px" />
```

## Adding New Icons

If you need to add a new icon:

1. Import the icon in `components/ui/Icons.tsx`
2. Add it to the appropriate category
3. Export it individually with a consistent naming convention
4. Update TypeScript types if necessary

## Best Practices

1. Always use the centralized icon system instead of direct imports
2. Use semantic color tokens with icons (e.g., `semantic.text.secondary.light` instead of `gray.300`)
3. Use the `Icon` component for consistent styling
4. Choose the appropriate icon category for your use case

## Questions?

If you have questions about the icon system, please contact the UI team.
