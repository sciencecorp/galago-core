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
  MenuDivider,
  Badge,
  Text,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, HamburgerIcon } from "@chakra-ui/icons";
import { FaPlay } from "react-icons/fa";
import { Tool } from "@/types/api";
import { CommandList } from "../lists/CommandList";
import { useState, useEffect, useRef } from "react";
import { usePagination } from "../../hooks/usePagination";
import { PaginationControls } from "../common/PaginationControls";
import { Sequence, TeachPoint, MotionProfile, GripParams } from "../types";
import { EmptyState } from "@/components/ui/EmptyState";

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
  config: Tool;
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
  config,
}) => {
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [sequenceToDelete, setSequenceToDelete] = useState<Sequence | null>(null);
  const [sequenceToRun, setSequenceToRun] = useState<Sequence | null>(null);
  const [expandedCommandIndex, setExpandedCommandIndex] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const runConfirmRef = useRef<HTMLButtonElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    onPageChange,
    onItemsPerPageChange,
  } = usePagination(sequences);

  // Select the first sequence on initial load if available
  useEffect(() => {
    if (sequences.length > 0 && !selectedSequence) {
      setSelectedSequence(sequences[0]);
    }
  }, [sequences, selectedSequence]);

  // Update selected sequence when sequences change
  useEffect(() => {
    if (selectedSequence) {
      const updatedSequence = sequences.find((seq) => seq.id === selectedSequence.id);
      // Only update if the found sequence is different from the current selectedSequence.
      if (updatedSequence && updatedSequence !== selectedSequence) {
        setSelectedSequence(updatedSequence);
      } else if (!updatedSequence && sequences.length > 0) {
        // If the selected sequence no longer exists, select the first available one
        setSelectedSequence(sequences[0]);
      } else if (!updatedSequence && sequences.length === 0) {
        // If no sequences are available, clear the selection
        setSelectedSequence(null);
      }
    }
  }, [sequences, selectedSequence]);

  const handleSequenceClick = (sequence: Sequence) => {
    setSelectedSequence(sequence);
    setExpandedCommandIndex(null);
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
      console.error("Failed to update sequence:", error);
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
        // Select another sequence if available after deletion
        if (sequences.length > 1) {
          const nextSequence = sequences.find((seq) => seq.id !== sequenceToDelete.id);
          if (nextSequence) {
            setSelectedSequence(nextSequence);
          }
        } else {
          setSelectedSequence(null);
        }
      }
    }
  };

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const tableBgColor = useColorModeValue("white", "gray.800");
  const headerBgColor = useColorModeValue("gray.50", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const panelShadowColor = useColorModeValue(
    "0 1px 3px rgba(0, 0, 0, 0.1)",
    "0 1px 3px rgba(0, 0, 0, 0.3)",
  );
  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12} color={textColor}>
            Sequences
          </Heading>
          <Button leftIcon={<AddIcon />} size="sm" onClick={onCreateNew} colorScheme="blue">
            New Sequence
          </Button>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          {sequences.length > 0 ? (
            <Grid templateColumns="450px 1fr" gap={4} height="100%">
              <GridItem height="100%" overflow="hidden" minWidth={0}>
                <Box
                  height="100%"
                  overflow="auto"
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={borderColor}
                  boxShadow={panelShadowColor}>
                  <Table
                    variant="simple"
                    size="sm"
                    bg={tableBgColor}
                    css={{
                      tr: {
                        borderColor: borderColor,
                        transition: "background-color 0.2s",
                        "&:hover": {
                          backgroundColor: hoverBgColor,
                        },
                      },
                      th: {
                        borderColor: borderColor,
                        color: textColor,
                      },
                      td: {
                        borderColor: borderColor,
                        color: textColor,
                      },
                    }}>
                    <Thead position="sticky" top={0} zIndex={1}>
                      <Tr>
                        <Th bg={headerBgColor} color={textColor}>
                          Name
                        </Th>
                        <Th bg={headerBgColor} color={textColor}>
                          Commands
                        </Th>
                        <Th bg={headerBgColor} color={textColor}>
                          Labware
                        </Th>
                        <Th
                          textAlign="right"
                          width="100px"
                          minWidth="100px"
                          bg={headerBgColor}
                          color={textColor}>
                          Actions
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginatedItems.map((sequence) => (
                        <Tr
                          key={sequence.id}
                          onClick={() => handleSequenceClick(sequence)}
                          cursor="pointer"
                          bg={selectedSequence?.id === sequence.id ? bgColorAlpha : "transparent"}
                          _hover={{ bg: hoverBgColor }}>
                          <Td>{sequence.name}</Td>
                          <Td>{sequence.commands?.length || 0}</Td>
                          <Td>
                            <Badge colorScheme={sequence.labware === "default" ? "gray" : "blue"}>
                              {sequence.labware || "default"}
                            </Badge>
                          </Td>
                          <Td textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Sequence actions"
                                  icon={<HamburgerIcon />}
                                  size="sm"
                                  variant="outline"
                                  borderColor={borderColor}
                                  onClick={(e) => e.stopPropagation()}
                                  minW="32px"
                                />
                                <MenuList onClick={(e) => e.stopPropagation()}>
                                  <MenuItem
                                    icon={<FaPlay />}
                                    onClick={() => setSequenceToRun(sequence)}>
                                    Run Sequence
                                  </MenuItem>
                                  <MenuItem
                                    icon={<EditIcon />}
                                    onClick={() => handleSequenceClick(sequence)}>
                                    Edit Sequence
                                  </MenuItem>
                                  <MenuDivider />
                                  <MenuItem
                                    icon={<DeleteIcon />}
                                    color="red.500"
                                    onClick={() => handleDeleteClick(sequence)}>
                                    Delete Sequence
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </GridItem>
              <GridItem height="100%" overflow="hidden">
                {selectedSequence ? (
                  <CommandList
                    commands={selectedSequence.commands}
                    sequenceName={selectedSequence.name}
                    labware={selectedSequence.labware || "default"}
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
                        console.error("Failed to update sequence commands:", error);
                      }
                    }}
                    onSequenceNameChange={async (newName) => {
                      try {
                        await handleSequenceUpdate({
                          ...selectedSequence,
                          name: newName,
                        });
                      } catch (error) {
                        console.error("Failed to update sequence name:", error);
                      }
                    }}
                    onLabwareChange={async (newLabware) => {
                      try {
                        await handleSequenceUpdate({
                          ...selectedSequence,
                          labware: newLabware,
                        });
                      } catch (error) {
                        console.error("Failed to update sequence labware:", error);
                      }
                    }}
                    expandedCommandIndex={expandedCommandIndex}
                    onCommandClick={(index) => {
                      if (!isEditing) {
                        setExpandedCommandIndex(expandedCommandIndex === index ? null : index);
                      }
                    }}
                    config={config}
                  />
                ) : (
                  <EmptyState
                    title="No Sequence Selected"
                    description="Please select a sequence from the list to view and edit its commands."
                  />
                )}
              </GridItem>
            </Grid>
          ) : (
            <EmptyState
              title="No Sequences Found"
              description="Create a new sequence to get started."
            />
          )}
        </Box>
      </VStack>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={sequences.length}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />

      <AlertDialog
        isOpen={sequenceToDelete !== null}
        leastDestructiveRef={cancelRef}
        onClose={() => setSequenceToDelete(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Sequence
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the sequence &quot;{sequenceToDelete?.name}&quot;?
              This action cannot be undone.
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

      {/* Run Sequence Confirmation Dialog */}
      <AlertDialog
        isOpen={sequenceToRun !== null}
        leastDestructiveRef={runConfirmRef}
        onClose={() => setSequenceToRun(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Run Sequence
            </AlertDialogHeader>
            <AlertDialogBody>
              {sequenceToRun?.commands && sequenceToRun.commands.length > 0 ? (
                <Box>
                  <Text>
                    Are you sure you want to run the sequence &quot;{sequenceToRun?.name}&quot;?
                  </Text>
                  This sequence contains {sequenceToRun.commands.length} command
                  {sequenceToRun.commands.length !== 1 ? "s" : ""}.
                </Box>
              ) : (
                <Box mt={2} color="yellow.500">
                  Warning: This sequence contains no commands.
                </Box>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={runConfirmRef} onClick={() => setSequenceToRun(null)}>
                Cancel
              </Button>
              <Button
                isDisabled={!sequenceToRun?.commands || sequenceToRun.commands.length === 0}
                colorScheme="blue"
                onClick={() => {
                  if (sequenceToRun) {
                    onRun(sequenceToRun);
                    setSequenceToRun(null);
                  }
                }}
                ml={3}>
                Run
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
