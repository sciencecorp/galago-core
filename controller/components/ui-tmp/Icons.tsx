import React from "react";
import { Box, SimpleGrid, Tooltip } from "@chakra-ui/react";

interface WellPlateIconProps {
  rows: number;
  columns: number;
  size?: string;
}

export const WellPlateIcon: React.FC<WellPlateIconProps> = ({ rows, columns, size = "48px" }) => {
  // Determine if this matches a standard plate format
  const getStandardFormat = (r: number, c: number): string => {
    if (r === 1 && c === 1) return "1-well";
    if (r === 2 && c === 3) return "6-well";
    if (r === 3 && c === 4) return "12-well";
    if (r === 4 && c === 6) return "24-well";
    if (r === 6 && c === 8) return "48-well";
    if (r === 8 && c === 12) return "96-well";
    if (r === 16 && c === 24) return "384-well";
    return "custom";
  };

  const format = getStandardFormat(rows, columns);

  // Add special case for 384-well plate
  const is384Well = rows === 16 && columns === 24;
  const is96Well = rows === 8 && columns === 12;
  const displayRows = is384Well ? 10 : is96Well ? 6 : rows; // Show only 10 rows for 384-well, 6 rows for 96-well
  const wellSize = "1px";
  const gridSpacing = is384Well ? "1px" : "2px";
  const boxPadding = is384Well ? "3px" : "4px";

  return (
    <Tooltip label={`${format} plate (${rows}×${columns})`} hasArrow placement="top">
      <Box
        width={size}
        height={`calc(${size} * 0.7)`}
        border="2px solid"
        borderColor="gray.400"
        _dark={{ borderColor: "gray.300" }}
        borderRadius="md"
        p={boxPadding}
        overflow="hidden"
        position="relative">
        <SimpleGrid
          columns={columns}
          spacing={gridSpacing}
          width="100%"
          height="100%"
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)">
          {Array.from({ length: displayRows * columns }).map((_, i) => (
            <Box
              key={i}
              border={`${wellSize} solid`}
              borderColor="gray.400"
              _dark={{ borderColor: "gray.300" }}
              bg="transparent"
              borderRadius={is384Well ? "2px" : "50%"}
              width="100%"
              paddingBottom="100%"
              position="relative"
            />
          ))}
        </SimpleGrid>
      </Box>
    </Tooltip>
  );
};
