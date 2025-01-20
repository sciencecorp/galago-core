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
  useOutsideClick,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, CheckIcon, HamburgerIcon } from "@chakra-ui/icons";
import { TeachPoint, TeachPointsPanelProps } from "../types/index";
import { FaPlay, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { MdOutlineReplay } from "react-icons/md";
import { BsRecordCircle } from "react-icons/bs";
import { useState, useRef } from "react";

interface EditablePoint {
  id: number;
  coordinates: number[];
}

export const TeachPointsPanel: React.FC<TeachPointsPanelProps> = ({
  teachPoints,
  expandedRows,
  toggleRow,
  onMove,
  onEdit,
  onDelete,
  onAdd,
  onTeach,
  isConnected,
  bgColor,
  bgColorAlpha,
  searchTerm = "",
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [editingPoint, setEditingPoint] = useState<EditablePoint | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  
  useOutsideClick({
    ref: tableRef,
    handler: () => {
      if (editingPoint) {
        setEditingPoint(null);
      }
    },
  });
  
  const filteredPoints = teachPoints.filter(point => 
    point.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCoordinateChange = (index: number, value: number) => {
    if (editingPoint) {
      const newCoordinates = [...editingPoint.coordinates];
      newCoordinates[index] = isNaN(value) ? 0 : value;
      setEditingPoint({ ...editingPoint, coordinates: newCoordinates });
    }
  };

  const handleSaveCoordinates = (point: TeachPoint) => {
    if (editingPoint) {
      const updatedPoint = {
        ...point,
        coordinate: editingPoint.coordinates.join(" ")
      };
      onEdit(updatedPoint);
      setEditingPoint(null);
    }
  };

  const startEditing = (point: TeachPoint) => {
    setEditingPoint({
      id: point.id,
      coordinates: point.coordinate ? point.coordinate.split(" ").map(Number) : [0, 0, 0, 0, 0, 0]
    });
  };

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12}>Teach Points</Heading>
          <Button leftIcon={<AddIcon />} size="sm" onClick={onAdd}>
            New Teach Point
          </Button>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          <Box ref={tableRef} height="100%" overflow="auto" borderWidth="1px" borderRadius="md">
            <Table variant="simple" size="sm" css={{
              'tr': {
                borderColor: borderColor,
              },
              'th': {
                borderColor: borderColor,
              },
              'td': {
                borderColor: borderColor,
              }
            }}>
              <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
                <Tr>
                  <Th width="200px">Name</Th>
                  <Th width="100px">Type</Th>
                  <Th>
                    {editingPoint && (
                      <Box textAlign="center">Coordinates</Box>
                    )}
                  </Th>
                  <Th width="200px" textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPoints.map((point) => (
                  <Tr key={point.id} bg={expandedRows.has(point.id) ? bgColorAlpha : undefined}>
                    <Td width="200px">{point.name}</Td>
                    <Td width="100px">{point.type}</Td>
                    <Td>
                      {editingPoint?.id === point.id && (
                        <Box>
                          <HStack spacing={2} justify="center">
                            {editingPoint.coordinates.map((coord, index) => (
                              <Box key={index}>
                                <Box fontSize="xs" textAlign="center" mb={1}>J{index + 1}</Box>
                                <NumberInput
                                  value={coord}
                                  onChange={(_, value) => handleCoordinateChange(index, value)}
                                  step={0.001}
                                  precision={3}
                                  size="xs"
                                  min={-360}
                                  max={360}
                                >
                                  <NumberInputField width="100px" textAlign="left" />
                                </NumberInput>
                              </Box>
                            ))}
                          </HStack>
                        </Box>
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
                            {point.type === 'nest' ? (
                              <>
                                <MenuItem 
                                  icon={<FaPlay style={{ transform: 'scaleX(-1)' }}/>}
                                  onClick={() => onMove(point, 'leave')}
                                >
                                  Leave nest
                                </MenuItem>
                                <MenuItem 
                                  icon={<FaPlay />}
                                  onClick={() => onMove(point, 'approach')}
                                >
                                  Approach nest
                                </MenuItem>
                              </>
                            ) : (
                              <>
                                <MenuItem 
                                  icon={<FaPlay />}
                                  onClick={() => onMove(point)}
                                >
                                  Move to point
                                </MenuItem>
                                {isConnected && (
                                  <MenuItem 
                                    icon={<BsRecordCircle />}
                                    onClick={() => onTeach(point)}
                                  >
                                    Teach current position
                                  </MenuItem>
                                )}
                              </>
                            )}
                            <MenuDivider />
                            <MenuItem 
                              icon={<EditIcon />}
                              onClick={() => startEditing(point)}
                            >
                              Edit coordinates
                            </MenuItem>
                            <MenuItem 
                              icon={<DeleteIcon />}
                              onClick={() => onDelete(point)}
                              color="red.500"
                            >
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
      </VStack>
    </Box>
  );
};