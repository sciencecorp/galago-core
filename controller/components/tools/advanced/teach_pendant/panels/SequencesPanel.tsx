import { Card, CardHeader, CardBody, HStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Menu, MenuButton, MenuList, MenuItem, IconButton, Button, Grid, GridItem, Box, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, VStack } from "@chakra-ui/react";
import { AddIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Sequence, TeachPoint, MotionProfile, GripParams } from "../types";
import { CommandList } from "../components/CommandList";
import { useState, useEffect, useRef } from "react";

interface SequencesPanelProps {
  sequences: Sequence[];
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: GripParams[];
  onRun: (sequence: Sequence) => void;
  onDelete: (id: number) => void;
  onCreateNew: () => void;
  onUpdateSequence: (sequence: Sequence) => void;
  bgColor: string;
  bgColorAlpha: string;
}

export const SequencesPanel: React.FC<SequencesPanelProps> = ({
  sequences,
  teachPoints,
  motionProfiles,
  gripParams,
  onRun,
  onDelete,
  onCreateNew,
  onUpdateSequence,
  bgColor,
  bgColorAlpha,
}) => {
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [sequenceToDelete, setSequenceToDelete] = useState<Sequence | null>(null);
  const [expandedCommandIndex, setExpandedCommandIndex] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Update selected sequence when sequences change
  useEffect(() => {
    if (selectedSequence) {
      const updatedSequence = sequences.find(seq => seq.id === selectedSequence.id);
      if (updatedSequence) {
        setSelectedSequence(updatedSequence);
      }
    }
  }, [sequences]);

  const handleUpdateSequence = async (sequence: Sequence) => {
    await onUpdateSequence(sequence);
  };

  const handleDeleteClick = (sequence: Sequence) => {
    setSequenceToDelete(sequence);
  };

  const handleDeleteConfirm = () => {
    if (sequenceToDelete) {
      onDelete(sequenceToDelete.id);
      setSequenceToDelete(null);
      if (selectedSequence?.id === sequenceToDelete.id) {
        setSelectedSequence(null);
      }
    }
  };

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12}>Sequences</Heading>
          <Button leftIcon={<AddIcon />} size="sm" onClick={onCreateNew}>
            New Sequence
          </Button>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          <Grid 
            templateColumns={selectedSequence ? "1fr 2fr" : "1fr"} 
            gap={4} 
            height="100%"
            transition="grid-template-columns 0.2s"
          >
            <GridItem height="100%" overflow="hidden">
              <Box height="100%" overflow="auto" borderWidth="1px" borderRadius="md" >
                <Table variant="simple" size="sm">
                  <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Commands</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sequences.map((sequence) => (
                      <Tr
                        key={sequence.id}
                        onClick={() => setSelectedSequence(sequence)}
                        cursor="pointer"
                        bg={selectedSequence?.id === sequence.id ? bgColorAlpha : "transparent"}
                        _hover={{ bg: bgColorAlpha }}
                      >
                        <Td>{sequence.name}</Td>
                        <Td>{sequence.commands.length}</Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              aria-label="Options"
                              icon={<HamburgerIcon />}
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <MenuList>
                              <MenuItem onClick={(e) => {
                                e.stopPropagation();
                                onRun(sequence);
                              }}>Run</MenuItem>
                              <MenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(sequence);
                              }} color="red.500">Delete</MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </GridItem>
            {selectedSequence && (
              <GridItem height="100%" overflow="hidden">
                <CommandList
                  commands={selectedSequence.commands}
                  sequenceName={selectedSequence.name}
                  teachPoints={teachPoints}
                  motionProfiles={motionProfiles}
                  gripParams={gripParams}
                  onDelete={() => handleDeleteClick(selectedSequence)}
                  onCommandsChange={async (updatedCommands) => {
                    await handleUpdateSequence({
                      ...selectedSequence,
                      commands: updatedCommands,
                    });
                  }}
                  onSequenceNameChange={async (newName) => {
                    await handleUpdateSequence({
                      ...selectedSequence,
                      name: newName,
                    });
                  }}
                  expandedCommandIndex={expandedCommandIndex}
                  onCommandClick={(index) => {
                    setExpandedCommandIndex(expandedCommandIndex === index ? null : index);
                  }}
                />
              </GridItem>
            )}
          </Grid>
        </Box>
      </VStack>

      <AlertDialog
        isOpen={sequenceToDelete !== null}
        leastDestructiveRef={cancelRef}
        onClose={() => setSequenceToDelete(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Sequence
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the sequence "{sequenceToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setSequenceToDelete(null)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};