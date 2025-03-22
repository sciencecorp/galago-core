# Design Tokens Migration Guide

This guide explains how to migrate from hardcoded values to our new centralized design token system.

## Overview

We've created a centralized design token system in `themes/tokens.ts` that provides:

1. Spacing tokens for consistent layout
2. Typography tokens for fonts, sizes, weights, etc.
3. Border tokens for widths, styles, and radii
4. Shadow tokens for consistent elevation
5. Z-index tokens for layering
6. Animation tokens for transitions and keyframes
7. Breakpoint tokens for responsive design

## How to Migrate

### Step 1: Import the design tokens

```tsx
// Import the tokens
import tokens from "../../themes/tokens";

// Or import specific token categories
import { spacing, typography, borders, shadows } from "../../themes/tokens";
```

### Step 2: Replace hardcoded values

#### Replace spacing values

Before:

```tsx
const styles = {
  container: {
    padding: "16px",
    margin: "24px 0",
    gap: "8px",
  },
};
```

After:

```tsx
const styles = {
  container: {
    padding: tokens.spacing.md,
    margin: `${tokens.spacing.lg} 0`,
    gap: tokens.spacing.sm,
  },
};
```

#### Replace typography values

Before:

```tsx
const styles = {
  heading: {
    fontFamily: "Inter, sans-serif",
    fontSize: "24px",
    fontWeight: 600,
    lineHeight: 1.5,
  },
};
```

After:

```tsx
const styles = {
  heading: {
    fontFamily: tokens.typography.fonts.heading,
    fontSize: tokens.typography.fontSizes["2xl"],
    fontWeight: tokens.typography.fontWeights.semibold,
    lineHeight: tokens.typography.lineHeights.base,
  },
};
```

#### Replace border values

Before:

```tsx
const styles = {
  card: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "8px",
  },
};
```

After:

```tsx
const styles = {
  card: {
    borderWidth: tokens.borders.widths.thin,
    borderStyle: tokens.borders.styles.solid,
    borderRadius: tokens.borders.radii.lg,
  },
};
```

#### Replace shadow values

Before:

```tsx
const styles = {
  card: {
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
};
```

After:

```tsx
const styles = {
  card: {
    boxShadow: tokens.shadows.md,
  },
};
```

#### Replace animation values

Before:

```tsx
const styles = {
  button: {
    transition: "all 200ms ease-in-out",
  },
};
```

After:

```tsx
const styles = {
  button: {
    transition: `all ${tokens.animation.durations.normal} ${tokens.animation.easings.easeInOut}`,
  },
};
```

### Step 3: Use with Chakra UI

Chakra UI components automatically use our design tokens through the theme:

```tsx
// These components will use our design tokens
<Box padding="md" margin="lg" borderRadius="md">
  <Heading fontSize="2xl" fontWeight="semibold">
    Title
  </Heading>
  <Text fontSize="md">Content</Text>
</Box>
```

## Design Token Structure

### Spacing Tokens

```tsx
// Base spacing unit (4px)
tokens.spacing.base; // 4

// Spacing scale
tokens.spacing.xs; // "0.25rem" (4px)
tokens.spacing.sm; // "0.5rem" (8px)
tokens.spacing.md; // "1rem" (16px)
tokens.spacing.lg; // "1.5rem" (24px)
tokens.spacing.xl; // "2rem" (32px)
tokens.spacing["2xl"]; // "2.5rem" (40px)
tokens.spacing["3xl"]; // "3rem" (48px)

// Component-specific spacing
tokens.spacing.card.padding; // "1rem"
tokens.spacing.card.gap; // "0.75rem"
tokens.spacing.section.margin; // "2rem 0"
tokens.spacing.section.padding; // "1.5rem"
tokens.spacing.form.gap; // "1rem"
tokens.spacing.form.fieldGap; // "0.5rem"
```

### Typography Tokens

