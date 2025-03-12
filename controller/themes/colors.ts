/**
 * Centralized color system for the Galago application
 * This file contains all color definitions used throughout the application
 */

// Base color palette
export const palette = {
  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  
  // Grays
  gray: {
    50: "#F7FAFC",
    100: "#EDF2F7",
    200: "#E2E8F0",
    300: "#CBD5E0",
    400: "#A0AEC0",
    500: "#718096",
    600: "#4A5568",
    700: "#2D3748",
    800: "#1A202C",
    900: "#171923",
  },
  
  // Blues
  blue: {
    50: "#EBF8FF",
    100: "#BEE3F8",
    200: "#90CDF4",
    300: "#63B3ED",
    400: "#4299E1",
    500: "#3182CE",
    600: "#2B6CB0",
    700: "#2C5282",
    800: "#2A4365",
    900: "#1A365D",
  },
  
  // Greens
  green: {
    50: "#F0FFF4",
    100: "#C6F6D5",
    200: "#9AE6B4",
    300: "#68D391",
    400: "#48BB78",
    500: "#38A169",
    600: "#2F855A",
    700: "#276749",
    800: "#22543D",
    900: "#1C4532",
  },
  
  // Reds
  red: {
    50: "#FFF5F5",
    100: "#FED7D7",
    200: "#FEB2B2",
    300: "#FC8181",
    400: "#F56565",
    500: "#E53E3E",
    600: "#C53030",
    700: "#9B2C2C",
    800: "#822727",
    900: "#63171B",
  },
  
  // Yellows
  yellow: {
    50: "#FFFFF0",
    100: "#FEFCBF",
    200: "#FAF089",
    300: "#F6E05E",
    400: "#ECC94B",
    500: "#D69E2E",
    600: "#B7791F",
    700: "#975A16",
    800: "#744210",
    900: "#5F370E",
  },
  
  // Oranges
  orange: {
    50: "#FFFAF0",
    100: "#FEEBC8",
    200: "#FBD38D",
    300: "#F6AD55",
    400: "#ED8936",
    500: "#DD6B20",
    600: "#C05621",
    700: "#9C4221",
    800: "#7B341E",
    900: "#652B19",
  },
  
  // Purples
  purple: {
    50: "#FAF5FF",
    100: "#E9D8FD",
    200: "#D6BCFA",
    300: "#B794F4",
    400: "#9F7AEA",
    500: "#805AD5",
    600: "#6B46C1",
    700: "#553C9A",
    800: "#44337A",
    900: "#322659",
  },
  
  // Teals
  teal: {
    50: "#E6FFFA",
    100: "#B2F5EA",
    200: "#81E6D9",
    300: "#4FD1C5",
    400: "#38B2AC",
    500: "#319795",
    600: "#2C7A7B",
    700: "#285E61",
    800: "#234E52",
    900: "#1D4044",
  },
  
  // Custom colors
  custom: {
    // Custom blue used in HomeNavCard hover state
    lightBlue: "#CEE0F0",
    // Dark console background
    consoleDark: "#222324",
    // Warning banner background
    warningYellow: "#FFC107",
    // Warning banner text
    warningText: "#212529",
    // Nav text color
    navText: "#292B2C",
    // Gradient colors
    gradientBlue1: "#16ABFF33",
    gradientBlue2: "#0885FF33",
    gradientBlue3: "#54D6FF33",
    gradientBlue4: "#0071FF33",
    // Pattern colors
    patternBlue: "#7B8AC8",
  }
};

