# Color System Migration Guide

This guide explains how to migrate from hardcoded colors to our new centralized color system.

## Overview

We've created a centralized color system in `themes/colors.ts` that provides:

1. A base color palette with all color values
2. Semantic color tokens for different UI elements
3. Helper functions for specific use cases
4. TypeScript type definitions

## How to Migrate

### Step 1: Import the color system

```tsx
// Import the color system
import { palette, semantic } from "../../themes/colors";
```

### Step 2: Replace hardcoded colors

#### Replace hex codes with palette references

Before:

```tsx
const styles = {
  header: {
    backgroundColor: "#fff",
    color: "#292b2c",
  },
};
```

After:

```tsx
const styles = {
  header: {
    backgroundColor: palette.white,
    color: palette.custom.navText,
  },
};
```

#### Replace Chakra color strings with semantic references

Before:

```tsx
const bgColor = useColorModeValue("white", "gray.800");
const textColor = useColorModeValue("gray.800", "white");
```

After:

```tsx
const bgColor = useColorModeValue(
  semantic.background.primary.light,
  semantic.background.secondary.dark,
);
const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
```

### Step 3: Use helper functions for specific cases

For tool status colors:

```tsx
import { getToolStatusColor } from "../../themes/colors";

const statusColor = getToolStatusColor(tool.status);
```

For instrument colors:

```tsx
import { getColorForInstrument } from "../../themes/colors";

const instrumentColor = getColorForInstrument(instrument.type);
```

For run type colors:

```tsx
import { getColorForRunType } from "../../themes/colors";

const runTypeColor = getColorForRunType(run.type);
```

## Color System Structure

### Base Palette

The `palette` object contains all raw color values:

```tsx
palette.white; // "#FFFFFF"
palette.black; // "#000000"
palette.gray[500]; // "#718096"
palette.blue[500]; // "#3182CE"
palette.green[500]; // "#38A169"
palette.red[500]; // "#E53E3E"
palette.yellow[500]; // "#D69E2E"
palette.orange[500]; // "#DD6B20"
palette.purple[500]; // "#805AD5"
palette.teal[500]; // "#319795"
```

Custom colors are available in `palette.custom`:

```tsx
palette.custom.lightBlue; // "#CEE0F0"
palette.custom.consoleDark; // "#222324"
palette.custom.warningYellow; // "#FFC107"
palette.custom.warningText; // "#212529"
palette.custom.navText; // "#292B2C"
```

### Semantic Colors

The `semantic` object provides color tokens based on their usage:

```tsx
// Text colors
semantic.text.primary.light; // Light mode primary text color
semantic.text.primary.dark; // Dark mode primary text color
semantic.text.secondary.light; // Light mode secondary text color
semantic.text.accent.light; // Light mode accent text color

// Background colors
semantic.background.primary.light; // Light mode primary background
semantic.background.card.light; // Light mode card background
semantic.background.hover.light; // Light mode hover background

// Border colors
semantic.border.primary.light; // Light mode primary border color
semantic.border.focus.light; // Light mode focus border color

// Status colors
semantic.status.success.light; // Light mode success color
semantic.status.error.light; // Light mode error color
semantic.status.warning.light; // Light mode warning color
```

## Complex Color Schemes

For components with complex color schemes like gradients, follow this pattern:

```tsx
// Before
const gradient = `linear-gradient(
  to bottom right,
  #16abff33 0deg,
  #0885ff33 55deg,
  #54d6ff33 120deg,
  #0071ff33 160deg
)`;

// After
const gradient = `linear-gradient(
  to bottom right,
  ${palette.custom.gradientBlue1} 0deg,
  ${palette.custom.gradientBlue2} 55deg,
  ${palette.custom.gradientBlue3} 120deg,
  ${palette.custom.gradientBlue4} 160deg
)`;
```

## Adding New Colors

If you need to add a new color:

1. Add it to the appropriate section in `palette` (preferably in `palette.custom`)
2. Add semantic references if needed
3. Update the TypeScript types if necessary

## Questions?

If you have questions about the color system, please contact the UI team.
