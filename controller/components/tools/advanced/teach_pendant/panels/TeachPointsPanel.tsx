import { Card, CardHeader, CardBody, HStack, Heading, Table, Thead, Tbody, Tr, Th, Td, IconButton, Menu, MenuButton, MenuList, MenuItem, Badge, useColorModeValue, Box, VStack } from "@chakra-ui/react";
import { TeachPoint, MotionProfile, TeachPointsPanelProps } from "../types";
import { AddIcon, HamburgerIcon } from "@chakra-ui/icons";

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
          <IconButton
            aria-label="Add teach point"
            icon={<AddIcon />}
            onClick={onAdd}
            colorScheme="blue"
            variant="ghost"
            size="sm"
          />
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
                  <Tr key={point.id} _hover={{ bg: bgColorAlpha }}>
                    <Td>{point.name}</Td>
                    <Td>
                      <Badge colorScheme={point.type === "location" ? "blue" : "green"}>{point.type}</Badge>
                    </Td>
                    <Td>
                      {point.type === "nest" && point.orientation && (
                        <Badge colorScheme="purple">{point.orientation}</Badge>
                      )}
                    </Td>
                    <Td textAlign="right">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Actions"
                          icon={<HamburgerIcon />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem onClick={() => onMove(point)}>Move To</MenuItem>
                          <MenuItem onClick={() => onEdit(point)}>Edit</MenuItem>
                          <MenuItem color="red.500" onClick={() => onDelete(point)}>Delete</MenuItem>
                        </MenuList>
                      </Menu>
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