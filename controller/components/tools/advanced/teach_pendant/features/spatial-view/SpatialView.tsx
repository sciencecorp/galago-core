import React, { useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Heading,
  Flex,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";
import { Icon } from "@/components/ui/Icons";
import { Grid3x3, Layers } from "lucide-react";

interface Nest {
  id: number;
  name: string | null;
  row: number;
  column: number;
  robotAccessible: boolean | null;
  nestType: string | null;
  referenceNestId: number | null;
}

interface RobotArmLocation {
  id: number;
  name: string;
  coordinates: string;
}

interface NestWithTeachpoint {
  nest: Nest;
  location: RobotArmLocation | null;
}

interface SpatialViewProps {
  teachPoints: RobotArmLocation[];
  nestsWithTeachpoints: NestWithTeachpoint[];
  onSelectPoint: (point: RobotArmLocation) => void;
  selectedPoint: RobotArmLocation | null;
}

const CELL_SIZE = 60;
const GRID_PADDING = 40;
const GRID_STROKE = "#E2E8F0";

export const SpatialView: React.FC<SpatialViewProps> = ({
  nestsWithTeachpoints,
  onSelectPoint,
  selectedPoint,
}) => {
  const { cardBg, borderColor } = useCommonColors();
  const { primary, secondary } = useTextColors();
  const tooltipBg = useColorModeValue("gray.700", "gray.300");
  const tooltipColor = useColorModeValue("white", "gray.800");

  // Calculate grid dimensions based on nests
  const { minRow, maxRow, minCol, maxCol, nestsByPosition } = useMemo(() => {
    if (nestsWithTeachpoints.length === 0) {
      return {
        minRow: 0,
        maxRow: 0,
        minCol: 0,
        maxCol: 0,
        nestsByPosition: new Map(),
      };
    }

    const rows = nestsWithTeachpoints.map((n) => n.nest.row);
    const cols = nestsWithTeachpoints.map((n) => n.nest.column);

    const nestMap = new Map<string, NestWithTeachpoint>();
    nestsWithTeachpoints.forEach((n) => {
      nestMap.set(`${n.nest.row},${n.nest.column}`, n);
    });

    return {
      minRow: Math.min(...rows),
      maxRow: Math.max(...rows),
      minCol: Math.min(...cols),
      maxCol: Math.max(...cols),
      nestsByPosition: nestMap,
    };
  }, [nestsWithTeachpoints]);

  const gridWidth = (maxCol - minCol + 1) * CELL_SIZE + GRID_PADDING * 2;
  const gridHeight = (maxRow - minRow + 1) * CELL_SIZE + GRID_PADDING * 2;

  const getNestColor = (nest: Nest): string => {
    if (nest.nestType === "transfer_station") return "#DD6B20"; // Orange
    if (nest.robotAccessible) return "#38A169"; // Green
    return "#A0AEC0"; // Gray
  };

  const handleNestClick = (nestWithTeachpoint: NestWithTeachpoint) => {
    if (nestWithTeachpoint.location) {
      onSelectPoint(nestWithTeachpoint.location);
    }
  };

  if (nestsWithTeachpoints.length === 0) {
    return (
      <VStack spacing={4} py={8}>
        <Icon as={Grid3x3} boxSize={12} color={secondary} />
        <Text color={secondary}>No robot-accessible nests found</Text>
        <Text fontSize="sm" color={secondary}>
          Mark nests as robot-accessible in the Inventory to see them here
        </Text>
      </VStack>
    );
  }

  // Group nests by type for legend
  const storageNests = nestsWithTeachpoints.filter(
    (n) => n.nest.nestType === "storage" && n.nest.robotAccessible
  );
  const transferStations = nestsWithTeachpoints.filter(
    (n) => n.nest.nestType === "transfer_station"
  );
  const inferredNests = nestsWithTeachpoints.filter(
    (n) => n.nest.referenceNestId !== null
  );

  return (
    <VStack spacing={6} align="stretch">
      {/* Legend */}
      <Box
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        borderRadius="lg"
        p={4}
      >
        <Heading size="sm" mb={3}>
          Legend
        </Heading>
        <Flex wrap="wrap" gap={4}>
          <HStack spacing={2}>
            <Box
              width="16px"
              height="16px"
              bg="#38A169"
              borderRadius="sm"
              borderWidth="1px"
              borderColor="gray.400"
            />
            <Text fontSize="sm">Robot Accessible ({storageNests.length})</Text>
          </HStack>
          <HStack spacing={2}>
            <Box
              width="16px"
              height="16px"
              bg="#DD6B20"
              borderRadius="sm"
              borderWidth="1px"
              borderColor="gray.400"
            />
            <Text fontSize="sm">Transfer Station ({transferStations.length})</Text>
          </HStack>
          <HStack spacing={2}>
            <Badge colorScheme="blue" fontSize="xs">
              Inf
            </Badge>
            <Text fontSize="sm">Inferred Position ({inferredNests.length})</Text>
          </HStack>
          <HStack spacing={2}>
            <Box
              width="16px"
              height="16px"
              bg="blue.400"
              borderRadius="sm"
              borderWidth="2px"
              borderColor="blue.600"
            />
            <Text fontSize="sm">Selected</Text>
          </HStack>
        </Flex>
      </Box>

      {/* Spatial Visualization */}
      <Box
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        borderRadius="lg"
        p={4}
        overflowX="auto"
      >
        <Heading size="sm" mb={4}>
          Top-Down View
        </Heading>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <svg
            width={gridWidth}
            height={gridHeight}
            style={{ border: `1px solid ${GRID_STROKE}`, borderRadius: "4px" }}
          >
            {/* Grid background lines */}
            <defs>
              <pattern
                id="grid"
                width={CELL_SIZE}
                height={CELL_SIZE}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${CELL_SIZE} 0 L 0 0 0 ${CELL_SIZE}`}
                  fill="none"
                  stroke={GRID_STROKE}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect
              width={gridWidth}
              height={gridHeight}
              fill="url(#grid)"
              opacity="0.3"
            />

            {/* Render all grid positions with nests */}
            {Array.from({ length: maxRow - minRow + 1 }, (_, rowIdx) => {
              const row = minRow + rowIdx;
              return Array.from({ length: maxCol - minCol + 1 }, (_, colIdx) => {
                const col = minCol + colIdx;
                const key = `${row},${col}`;
                const nestWithTeachpoint = nestsByPosition.get(key);

                if (!nestWithTeachpoint) return null;

                const nest = nestWithTeachpoint.nest;
                const x = GRID_PADDING + (col - minCol) * CELL_SIZE;
                const y = GRID_PADDING + (row - minRow) * CELL_SIZE;
                const isSelected =
                  selectedPoint?.id === nestWithTeachpoint.location?.id;

                return (
                  <Tooltip
                    key={key}
                    bg={tooltipBg}
                    color={tooltipColor}
                    label={
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">
                          {nest.name || `Nest ${nest.id}`}
                        </Text>
                        <Text fontSize="xs">Row: {row}, Col: {col}</Text>
                        {nestWithTeachpoint.location && (
                          <Text fontSize="xs">
                            Coords: {nestWithTeachpoint.location.coordinates}
                          </Text>
                        )}
                        {nest.nestType === "transfer_station" && (
                          <Badge colorScheme="orange" size="sm">
                            Transfer
                          </Badge>
                        )}
                        {nest.referenceNestId && (
                          <Badge colorScheme="blue" size="sm">
                            Inferred
                          </Badge>
                        )}
                      </VStack>
                    }
                  >
                    <g
                      onClick={() => handleNestClick(nestWithTeachpoint)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Nest rectangle */}
                      <rect
                        x={x + 5}
                        y={y + 5}
                        width={CELL_SIZE - 10}
                        height={CELL_SIZE - 10}
                        fill={getNestColor(nest)}
                        stroke={isSelected ? "#3182CE" : "#2D3748"}
                        strokeWidth={isSelected ? 3 : 1}
                        opacity={0.8}
                        rx={4}
                      />

                      {/* Icon (simplified - using circle for now) */}
                      {nest.nestType === "transfer_station" ? (
                        <circle
                          cx={x + CELL_SIZE / 2}
                          cy={y + CELL_SIZE / 2}
                          r={8}
                          fill="white"
                          opacity={0.9}
                        />
                      ) : (
                        <rect
                          x={x + CELL_SIZE / 2 - 6}
                          y={y + CELL_SIZE / 2 - 6}
                          width={12}
                          height={12}
                          fill="white"
                          opacity={0.9}
                          rx={2}
                        />
                      )}

                      {/* Inferred badge indicator */}
                      {nest.referenceNestId && (
                        <circle
                          cx={x + CELL_SIZE - 12}
                          cy={y + 12}
                          r={6}
                          fill="#3182CE"
                          stroke="white"
                          strokeWidth={1}
                        />
                      )}

                      {/* Label */}
                      <text
                        x={x + CELL_SIZE / 2}
                        y={y + CELL_SIZE + 12}
                        textAnchor="middle"
                        fontSize="10"
                        fill={primary}
                        fontWeight="500"
                      >
                        {nest.name?.substring(0, 8) || `N${nest.id}`}
                      </text>
                    </g>
                  </Tooltip>
                );
              });
            })}
          </svg>
        </Box>
      </Box>

      {/* Selected Point Info */}
      {selectedPoint && (
        <Box
          bg={cardBg}
          borderColor="blue.400"
          borderWidth="2px"
          borderRadius="lg"
          p={4}
        >
          <VStack align="stretch" spacing={2}>
            <HStack>
              <Icon as={Layers} color="blue.500" />
              <Heading size="sm">Selected Teachpoint</Heading>
            </HStack>
            <Text>
              <strong>Name:</strong> {selectedPoint.name}
            </Text>
            <Text>
              <strong>Coordinates:</strong> {selectedPoint.coordinates}
            </Text>
            <Text fontSize="sm" color={secondary}>
              Switch to the "Teach Points" tab to edit this position
            </Text>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
