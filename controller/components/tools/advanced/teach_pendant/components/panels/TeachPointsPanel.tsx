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
  Tooltip,
  VStack,
  useColorModeValue,
  Heading,
  NumberInput,
  NumberInputField,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, CheckIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Tool } from "@/types/api";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "../types";
import { FaPlay, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { MdOutlineReplay } from "react-icons/md";
import { BsRecordCircle } from "react-icons/bs";
import { useState, useRef } from "react";
import { usePagination } from "../../hooks/usePagination";
import { PaginationControls } from "../common/PaginationControls";

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
  onMove: (point: TeachPoint, action?: "approach" | "leave") => void;
  onEdit: (point: TeachPoint) => void;
  onDelete: (point: TeachPoint) => void;
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
  motionProfiles,
  gripParams,
  sequences,
  expandedRows,
  toggleRow,
  onImport,
  onMove,
  onEdit,
  onDelete,
  onAdd,
  onTeach,
  isConnected,
  bgColor,
  bgColorAlpha,
  searchTerm,
  config,
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [editingPoint, setEditingPoint] = useState<EditablePoint | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    onPageChange,
    onItemsPerPageChange,
  } = usePagination(teachPoints);

  const handleCoordinateChange = (index: number, value: number) => {
    if (editingPoint) {
      const numJoints = parseInt((config.config as any)?.pf400?.joints || "5");
      const newCoordinates = Array.from({ length: numJoints }).map((_, i) =>
        i === index ? value : editingPoint.coordinates[i] || 0,
      );
      setEditingPoint({ ...editingPoint, coordinates: newCoordinates });
    }
  };

  const handleSaveCoordinates = (point: TeachPoint) => {
    if (editingPoint) {
      const numJoints = parseInt((config.config as any)?.pf400?.joints || "5");
      const coordinates = Array.from({ length: numJoints }).map(
        (_, i) => editingPoint.coordinates[i] || 0,
      );
      const updatedPoint = {
        ...point,
        coordinates: coordinates.join(" "),
      };
      onEdit(updatedPoint);
      setEditingPoint(null);
    }
  };

  const startEditing = (point: TeachPoint) => {
    const numJoints = parseInt((config.config as any)?.pf400?.joints || "5");
    const coordinates = point.coordinates
      ? point.coordinates.split(" ").map(Number)
      : Array(numJoints).fill(0);

    setEditingPoint({
      id: point.id,
      coordinates: Array.from({ length: numJoints }).map((_, i) => coordinates[i] || 0),
    });
  };

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12}>
            Teach Points
          </Heading>
          <Button leftIcon={<AddIcon />} size="sm" onClick={onAdd}>
            New Teach Point
          </Button>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          <Box ref={tableRef} height="100%" overflow="auto" borderWidth="1px" borderRadius="md">
            <Table
              variant="simple"
              size="sm"
              css={{
                tr: {
                  borderColor: borderColor,
                },
                th: {
                  borderColor: borderColor,
                },
                td: {
                  borderColor: borderColor,
                },
              }}>
              <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
                <Tr>
                  <Th width="200px">Name</Th>
                  <Th width="100px">Type</Th>
                  <Th textAlign="center">Coordinates</Th>
                  <Th width="200px" textAlign="right">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedItems.map((point) => (
                  <Tr key={point.id} bg={expandedRows[point.id] ? bgColorAlpha : undefined}>
                    <Td width="200px">{point.name}</Td>
                    <Td width="100px">{point.type}</Td>
                    <Td>
                      {editingPoint?.id === point.id ? (
                        <Box>
                          <HStack spacing={2} justify="center">
                            {Array.from(
                              { length: parseInt((config.config as any)?.pf400?.joints || "5") },
                              (_, index) => (
                                <Box key={index}>
                                  <Box fontSize="xs" textAlign="center" mb={1}>
                                    J{index + 1}
                                  </Box>
                                  <NumberInput
                                    value={editingPoint?.coordinates[index] || 0}
                                    onChange={(_, value) => handleCoordinateChange(index, value)}
                                    step={0.001}
                                    precision={3}
                                    size="xs"
                                    min={-360}
                                    max={360}>
                                    <NumberInputField width="100px" textAlign="left" />
                                  </NumberInput>
                                </Box>
                              ),
                            )}
                          </HStack>
                        </Box>
                      ) : (
                        <HStack spacing={2} justify="center">
                          {Array.from(
                            { length: parseInt((config.config as any)?.pf400?.joints || "5") },
                            (_, index) => {
                              const coordinates = point.coordinates
                                ? point.coordinates.split(" ").map(Number)
                                : Array(parseInt((config.config as any)?.pf400?.joints || "5")).fill(0);
                              return (
                                <Box key={index}>
                                  <Box fontSize="xs" textAlign="center" mb={1}>
                                    J{index + 1}
                                  </Box>
                                  <Box
                                    width="100px"
                                    textAlign="center"
                                    borderWidth="1px"
                                    borderRadius="md"
                                    py={1}
                                    px={2}
                                    fontSize="sm"
                                    fontFamily="mono"
                                  >
                                    {coordinates[index]?.toFixed(3) || "0.000"}
                                  </Box>
                                </Box>
                              );
                            },
                          )}
                        </HStack>
                      )}
                    </Td>
                    <Td width="200px" textAlign="right">
                      {editingPoint?.id === point.id ? (
                        <Tooltip label="Save coordinates">
                          <IconButton
                            aria-label="Save coordinates"
                            icon={<CheckIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleSaveCoordinates(point)}
                          />
                        </Tooltip>
                      ) : (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Actions"
                            icon={<HamburgerIcon />}
                            variant="outline"
                            size="sm"
                          />
                          <MenuList>
                            {point.type === "nest" ? (
                              <>
                                <MenuItem
                                  icon={<FaPlay style={{ transform: "scaleX(-1)" }} />}
                                  onClick={() => onMove(point, "leave")}>
                                  Leave nest
                                </MenuItem>
                                <MenuItem
                                  icon={<FaPlay />}
                                  onClick={() => onMove(point, "approach")}>
                                  Approach nest
                                </MenuItem>
                              </>
                            ) : (
                              <>
                                <MenuItem icon={<FaPlay />} onClick={() => onMove(point)}>
                                  Move to point
                                </MenuItem>
                                {isConnected && (
                                  <MenuItem
                                    icon={<BsRecordCircle />}
                                    onClick={() => onTeach(point)}>
                                    Teach current position
                                  </MenuItem>
                                )}
                              </>
                            )}
                            <MenuDivider />
                            <MenuItem icon={<EditIcon />} onClick={() => startEditing(point)}>
                              Edit coordinates
                            </MenuItem>
                            <MenuItem
                              icon={<DeleteIcon />}
                              onClick={() => onDelete(point)}
                              color="red.500">
                              Delete point
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
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
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </VStack>
    </Box>
  );
};
