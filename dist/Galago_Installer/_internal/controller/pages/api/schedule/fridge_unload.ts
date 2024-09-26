import RunStore from "@/server/runs";
import { RunStatusList, RunSubmissionStatus } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { Instrument, Inventory,inventoryApiClient, Nest, Plate, Well, Reagent} from "@/server/utils/InventoryClient";
import { json } from "stream/consumers";

type ResponseData = {
  message: string
}
 

async function postHandler(req:NextApiRequest, res:NextApiResponse) {
  try {
    let params : Record<string, any> = {}

    const inventory = await inventoryApiClient.getInventory("Cell Foundry Workcell");
    //console.log("Total plates" + inventory.plates.length)

    let fridgePlates : string[] = [];
    let openHotelPlates : string[] = [];
    let queuedRuns : string[] = []
  
    for(let i=0; i < inventory.nests.length; i++){
      let nest = inventory.nests[i];
      let instrument = inventory.instruments.find(inst=> inst.id == nest.instrument_id);
      if(instrument?.name == "hotel"){
        //Check if there is a plate on this nest
        let plateInHotel = inventory.plates.find(plate => plate.nest_id == nest.id);
        if(!plateInHotel){
          openHotelPlates.push(nest.name);
        }
      }
    }

    for(let i=0; i < inventory.plates.length; i++){
      let plate = inventory.plates[i];
      if(plate == null){continue;}
      if(plate){
        let plateNest = inventory.nests.find(nest => nest.id === plate.nest_id);
        if(plateNest){
          let instrument = inventory.instruments.find(inst=> inst.id == plateNest?.instrument_id);
          if(instrument?.name == 'fridge'){
            fridgePlates.push(plateNest.name)
          }
        }
      }
    }

    for(let i=0; i < fridgePlates.length; i++){
      let sourceNest:string = fridgePlates[i];
      let destNest:string = openHotelPlates[i];
      if(destNest){
        params = {source_nest:sourceNest, destination_nest:destNest}
        const run = await RunStore.global.createFromProtocol("baymax", "unload_fridge_plates", params);
        queuedRuns.push(run.id)
      }
    }

    res.status(201).json({ response: `Succesfully queued ${queuedRuns.length} media plates for fridge unload` });

  } catch (e: any) {
    switch (e.name) {
      case "ProtocolNotFoundError":
        res.status(404).end(e.message);
        break;
      case "ZodError":
        res.status(400).end(e.message);
        break;
      default:
        res.status(500).end(e.message)
    }
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) 
{
  postHandler(req, res);
}