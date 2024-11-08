import { trpc } from "@/utils/trpc";
import {
  Heading,
  HStack,
  Spinner,
  Switch,
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
} from "@chakra-ui/react";
import { InfoOutlineIcon, CloseIcon, WarningIcon, QuestionOutlineIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { Log } from "@/types/api";
import { renderDatetime } from "../ui/Time";

import { VscRefresh } from "react-icons/vsc";

interface LogViewProps {}

function getIconFromLogType(logType: string) {
  switch (logType) {
    case "error":
      return <CloseIcon color="red" />;
    case "warning":
      return <WarningIcon color="red" />;
    case "debug":
      return <QuestionOutlineIcon color="red" />;
    case "info":
      return <InfoOutlineIcon color="blue" />;
  }
}

export const LogView: React.FC<LogViewProps> = ({}) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [limit, setLimit] = useState<number>(25);
  const [offset, setOffset] = useState<number>(0);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const hasPrevious = offset > 0;
  const hasNext = logs.length === limit || false;

  const { data: fetchedLogs, refetch } = trpc.logging.getPaginated.useQuery({
    limit: limit,
    skip: offset,
    descending: true,
  });

  useEffect(() => {
    if (fetchedLogs) {
      setLogs(fetchedLogs);
    }
  }, [fetchedLogs, offset, limit]);

  const handleNext = () => {
    if (hasNext) {
      setOffset(offset + limit);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      setOffset(Math.max(offset - limit, 0));
    }
  };

  const handleLimitChange = (e: number) => {
    setLimit(e);
  };

  return (
    <VStack spacing={1} p={4} maxHeight="calc(100vh - 80px)" overflowY="auto" mt={10}>
      <HStack justify="space-between" width="100%">
        <Heading>Logs</Heading>
        <Button onClick={() => refetch()} colorScheme="teal" leftIcon={<VscRefresh />}>
          Refresh
        </Button>
      </HStack>
      <HStack margin="10px"></HStack>
      {/* <HStack>
          <Button
            onClick={() => {
              selectedFilter === "info" ? setSelectedFilter(null) : setSelectedFilter("info");
            }}
            colorScheme={selectedFilter == "info" ? "blue" : "gray"}>
            INFO
          </Button>
          <Button
            onClick={() => {
              selectedFilter === "debug" ? setSelectedFilter(null) : setSelectedFilter("debug");
            }}
            colorScheme={selectedFilter == "debug" ? "orange" : "gray"}>
            DEBUG
          </Button>
          <Button
            onClick={() => {
              selectedFilter === "error" ? setSelectedFilter(null) : setSelectedFilter("error");
            }}
            colorScheme={selectedFilter === "error" ? "red" : "gray"}>
            ERROR
          </Button>
        </HStack> */}
      <Table mt={8}>
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
          {logs.map((log, index) => {
            return (
              <Tr key={index} h="50px">
                <Td p={1}>{getIconFromLogType(log.level)}</Td>
                <Td p={1}>{log.level}</Td>
                <Td p={1}>{log.action}</Td>
                <Td p={1}>{log.details}</Td>
                <Td p={1}>{renderDatetime(String(log.created_at))}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <HStack>
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
        <Button size="sm" disabled={!hasPrevious} onClick={handlePrevious}>
          Previous
        </Button>
        <Button size="sm" disabled={!hasNext} onClick={handleNext}>
          Next
        </Button>
      </HStack>
    </VStack>
  );
};
