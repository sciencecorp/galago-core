import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  VStack,
  useColorModeValue,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Select,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Tool } from "@/types/api";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "../../types";
import { Play, Circle } from "lucide-react";

import { useState, useRef, useMemo } from "react";
import { usePagination } from "../../hooks/usePagination";
import { PaginationControls } from "../../shared/ui/PaginationControls";
import { EditableText } from "@/components/ui/Form";

interface EditablePoint {
  id: number;
  coordinates: number[];
}

interface TeachPointsPanelProps {
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: GripParams[];
  sequences: Sequence[];
  expandedRows: { [key: number]: boolean };
  toggleRow: (id: number) => void;
  onImport: (data: any) => void;
  onMove: (point: TeachPoint) => void;
  onEdit: (point: TeachPoint) => void;
  onDelete: (point: TeachPoint) => void;
  onDeleteAll: () => void;
  onAdd: () => void;
  onTeach: (point: TeachPoint) => void;
  isConnected: boolean;
  bgColor: string;
  bgColorAlpha: string;
  searchTerm?: string;
  config: Tool;
}

export const TeachPointsPanel: React.FC<TeachPointsPanelProps> = ({
  teachPoints,
  expandedRows,
  onMove,
  onEdit,
  onDelete,
  onDeleteAll,
  onAdd,
  onTeach,
  isConnected,
  bgColor,
  bgColorAlpha,
  config,
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const tableBgColor = useColorModeValue("white", "gray.800");
  const headerBgColor = useColorModeValue("gray.50", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const tableRef = useRef<HTMLDivElement>(null);

  // Get the number of joints from the config
  const numJoints = useMemo(() => {
    return parseInt((config.config as any)?.pf400?.joints || "6");
  }, [config]);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    onPageChange,
    onItemsPerPageChange,
  } = usePagination(teachPoints);

  const handleSaveCoordinates = (teachpoint: TeachPoint, newValue: number, jointIndex: number) => {
    const updatedPoint = teachpoint.coordinates.split(" ");
    updatedPoint[jointIndex] = newValue.toString();
    onEdit({ ...teachpoint, coordinates: updatedPoint.join(" ") });
  };

  const handleSaveOrientation = (teachpoint: TeachPoint, newValue: "landscape" | "portrait") => {
    onEdit({ ...teachpoint, orientation: newValue });
  };

  // Generate joint column headers dynamically
  const jointHeaders = useMemo(() => {
    return Array.from({ length: numJoints }, (_, i) => (
      <Th key={`joint-header-${i + 1}`} bg={headerBgColor} color={textColor}>
        Joint {i + 1}
      </Th>
    ));
  }, [numJoints, headerBgColor, textColor]);

  // Function to limit coordinates to the configured number of joints
  const limitCoordinates = (coordinates: string): string[] => {
    const coords = coordinates.split(" ");
    // Slice to the configured number of joints
    const limitedCoords = coords.slice(0, numJoints);
    // Pad with "0" for any missing joints
    while (limitedCoords.length < numJoints) {
      limitedCoords.push("0");
    }
    return limitedCoords;
  };

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12} color={textColor}>
            Teach Points
          </Heading>
          <HStack>
            <Button
              leftIcon={<DeleteIcon />}
              size="sm"
              onClick={onDeleteAll}
              colorScheme="red"
              variant="outline">
              Delete All
            </Button>
            <Button leftIcon={<AddIcon />} size="sm" onClick={onAdd} colorScheme="blue">
              New Teach Point
            </Button>
          </HStack>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          <Box
            ref={tableRef}
            height="100%"
            overflow="auto"
            borderWidth="1px"
            borderRadius="md"
            borderColor={borderColor}
            boxShadow={useColorModeValue(
              "0 1px 3px rgba(0, 0, 0, 0.1)",
              "0 1px 3px rgba(0, 0, 0, 0.3)",
            )}>
            <Table
              variant="simple"
              size="sm"
              bg={tableBgColor}
              css={{
                tr: {
                  borderColor: borderColor,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: hoverBgColor,
                  },
                },
                th: {
                  borderColor: borderColor,
                  color: textColor,
                },
                td: {
                  borderColor: borderColor,
                  color: textColor,
                },
              }}>
              <Thead position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th bg={headerBgColor} color={textColor}>
                    Name
                  </Th>
                  {jointHeaders}
                  <Th bg={headerBgColor} color={textColor}>
                    Orientation
                  </Th>
                  <Th
                    width="120px"
                    minWidth="120px"
                    textAlign="right"
                    bg={headerBgColor}
                    color={textColor}>
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedItems.map((point, index) => (
                  <Tr key={point.id} bg={expandedRows[point.id] ? bgColorAlpha : undefined}>
                    <Td width="200px">
                      <EditableText
                        defaultValue={point.name}
                        onSubmit={(value) => {
                          value && onEdit({ ...point, name: value });
                        }}
                      />
                    </Td>
                    {limitCoordinates(point?.coordinates || "").map((coord, index) => (
                      <Td key={index}>
                        <EditableText
                          onSubmit={async (value) => {
                            value && handleSaveCoordinates(point, Number(value), index);
                          }}
                          defaultValue={coord}
                        />
                      </Td>
                    ))}
                    <Td>
                      <Select
                        value={point.orientation}
                        onChange={(e) => {
                          const value = e.target.value;
                          const orientation: "portrait" | "landscape" | undefined =
                            value === "portrait" || value === "landscape" ? value : undefined;
                          if (orientation !== undefined) {
                            handleSaveOrientation(point, orientation);
                          }
                        }}
                        size="sm"
                        borderColor={borderColor}
                        bg={tableBgColor}>
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </Select>
                    </Td>
                    <Td width="200px" textAlign="right">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Actions"
                          icon={<HamburgerIcon />}
                          variant="outline"
                          size="sm"
                          borderColor={borderColor}
                          minW="32px"
                        />
                        <MenuList>
                          <MenuItem icon={<Play size={14} />} onClick={() => onMove(point)}>
                            Move to point
                          </MenuItem>
                          {isConnected && (
                            <MenuItem icon={<Circle size={14} />} onClick={() => onTeach(point)}>
                              Teach current position
                            </MenuItem>
                          )}
                          <MenuDivider borderColor={borderColor} />
                          <MenuItem
                            icon={<DeleteIcon />}
                            onClick={() => onDelete(point)}
                            color="red.500">
                            Delete point
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={teachPoints.length}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </VStack>
    </Box>
  );
};
