import { trpc } from "@/utils/trpc";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Spinner,
  Box,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Heading,
  Text,
  Input,
  Grid,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState ,  useEffect} from "react";
import { AllNamesOutput } from "@/server/routers/protocol";

export default function ProtocolListComponent({}: {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkcell, setSelectedWorkcell] = useState<string | null>(null);
  const {data:workcellData, refetch} = trpc.workcell.getSelectedWorkcell.useQuery();
  // console.log("Workcell name is"+workcellName);
  const allProtocols = trpc.protocol.allNames.useQuery({ workcellName: selectedWorkcell || "" });
  // console.log("All protocols are"+allProtocols.data);
  if (allProtocols.isLoading) {
    return <Spinner size="lg" />;
  }

  useEffect(() => {
    if(workcellData){
      setSelectedWorkcell(workcellData);
    }
  }, [workcellData]);

  if (allProtocols.isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Could not load protocols</AlertTitle>
      </Alert>
    );
  }

  // Separate protocols by category and apply search term
  const qcProtocols = allProtocols.data.filter(
    (protocol) => protocol.category === "qc" && protocol.id.includes(searchTerm),
  );
  const devProtocols = allProtocols.data.filter(
    (protocol) => protocol.category === "development" && protocol.id.includes(searchTerm),
  );
  const prodProtocols = allProtocols.data.filter(
    (protocol) => protocol.category === "production" && protocol.id.includes(searchTerm),
  );

  // A helper function to render protocol table for a specific category
  const renderProtocolTable = (protocols: AllNamesOutput, categoryName: string) => (
    <Box w={{ base: "100%", md: "32%" }}>
      <Heading size="md" mb={2}>
        {categoryName} Protocols
      </Heading>
      <Table variant="simple" size="md" mt={8}>
        <Thead>
          <Tr>
            <Th>Protocol Name</Th>
            <Th># Commands</Th>
          </Tr>
        </Thead>
        <Tbody>
          {protocols.map((protocol) => (
            <Tr key={protocol.id}>
              <Td>
                <Link href={`/protocols/${protocol.id}`}>
                  <Text fontWeight="semibold">{protocol.id.replaceAll("_", " ")}</Text>
                </Link>
              </Td>
              <Td>{protocol.number_of_commands}</Td>
            </Tr>
          ))}
          {protocols.length === 0 && (
            <Tr>
              <Td colSpan={2}>No protocols in this category.</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );

  return (
    <Box bg="white" borderRadius="lg" p={6}>
      <Input
        type="text"
        placeholder="Search protocols..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        mb={4}
      />
      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
        {renderProtocolTable(qcProtocols, "QC")}
        {renderProtocolTable(devProtocols, "Development")}
        {renderProtocolTable(prodProtocols, "Production")}
      </Grid>
    </Box>
  );
}