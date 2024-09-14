import { useToast,Box, Button, Table, Tbody, Td, Text, Th, Thead, Tr ,HStack,useDisclosure, Modal, ModalBody, ModalFooter, ModalHeader, ModalCloseButton, ModalContent, requiredChakraThemeKeys} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { RoutineRequirements, RoutineQueueItem, Params} from "@/server/utils/RoutineRequirements";

export class RoutineTableUtils{
    queuedRuns : string[] 
    errorMessage :string

    constructor(){
      this.queuedRuns =[]
      this.errorMessage = ""
    }

    toast = useToast();

    createRunMutation = trpc.run.create.useMutation({
        onError: (error) => {
          this.toast({
            title: "Failed to queue run",
            description: error.message,
            status: "error",
            duration: 4000,
            isClosable: true,
            position: "top"
          });
      },
    });

    async queueMultipleRoutines(workcellName:string, routineQueueItems:RoutineQueueItem[], selectedRoutineFilter:string){
      this.queuedRuns = []

      for(let i = 0; i < routineQueueItems.length;i++){
        let queueItem = routineQueueItems[i];
        if(selectedRoutineFilter != "All" && queueItem.routine.name != selectedRoutineFilter){
          continue;
        }
        const missingParameters = this.findMissingParams(queueItem.params);
        if(missingParameters.length == 0 ){
          await this.createRunMutation.mutateAsync({
            workcellName: workcellName,
            protocolId: queueItem.routine.protocol_id,
            params: queueItem.params,
          }).then((data) => {
            if(data.params.wellPlateID !== undefined){
              this.queuedRuns.push(data.params.wellPlateID);
            }
          }
          ).catch((error) => {
            console.error("Error queueing run", error);
          });;
        }
      }
      if(this.queuedRuns.length > 0){
        this.toast.closeAll(),
        this.toast({
          title: `Sucess adding ${this.queuedRuns.length} workflows!`,
          description: `Well Plate(s):${this.queuedRuns.join(",")}`,
          status: "success",
          duration: null,
          isClosable: true,
          position: "top"
        });
      }
    }

    async queueRoutine(workcellName:string, protocolId: string, params: Params){
      //Check for missing parameters
      const missingParameters = this.findMissingParams(params);
      if (missingParameters.length > 0) {
        this.errorMessage = this.errorMessage + `You're missing the following required consumables: ${missingParameters.join(", ")}`
      }
      await this.createRunMutation.mutateAsync({
        workcellName: workcellName,
        protocolId: protocolId,
        params: params,
      }).then((data)=>{
        this.toast.closeAll(),
        this.toast({
          title: `Sucess adding workflow!`,
          description: `Well Plate(s):${data.params.wellPlateID}`,
          status: "success",
          duration: null,
          isClosable: true,
          position: "top"
        });
      });
    }

    findMissingParams = (params: Params, parentKey = ''): string[] => {
      let missingParams: string[] = [];
      Object.entries(params).forEach(([key, value]) => {
        const paramName = parentKey ? `${parentKey}.${key}` : key;
        if (typeof value === 'string' && value.includes("❓")) {
          missingParams.push(paramName);
        } else if (typeof value === 'object' && value !== null) { // Checking for null as typeof null is 'object'
          missingParams = missingParams.concat(this.findMissingParams(value as Params, paramName));
        }
      });
      return missingParams;
    };
    
    
}