import { Card, CardHeader, CardBody, HStack, Heading, Table, Thead, Tbody, Tr, Th, Td, IconButton, Menu, MenuButton, MenuList, MenuItem, Badge } from "@chakra-ui/react";
import { TeachPoint, MotionProfile } from "../types";
import { AddIcon, HamburgerIcon } from "@chakra-ui/icons";

interface TeachPointsPanelProps {
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: any[];
  sequences: any[];
  onImport: (data: any) => Promise<void>;
  onMove: (point: TeachPoint) => void;
  onEdit: (point: TeachPoint) => void;
  onDelete: (point: TeachPoint) => void;
  onAdd: () => void;
  bgColor: string;
  bgColorAlpha: string;
  searchTerm?: string;
}

export const TeachPointsPanel: React.FC<TeachPointsPanelProps> = ({
  teachPoints,
  onImport,
  onMove,
  onEdit,
  onDelete,
  onAdd,
  bgColor,
  bgColorAlpha,
  searchTerm = "",
}) => {
  const filteredPoints = teachPoints.filter(point => 
    point.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card width="100%" flex="1" bg={bgColor} borderColor={bgColorAlpha}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Teach Points</Heading>
          <IconButton
            aria-label="Add teach point"
            icon={<AddIcon />}
            onClick={onAdd}
            colorScheme="blue"
            variant="ghost"
            size="sm"
          />
        </HStack>
      </CardHeader>
      <CardBody overflowY="auto" maxHeight="calc(100vh - 700px)" minHeight="550px">
        <Table variant="simple" size="sm">
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
      </CardBody>
    </Card>
  );
};