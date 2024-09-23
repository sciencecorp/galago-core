import { trpc } from "@/utils/trpc";
import {
  Heading,
  HStack,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import NewProtocolRunModal from "./NewProtocolRunModal";

export function ProtocolDetailsComponent({ id }: { id: string }) {
  const protocol = trpc.protocol.get.useQuery({ id });
  

  if (protocol.isLoading) return <div>Loading...</div>;
  if (protocol.isError) return <div>Error: {protocol.error.message}</div>;

  const commandList = protocol.data?.commands || [];
  const uiParams = protocol.data?.uiParams || {};

  return (
    <>
      <VStack align="start" spacing={8} width="100%">
        <HStack justify="space-between" width="100%">
          <Heading size="lg">Protocol: {protocol.data?.id}</Heading>
        </HStack>
        {protocol.data && (
          <Wrap>
            <Text>Params:</Text>
            {Object.entries(protocol.data.uiParams).map(([param, paramInfo]) => (
              <Tag key={param}>{param}</Tag>
            ))}
          </Wrap>
        )}
        <Table mt={8}>
          <Thead>
            <Tr>
              <Th>Tool ID</Th>
              <Th>Description</Th>
              <Th>Command</Th>
              <Th>Params</Th>
            </Tr>
          </Thead>
          <Tbody>
            {commandList.map((command, i) => {
              return (
                <Tr key={i}>
                  <Td>{command.toolId}</Td>
                  <Td>{command.label}</Td>
                  <Td>
                    <Tag>{command.command}</Tag>
                  </Td>
                  <Td>
                    <pre style={{ fontSize: "0.8em", whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(command.params, null, 2)}
                    </pre>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </VStack>
    </>
  );
}
