import { trpc } from "@/utils/trpc";
import {
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  Td,
  VStack,
  Box,
  Button,
  Select,
  Card,
  CardBody,
  Icon,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  HStack,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Input,
  Text,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
} from "@chakra-ui/react";
import { CloseIcon, WarningIcon, QuestionOutlineIcon, SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { Log } from "@/types";
import { renderDatetime } from "../ui/Time";
import { Info, Book } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

interface LogViewProps {}

function getIconFromLogType(logType: string) {
  const iconStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "18x",
    height: "18px",
    padding: "2px",
  };

  switch (logType) {
    case "error":
      return <CloseIcon color="red" style={iconStyle} />;
    case "warning":
      return <WarningIcon color="orange" style={iconStyle} />;
    case "debug":
      return <QuestionOutlineIcon color="yellow" style={iconStyle} />;
    case "info":
      return <Info style={iconStyle} />;
  }
}

function getColorForLevel(level: string): string {
  switch (level) {
    case "error":
      return "red.400";
    case "warning":
      return "orange.400";
    case "info":
      return "blue.400";
    case "debug":
      return "gray.400";
    default:
      return "gray.100";
  }
}

function formatConsoleTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export const LogView: React.FC<LogViewProps> = ({}) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [limit, setLimit] = useState<number>(25);
  const [offset, setOffset] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const headerBg = useColorModeValue("white", "gray.700");
  const tableBgColor = useColorModeValue("white", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.600");

  // Get filters object for queries
  const filters = {
    level: selectedLevel || undefined,
    action: searchQuery || undefined,
  };

  const { data: fetchedLogs, refetch } = trpc.logging.getPaginated.useQuery(
    {
      limit: limit,
      skip: offset,
      descending: true,
      filters: filters,
    },
    {
      refetchInterval: 1000,
    },
  );

  // Get total count with same filters
  const { data: totalCount } = trpc.logging.count.useQuery(
    { filters: filters },
    {
      refetchInterval: 1000,
    },
  );

  useEffect(() => {
    if (fetchedLogs) {
      setLogs(fetchedLogs);
    }
  }, [fetchedLogs]);

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [searchQuery, selectedLevel, limit]);

  // Calculate pagination info
  const total = totalCount || 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const startRecord = total === 0 ? 0 : offset + 1;
  const endRecord = Math.min(offset + limit, total);

  const hasPrevious = offset > 0;
  const hasNext = offset + limit < total;

  // Calculate stats from current page
  const errorCount = logs.filter((log) => log.level === "error").length;
  const warningCount = logs.filter((log) => log.level === "warning").length;

  const handlePrevious = () => {
    setOffset(Math.max(offset - limit, 0));
  };

  const handleNext = () => {
    if (hasNext) {
      setOffset(offset + limit);
    }
  };

  const handleFirstPage = () => {
    setOffset(0);
  };

  const handleLastPage = () => {
    setOffset((totalPages - 1) * limit);
  };

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Logs"
                subTitle="Monitor and analyze system logs"
                titleIcon={<Icon as={Book} boxSize={8} color="teal.500" />}
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Logs</StatLabel>
                  <StatNumber>{total}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Errors (Page)</StatLabel>
                  <StatNumber color="red.500">{errorCount}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Warnings (Page)</StatLabel>
                  <StatNumber color="orange.500">{warningCount}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Current Page</StatLabel>
                  <StatNumber>
                    {currentPage} / {totalPages || 1}
                  </StatNumber>
                </Stat>
              </StatGroup>
              <Divider />
              <HStack spacing={4}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={tableBgColor}
                  />
                </InputGroup>
                <Select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  maxW="200px">
                  <option value="">All Levels</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </Select>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  Showing {startRecord} - {endRecord} of {total} logs
                </Text>
                {(searchQuery || selectedLevel) && (
                  <Badge colorScheme="blue">
                    Filtered {selectedLevel && `by ${selectedLevel}`}
                  </Badge>
                )}
              </HStack>

              <Tabs variant="enclosed" colorScheme="teal">
                <TabList>
                  <Tab>Console</Tab>
                  <Tab>Table</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <Box
                      bg="gray.900"
                      color="gray.100"
                      fontFamily="mono"
                      fontSize="sm"
                      p={4}
                      borderRadius="md"
                      maxHeight="1000px"
                      overflowY="auto">
                      {logs.length === 0 ? (
                        <Text color="gray.500">No logs found</Text>
                      ) : (
                        logs.map((log, index) => (
                          <Text key={log.id || index} color={getColorForLevel(log.level)} py={0.5}>
                            [{formatConsoleTime(String(log.createdAt))}] [
                            {log.level.toUpperCase().padEnd(7)}] {log.action}: {log.details}
                          </Text>
                        ))
                      )}
                    </Box>
                  </TabPanel>
                  <TabPanel px={0}>
                    <Box overflowX="auto">
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
                            <Th p={1}></Th>
                            <Th p={1}>Level</Th>
                            <Th p={1}>Actions</Th>
                            <Th p={1}>Details</Th>
                            <Th p={1}>Created On</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {logs.length === 0 ? (
                            <Tr>
                              <Td colSpan={5} textAlign="center" py={8}>
                                <Text color="gray.500">No logs found</Text>
                              </Td>
                            </Tr>
                          ) : (
                            logs.map((log, index) => (
                              <Tr key={log.id || index} _hover={{ bg: hoverBgColor }}>
                                <Td p={1}>{getIconFromLogType(log.level)}</Td>
                                <Td p={1}>{log.level}</Td>
                                <Td p={1}>{log.action}</Td>
                                <Td maxWidth={"900px"} p={1}>
                                  {log.details}
                                </Td>
                                <Td p={1}>{renderDatetime(String(log.createdAt))}</Td>
                              </Tr>
                            ))
                          )}
                        </Tbody>
                      </Table>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Text fontSize="sm">Per Page:</Text>
                  <Select
                    value={limit}
                    width="75px"
                    size="sm"
                    onChange={(e) => setLimit(Number(e.target.value))}>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Select>
                </HStack>

                <HStack spacing={2}>
                  <Button
                    size="sm"
                    isDisabled={!hasPrevious}
                    onClick={handleFirstPage}
                    variant="ghost">
                    First
                  </Button>
                  <Button size="sm" isDisabled={!hasPrevious} onClick={handlePrevious}>
                    Previous
                  </Button>

                  <Text fontSize="sm" px={2}>
                    Page {currentPage} of {totalPages || 1}
                  </Text>

                  <Button size="sm" isDisabled={!hasNext} onClick={handleNext}>
                    Next
                  </Button>
                  <Button size="sm" isDisabled={!hasNext} onClick={handleLastPage} variant="ghost">
                    Last
                  </Button>
                </HStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
