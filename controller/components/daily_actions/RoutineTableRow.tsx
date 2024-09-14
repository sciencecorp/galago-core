import React, { useState, useEffect } from "react";
import { Button,Td, Tr,Box} from "@chakra-ui/react";
import { RoutineQueueItem, Params} from "@/server/utils/RoutineRequirements";
import { RoutineTableUtils } from "./RoutineTableUtils";

interface RoutineTableRowProps{
    workcellName: string,
    routineItem: RoutineQueueItem,
}

export const RoutineTableRow : React.FC<RoutineTableRowProps> = ({workcellName,routineItem}) => {
    const rtUtils = new RoutineTableUtils(); 
    return (
      <>
        <Td>{routineItem.routine.name}</Td>
        <Td>{routineItem.routine.parameters.culture_ids.join(", ")}</Td>
        <Td>{routineItem.routine.parameters.wellPlateID}</Td>
        <Td>{routineItem.params.nestName}</Td>
        <Td>{routineItem.routine.parameters.media_type || routineItem.routine.parameters.protocol_name}</Td>
        <Td>{routineItem.routine.parameters.plate_type}</Td>
        <Td>{routineItem.routine.parameters.well_array_to_process.length}</Td>
        <Td style={{ maxWidth: "600px", wordWrap: "break-word" }}>
          <Box>Protocol Name: {routineItem.routine.protocol_id}</Box>
          <div>
            <small>Parameters: {JSON.stringify(routineItem.params)}</small>
          </div>
        <Button
            variant="outline"
            width="100%"
            onClick={()=>{rtUtils.queueRoutine(workcellName, routineItem.routine.protocol_id, routineItem.params)}}
          >
          Queue Run
        </Button>
        </Td>
      </>
      );

}