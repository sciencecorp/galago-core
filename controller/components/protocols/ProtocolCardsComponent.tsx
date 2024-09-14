
import React, { useState, useEffect } from "react";
import {Box, Grid, Card, VStack, Heading, CardBody,CardHeader, CardFooter, ButtonGroup,Button, Input, Text, Center, useDisclosure, Spinner, Alert, AlertIcon, AlertTitle, Divider, useSafeLayoutEffect} from "@chakra-ui/react"
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import {Protocol } from "@/types";
import { AllNamesOutput } from "@/server/routers/protocol";
import Head from "next/head";
import NewProtocolRunModal from "./NewProtocolRunModal";
interface ProtocolCardsComponentProp {
}

export const ProtocolCardsComponent : React.FC<ProtocolCardsComponentProp> = ({}) => {
const [isHovered, setIsHovered] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const workcellData = trpc.tool.getWorkcellName.useQuery();
const workcellName = workcellData.data;
const allProtocols = trpc.protocol.allNames.useQuery({ workcellName: workcellName || "" });
const { isOpen, onOpen, onClose } = useDisclosure();
const [selectedProtocol, setSelectedProtocol] = useState("")

const router = useRouter();

const onStartProtocolButtonClick = (id:string) => {
  router.push(`/protocols/${id}`);
}


if (allProtocols.isLoading) {
  return <Spinner size="lg" />;
}

if (allProtocols.isLoading) {
  return <Spinner size="lg" />;
}

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
      templateColumns={allProtocols.data.length >= 3 ? "repeat(3, 1fr)" : `repeat(${allProtocols.data.length}, 1fr)`} 
      gap={2} 
      width="max-content"
      >
        {allProtocols.data.map((protocol, index) => (
              <Card key={index}>
              <CardHeader>
                <Heading size='md'>{protocol.name}</Heading>
                <Text fontSize='sm'>{protocol.id}</Text>
              </CardHeader>
              <CardBody>
                <Text>{protocol.description}</Text>
              </CardBody>
              <Divider />
              <CardFooter>
                <Button onClick={()=>{onStartProtocolButtonClick(protocol.id)}}>Start</Button>
              </CardFooter>
            </Card>
        ))}
      </Grid>
      </VStack>
    </Center>
  )
}

export default ProtocolCardsComponent;