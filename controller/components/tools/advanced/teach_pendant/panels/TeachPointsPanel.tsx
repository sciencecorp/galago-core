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
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { TeachPoint, TeachPointsPanelProps } from "../types";
import { FaPlay, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { MdOutlineReplay } from "react-icons/md";

export const TeachPointsPanel: React.FC<TeachPointsPanelProps> = ({
  teachPoints,
  expandedRows,
  toggleRow,
  onMove,
  onEdit,
  onDelete,
  onAdd,
  bgColor,
  bgColorAlpha,
  searchTerm = "",
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const filteredPoints = teachPoints.filter(point => 
    point.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Box height="100%" overflow="auto" borderWidth="1px" borderRadius="md">
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
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Orientation</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPoints.map((point) => (
                  <Tr key={point.id} bg={expandedRows.has(point.id) ? bgColorAlpha : undefined}>
                    <Td>{point.name}</Td>
                    <Td>{point.type}</Td>
                    <Td>{point.orientation || '-'}</Td>
                    <Td textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        {point.type === 'nest' ? (
                          <>
                            <Tooltip label="Leave nest">
                              <IconButton
                                aria-label="Leave nest"
                                icon={<FaPlay style={{ transform: 'scaleX(-1)' }}/>}
                                size="sm"
                                onClick={() => onMove(point, 'leave')}
                              />
                            </Tooltip>
                            <Tooltip label="Approach nest">
                              <IconButton
                                aria-label="Approach nest"
                                icon={<FaPlay  />}
                                size="sm"
                                onClick={() => onMove(point, 'approach')}
                              />
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip label="Move to point">
                            <IconButton
                              aria-label="Move to point"
                              icon={<FaPlay />}
                              size="sm"
                              onClick={() => onMove(point)}
                            />
                          </Tooltip>
                        )}
                        <Tooltip label="Edit point">
                          <IconButton
                            aria-label="Edit point"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => onEdit(point)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete point">
                          <IconButton
                            aria-label="Delete point"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => onDelete(point)}
                          />
                        </Tooltip>
                      </HStack>
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