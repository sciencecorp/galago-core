import { Protocol } from "@/types/api";
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
  Heading,
  useToast,
  Tag,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon, ChevronDownIcon, ArrowUpDownIcon } from "@chakra-ui/icons";
import { useState, useMemo } from "react";
import { ProtocolManager } from "./ProtocolManager";
import Link from "next/link";
import { useRouter } from "next/router";
import { DeleteWithConfirmation } from "@/components/UI/Delete";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import NewProtocolRunModal from "./NewProtocolRunModal";
import { trpc } from "@/utils/trpc";
type SortField = "name" | "category" | "workcell" | "number_of_commands";
type SortOrder = "asc" | "desc";

export const ProtocolPageComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [workcellFilter, setWorkcellFilter] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [runModalProtocolId, setRunModalProtocolId] = useState<string | null>(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const tableBgColor = useColorModeValue("white", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.600");

  const router = useRouter();
  const toast = useToast();
  const workcellName = "Cell Culture Workcell";
  const { data: protocols, isLoading, isError } = trpc.protocol.allNames.useQuery({ workcellName });

  // Get unique workcells and categories for filters
  const uniqueWorkcells = useMemo(() => {
    const workcells = new Set(protocols?.map((p) => p.workcell));
    return Array.from(workcells);
  }, [protocols]);

  const categories = ["development", "qc", "production"];

  // Enhanced filtering
  const filteredProtocols = useMemo(() => {
    return protocols?.filter((protocol) => {
      const matchesSearch =
        protocol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        protocol.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !categoryFilter || protocol.category === categoryFilter;
      const matchesWorkcell = !workcellFilter || protocol.workcell === workcellFilter;

      return matchesSearch && matchesCategory && matchesWorkcell;
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

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
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

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      p={6}
      color={textColor}
      borderColor={borderColor}
      borderWidth="1px">
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading size="lg">Protocols</Heading>
          <Button colorScheme="teal" onClick={() => router.push("/protocols/new")}>
            New Protocol
          </Button>
        </HStack>

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
              <option key={workcell} value={workcell}>
                {workcell}
              </option>
            ))}
          </Select>
        </HStack>

        <Table variant="simple">
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
              {/* <Th cursor="pointer" onClick={() => handleSort("created_at")}>
                <HStack spacing={2}>
                  <span>Created At</span>
                  {sortField === "created_at" && (
                    <ArrowUpDownIcon 
                      transform={sortOrder === "desc" ? "rotate(180deg)" : undefined}
                    />
                  )}
                </HStack>
              </Th> */}
              <Th cursor="pointer" onClick={() => handleSort("number_of_commands")}>
                <HStack spacing={2}>
                  <span>Commands</span>
                  {sortField === "number_of_commands" && (
                    <ArrowUpDownIcon
                      transform={sortOrder === "desc" ? "rotate(180deg)" : undefined}
                    />
                  )}
                </HStack>
              </Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedProtocols.map((protocol) => (
              <Tr key={protocol.id} _hover={{ bg: hoverBgColor }}>
                <Td>
                  <Link href={`/protocols/${protocol.id}`}>{protocol.name}</Link>
                </Td>
                <Td>
                  <Tag colorScheme={getCategoryColor(protocol.category)}>{protocol.category}</Tag>
                </Td>
                <Td>{protocol.workcell}</Td>
                <Td>{protocol.description}</Td>
                {/* <Td>{protocol.created_at}</Td> */}
                <Td>{protocol.number_of_commands}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleRunClick(protocol.id.toString())}>
                      Run
                    </Button>
                    <Button size="sm" onClick={() => router.push(`/protocols/${protocol.id}/edit`)}>
                      Edit
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>

      {runModalProtocolId && (
        <NewProtocolRunModal id={runModalProtocolId} onClose={handleRunModalClose} />
      )}
    </Box>
  );
};
