import { Card, CardHeader, CardBody, HStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Menu, MenuButton, MenuList, MenuItem, IconButton, Button } from "@chakra-ui/react";
import { AddIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Sequence } from "../types";

interface SequencesPanelProps {
  sequences: Sequence[];
  onEdit: (sequence: Sequence) => void;
  onRun: (sequence: Sequence) => void;
  onDelete: (id: number) => void;
  onCreateNew: () => void;
  bgColor: string;
  bgColorAlpha: string;
}

export const SequencesPanel: React.FC<SequencesPanelProps> = ({
  sequences,
  onEdit,
  onRun,
  onDelete,
  onCreateNew,
  bgColor,
  bgColorAlpha,
}) => {
  return (
    <Card width="100%" flex="1" bg={bgColor} borderColor={bgColorAlpha}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Sequences</Heading>
          <IconButton aria-label="Add sequence" icon={<AddIcon />} colorScheme="blue" variant="ghost" size="sm" onClick={onCreateNew} />
        </HStack>
      </CardHeader>
      <CardBody overflowY="auto" maxHeight="calc(100vh - 700px)" minHeight="550px">
        <Table variant="simple">
          <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
            <Tr>
              <Th>Name</Th>
              <Th>Commands</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sequences.map((sequence) => (
              <Tr key={sequence.id} _hover={{ bg: bgColorAlpha }}>
                <Td>{sequence.name}</Td>
                <Td>{sequence.commands.length} commands</Td>
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
                      <MenuItem onClick={() => onEdit(sequence)}>Edit</MenuItem>
                      <MenuItem onClick={() => onRun(sequence)}>Run</MenuItem>
                      <MenuItem color="red.500" onClick={() => onDelete(sequence.id)}>Delete</MenuItem>
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