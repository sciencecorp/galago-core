import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  VStack,
  Heading,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Text,
  Center,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  Divider,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import { AllNamesOutput } from "@/server/routers/protocol"; // Ensure this type is imported

export const ProtocolCardsComponent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProtocols, setFilteredProtocols] = useState<AllNamesOutput>([]); // Set type here
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProtocol, setSelectedProtocol] = useState("");

  const router = useRouter();

  const workcellData = trpc.workcell.getSelectedWorkcell.useQuery();
  const workcellName = workcellData.data;
  const allProtocols = trpc.protocol.allNames.useQuery({ workcellName: workcellName || "" });

  // Set initial protocols from query result
  useEffect(() => {
    if (allProtocols.data) {
      setFilteredProtocols(allProtocols.data);
    }
  }, [allProtocols.data]);

  useEffect(() => {
    if (!allProtocols.data) return;
    const results = allProtocols.data.filter((protocol) =>
      protocol.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredProtocols(results);
  }, [searchTerm, allProtocols.data]);

  const onStartProtocolButtonClick = (id: string) => {
    router.push(`/protocols/${id}`);
  };

  // Handle loading state
  if (allProtocols.isLoading) {
    return <Spinner size="lg" />;
  }

  // Handle error state
  if (allProtocols.isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Could not load protocols</AlertTitle>
      </Alert>
    );
  }

  return (
    <Center>
      <VStack>
        <Heading>Protocols</Heading>
        <Input
          type="text"
          placeholder="Search protocols..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          mb={4}
        />
        <Grid
          templateColumns={
            filteredProtocols.length >= 3
              ? "repeat(3, 1fr)"
              : `repeat(${filteredProtocols.length}, 1fr)`
          }
          gap={2}
          width="max-content">
          {filteredProtocols.length === 0 && (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No protocols found</AlertTitle>
            </Alert>
          )}
          {filteredProtocols.map((protocol, index) => (
            <Card key={index}>
              <CardHeader>
                <Heading size="md">{protocol.name}</Heading>
                <Text fontSize="sm">{protocol.id}</Text>
              </CardHeader>
              <CardBody>
                <Text>{protocol.description}</Text>
              </CardBody>
              <Divider />
              <CardFooter>
                <Button onClick={() => onStartProtocolButtonClick(protocol.id)} colorScheme="teal">
                  Start
                </Button>
              </CardFooter>
            </Card>
          ))}
        </Grid>
      </VStack>
    </Center>
  );
};

export default ProtocolCardsComponent;
