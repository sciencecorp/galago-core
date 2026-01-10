import React from "react";
import { Grid, Box, Tooltip, VStack, useColorModeValue } from "@chakra-ui/react";

interface PlateGridProps {
  plateType: string;
  wells: any[];
  selectedWells?: number[];
  onWellClick?: (wellId: number) => void;
  getWellContent?: (wellId: number) => React.ReactNode;
  getWellTooltip?: (wellId: number) => string;
  wellStyles?: {
    size?: number;
    shape?: "circle" | "square";
    spacing?: number;
    selectedColor?: string;
    defaultColor?: string;
    hoverColor?: string;
  };
}

const getPlateLayout = (plateType: string): { rows: number; cols: number } => {
  const type = plateType.toLowerCase();
  switch (type) {
    case "6-well":
    case "6 well":
    case "6_well":
      return { rows: 2, cols: 3 };
    case "24-well":
    case "24 well":
    case "24_well":
      return { rows: 4, cols: 6 };
    case "96-well":
    case "96 well":
    case "96_well":
      return { rows: 8, cols: 12 };
    case "384-well":
    case "384 well":
    case "384_well":
      return { rows: 16, cols: 24 };
    default:
      console.warn(`Unknown plate type: ${plateType}, defaulting to 96 well`);
      return { rows: 8, cols: 12 }; // Default to 96 well
  }
};

const defaultWellStyles = {
  size: 40,
  shape: "circle" as const,
  spacing: 2,
  selectedColor: "blue.200",
  defaultColor: "gray.100",
  hoverColor: "blue.100",
};

export const PlateGrid: React.FC<PlateGridProps> = ({
  plateType,
  wells,
  selectedWells = [],
  onWellClick,
  getWellContent: _getWellContent,
  getWellTooltip,
  wellStyles = {},
}) => {
  const { rows, cols } = getPlateLayout(plateType);
  const styles = { ...defaultWellStyles, ...wellStyles };
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const is384Well = plateType.includes("384");
  const wellSize = is384Well ? 20 : styles.size;
  const spacing = styles.spacing;

  // Calculate the exact width and height of the plate
  const totalWidth = cols * wellSize + cols * 3.9 * spacing;
  const totalHeight = rows * wellSize + rows * 3.9 * spacing;

  // Create a 2D array to hold wells organized by position
  const wellGrid = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  wells.forEach((well) => {
    const rowIndex = typeof well.row === "string" ? well.row.charCodeAt(0) - 65 : well.row;

    const colIndex = typeof well.column === "number" ? well.column - 1 : well.column;

    if (rowIndex >= 0 && rowIndex < rows && colIndex >= 0 && colIndex < cols) {
      wellGrid[rowIndex][colIndex] = well;
    }
  });

  const renderWell = (well: any | null, rowIndex: number, colIndex: number) => {
    if (!well)
      return (
        <Box
          key={`empty-${rowIndex}-${colIndex}`}
          w={`${wellSize}px`}
          h={`${wellSize}px`}
          bg="transparent"
          border="1px solid"
          borderColor={borderColor}
          borderRadius={styles.shape === "circle" ? "full" : "md"}
        />
      );

    const isSelected = selectedWells.includes(well.id);
    const tooltipLabel = getWellTooltip ? getWellTooltip(well.id) : "";
    const hasReagent = tooltipLabel && tooltipLabel !== "Empty";

    return (
      <Tooltip key={well.id} label={tooltipLabel}>
        <Box
          bg={isSelected ? styles.selectedColor : hasReagent ? "green.200" : "transparent"}
          border="1px solid"
          borderColor={isSelected ? "blue.400" : borderColor}
          borderRadius={styles.shape === "circle" ? "full" : "md"}
          cursor="pointer"
          onClick={() => onWellClick?.(well.id)}
          w={`${wellSize}px`}
          h={`${wellSize}px`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          _hover={{
            bg: isSelected ? styles.selectedColor : hasReagent ? "green.300" : styles.hoverColor,
          }}
          transition="all 0.2s"
        />
      </Tooltip>
    );
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box
        border="2px solid"
        borderColor={borderColor}
        borderRadius="md"
        p={2}
        width={`${totalWidth + 16}px`} // Add 16px for padding (8px on each side)
        height={`${totalHeight + 16}px`}>
        <Grid templateColumns={`repeat(${cols}, ${wellSize}px)`} gap={spacing} w="fit-content">
          {Array.from({ length: rows }).map((_, rowIndex) =>
            Array.from({ length: cols }).map((_, colIndex) => {
              const well = wellGrid[rowIndex][colIndex];
              return renderWell(well, rowIndex, colIndex);
            }),
          )}
        </Grid>
      </Box>
    </VStack>
  );
};
