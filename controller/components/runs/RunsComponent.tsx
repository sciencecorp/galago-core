import CommandComponent from "@/components/protocols/CommandComponent";
import React, { useEffect, useState } from "react";
import StatusTag from "@/components/tools/StatusTag";
import { ToolStatusCardsComponent } from "@/components/tools/ToolStatusCardsComponent";
import  {SwimLaneComponent}  from "@/components/runs/SwimLaneComponent";

import { trpc } from "@/utils/trpc";
import {
  Alert,
  Box,
  Button,
  Heading,
  HStack,
  VStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Text,
  Progress,
  useColorMode,
  useColorModeValue
} from "@chakra-ui/react";

import {PlusSquareIcon, ChevronUpIcon, DeleteIcon} from "@chakra-ui/icons";
import { RunCommand } from "@/types";
import { QueueStatusComponent } from "./QueueStatuscomponent";

interface GroupedCommand {
  Id: string;
  Commands: RunCommand[];
}

interface RunsComponentProps{

}

interface RunQueueAttributes {
  runId:string, 
  runName:string,
  commandsCount:number,
}

export const RunsComponent: React.FC<RunsComponentProps> = () => {
  const [expandedRunId, setExpandedRunId] = useState<string|null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const skipRunMutation = trpc.commandQueue.clearByRunId.useMutation();
  const [selectedDeleteRun, setSelectedDeleteRun] = useState<string>("");
  const commandsAll = trpc.commandQueue.commands.useQuery(
    { limit: 1000, offset: 0 },
    { refetchInterval: 1000 }
  );

  const bgColor = useColorModeValue("#F9F9F9", "gray.700");

  const runsAll = trpc.commandQueue.getAllRuns.useQuery(undefined, {refetchInterval:1000});
  let groupedCommands: GroupedCommand[] =  [];
  let commands : RunCommand[] = []
  let runIds : string[] = []

  function getRunAttributes(runId: string): RunQueueAttributes {
    let result: RunQueueAttributes = { runId: "", runName: "", commandsCount: 0 };
    if (runsAll.data === undefined) { return result; }
    let data = runsAll.data.filter((r) => r.id == runId);
    if (data.length > 0) {
      let match = data[0];
      let runName = match.run_type.replaceAll("_", " ").toUpperCase();
      if (match.params.wellPlateID !== undefined) {
        runName += ` | WP-${match.params.wellPlateID}`;
      }
      if (match.params.culturePlateType !== undefined) {
        runName += ` | ${match.params.culturePlateType}`;
      }
      result = {
        runId: runId,
        runName: runName,
        commandsCount: match.commands_count
      };
    }
    return result;
  }
  

  function expandButtonIcon(runId:string){
    if(expandedRunId === runId){
      return <ChevronUpIcon></ChevronUpIcon>
    }
    else{
      return <PlusSquareIcon></PlusSquareIcon>
    }
  }
  
  const handleConfirmDelete = (runId:string) => {
    skipRunMutation.mutate(runId);
    onClose();
  }

  if(!commandsAll.data || commandsAll.data.length === 0){
    return (
      <>
      <Box>
      <QueueStatusComponent totalRuns={groupedCommands.length}/>
      </Box>   
      <Heading mt='10px' size = "lg" color='gray'>No runs found on the queue...</Heading>
    </>
    )

  }

  const handleRunButtonClick = (runId:string |null) => {
    setExpandedRunId((prevId) => (prevId === runId ? null : runId));
  }

  const handleDeleteButtonClick = (runId:string)=>{
    setSelectedDeleteRun(runId);
    onOpen();
  }

  commandsAll.data?.forEach(command => {
    if(!runIds.includes(command.runId)) {
      commands = [];
      runIds.push(command.runId);
    }
    commands.push(command);
    var run : GroupedCommand = {
      Id:command.runId,
      Commands:commands
    }  
    groupedCommands[runIds.length-1] = run;
    },[]
  );  
  
  return  (
    <Box width='95%'>
     <Box>
      <QueueStatusComponent totalRuns={groupedCommands.length}/>
      </Box>   
    { 
      groupedCommands.map((run,index)=> {
      let runCommands: RunCommand[] = run.Commands;
        return  <VStack align='left' key={index}>
                <Modal isOpen={isOpen} onClose={onClose} isCentered ={true}>
                  <ModalContent >
                    <ModalHeader>Confirm Action</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <Text>Are you sure you want to delete this run?</Text>
                    </ModalBody>
                    <ModalFooter>
                      <Button colorScheme="blue" mr={3} onClick={()=>{handleConfirmDelete(selectedDeleteRun)}}>
                        Accept
                      </Button>
                      <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
                  <Box
                    left='0'
                    right='0'
                    height={expandedRunId != run.Id ? 'auto' : '250px'}
                    position='relative'
                    maxWidth='100%'>
                  <Box 
                    position='relative' 
                    // bg='#F9F9F9'
                    w='100%' 
                    p={1} color='black' border='1px'
                    bg={bgColor}
                    >
                    <VStack spacing='0'>
                      <Progress width='100%' hasStripe isAnimated value={(getRunAttributes(run.Id).commandsCount-run.Commands.length)/getRunAttributes(run.Id).commandsCount*100} colorScheme='blue' size='md'/>
                      <HStack width='100%'>
                        <Box width='90%'>
                          <Button padding='2px' variant='ghost' onClick={()=>{handleRunButtonClick(run.Id)}}>
                            {expandButtonIcon(run.Id)}
                            <Heading size="md" padding='4px'>{getRunAttributes(run.Id).runName}</Heading>
                          </Button>
                        </Box>
                        <Box width='10%' textAlign='right'>
                          <IconButton
                            onClick={()=>{handleDeleteButtonClick(run.Id)}}
                            variant='ghost'
                            aria-label='Call Segun'
                            size='lg'
                            icon={<DeleteIcon />}/>
                        </Box>
                    </HStack>
                    </VStack>
                  </Box>
                  <Box>
                  {
                    expandedRunId === run.Id && (<SwimLaneComponent runCommands={runCommands}/>)
                  }
                  </Box>
                </Box>
              </VStack>
    })}
    </Box>
  )
}