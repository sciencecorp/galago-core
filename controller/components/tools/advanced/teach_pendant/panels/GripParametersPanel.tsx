import { Card, CardHeader, CardBody, HStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { AddIcon, HamburgerIcon } from "@chakra-ui/icons";
import { GripParams } from "../types";

interface GripParametersPanelProps {
  params: GripParams[];
  onEdit: (params: GripParams) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  bgColor: string;
  bgColorAlpha: string;
}

export const GripParametersPanel: React.FC<GripParametersPanelProps> = ({
  params,
  onEdit,
  onDelete,
  onAdd,
  bgColor,
  bgColorAlpha,
}) => {
  return (
    <Card width="100%" flex="1" bg={bgColor} borderColor={bgColorAlpha}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Grip Parameters</Heading>
          <IconButton
            aria-label="Add grip parameters"
            icon={<AddIcon />}
            onClick={onAdd}
            colorScheme="blue"
            variant="ghost"
            size="sm"
          />
        </HStack>
      </CardHeader>
      <CardBody overflowY="auto" maxHeight="calc(100vh - 700px)" minHeight="550px">
        <Table variant="simple">
          <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
            <Tr>
              <Th>Name</Th>
              <Th>Width</Th>
              <Th>Speed</Th>
              <Th>Force</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {params.map((param) => (
              <Tr key={param.id} _hover={{ bg: bgColorAlpha }}>
                <Td>{param.name}</Td>
                <Td>{param.width}</Td>
                <Td>{param.speed}</Td>
                <Td>{param.force}</Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Actions"
                      icon={<HamburgerIcon />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem onClick={() => onEdit(param)}>Edit</MenuItem>
                      <MenuItem 
                        color="red.500" 
                        onClick={() => param.id && onDelete(param.id)}
                      >
                        Delete
                      </MenuItem>
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