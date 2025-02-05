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

// Chakra UI color palette (excluding grays)
const colorPalette = [
  // Blues
  "#4299E1",
  "#3182CE",
  "#2B6CB0",
  // Greens
  "#48BB78",
  "#38A169",
  "#2F855A",
  // Teals
  "#38B2AC",
  "#319795",
  "#2C7A7B",
  // Purples
  "#9F7AEA",
  "#805AD5",
  "#6B46C1",
  // Pinks
  "#ED64A6",
  "#D53F8C",
  "#B83280",
  // Oranges
  "#F6AD55",
  "#DD6B20",
  "#C05621",
  // Reds
  "#FC8181",
  "#E53E3E",
  "#C53030",
  // Yellows
  "#F6E05E",
  "#ECC94B",
  "#D69E2E",
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
