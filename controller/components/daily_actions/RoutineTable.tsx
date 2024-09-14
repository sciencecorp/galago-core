import React, { useState, useEffect } from "react";
import { Box, Button, Table, Tbody, Td, Text, Th, Thead,TableContainer, Tr ,HStack,useDisclosure, Modal, ModalBody, ModalFooter, ModalHeader, ModalCloseButton, ModalContent, requiredChakraThemeKeys} from "@chakra-ui/react";
import {  Routine } from "@/server/utils/HelixClient";
import { Instrument, Inventory, Nest, Plate, Well, Reagent} from "@/server/utils/InventoryClient";
import { RoutineRequirements, RoutineQueueItem, Params } from "@/server/utils/RoutineRequirements";
import { RoutineTableRow } from "./RoutineTableRow";
import { RoutineTableUtils } from "./RoutineTableUtils";

interface RoutineTableProps {
  workcellName: string;
  routines: Routine[];
  real_inventory: Inventory;
  onAlert: (
    status: "error" | "info" | "warning" | "success" | "loading",
    description: string
  ) => void;
}

export const RoutineTable: React.FC<RoutineTableProps> = ({
  workcellName,
  routines,
  real_inventory,
  onAlert,
}) => {
  

  const todoTypesCount = new Map();
  const [routineQueueItems, setRoutineQueueItems] = useState<RoutineQueueItem[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const rtUtils = new RoutineTableUtils(); 


  useEffect(() => {
    const inventory = JSON.parse(JSON.stringify(real_inventory)) as Inventory;
    const requirementsInstance = new RoutineRequirements(inventory);
    const queueItems: RoutineQueueItem[] = routines.map((r) => {
      const params = requirementsInstance.getProtocolParameters(r);
      console.log("params", JSON.stringify(params ));
      return { routine: r, params };
    });
    setRoutineQueueItems(queueItems);
  }, [real_inventory, routines]);

  function updateTodoCountByType(routineQueueItems : RoutineQueueItem[]){
    todoTypesCount.set("All", routineQueueItems.length);
    for(var i=0; i< routineQueueItems.length; i++){
      let todoType = routineQueueItems[i].routine.name;
      if(!todoTypesCount?.has(todoType)){
        todoTypesCount?.set(todoType, 1);
      }
      else{
        let currentCount = todoTypesCount.get(todoType);
        if(currentCount){
          todoTypesCount.set(todoType, currentCount+1);
        }
      }
    }
  }
  


  const queueAllRoutines = async () => {
    await rtUtils.queueMultipleRoutines(workcellName,routineQueueItems, selectedRoutineFilter);
    onClose();
  }

  const queueAllRoutinesConfirmModal = () => {
    return(
      <Modal isOpen={isOpen} onClose={onClose} isCentered ={true}>
      <ModalContent >
        <ModalHeader>Confirm Action</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Proceed to queue runs?</Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={queueAllRoutines}>
            Accept
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    )
  }



  const filters :string[] = ["All", "Image Culture Plate", "Media Exchange", "Passage","Transfect"]
  const [selectedRoutineFilter, setRoutineFilter] = useState<string>(filters[0]);

  
  const routineFilterComponent = () =>{
    updateTodoCountByType(routineQueueItems);
    return (filters.map((filter, index)=>{
      let buttonLabel = filter;
      if(todoTypesCount.get(filter)>0){
        buttonLabel = buttonLabel + " - " + todoTypesCount.get(filter);
      }
      return(
        <Button key={index} colorScheme={selectedRoutineFilter==filter ? "blue":"gray"}onClick={()=>setRoutineFilter(filter)} margin='3px'>{buttonLabel}</Button>
      )
    }
    ))
  }

  return (
    <Box overflowX="auto">
      {queueAllRoutinesConfirmModal()}
      <HStack margin="2">
        <Box width='5%'><Text as='b'>Filters:</Text></Box>
        <Box margin='4px' width='80%'>{routineFilterComponent()}</Box>
        <Box hidden={false} width ='15%'><Button onClick={onOpen} variant='solid' width='100%'>Bulk Queue</Button></Box>
      </HStack>
      <Table variant="simple" colorScheme="blue" margin="2">
        <Thead bg="blue.100">
          <Tr>
            <Th>Name</Th>
            <Th>Culture ID</Th>
            <Th>Well Plate ID</Th>
            <Th>Plate Location</Th>
            <Th>Type</Th>
            <Th>Plate Type</Th>
            <Th>Wells To Process</Th>
            <Th>Protocol Info</Th>
          </Tr>
        </Thead>
        <Tbody>
        {routineQueueItems.length > 0 && routineQueueItems.filter((r) => selectedRoutineFilter === "All" || r.routine.name === selectedRoutineFilter).map((r, index) => (
            <Tr key={index}>
              <RoutineTableRow workcellName={workcellName} routineItem={r} />
            </Tr>
          ))}
        </Tbody>
      </Table>
      {routines.length === 0 && (
        <Box p={4}>
          <Text color="gray.500">No routines to display</Text>
        </Box>
        )
      }
    </Box>
  );
};

export default RoutineTable;