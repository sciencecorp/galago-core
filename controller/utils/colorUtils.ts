import { ToolType } from "gen-interfaces/controller";
import { 
  getColorForRunType as getRunTypeColor,
  getColorForInstrument as getInstrumentColor,
  getToolColor as getToolColorFromPalette,
  colorPalette
} from "../themes/colors";

// Re-export the functions from the centralized color system
export const getColorForRunType = getRunTypeColor;
export const getColorForInstrument = getInstrumentColor;
export const getToolColor = getToolColorFromPalette;

// Re-export the color palette for backward compatibility
export { colorPalette };

// Hash function to generate a consistent index for a given string
// This is kept for backward compatibility
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};
