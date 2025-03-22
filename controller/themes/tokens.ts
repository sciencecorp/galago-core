/**
 * Design tokens for the Galago application
 * This file contains all design tokens used throughout the application
 */

// Spacing tokens
export const spacing = {
  // Base spacing unit (4px)
  base: 4,

  // Spacing scale
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "2.5rem", // 40px
  "3xl": "3rem", // 48px

  // Component-specific spacing
  card: {
    padding: "1rem",
    gap: "0.75rem",
  },
  section: {
    margin: "2rem 0",
    padding: "1.5rem",
  },
  form: {
    gap: "1rem",
    fieldGap: "0.5rem",
  },
};

// Typography tokens
export const typography = {
  // Font families
  fonts: {
    body: "Inter, system-ui, sans-serif",
    heading: "Inter, system-ui, sans-serif",
    mono: "Menlo, monospace",
  },

  // Font sizes
  fontSizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    md: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },

  // Font weights
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeights: {
    normal: "normal",
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: 2,
  },

  // Letter spacings
  letterSpacings: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};

// Border tokens
export const borders = {
  // Border widths
  widths: {
    none: 0,
    thin: "1px",
    medium: "2px",
    thick: "4px",
  },

  // Border styles
  styles: {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
  },

  // Border radii
  radii: {
    none: "0",
    sm: "0.125rem", // 2px
    base: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    "3xl": "1.5rem", // 24px
    full: "9999px",
  },
};

// Shadow tokens
export const shadows = {
  // Box shadows
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  outline: "0 0 0 3px rgba(66, 153, 225, 0.6)",
  none: "none",

  // Dark mode shadows
  dark: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.26)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.26)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.25)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.24)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.26)",
    outline: "0 0 0 3px rgba(66, 153, 225, 0.8)",
  },
};

// Z-index tokens
export const zIndices = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Animation tokens
export const animation = {
  // Transition durations
  durations: {
    ultra_fast: "50ms",
    faster: "100ms",
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "400ms",
    ultra_slow: "500ms",
  },

  // Transition easings
  easings: {
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Keyframes
  keyframes: {
    spin: {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
    ping: {
      "0%": { transform: "scale(1)", opacity: 1 },
      "75%, 100%": { transform: "scale(2)", opacity: 0 },
    },
    pulse: {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.5 },
    },
    bounce: {
      "0%, 100%": {
        transform: "translateY(-25%)",
        animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
      },
      "50%": {
        transform: "translateY(0)",
        animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
      },
    },
  },
};

// Breakpoint tokens
export const breakpoints = {
  sm: "30em", // 480px
  md: "48em", // 768px
  lg: "62em", // 992px
  xl: "80em", // 1280px
  "2xl": "96em", // 1536px
};

// Export all tokens
export const tokens = {
  spacing,
  typography,
  borders,
  shadows,
  zIndices,
  animation,
  breakpoints,
};

export default tokens;
