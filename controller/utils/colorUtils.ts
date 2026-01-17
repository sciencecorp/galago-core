import { ToolType } from "gen-interfaces/controller";

const runTypeColors: { [key: string]: string } = {
  default: "green",
  plate_transfer: "green",
  imaging: "green",
  incubation: "green",
  // Add more run types and their corresponding colors here
};

export function getColorForRunType(runType: string): string {
  return runTypeColors[runType] || runTypeColors.default;
}

const instrumentColors: { [key: string]: string } = {
  pf400: "purple.500",
  cytation: "purple.500",
  liconic: "purple.500",
  hamilton: "purple.500",
  ot2: "purple.500",
  bravo: "purple.500",
  vcode: "purple.500",
  toolbox: "purple.500",
  // Add more instruments and their corresponding colors here
};

export function getColorForInstrument(instrument: string): string {
  return instrumentColors[instrument.toLowerCase()] || "gray";
}

// Curated "interesting" palette (keeps good contrast with white text).
// Intentionally wide hue coverage; values are mostly deeper midtones.
const colorPalette = [
  // Blues / Indigos
  "#2563EB", // blue 600
  "#1D4ED8", // blue 700
  "#4F46E5", // indigo 600
  "#4338CA", // indigo 700
  "#7C3AED", // violet 600
  "#9333EA", // purple 600

  // Cyans / Teals
  "#0284C7", // sky 600
  "#0891B2", // cyan 600
  "#0D9488", // teal 600
  "#0F766E", // teal 700

  // Greens
  "#059669", // emerald 600
  "#16A34A", // green 600
  "#15803D", // green 700
  "#65A30D", // lime 600

  // Warm tones
  "#CA8A04", // yellow 600 (darker for contrast)
  "#D97706", // amber 600
  "#EA580C", // orange 600
  "#C2410C", // orange 700

  // Reds / Pinks
  "#DC2626", // red 600
  "#E11D48", // rose 600
  "#BE123C", // rose 700
  "#DB2777", // pink 600
  "#C026D3", // fuchsia 600
  "#A21CAF", // fuchsia 700
];

// Hash function to generate a consistent index for a given string
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export const getToolColor = (toolType: ToolType | string): string => {
  if (!toolType) return "#CBD5E0"; // Default gray

  // Special case for toolbox
  if (toolType.toLowerCase() === "toolbox") {
    return "#FC8181"; // Keep the original toolbox color
  }

  const index = hashString(toolType.toLowerCase()) % colorPalette.length;
  return colorPalette[index];
};
