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
  toolId: number | null;
}

interface RobotArmLocation {
  id: number;
  name: string;
  coordinates: string;
}

interface Tool {
  id: number;
  name: string;
  type: string;
  imageUrl: string | null;
}

interface NestWithTeachpoint {
  nest: Nest;
  location: RobotArmLocation | null;
  tool: Tool | null;
}

interface SpatialViewProps {
  teachPoints: RobotArmLocation[];
  nestsWithTeachpoints: NestWithTeachpoint[];
  onSelectPoint: (point: RobotArmLocation) => void;
  selectedPoint: RobotArmLocation | null;
}

const CELL_SIZE = 80; // Increased for better image visibility
const CLUSTER_PADDING = 120; // Space between tool clusters
const CENTER_SIZE = 100; // Size for PF400 robot at center
const GRID_STROKE = "#E2E8F0";

export const SpatialView: React.FC<SpatialViewProps> = ({
  nestsWithTeachpoints,
  onSelectPoint,
  selectedPoint,
}) => {
  const { cardBg, borderColor } = useCommonColors();
  const { primary, secondary } = useTextColors();
  // Fixed tooltip colors for better contrast in both modes
  const tooltipBg = useColorModeValue("gray.100", "gray.700");
  const tooltipColor = useColorModeValue("gray.800", "white");

  // Group nests by tool and calculate cluster positions
  const { toolClusters, pf400Tool, gridWidth, gridHeight } = useMemo<{
    toolClusters: Map<number, NestWithTeachpoint[]>;
    pf400Tool: Tool | null;
    gridWidth: number;
    gridHeight: number;
  }>(() => {
    if (nestsWithTeachpoints.length === 0) {
      return {
        toolClusters: new Map<number, NestWithTeachpoint[]>(),
        pf400Tool: null,
        gridWidth: 400,
        gridHeight: 400,
      };
    }

    // Group nests by tool
    const clusterMap = new Map<number, NestWithTeachpoint[]>();
    let pf400: Tool | null = null;

    nestsWithTeachpoints.forEach((item) => {
      if (item.tool?.type === "PF400") {
        pf400 = item.tool;
      }

      const toolId = item.nest.toolId || 0; // Use 0 for nests without tools (shouldn't happen)
      if (!clusterMap.has(toolId)) {
        clusterMap.set(toolId, []);
      }
      clusterMap.get(toolId)!.push(item);
    });

    // Calculate grid dimensions for radial layout
    const radius = CLUSTER_PADDING * 2;
    const width = radius * 2 + CENTER_SIZE * 2 + CELL_SIZE * 4;
    const height = radius * 2 + CENTER_SIZE * 2 + CELL_SIZE * 4;

    return {
      toolClusters: clusterMap,
      pf400Tool: pf400,
      gridWidth: width,
      gridHeight: height,
    };
  }, [nestsWithTeachpoints]);

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

  // Helper function to calculate radial positions for tool clusters
  const getClusterPosition = (index: number, total: number) => {
    const centerX = gridWidth / 2;
    const centerY = gridHeight / 2;
    const radius = CLUSTER_PADDING * 2;
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // Group nests by type for legend
  const storageNests = nestsWithTeachpoints.filter(
    (n) => n.nest.nestType === "storage" && n.nest.robotAccessible,
  );
  const transferStations = nestsWithTeachpoints.filter(
    (n) => n.nest.nestType === "transfer_station",
  );
  const inferredNests = nestsWithTeachpoints.filter((n) => n.nest.referenceNestId !== null);

  return (
    <VStack spacing={6} align="stretch">
      {/* Legend */}
      <Box bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="lg" p={4}>
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
          <HStack spacing={2}>
            <Box
              width="16px"
              height="16px"
              bg="purple.400"
              borderRadius="full"
              borderWidth="1px"
              borderColor="gray.400"
            />
            <Text fontSize="sm">PF400 Robot Arm</Text>
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
        overflowX="auto">
        <Heading size="sm" mb={4}>
          Top-Down View - Robot Workspace Layout
        </Heading>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="600px">
          <svg
            width={gridWidth}
            height={gridHeight}
            style={{ border: `1px solid ${GRID_STROKE}`, borderRadius: "4px" }}>
            {/* Background */}
            <rect width={gridWidth} height={gridHeight} fill={cardBg} />

            {/* PF400 Robot Arm at center */}
            {pf400Tool && (
              <g>
                <circle
                  cx={gridWidth / 2}
                  cy={gridHeight / 2}
                  r={CENTER_SIZE / 2}
                  fill="#9F7AEA"
                  opacity={0.3}
                  stroke="#805AD5"
                  strokeWidth={2}
                />
                {pf400Tool.imageUrl ? (
                  <image
                    href={pf400Tool.imageUrl}
                    x={gridWidth / 2 - CENTER_SIZE / 3}
                    y={gridHeight / 2 - CENTER_SIZE / 3}
                    width={CENTER_SIZE / 1.5}
                    height={CENTER_SIZE / 1.5}
                    preserveAspectRatio="xMidYMid meet"
                  />
                ) : (
                  <text
                    x={gridWidth / 2}
                    y={gridHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fill="#805AD5"
                    fontWeight="bold">
                    PF400
                  </text>
                )}
                <text
                  x={gridWidth / 2}
                  y={gridHeight / 2 + CENTER_SIZE / 2 + 15}
                  textAnchor="middle"
                  fontSize="12"
                  fill={primary}
                  fontWeight="600">
                  {pf400Tool.name}
                </text>
              </g>
            )}

            {/* Render tool clusters in radial layout */}
            {Array.from(toolClusters.entries()).map(([toolId, nests], clusterIndex) => {
              const tool = nests[0]?.tool;
              if (!tool || tool.type === "PF400") return null; // Skip PF400 (already rendered at center)

              const clusterPos = getClusterPosition(clusterIndex, toolClusters.size);

              // Calculate local grid for this cluster based on nest positions
              const clusterNestRows = nests.map((n) => n.nest.row);
              const clusterNestCols = nests.map((n) => n.nest.column);
              const minRow = Math.min(...clusterNestRows);
              const maxRow = Math.max(...clusterNestRows);
              const minCol = Math.min(...clusterNestCols);
              const maxCol = Math.max(...clusterNestCols);

              const clusterWidth = (maxCol - minCol + 1) * CELL_SIZE;
              const clusterHeight = (maxRow - minRow + 1) * CELL_SIZE;
              const toolImageSize = 60;

              return (
                <g key={`cluster-${toolId}`}>
                  {/* Cluster background */}
                  <rect
                    x={clusterPos.x - clusterWidth / 2 - 10}
                    y={clusterPos.y - clusterHeight / 2 - 30}
                    width={clusterWidth + 20}
                    height={clusterHeight + 50}
                    fill={borderColor}
                    opacity={0.1}
                    stroke={borderColor}
                    strokeWidth={1}
                    rx={8}
                  />

                  {/* Tool image positioned to the left of nests */}
                  {tool.imageUrl && (
                    <image
                      href={tool.imageUrl}
                      x={clusterPos.x - clusterWidth / 2 - toolImageSize - 20}
                      y={clusterPos.y - toolImageSize / 2}
                      width={toolImageSize}
                      height={toolImageSize}
                      preserveAspectRatio="xMidYMid meet"
                      opacity={0.8}
                    />
                  )}

                  {/* Cluster label */}
                  <text
                    x={clusterPos.x}
                    y={clusterPos.y - clusterHeight / 2 - 15}
                    textAnchor="middle"
                    fontSize="12"
                    fill={primary}
                    fontWeight="600">
                    {tool.name}
                  </text>

                  {/* Render nests in cluster */}
                  {nests.map((nestWithTeachpoint) => {
                    const nest = nestWithTeachpoint.nest;
                    const relativeRow = nest.row - minRow;
                    const relativeCol = nest.column - minCol;

                    const x = clusterPos.x - clusterWidth / 2 + relativeCol * CELL_SIZE;
                    const y = clusterPos.y - clusterHeight / 2 + relativeRow * CELL_SIZE;
                    const isSelected = selectedPoint?.id === nestWithTeachpoint.location?.id;

                    return (
                      <Tooltip
                        key={`nest-${nest.id}`}
                        bg={tooltipBg}
                        color={tooltipColor}
                        placement="top"
                        closeOnClick={true}
                        label={
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{nest.name || `Nest ${nest.id}`}</Text>
                            <Text fontSize="xs">Tool: {tool.name}</Text>
                            <Text fontSize="xs">
                              Row: {nest.row}, Col: {nest.column}
                            </Text>
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
                        }>
                        <g
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNestClick(nestWithTeachpoint);
                          }}
                          style={{ cursor: "pointer" }}>
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

                          {/* Icon for nest type */}
                          {nest.nestType === "transfer_station" ? (
                            <circle
                              cx={x + CELL_SIZE / 2}
                              cy={y + CELL_SIZE / 2}
                              r={10}
                              fill="white"
                              opacity={0.9}
                            />
                          ) : (
                            <rect
                              x={x + CELL_SIZE / 2 - 8}
                              y={y + CELL_SIZE / 2 - 8}
                              width={16}
                              height={16}
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

                          {/* Nest label */}
                          <text
                            x={x + CELL_SIZE / 2}
                            y={y + CELL_SIZE + 12}
                            textAnchor="middle"
                            fontSize="9"
                            fill={primary}
                            fontWeight="500">
                            {nest.name?.substring(0, 10) || `N${nest.id}`}
                          </text>
                        </g>
                      </Tooltip>
                    );
                  })}

                  {/* Line connecting cluster to center (PF400) */}
                  <line
                    x1={gridWidth / 2}
                    y1={gridHeight / 2}
                    x2={clusterPos.x}
                    y2={clusterPos.y}
                    stroke={borderColor}
                    strokeWidth={1}
                    strokeDasharray="5,5"
                    opacity={0.3}
                  />
                </g>
              );
            })}
          </svg>
        </Box>
      </Box>

      {/* Selected Point Info */}
      {selectedPoint && (
        <Box bg={cardBg} borderColor="blue.400" borderWidth="2px" borderRadius="lg" p={4}>
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
              Switch to the &quot;Teach Points&quot; tab to edit this position
            </Text>
          </VStack>
        </Box>
      )}
    </VStack>
  );
};