// Semantic color tokens
export const semantic = {
  // Text colors
  text: {
    primary: {
      light: palette.gray[800],
      dark: palette.white,
    },
    secondary: {
      light: palette.gray[600],
      dark: palette.gray[400],
    },
    accent: {
      light: palette.teal[600],
      dark: palette.teal[200],
    },
  },
  
  // Background colors
  background: {
    primary: {
      light: palette.white,
      dark: palette.gray[900],
    },
    secondary: {
      light: palette.gray[50],
      dark: palette.gray[800],
    },
    accent: {
      light: palette.teal[50],
      dark: palette.teal[900],
    },
    card: {
      light: palette.white,
      dark: palette.gray[700],
    },
    hover: {
      light: palette.gray[100],
      dark: palette.gray[600],
    },
  },
  
  // Border colors
  border: {
    primary: {
      light: palette.gray[200],
      dark: palette.gray[600],
    },
    secondary: {
      light: palette.gray[300],
      dark: palette.gray[500],
    },
    focus: {
      light: palette.blue[500],
      dark: palette.blue[400],
    },
  },
  
  // Status colors
  status: {
    success: {
      light: palette.green[500],
      dark: palette.green[400],
    },
    error: {
      light: palette.red[500],
      dark: palette.red[400],
    },
    warning: {
      light: palette.yellow[500],
      dark: palette.yellow[400],
    },
    info: {
      light: palette.blue[500],
      dark: palette.blue[400],
    },
    neutral: {
      light: palette.gray[500],
      dark: palette.gray[400],
    },
  },
  
  // Tool status colors
  toolStatus: {
    READY: palette.green[500],
    SIMULATED: palette.blue[500],
    BUSY: palette.yellow[500],
    FAILED: palette.red[500],
    OFFLINE: palette.gray[500],
    NOT_CONFIGURED: palette.yellow[500],
    INITIALIZING: palette.orange[500],
    UNKNOWN_STATUS: palette.gray[500],
    UNRECOGNIZED: palette.gray[500],
  },
  
  // Instrument colors
  instrument: {
    pf400: palette.purple[500],
    cytation: palette.purple[500],
    liconic: palette.purple[500],
    hamilton: palette.purple[500],
    ot2: palette.purple[500],
    bravo: palette.purple[500],
    vcode: palette.purple[500],
    toolbox: palette.red[300], // FC8181
    default: palette.gray[400], // CBD5E0
  },
  
  // Run type colors
  runType: {
    default: palette.green[500],
    plate_transfer: palette.green[500],
    imaging: palette.green[500],
    incubation: palette.green[500],
  },
};

// Helper functions
export const getColorForRunType = (runType: string): string => {
  return semantic.runType[runType as keyof typeof semantic.runType] || semantic.runType.default;
};

export const getColorForInstrument = (instrument: string): string => {
  const key = instrument.toLowerCase() as keyof typeof semantic.instrument;
  return semantic.instrument[key] || semantic.instrument.default;
};

export const getToolStatusColor = (status: string): string => {
  const key = status as keyof typeof semantic.toolStatus;
  return semantic.toolStatus[key] || semantic.toolStatus.UNRECOGNIZED;
};

// Re-export the color palette from colorUtils for backward compatibility
export const colorPalette = [
  // Blues
  palette.blue[400],
  palette.blue[500],
  palette.blue[600],
  // Greens
  palette.green[400],
  palette.green[500],
  palette.green[600],
  // Teals
  palette.teal[400],
  palette.teal[500],
  palette.teal[600],
  // Purples
  palette.purple[400],
  palette.purple[500],
  palette.purple[600],
  // Pinks
  palette.red[300],
  palette.red[500],
  palette.red[600],
  // Oranges
  palette.orange[300],
  palette.orange[500],
  palette.orange[600],
  // Reds
  palette.red[300],
  palette.red[500],
  palette.red[600],
  // Yellows
  palette.yellow[300],
  palette.yellow[400],
  palette.yellow[500],
];

// Hash function to generate a consistent index for a given string (from colorUtils.ts)
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export const getToolColor = (toolType: string): string => {
  if (!toolType) return palette.gray[300]; // Default gray
  
  // Special case for toolbox
  if (toolType.toLowerCase() === "toolbox") {
    return palette.red[300]; // Keep the original toolbox color
  }
  
  const index = hashString(toolType.toLowerCase()) % colorPalette.length;
  return colorPalette[index];
};

// Type definitions
export interface ColorPalette {
  white: string;
  black: string;
  gray: Record<number, string>;
  blue: Record<number, string>;
  green: Record<number, string>;
  red: Record<number, string>;
  yellow: Record<number, string>;
  orange: Record<number, string>;
  purple: Record<number, string>;
  teal: Record<number, string>;
  custom: Record<string, string>;
}

export interface SemanticColors {
  text: {
    primary: { light: string; dark: string };
    secondary: { light: string; dark: string };
    accent: { light: string; dark: string };
  };
  background: {
    primary: { light: string; dark: string };
    secondary: { light: string; dark: string };
    accent: { light: string; dark: string };
    card: { light: string; dark: string };
    hover: { light: string; dark: string };
  };
  border: {
    primary: { light: string; dark: string };
    secondary: { light: string; dark: string };
    focus: { light: string; dark: string };
  };
  status: {
    success: { light: string; dark: string };
    error: { light: string; dark: string };
    warning: { light: string; dark: string };
    info: { light: string; dark: string };
    neutral: { light: string; dark: string };
  };
  toolStatus: Record<string, any>;
  instrument: Record<string, string>;
  runType: Record<string, any>;
}

export type Colors = {
  palette: ColorPalette;
  semantic: SemanticColors;
}; 