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
  Text,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, HamburgerIcon, CopyIcon } from "@chakra-ui/icons";
import { FaPlay } from "react-icons/fa";
import { Tool } from "@/types/api";
import { BravoCommandList } from "./BravoCommandList";
import { useState, useEffect, useRef } from "react";
import { usePagination } from "@/components/tools/advanced/teach_pendant/hooks/usePagination";
import { PaginationControls } from "@/components/tools/advanced/teach_pendant/shared/ui/PaginationControls";
import { EmptyState } from "@/components/ui/EmptyState";
import { EditableText } from "@/components/ui/Form";
import { BravoProtocol } from "@/server/schemas/bravo";

interface BravoProtocolsPanelProps {
  protocols: BravoProtocol[];
  onRun: (protocol: BravoProtocol) => void;
  onDelete: (id: number) => void;
  onDeleteAll: () => void;
  onCreateNew: () => void;
  onUpdateProtocol: (protocol: BravoProtocol) => void;
  onCloneProtocol: (protocol: BravoProtocol) => void;
  bgColor: string;
  bgColorAlpha: string;
  config: Tool;
}

export const BravoProtocolsPanel: React.FC<BravoProtocolsPanelProps> = ({
  protocols,
  onRun,
  onDelete,
  onDeleteAll,
  onCreateNew,
  onUpdateProtocol,
  onCloneProtocol,
  bgColor,
  bgColorAlpha,
  config,
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<BravoProtocol | null>(null);
  const [protocolToDelete, setProtocolToDelete] = useState<BravoProtocol | null>(null);
  const [protocolToRun, setProtocolToRun] = useState<BravoProtocol | null>(null);
  const [expandedCommandIndex, setExpandedCommandIndex] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const runConfirmRef = useRef<HTMLButtonElement>(null);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    onPageChange,
    onItemsPerPageChange,
  } = usePagination(protocols);

  // Helper function to generate a unique clone name
  const generateCloneName = (originalName: string): string => {
    const basePattern = /^(.+?)(?:\s*\((\d+)\))?$/;
    const match = originalName.match(basePattern);
    const baseName = match ? match[1] : originalName;

    const existingNames = protocols.map((p) => p.name);
    let counter = 1;
    let newName = `${baseName} (${counter})`;

    while (existingNames.includes(newName)) {
      counter++;
      newName = `${baseName} (${counter})`;
    }

    return newName;
  };

  // Handle clone protocol
  const handleCloneProtocol = (protocol: BravoProtocol) => {
    const clonedProtocol: BravoProtocol = {
      ...protocol,
      id: Date.now(), // Temporary ID, will be replaced by backend
      name: generateCloneName(protocol.name),
      commands: [...protocol.commands], // Deep copy of commands array
    };

    onCloneProtocol(clonedProtocol);
  };

  // Select the first protocol on initial load if available
  useEffect(() => {
    if (protocols.length > 0 && !selectedProtocol) {
      setSelectedProtocol(protocols[0]);
    }
  }, [protocols, selectedProtocol]);

  // Update selected protocol when protocols change
  useEffect(() => {
    if (selectedProtocol) {
      const updatedProtocol = protocols.find((p) => p.id === selectedProtocol.id);
      if (updatedProtocol && updatedProtocol !== selectedProtocol) {
        setSelectedProtocol(updatedProtocol);
      } else if (!updatedProtocol && protocols.length > 0) {
        setSelectedProtocol(protocols[0]);
      } else if (!updatedProtocol && protocols.length === 0) {
        setSelectedProtocol(null);
      }
    }
  }, [protocols, selectedProtocol]);

  const handleProtocolClick = (protocol: BravoProtocol) => {
    setSelectedProtocol(protocol);
    setExpandedCommandIndex(null);
  };

  const handleProtocolUpdate = async (protocol: BravoProtocol) => {
    try {
      await onUpdateProtocol(protocol);
      const updatedProtocol = { ...protocol };
      setSelectedProtocol(updatedProtocol);
    } catch (error) {
      console.error("Failed to update protocol:", error);
    }
  };

  const handleDeleteClick = (protocol: BravoProtocol) => {
    setProtocolToDelete(protocol);
  };

  const handleDeleteConfirm = () => {
    if (protocolToDelete) {
      onDelete(protocolToDelete.id!);
      setProtocolToDelete(null);
      if (selectedProtocol?.id === protocolToDelete.id) {
        if (protocols.length > 1) {
          const nextProtocol = protocols.find((p) => p.id !== protocolToDelete.id);
          if (nextProtocol) {
            setSelectedProtocol(nextProtocol);
          }
        } else {
          setSelectedProtocol(null);
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
            Bravo Protocols
          </Heading>
          <HStack>
            <Button
              leftIcon={<DeleteIcon />}
              size="sm"
              onClick={onDeleteAll}
              colorScheme="red"
              variant="outline">
              Delete All
            </Button>
            <Button leftIcon={<AddIcon />} size="sm" onClick={onCreateNew} colorScheme="blue">
              New Protocol
            </Button>
          </HStack>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          {protocols.length > 0 ? (
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
                        <Th textAlign="right" width="80px" bg={headerBgColor} color={textColor}>
                          Actions
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginatedItems.map((protocol) => (
                        <Tr
                          key={protocol.id}
                          onClick={() => handleProtocolClick(protocol)}
                          cursor="pointer"
                          bg={selectedProtocol?.id === protocol.id ? bgColorAlpha : "transparent"}
                          _hover={{ bg: hoverBgColor }}>
                          <Td>
                            <EditableText
                              defaultValue={protocol.name}
                              preview={<Text fontSize="xs">{protocol.name}</Text>}
                              onSubmit={(value) => {
                                if (value) {
                                  handleProtocolUpdate({ ...protocol, name: value });
                                }
                              }}
                            />
                          </Td>
                          <Td maxW="60px" textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Protocol actions"
                                  icon={<HamburgerIcon />}
                                  size="xs"
                                  variant="outline"
                                  borderColor={borderColor}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <MenuList onClick={(e) => e.stopPropagation()}>
                                  <MenuItem
                                    icon={<FaPlay />}
                                    onClick={() => setProtocolToRun(protocol)}>
                                    Run Protocol
                                  </MenuItem>
                                  <MenuItem
                                    icon={<CopyIcon />}
                                    onClick={() => handleCloneProtocol(protocol)}>
                                    Clone Protocol
                                  </MenuItem>
                                  <MenuDivider />
                                  <MenuItem
                                    icon={<DeleteIcon />}
                                    color="red.500"
                                    onClick={() => handleDeleteClick(protocol)}>
                                    Delete Protocol
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
                {selectedProtocol ? (
                  <BravoCommandList
                    commands={selectedProtocol.commands || []}
                    protocolName={selectedProtocol.name}
                    onDelete={() => handleDeleteClick(selectedProtocol)}
                    onCommandsChange={async (updatedCommands) => {
                      try {
                        await handleProtocolUpdate({
                          ...selectedProtocol,
                          commands: updatedCommands,
                        });
                      } catch (error) {
                        console.error("Failed to update protocol commands:", error);
                      }
                    }}
                    onProtocolNameChange={async (newName) => {
                      try {
                        await handleProtocolUpdate({
                          ...selectedProtocol,
                          name: newName,
                        });
                      } catch (error) {
                        console.error("Failed to update protocol name:", error);
                      }
                    }}
                    expandedCommandIndex={expandedCommandIndex}
                    onCommandClick={(index) => {
                      setExpandedCommandIndex(expandedCommandIndex === index ? null : index);
                    }}
                    config={config}
                  />
                ) : (
                  <EmptyState
                    title="No Protocol Selected"
                    description="Please select a protocol from the list to view and edit its commands."
                  />
                )}
              </GridItem>
            </Grid>
          ) : (
            <EmptyState
              title="No Protocols Found"
              description="Create a new protocol to get started."
            />
          )}
        </Box>
      </VStack>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={protocols.length}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />

      <AlertDialog
        isOpen={protocolToDelete !== null}
        leastDestructiveRef={cancelRef}
        onClose={() => setProtocolToDelete(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Protocol
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the protocol &quot;{protocolToDelete?.name}&quot;?
              This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setProtocolToDelete(null)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Run Protocol Confirmation Dialog */}
      <AlertDialog
        isOpen={protocolToRun !== null}
        leastDestructiveRef={runConfirmRef}
        onClose={() => setProtocolToRun(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Run Protocol
            </AlertDialogHeader>
            <AlertDialogBody>
              {protocolToRun?.commands && protocolToRun.commands.length > 0 ? (
                <Box>
                  <Text>
                    Are you sure you want to run the protocol &quot;{protocolToRun?.name}&quot;?
                  </Text>
                  This protocol contains {protocolToRun.commands.length} command
                  {protocolToRun.commands.length !== 1 ? "s" : ""}.
                </Box>
              ) : (
                <Box mt={2} color="yellow.500">
                  Warning: This protocol contains no commands.
                </Box>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={runConfirmRef} onClick={() => setProtocolToRun(null)}>
                Cancel
              </Button>
              <Button
                isDisabled={!protocolToRun?.commands || protocolToRun.commands.length === 0}
                colorScheme="blue"
                onClick={() => {
                  if (protocolToRun) {
                    onRun(protocolToRun);
                    setProtocolToRun(null);
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
