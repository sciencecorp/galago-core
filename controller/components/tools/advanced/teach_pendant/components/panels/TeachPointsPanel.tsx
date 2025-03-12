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
import { AddIcon, DeleteIcon, EditIcon, CheckIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Tool } from "@/types/api";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "../types";
import { FaPlay, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { MdOutlineReplay } from "react-icons/md";
import { BsRecordCircle } from "react-icons/bs";
import { useState, useRef, useEffect, useMemo } from "react";
import { usePagination } from "../../hooks/usePagination";
import { PaginationControls } from "../common/PaginationControls";
import { EditableText } from "@/components/ui/Form";
import { palette, semantic } from "../../../../../../themes/colors";

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
  onAdd,
  onTeach,
  isConnected,
  bgColor,
  bgColorAlpha,
  config,
}) => {
  const borderColor = useColorModeValue(semantic.border.primary.light, semantic.border.primary.dark);
  const tableBgColor = useColorModeValue(semantic.background.primary.light, semantic.background.secondary.dark);
  const headerBgColor = useColorModeValue(semantic.background.secondary.light, semantic.background.card.dark);
  const hoverBgColor = useColorModeValue(semantic.background.hover.light, semantic.background.hover.dark);
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const [editingPoint, setEditingPoint] = useState<EditablePoint | null>(null);
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
    <Box>
      <VStack spacing={4} align="stretch">
        <HStack justifyContent="space-between">
          <Heading size="md">Teach Points</Heading>
          <HStack>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onAdd}
              size="sm">
              Add Point
            </Button>
          </HStack>
        </HStack>

        <Box
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
          overflow="auto"
          maxHeight="600px"
          ref={tableRef}>
          <Table variant="simple" size="sm">
            <Thead position="sticky" top={0} zIndex={1} bg={headerBgColor}>
              <Tr>
                <Th width="30%">Name</Th>
                <Th width="15%">Type</Th>
                <Th width="15%">Orientation</Th>
                <Th width="40%" textAlign="right">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedItems.map((point) => (
                <Tr
                  key={point.id}
                  _hover={{ bg: hoverBgColor }}
                  bg={expandedRows[point.id] ? bgColorAlpha : tableBgColor}>
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
                          <MenuItem icon={<FaPlay />} onClick={() => onMove(point)}>
                            Move to point
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

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          totalItems={teachPoints.length}
        />
      </VStack>
    </Box>
  );
};
