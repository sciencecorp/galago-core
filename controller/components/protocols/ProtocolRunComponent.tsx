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
  VStack,
} from "@chakra-ui/react";
import moment from "moment-timezone";

import CommandComponent from "./CommandComponent";

export function ProtocolRunComponent({ id }: { id: string }) {
  const run = trpc.run.get.useQuery({ id });

  if (run.isLoading) return <div>Loading...</div>;
  if (run.isError) return <div>Error: {run.error.message}</div>;

  const commandList = run.data?.commands || [];
  const durationSum = commandList.reduce(
    (acc, cur) => acc + (cur.estimatedDuration ?? 0),
    0
  );

  return (
    <VStack align="start" spacing={8} width="100%">
      <HStack justify="space-between" width="100%">
        <Heading size="lg">Protocol Run {id}</Heading>
        <HStack spacing={2}>
          <Text>Duration:</Text>
          <Tag>
            {moment
              .utc(moment.duration(durationSum, "seconds").asMilliseconds())
              .format("H:mm:ss")}
          </Tag>
        </HStack>
      </HStack>
      <Table mt={8}>
        <Thead>
          <Tr>
            <Th>Tool Type</Th>
            <Th>Command</Th>
            <Th>Params</Th>
            <Th>Duration</Th>
            <Th>Execute</Th>
            <Th>Response</Th>
          </Tr>
        </Thead>
        <Tbody>
          {commandList.map((command, i) => {
            return <CommandComponent key={command.queueId} command={command} />;
          })}
        </Tbody>
      </Table>
    </VStack>
  );
}
