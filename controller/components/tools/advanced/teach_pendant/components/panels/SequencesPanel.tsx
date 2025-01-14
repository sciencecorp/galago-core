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
  Grid,
  GridItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Heading,
  useColorModeValue,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, HamburgerIcon } from "@chakra-ui/icons";
import { FaPlay } from "react-icons/fa";
import { Sequence, TeachPoint, MotionProfile, GripParams } from "../types";
import { CommandList } from "../lists/CommandList";
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
  const [isEditing, setIsEditing] = useState(false);

  // Update selected sequence when sequences change
  useEffect(() => {
    if (selectedSequence) {
      const updatedSequence = sequences.find(seq => seq.id === selectedSequence.id);
      if (updatedSequence) {
        setSelectedSequence(updatedSequence);
      }
    }
  }, [sequences]);

  const handleSequenceClick = (sequence: Sequence) => {
    if (selectedSequence?.id === sequence.id) {
      // If clicking the same sequence, collapse it
      setSelectedSequence(null);
      setExpandedCommandIndex(null);
    } else {
      // If clicking a different sequence, expand it
      setSelectedSequence(sequence);
      setExpandedCommandIndex(null);
    }
  };

  const handleSequenceUpdate = async (sequence: Sequence) => {
    try {
      await onUpdateSequence(sequence);
      // Update the local selected sequence state after successful update
      const updatedSequence = { ...sequence };
      setSelectedSequence(updatedSequence);
      // Clear editing state
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update sequence:', error);
    }
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

  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12}>Sequences</Heading>
          <HStack mb={4} justify="flex-end">
            <Button leftIcon={<AddIcon />} size="sm" onClick={onCreateNew}>
              New Sequence
            </Button>
          </HStack>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          <Grid 
            templateColumns={selectedSequence ? "350px 1fr" : "1fr"} 
            gap={4} 
            height="100%"
            transition="grid-template-columns 0.2s"
          >
            <GridItem height="100%" overflow="hidden" minWidth={0}>
              <Box height="100%" overflow="auto" borderWidth="1px" borderRadius="md" >
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
                      <Th>Commands</Th>
                      <Th textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sequences.map((sequence) => (
                      <Tr
                        key={sequence.id}
                        onClick={() => handleSequenceClick(sequence)}
                        cursor="pointer"
                        bg={selectedSequence?.id === sequence.id ? bgColorAlpha : "transparent"}
                        _hover={{ bg: bgColorAlpha }}
                      >
                        <Td>{sequence.name}</Td>
                        <Td>{sequence.commands.length}</Td>
                        <Td textAlign="right">
                          <HStack spacing={2} justify="flex-end">
                            {selectedSequence ? (
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Sequence actions"
                                  icon={<HamburgerIcon />}
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <MenuList onClick={(e) => e.stopPropagation()}>
                                  <MenuItem
                                    icon={<FaPlay />}
                                    onClick={() => onRun(sequence)}
                                  >
                                    Run Sequence
                                  </MenuItem>
                                  <MenuItem
                                    icon={<EditIcon />}
                                    onClick={() => handleSequenceClick(sequence)}
                                  >
                                    Edit Sequence
                                  </MenuItem>
                                  <MenuItem
                                    icon={<DeleteIcon />}
                                    color="red.500"
                                    onClick={() => handleDeleteClick(sequence)}
                                  >
                                    Delete Sequence
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            ) : (
                              <>
                                <Tooltip label="Run sequence">
                                  <IconButton
                                    aria-label="Run sequence"
                                    icon={<FaPlay />}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRun(sequence);
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip label="Edit sequence">
                                  <IconButton
                                    aria-label="Edit sequence"
                                    icon={<EditIcon />}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSequenceClick(sequence);
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip label="Delete sequence">
                                  <IconButton
                                    aria-label="Delete sequence"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(sequence);
                                    }}
                                  />
                                </Tooltip>
                              </>
                            )}
                          </HStack>
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
                    try {
                      await handleSequenceUpdate({
                        ...selectedSequence,
                        commands: updatedCommands,
                      });
                    } catch (error) {
                      console.error('Failed to update sequence commands:', error);
                    }
                  }}
                  onSequenceNameChange={async (newName) => {
                    try {
                      await handleSequenceUpdate({
                        ...selectedSequence,
                        name: newName,
                      });
                    } catch (error) {
                      console.error('Failed to update sequence name:', error);
                    }
                  }}
                  expandedCommandIndex={expandedCommandIndex}
                  onCommandClick={(index) => {
                    if (!isEditing) {
                      setExpandedCommandIndex(expandedCommandIndex === index ? null : index);
                    }
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