```tsx
// Font families
tokens.typography.fonts.body; // "Inter, system-ui, sans-serif"
tokens.typography.fonts.heading; // "Inter, system-ui, sans-serif"
tokens.typography.fonts.mono; // "Menlo, monospace"

// Font sizes
tokens.typography.fontSizes.xs; // "0.75rem" (12px)
tokens.typography.fontSizes.sm; // "0.875rem" (14px)
tokens.typography.fontSizes.md; // "1rem" (16px)
tokens.typography.fontSizes.lg; // "1.125rem" (18px)
tokens.typography.fontSizes.xl; // "1.25rem" (20px)
tokens.typography.fontSizes["2xl"]; // "1.5rem" (24px)
tokens.typography.fontSizes["3xl"]; // "1.875rem" (30px)

// Font weights
tokens.typography.fontWeights.normal; // 400
tokens.typography.fontWeights.medium; // 500
tokens.typography.fontWeights.semibold; // 600
tokens.typography.fontWeights.bold; // 700

// Line heights
tokens.typography.lineHeights.normal; // "normal"
tokens.typography.lineHeights.none; // 1
tokens.typography.lineHeights.shorter; // 1.25
tokens.typography.lineHeights.base; // 1.5
```

### Border Tokens

```tsx
// Border widths
tokens.borders.widths.none; // 0
tokens.borders.widths.thin; // "1px"
tokens.borders.widths.medium; // "2px"
tokens.borders.widths.thick; // "4px"

// Border styles
tokens.borders.styles.solid; // "solid"
tokens.borders.styles.dashed; // "dashed"
tokens.borders.styles.dotted; // "dotted"

// Border radii
tokens.borders.radii.none; // "0"
tokens.borders.radii.sm; // "0.125rem" (2px)
tokens.borders.radii.base; // "0.25rem" (4px)
tokens.borders.radii.md; // "0.375rem" (6px)
tokens.borders.radii.lg; // "0.5rem" (8px)
tokens.borders.radii.xl; // "0.75rem" (12px)
tokens.borders.radii["2xl"]; // "1rem" (16px)
tokens.borders.radii.full; // "9999px"
```

### Shadow Tokens

```tsx
// Box shadows
tokens.shadows.sm; // "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
tokens.shadows.base; // "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
tokens.shadows.md; // "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
tokens.shadows.lg; // "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
tokens.shadows.xl; // "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
tokens.shadows["2xl"]; // "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
tokens.shadows.inner; // "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)"
tokens.shadows.outline; // "0 0 0 3px rgba(66, 153, 225, 0.6)"
tokens.shadows.none; // "none"

// Dark mode shadows
tokens.shadows.dark.md; // "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.26)"
```

### Animation Tokens

```tsx
// Transition durations
tokens.animation.durations.ultra_fast; // "50ms"
tokens.animation.durations.faster; // "100ms"
tokens.animation.durations.fast; // "150ms"
tokens.animation.durations.normal; // "200ms"
tokens.animation.durations.slow; // "300ms"
tokens.animation.durations.slower; // "400ms"
tokens.animation.durations.ultra_slow; // "500ms"

// Transition easings
tokens.animation.easings.easeIn; // "cubic-bezier(0.4, 0, 1, 1)"
tokens.animation.easings.easeOut; // "cubic-bezier(0, 0, 0.2, 1)"
tokens.animation.easings.easeInOut; // "cubic-bezier(0.4, 0, 0.2, 1)"

// Keyframes
tokens.animation.keyframes.spin;
tokens.animation.keyframes.ping;
tokens.animation.keyframes.pulse;
tokens.animation.keyframes.bounce;
```

### Z-Index Tokens

```tsx
tokens.zIndices.hide; // -1
tokens.zIndices.auto; // "auto"
tokens.zIndices.base; // 0
tokens.zIndices.docked; // 10
tokens.zIndices.dropdown; // 1000
tokens.zIndices.sticky; // 1100
tokens.zIndices.banner; // 1200
tokens.zIndices.overlay; // 1300
tokens.zIndices.modal; // 1400
tokens.zIndices.popover; // 1500
tokens.zIndices.toast; // 1700
tokens.zIndices.tooltip; // 1800
```

### Breakpoint Tokens

```tsx
tokens.breakpoints.sm; // "30em" (480px)
tokens.breakpoints.md; // "48em" (768px)
tokens.breakpoints.lg; // "62em" (992px)
tokens.breakpoints.xl; // "80em" (1280px)
tokens.breakpoints["2xl"]; // "96em" (1536px)
```

## Adding New Tokens

If you need to add a new token:

1. Add it to the appropriate section in `themes/tokens.ts`
2. Update the TypeScript types if necessary
3. Consider if it should be added to the Chakra UI theme in `themes/customTheme.ts`

## Best Practices

1. Always use design tokens instead of hardcoded values
2. Use the appropriate token category for your use case
3. Combine with semantic color tokens for a complete design system
4. Use Chakra UI's theme props when possible

## Questions?

If you have questions about the design token system, please contact the UI team.
