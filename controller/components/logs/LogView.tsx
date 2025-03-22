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
import { useEffect, useState, useMemo } from "react";
import { Log } from "@/types/api";
import { renderDatetime } from "../ui/Time";
import { PageHeader } from "@/components/ui/PageHeader";
import { palette, semantic } from "../../themes/colors";
import {
  CloseIcon,
  WarningIcon,
  QuestionOutlineIcon,
  SearchIcon,
  InfoIcon,
  BookIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../ui/Icons";
import tokens from "../../themes/tokens";

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
      return <Icon as={CloseIcon} color={semantic.status.error.light} style={iconStyle} />;
    case "warning":
      return <Icon as={WarningIcon} color={semantic.status.warning.light} style={iconStyle} />;
    case "debug":
      return <Icon as={QuestionOutlineIcon} color={semantic.status.info.light} style={iconStyle} />;
    case "info":
      return <Icon as={InfoIcon} color={semantic.text.accent.light} style={iconStyle} />;
  }
}

export const LogView: React.FC<LogViewProps> = ({}) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [limit, setLimit] = useState<number>(25);
  const [offset, setOffset] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const headerBg = useColorModeValue(semantic.background.card.light, semantic.background.card.dark);
  const tableBgColor = useColorModeValue(
    semantic.background.card.light,
    semantic.background.card.dark,
  );
  const hoverBgColor = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);

  const hasPrevious = offset > 0;
  const hasNext = logs.length === limit || false;

  const { data: fetchedLogs, refetch } = trpc.logging.getPaginated.useQuery(
    {
      limit: limit,
      skip: offset,
      descending: true,
    },
    {
      refetchInterval: 1000,
    },
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
      <VStack spacing={tokens.spacing.md} align="stretch">
        <Card
          bg={headerBg}
          shadow={tokens.shadows.md}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}>
          <CardBody>
            <VStack spacing={tokens.spacing.md} align="stretch">
              <PageHeader
                title="Logs"
                subTitle="Monitor and analyze system logs"
                titleIcon={<Icon as={BookIcon} boxSize={8} color={accentColor} />}
              />
              <Divider borderColor={borderColor} />
              <StatGroup>
                <Stat>
                  <StatLabel color={textSecondary}>Total Logs</StatLabel>
                  <StatNumber color={textColor}>{totalLogs}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color={textSecondary}>Errors</StatLabel>
                  <StatNumber color={semantic.status.error.light}>{errorCount}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color={textSecondary}>Warnings</StatLabel>
                  <StatNumber color={semantic.status.warning.light}>{warningCount}</StatNumber>
                </Stat>
              </StatGroup>
              <Divider borderColor={borderColor} />
              <HStack spacing={tokens.spacing.md}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={SearchIcon} color={textSecondary} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={tableBgColor}
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </InputGroup>
                <Select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  maxW="200px"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                  color={textColor}>
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

        <Card
          bg={headerBg}
          shadow={tokens.shadows.md}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}>
          <CardBody>
            <VStack spacing={tokens.spacing.md} align="stretch">
              <Box overflowX="auto">
                <Table
                  variant="simple"
                  sx={{
                    th: {
                      borderColor: borderColor,
                      color: textSecondary,
                      fontSize: tokens.typography.fontSizes.sm,
                    },
                    td: {
                      borderColor: borderColor,
                      color: textColor,
                      fontSize: tokens.typography.fontSizes.sm,
                    },
                  }}>
                  <Thead>
                    <Tr>
                      <Th p={tokens.spacing.xs}></Th>
                      <Th p={tokens.spacing.xs}>Level</Th>
                      <Th p={tokens.spacing.xs}>Actions</Th>
                      <Th p={tokens.spacing.xs}>Details</Th>
                      <Th p={tokens.spacing.xs}>Created On</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredLogs.map((log, index) => (
                      <Tr key={index} _hover={{ bg: hoverBgColor }}>
                        <Td p={tokens.spacing.xs}>{getIconFromLogType(log.level)}</Td>
                        <Td p={tokens.spacing.xs}>{log.level}</Td>
                        <Td p={tokens.spacing.xs}>{log.action}</Td>
                        <Td p={tokens.spacing.xs}>{log.details}</Td>
                        <Td p={tokens.spacing.xs}>{renderDatetime(String(log.created_at))}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              <HStack justify="flex-end" spacing={tokens.spacing.md}>
                <Text color={textSecondary} fontSize={tokens.typography.fontSizes.sm}>
                  Per Page:
                </Text>
                <Select
                  value={limit}
                  width="75px"
                  size="sm"
                  onChange={(e) => setLimit(Number(e.target.value))}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                  color={textColor}>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>
                <Button
                  size="sm"
                  disabled={!hasPrevious}
                  onClick={() => setOffset(Math.max(offset - limit, 0))}
                  leftIcon={<Icon as={ChevronLeftIcon} />}
                  bg={hasPrevious ? accentColor : "transparent"}
                  color={hasPrevious ? "white" : textSecondary}
                  borderColor={borderColor}
                  borderWidth={tokens.borders.widths.thin}
                  _hover={{
                    bg: hasPrevious ? `${accentColor}90` : `${semantic.background.hover.light}50`,
                  }}>
                  Previous
                </Button>
                <Button
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => setOffset(offset + limit)}
                  rightIcon={<Icon as={ChevronRightIcon} />}
                  bg={hasNext ? accentColor : "transparent"}
                  color={hasNext ? "white" : textSecondary}
                  borderColor={borderColor}
                  borderWidth={tokens.borders.widths.thin}
                  _hover={{
                    bg: hasNext ? `${accentColor}90` : `${semantic.background.hover.light}50`,
                  }}>
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
