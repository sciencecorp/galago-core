import { Card, CardHeader, CardBody, HStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Menu, MenuButton, MenuList, MenuItem, IconButton, useColorModeValue, Box, VStack } from "@chakra-ui/react";
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
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12}>Grip Parameters</Heading>
          <IconButton
            aria-label="Add grip parameters"
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
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};