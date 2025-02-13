import { trpc } from "@/utils/trpc";
import {
  Table,
  Tag,
  Tbody,
  Text,
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
} from "@chakra-ui/react";
import {
  CloseIcon,
  WarningIcon,
  QuestionOutlineIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { useEffect, useState, useMemo } from "react";
import { Log } from "@/types/api";
import { renderDatetime } from "../ui/Time";
import { FiInfo } from "react-icons/fi";
import { FiBook } from "react-icons/fi";
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
      return <FiInfo style={iconStyle} />;
  }
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

  const hasPrevious = offset > 0;
  const hasNext = logs.length === limit || false;

  const { data: fetchedLogs, refetch } = trpc.logging.getPaginated.useQuery({
    limit: limit,
    skip: offset,
    descending: true,
  },
  { 
    refetchInterval: 1000,
  }
);

  useEffect(() => {
    if (fetchedLogs) {
      setLogs(fetchedLogs);
    }
  }, [fetchedLogs, offset, limit]);

  // Calculate stats
  const totalLogs = logs.length;
  const errorCount = logs.filter((log) => log.level === "error").length;
  const warningCount = logs.filter((log) => log.level === "warning").length;

  // Filter logs based on search and level
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = !selectedLevel || log.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [logs, searchQuery, selectedLevel]);

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Logs"
                subTitle="Monitor and analyze system logs"
                titleIcon={<Icon as={FiBook} boxSize={8} color="teal.500" />}
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Logs</StatLabel>
                  <StatNumber>{totalLogs}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Errors</StatLabel>
                  <StatNumber color="red.500">{errorCount}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Warnings</StatLabel>
                  <StatNumber color="orange.500">{warningCount}</StatNumber>
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
                    {filteredLogs.map((log, index) => (
                      <Tr key={index} _hover={{ bg: hoverBgColor }}>
                        <Td p={1}>{getIconFromLogType(log.level)}</Td>
                        <Td p={1}>{log.level}</Td>
                        <Td p={1}>{log.action}</Td>
                        <Td p={1}>{log.details}</Td>
                        <Td p={1}>{renderDatetime(String(log.created_at))}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <HStack justify="flex-end" spacing={4}>
                <Box>Per Page:</Box>
                <Select
                  value={limit}
                  width="75px"
                  size="sm"
                  onChange={(e) => setLimit(Number(e.target.value))}>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>
                <Button
                  size="sm"
                  disabled={!hasPrevious}
                  onClick={() => setOffset(Math.max(offset - limit, 0))}>
                  Previous
                </Button>
                <Button size="sm" disabled={!hasNext} onClick={() => setOffset(offset + limit)}>
                  Next
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
