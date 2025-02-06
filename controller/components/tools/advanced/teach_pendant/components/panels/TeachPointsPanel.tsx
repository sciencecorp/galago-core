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
import { useState, useRef, useEffect } from "react";
import { usePagination } from "../../hooks/usePagination";
import { PaginationControls } from "../common/PaginationControls";
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

  const handleSaveCoordinates = (teachpoint: TeachPoint, newValue: number, jointIndex: number) => {
    const updatedPoint = teachpoint.coordinates.split(" ");
    updatedPoint[jointIndex] = newValue.toString();
    onEdit({ ...teachpoint, coordinates: updatedPoint.join(" ") });
    setEditingPoint(null);
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
                  <Th textAlign="center">Joint 1</Th>
                  <Th textAlign="center">Joint 2</Th>
                  <Th textAlign="center">Joint 3</Th>
                  <Th textAlign="center">Joint 4</Th>
                  <Th textAlign="center">Joint 5</Th>
                  <Th textAlign="center">Joint 6</Th>
                  <Th width="200px" textAlign="right">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedItems.map((point, index) => (
                  <Tr key={point.id} bg={expandedRows[point.id] ? bgColorAlpha : undefined}>
                    <Td width="200px">{point.name}</Td>
                    {point?.coordinates?.split(" ").map((coord, index) => (
                      <Td key={index} textAlign="center">
                        <EditableText
                          onSubmit={async (value) => {
                            value && handleSaveCoordinates(point, Number(value), index);
                          }}
                          defaultValue={coord}
                        />
                      </Td>
                    ))}
                    <Td width="200px" textAlign="right">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Actions"
                          icon={<HamburgerIcon />}
                          variant="outline"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem icon={<FaPlay />} onClick={() => onMove(point)}>
                            Move to point
                          </MenuItem>
                          {isConnected && (
                            <MenuItem icon={<BsRecordCircle />} onClick={() => onTeach(point)}>
                              Teach current position
                            </MenuItem>
                          )}
                          <MenuDivider />
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
