import { NewProtocolForm } from "./NewProtocolForm";
import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Tag,
  Select,
  useColorModeValue,
  Card,
  CardBody,
  Icon,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ArrowUpDownIcon,
  HamburgerIcon,
  DownloadIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import NewProtocolRunModal from "./NewProtocolRunModal";
import { trpc } from "@/utils/trpc";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  GitBranch, // replaces PiPathBold
  Plus, // replaces RiAddFill
  Upload, // replaces FaFileImport
  Play, // replaces FaPlay
} from "lucide-react";
import { EditableText } from "../ui/Form";
import { errorToast, successToast } from "../ui/Toast";
import { downloadFile, uploadFile } from "@/server/utils/api";

type SortField = "name" | "category";
type SortOrder = "asc" | "desc";

export const ProtocolPageComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [workcellFilter, setWorkcellFilter] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [runModalProtocolId, setRunModalProtocolId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    isOpen: isNewProtocolOpen,
    onOpen: onNewProtocolOpen,
    onClose: onNewProtocolClose,
  } = useDisclosure();

  const headerBg = useColorModeValue("white", "gray.700");
  const tableBgColor = useColorModeValue("white", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.600");

  const { data: workcellName } = trpc.workcell.getSelectedWorkcell.useQuery();
  const {
    data: protocols,
    isLoading,
    isError,
    refetch,
  } = trpc.protocol.allNames.useQuery({ workcellName: workcellName || "" });
  const { data: workcells } = trpc.workcell.getAll.useQuery();
  const deleteMutation = trpc.protocol.delete.useMutation({
    onSuccess: () => {
      successToast("Protocol deleted", "");
      refetch(); // Refresh the protocols list
    },
    onError: (error) => {
      errorToast("Error deleting protocol", error.message);
    },
  });

  const updateProtocol = trpc.protocol.update.useMutation({
    onSuccess: () => {
      successToast("Protocol updated", "");
      refetch();
    },
    onError: (error) => {
      errorToast("Error updating protocol", error.message);
    },
  });

  // Get unique workcells and categories for filters
  const uniqueWorkcells = useMemo(() => {
    if (!protocols || !workcells) return [];
    // Get unique workcell IDs from protocols
    const workcellIds = new Set(protocols.map((p) => p.workcell_id));
    // Filter workcells to only include those that are actually in use
    const usedWorkcells = workcells.filter((w) => workcellIds.has(w.id));
    return usedWorkcells;
  }, [protocols, workcells]);

  // Get unique categories actually in use
  const uniqueCategories = useMemo(() => {
    if (!protocols) return [];
    const categories = new Set(protocols.map((p) => p.category));
    return Array.from(categories);
  }, [protocols]);

  const categories = ["development", "qc", "production"];

  // Enhanced filtering
  const filteredProtocols = useMemo(() => {
    return protocols?.filter((protocol) => {
      const matchesSearch =
        protocol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        protocol.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !categoryFilter || protocol.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [protocols, searchQuery, categoryFilter, workcellFilter]);

  // Sorting
  const sortedProtocols = useMemo(() => {
    if (!filteredProtocols) return [];

    return [...filteredProtocols].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortOrder === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });
  }, [filteredProtocols, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case "development":
        return "purple";
      case "qc":
        return "blue";
      case "production":
        return "green";
      default:
        return "gray";
    }
  };

  const handleRunClick = (protocolId: string) => {
    setRunModalProtocolId(protocolId);
  };

  const handleRunModalClose = () => {
    setRunModalProtocolId(null);
  };

  const handleDelete = async (protocolId: string) => {
    // Check if it's a TypeScript protocol (non-numeric ID)
    if (isNaN(parseInt(protocolId))) {
      errorToast(
        "Cannot Delete",
        "TypeScript-based protocols cannot be deleted as they are part of the codebase. Only database protocols can be deleted.",
      );
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: parseInt(protocolId) });
    } catch (error) {
      // Error is handled in onError callback above
    }
  };

  const getWorkcellName = (workcellId: number) => {
    const workcell = workcells?.find((w) => w.id === workcellId);
    return workcell?.name || workcellId;
  };

  const handleUpdateProtocol = (protocolId: number, updates: any) => {
    updateProtocol.mutate({
      id: protocolId,
      data: updates,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);

      // Get the current workcell ID
      const currentWorkcell = workcells?.find((w) => w.name === workcellName);
      if (!currentWorkcell) {
        throw new Error("No workcell selected");
      }

      // Use the uploadFile utility
      await uploadFile("/protocols/import", file, {
        workcell_id: currentWorkcell.id,
      });

      successToast("Protocol Imported", "Protocol has been imported successfully");
      refetch();
    } catch (error: any) {
      errorToast("Import Failed", error.message || "Failed to import protocol");
    } finally {
      setIsImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExportProtocol = async (protocolId: number) => {
    try {
      setIsExporting(true);
      const protocol = protocols?.find((p) => p.id === protocolId);
      if (!protocol) {
        throw new Error("Protocol not found");
      }

      // Use the downloadFile utility
      const filename = `${protocol.name.replace(/\s+/g, "_")}-protocol.json`;
      await downloadFile(`/protocols/${protocolId}/export`, filename);

      successToast("Protocol Exported", `${protocol.name} has been exported successfully`);
    } catch (error: any) {
      errorToast("Export Failed", error.message || "Failed to export protocol");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch" minH="100vh" pb={8}>
      <Card bg={headerBg} shadow="md">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <PageHeader
              title="Protocols"
              subTitle="Manage and run your automation protocols"
              titleIcon={<Icon as={GitBranch} boxSize={8} color="teal.500" />}
              mainButton={
                <HStack>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    leftIcon={<Upload size={14} />}
                    onClick={handleImportClick}
                    isLoading={isImporting}
                    isDisabled={isImporting}>
                    Import
                  </Button>
                  <Button
                    colorScheme="teal"
                    leftIcon={<Plus size={14} />}
                    onClick={onNewProtocolOpen}>
                    New Protocol
                  </Button>
                </HStack>
              }
            />

            <Divider />

            <StatGroup>
              <Stat>
                <StatLabel>Total Protocols</StatLabel>
                <StatNumber>{protocols?.length || 0}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Categories in Use</StatLabel>
                <StatNumber>{uniqueCategories.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Workcells in Use</StatLabel>
                <StatNumber>{uniqueWorkcells.length}</StatNumber>
              </Stat>
            </StatGroup>

            <Divider />

            <HStack spacing={4}>
              <InputGroup maxW="400px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search protocols..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={tableBgColor}
                />
              </InputGroup>

              <Select
                placeholder="All Categories"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                maxW="200px"
                bg={tableBgColor}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Select>

              <Select
                placeholder="All Workcells"
                value={workcellFilter}
                onChange={(e) => setWorkcellFilter(e.target.value)}
                maxW="200px"
                bg={tableBgColor}>
                {uniqueWorkcells.map((workcell) => (
                  <option key={workcell.id} value={workcell.id.toString()}>
                    {workcell.name}
                  </option>
                ))}
              </Select>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <Card bg={headerBg} shadow="md" flex={1}>
        <CardBody>
          <VStack align="stretch" spacing={4} height="100%">
            <Box overflowX="auto" flex={1}>
              <Table
                variant="simple"
                sx={{
                  th: {
                    borderColor: useColorModeValue("gray.200", "gray.600"),
                  },
                  td: {
                    borderColor: useColorModeValue("gray.200", "gray.600"),
                  },
                }}>
                <Thead>
                  <Tr>
                    <Th cursor="pointer" onClick={() => handleSort("name")}>
                      <HStack spacing={2}>
                        <span>Name</span>
                        {sortField === "name" && (
                          <ArrowUpDownIcon
                            transform={sortOrder === "desc" ? "rotate(180deg)" : undefined}
                          />
                        )}
                      </HStack>
                    </Th>
                    <Th>Category</Th>
                    <Th>Workcell</Th>
                    <Th>Description</Th>
                    <Th>Commands</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedProtocols.map((protocol, index) => (
                    <Tr key={index} _hover={{ bg: hoverBgColor }}>
                      <Td>
                        <EditableText
                          defaultValue={protocol.name}
                          preview={<Link href={`/protocols/${protocol.id}`}>{protocol.name}</Link>}
                          onSubmit={(value) => {
                            if (value && value !== protocol.name) {
                              handleUpdateProtocol(protocol.id, { name: value });
                            }
                          }}
                        />
                      </Td>
                      <Td>
                        <Popover placement="bottom" closeOnBlur={true}>
                          <PopoverTrigger>
                            <Tag
                              colorScheme={getCategoryColor(protocol.category)}
                              cursor="pointer"
                              _hover={{ opacity: 0.8 }}>
                              {protocol.category}
                            </Tag>
                          </PopoverTrigger>
                          <PopoverContent width="fit-content">
                            <PopoverBody>
                              <VStack align="stretch" spacing={2}>
                                {categories.map((category) => (
                                  <Button
                                    key={category}
                                    size="sm"
                                    variant={category === protocol.category ? "solid" : "ghost"}
                                    colorScheme={getCategoryColor(category)}
                                    onClick={() => {
                                      if (category !== protocol.category) {
                                        handleUpdateProtocol(protocol.id, { category });
                                      }
                                    }}>
                                    {category}
                                  </Button>
                                ))}
                              </VStack>
                            </PopoverBody>
                          </PopoverContent>
                        </Popover>
                      </Td>
                      <Td>
                        <Popover placement="bottom" closeOnBlur={true}>
                          <PopoverTrigger>
                            <Text cursor="pointer" _hover={{ color: "blue.500" }}>
                              {getWorkcellName(protocol.workcell_id)}
                            </Text>
                          </PopoverTrigger>
                          <PopoverContent width="fit-content">
                            <PopoverBody>
                              <VStack align="stretch" spacing={2}>
                                {workcells?.map((workcell) => (
                                  <Button
                                    key={workcell.id}
                                    size="sm"
                                    variant={
                                      workcell.id === protocol.workcell_id ? "solid" : "ghost"
                                    }
                                    onClick={() => {
                                      if (workcell.id !== protocol.workcell_id) {
                                        handleUpdateProtocol(protocol.id, {
                                          workcell_id: workcell.id,
                                        });
                                      }
                                    }}>
                                    {workcell.name}
                                  </Button>
                                ))}
                              </VStack>
                            </PopoverBody>
                          </PopoverContent>
                        </Popover>
                      </Td>
                      <Td>
                        <EditableText
                          defaultValue={protocol.description || ""}
                          preview={<Text>{protocol.description || "-"}</Text>}
                          onSubmit={(value) => {
                            if (value !== protocol.description) {
                              handleUpdateProtocol(protocol.id, { description: value });
                            }
                          }}
                        />
                      </Td>
                      <Td>{protocol.commands.length}</Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<HamburgerIcon />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              onClick={() => handleRunClick(protocol.id.toString())}
                              color="green.500"
                              icon={<Icon as={Play} />}>
                              Run
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleExportProtocol(protocol.id)}
                              color="blue.500"
                              icon={<DownloadIcon />}>
                              Export
                            </MenuItem>
                            <MenuItem
                              color="red.500"
                              onClick={() => handleDelete(protocol.id.toString())}
                              icon={<DeleteIcon />}>
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
          </VStack>
        </CardBody>
      </Card>

      {runModalProtocolId && (
        <NewProtocolRunModal id={runModalProtocolId} onClose={handleRunModalClose} />
      )}

      <Modal isOpen={isNewProtocolOpen} onClose={onNewProtocolClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Protocol</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <NewProtocolForm />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileSelect}
        display="none"
      />
    </VStack>
  );
};
