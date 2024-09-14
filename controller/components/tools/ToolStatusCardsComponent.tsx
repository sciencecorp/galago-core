import { useState } from 'react';
import { trpc } from "@/utils/trpc";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { Box, Grid, Spinner, Alert, Button, HStack, Heading, VStack, Center,useToast } from "@chakra-ui/react";
import {PlusSquareIcon, ChevronUpIcon, DeleteIcon} from "@chakra-ui/icons";
import { ToolConfig, ToolType } from "gen-interfaces/controller";

export function ToolStatusCardsComponent() {
  const utils = trpc.useContext();
  const toast = useToast();
  const availableToolsQuery = trpc.tool.availableIDs.useQuery();
  const availableToolIDs = availableToolsQuery.data;
  const [toolsHeight, setToolsHeight] = useState("auto");

  const configureMutation = trpc.tool.configure.useMutation({
    onSuccess: () => {
      console.log("connected!!");
    },
    onError: (data) => {
      toast({
        title: "Failed to connect to instrument",
        description: `${data.message}`,
        status: "error",
        duration: 10000,
        isClosable: true,
        position: "top"
      });
    },
  });


  if (availableToolsQuery.isLoading) {
    return <Spinner size="lg" />;
  }
  if (availableToolsQuery.isError || !availableToolIDs) {
    return <Alert status="error">Could not load tool info</Alert>;
  }

  const toggleHeight = () => {
    setToolsHeight(toolsHeight === "auto" ? "300px" : "auto");
  };

  function expandButtonIcon(){
    if(toolsHeight === "auto"){
      return <ChevronUpIcon></ChevronUpIcon>
    }
    else{
      return <PlusSquareIcon></PlusSquareIcon>
    }
  }

  const connectAllTools = async () => {
    for(const tool in availableToolIDs){
      const toolId = availableToolIDs[tool];
      //setToolToConnect(availableToolIDs[toolId]);
      const toolInfo = await utils.tool.info.fetch({toolId:toolId})
      console.log("Tool config is" + JSON.stringify(toolInfo));
      if(!toolInfo){
        toast({
          title: `Failed to get info for tool ${toolId}`,
          description: `Warning`,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
      }
      configureMutation.mutate({
        toolId:toolId,
        config:{simulated:false, [toolInfo.type]:toolInfo}
      });
    }
  }

  return (
      <Box 
        p={2} 
        maxWidth="1800px" 
        margin="auto"
        overflowX='auto'
        style={{ height: toolsHeight, transition: "height 0.3s ease-in-out" }}
      >
      <VStack>
        <Box>
          <HStack>
            <Heading mb={2} css={{
                fontFamily: `'Bungee Shade', cursive`,
              }}>
                Tools       
              <Button onClick={toggleHeight} marginLeft={2} bg='gray.500'>
                {expandButtonIcon()}
              </Button>
            </Heading>
          </HStack>

        </Box>
        <Center>
          <Grid 
            templateColumns={`repeat(5, 1fr)`} 
            gap={6}
            justifyContent="center" // Center horizontally
            alignContent="center"   // Center vertically
            >
            {availableToolIDs.map((tool_id) => (
              <ToolStatusCard key={tool_id} toolId={tool_id} />
            ))}
          </Grid>
        </Center>
        {
          availableToolIDs.length > 1 && 
          (
            <Button m={0} onClick={()=>{connectAllTools()}}>Connect All</Button>
          )
        }
    </VStack>
    </Box>
  );
}
