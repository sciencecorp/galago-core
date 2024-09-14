import { ConsumableRequirementMapType, helixClient, Routine } from "@/server/utils/HelixClient";
import { Instrument, Inventory, Nest, Plate, Well, Reagent} from "@/server/utils/InventoryClient";
import { Any } from "@grpc/grpc-js/build/src/generated/google/protobuf/Any";
import React, { useState, useEffect } from "react";
export interface RoutineQueueItem {
  routine:Routine, 
  params:Params, 
};

export interface Params {
  [key: string]: any;
}


export interface InstrumentMap {
  key:number,
  instrument:Instrument
}

interface TipRequirement {
  "20 ul tip": number;
  "1000 ul tip": number;
  "200 ul tip": number;
}

interface MapWellsToRequirementsOptions {
  well_array_to_process: number[] | string[];
  plate_type: string;
  protocol_name: string;
  percent_change?: number;
  media_type?: string;
  new_tip?: boolean;
  plate_id?: string;
}

interface MediaTypeToTipRequirements {
  [key: string]: TipRequirement;
}

const hasRedQuestionMark = (params: Params): boolean => {
  const paramString = JSON.stringify(params); // Convert params to string to search within it
  return paramString.includes("❓");
};


//Class used to define requirements for a protocol, these are based on available inventory on the workcell. 
export class RoutineRequirements {
    calculated_inventory : Inventory; 
    raw_inventory: Inventory;
    plateInstrumentArray : InstrumentMap[];

    constructor(inventory:Inventory){
      this.raw_inventory = inventory;
      this.calculated_inventory = inventory;
      this.plateInstrumentArray = []
      this.buildInstrumentMap(inventory);
    }

    updateReagentInventoryOLD = (wells: Well[]) => {
      if (!wells || wells.length === 0) {
        return;
      }
      wells.forEach((well) => {
        this.calculated_inventory.reagents = this.calculated_inventory.reagents.filter((reagent) => reagent.well_id !== well.id);
      });
    };

    updateReagentInventory = (wellsInput: { [key: string]: Well[] } | Well[]) => {
      // Check if the input is an array and handle directly
      if (Array.isArray(wellsInput)) {
        if (wellsInput.length === 0) {
          return;
        }
        wellsInput.forEach((well) => {
          this.calculated_inventory.reagents = this.calculated_inventory.reagents.filter((reagent) => reagent.well_id !== well.id);
        });
      } else if (typeof wellsInput === 'object' && wellsInput !== null) {
        // Handle if the input is an object containing arrays
        Object.values(wellsInput).forEach(wells => {
          if (Array.isArray(wells)) {
            wells.forEach((well) => {
              this.calculated_inventory.reagents = this.calculated_inventory.reagents.filter((reagent) => reagent.well_id !== well.id);
            });
          }
        });
      } else {
        // Log an error or handle cases where wellsInput is neither an array nor a valid object
        console.error('Invalid input type for updateReagentInventory:', wellsInput);
      }
    };

    extractAndFormatWellsOrTips = (wellsOrTips: { [key: string]: Well[] } | Well[]): string[] | "❓" => {
      if (!wellsOrTips) return "❓";
      if (Array.isArray(wellsOrTips)) {
        return wellsOrTips.map(well => `${well.row}${well.column}`);
      } else {
        const formattedWells: string[] = [];
        Object.values(wellsOrTips).forEach(wells => {
          formattedWells.push(...wells.map(well => `${well.row}${well.column}`));
        });
        return formattedWells.length > 0 ? formattedWells : "❓";
      }
    };
    
    //Finds the nest that matches the well plate id
    findNest=(plateId:string) : Plate | undefined =>{
      let plate: Plate | undefined = this.raw_inventory.plates.find((plate) => plate.name === plateId);
      return plate;
    }

    buildInstrumentMap=(inventory:Inventory): Map<number, Instrument> =>{
      let map = new Map<number,Instrument>();
      inventory.plates.forEach((plate) => {
        const nest = inventory.nests.find((nest) => nest.id === plate.nest_id);
        if (nest) {
          const instrument = inventory.instruments.find((instrument) => instrument.id === nest.instrument_id );
          if (instrument) {
            let nestMap : InstrumentMap =  {key:plate.id, instrument:instrument}
            this.plateInstrumentArray.push(nestMap);
          }
        }
      });
      return map;
    };

    getLiconicNest(routine:Routine):Params
    {
      let inventoryRequirements : Params = {
          nestName:null,
          liconicCassette:null,
          liconicLevel:null,
          culturePlateBarcode: null,
      }
      let plate: Plate | undefined = this.raw_inventory.plates.find(
        (plate) => plate.name === routine.parameters.wellPlateID
      );      if(!plate){
        console.error("Plate not found in inventory");
        return inventoryRequirements;}
      inventoryRequirements.culturePlateBarcode = plate.barcode;
      let plateNestId = plate.nest_id;
      let nestName :undefined|string  = this.calculated_inventory.nests.find((nest) => nest.id === plateNestId)?.name;
      if(!nestName){return inventoryRequirements;}
      
      let parts = nestName.split("_");
      let cassette = parts[2] ? parseInt(parts[2]) : "❓";
      let level = parts[1] ? parseInt(parts[1] ) : "❓";
      // console.log("cassette", cassette);
      // console.log("level", level);
      inventoryRequirements.liconicLevel = level;
      inventoryRequirements.liconicCassette = cassette; 
      inventoryRequirements.nestName = nestName;
      return inventoryRequirements;
    }

    getReagentPlate(routine:Routine):Params{
      return {}
    }


    OT2SlotMapping: Record<string, number> = {
      "1_4_1": 1,
      "1_4_2": 2,
      "1_4_3": 3,
      "1_3_2": 5,
      "1_3_3": 6,
      "1_2_1": 7,
      "1_2_2": 8,
      "1_2_3": 9,
      "1_1_1": 10,
      "1_1_2": 11,
      "1_1_3": 12,
   };

    tipsConsumed: Record<string, number> = {
      "6 well": 1,
      "6 well with organoid inserts": 1,
      "12 well": 1,
      "24 well": 1,
      "96 well": 1/48,
      "384 well": 1 / 48,
    };
  
    mediaConsumed: Record<string, number> = {
      "6 well": 2,
      "6 well with organoid inserts": 2,
      "12 well": 1,
      "24 well": 1,
      "96 well": 1/6,
      "384 well": 1 / 16,
    };
  
    dissociationReagentConsumed: Record<string, number> = {
      "6 well": 1,
      "6 well with organoid inserts": 1,
      "12 well": 1,
      "24 well": 1,
      "96 well": 8,
      "384 well": 1 / 48,
    };

    mapPlateTypeTotipType(plate_type: string): string[] {
      const mapping: Record<string, string[]> = {
        "6 well": ["20 ul tip","1000 ul tip"],
        "6 well with organoid inserts": ["1000 ul tip"],
        "12 well": ["1000 ul tip"],
        "24 well": ["1000 ul tip"],
        "96 well": ["20 ul tip", "200 ul tip", "1000 ul tip"], // Example of multiple tip types
        "384 well": ["200 ul tip", "1000 ul tip"],
      };  
      return mapping[plate_type] || [];
  }

  fetchTipsFromInventory(tipType: string, numberOfTipsNeeded: number): Well[] {
    // Filter reagents to find those that match the tipType
    const tipsReagents = this.raw_inventory.reagents.filter(reagent => reagent.name === tipType);
  
    // Use the reagents to find corresponding wells, limiting to the numberOfTipsNeeded
    const tipsWells = this.raw_inventory.wells.filter(well =>
      tipsReagents.some(reagent => reagent.well_id === well.id)
    ).slice(0, numberOfTipsNeeded);
  
    return tipsWells; // Return the filtered list of wells
  }

  calculateNumberOfTipsNeeded(tipType: string, plate_type: string, protocol_name: string, wellsToProcess: number, new_tip?: boolean): number {
    
    const mediaTypeTipRequirements: MediaTypeToTipRequirements = {
      "transfection": {
        "20 ul tip": wellsToProcess * 3, // This presumes a dynamic calculation based on wellsToProcess
        "1000 ul tip": wellsToProcess*2,   // Same here
        "200 ul tip": 0,
      },
      "passage": {
        "20 ul tip": 0, // And here
        "1000 ul tip": 1,
        "200 ul tip": 0,
      },
      "media exchange-single": {
        "20 ul tip": 0,
        "1000 ul tip": wellsToProcess,
        "200 ul tip": 0,
      },
       "media exchange-multi": {
        "20 ul tip": 0,
        "1000 ul tip": 0,
        "200 ul tip": (1/48)*wellsToProcess,
      }
    };
    // console.log("media_type", media_type);
    if (protocol_name === "media exchange" && (plate_type === "384 well" || plate_type === "96 well")) {
      protocol_name = "media exchange-multi";
    }
    else if (protocol_name === "media exchange") {
      protocol_name = "media exchange-single";
    }
    // console.log("protocol_name", protocol_name);
    const tipRequirements = mediaTypeTipRequirements[protocol_name as keyof MediaTypeToTipRequirements];
    // console.log("tipRequirements", tipRequirements);
    if (tipRequirements && tipType in tipRequirements) {
      // Directly return the number associated with tipType
      return tipRequirements[tipType as keyof TipRequirement]; // Now directly using the value without calling it as a function
    }  
    return 0; // Default case if none of the conditions are met
  }

  
  mapPlateTypeTotipTypeOLD(plate_type: string,percent_change?: number): string {
    
    const mapping: Record<string, string> = {
      "6 well": "1000 ul tip",
      "6 well with organoid inserts": "1000 ul tip",
      "12 well": "1000 ul tip",
      "24 well": "1000 ul tip",
      "96 well": "200 ul tip",
      "384 well": "200 ul tip",
    };
    // if the protocol is passage, then we need to use 1000 ul tip
    if (percent_change === 0) return "1000 ul tip";
    return mapping[plate_type];
  }


  mapWellsToRequirementsOLD(
    well_array_to_process: number[] | string[],
    plate_type: string,
    media_type: string,
    percent_change: number,
    new_tip?: boolean
  ): any {
    // console.log("--------------------");
    // console.log("plate_type", plate_type);
    // console.log("media_type", media_type);
    var totalTips = well_array_to_process.length * this.tipsConsumed[plate_type];
    if (new_tip === false) totalTips = 1;
    if (new_tip === true) totalTips = well_array_to_process.length;
    // console.log("totalTips", totalTips);
    // if percent change is 50, then we need to half
    var totalMedia = well_array_to_process.length * this.mediaConsumed[plate_type];
    if (percent_change === 0 && plate_type === "384 well") {
      totalMedia = well_array_to_process.length
    }
    if (plate_type === "96 well") {
      totalMedia = 96 * this.mediaConsumed[plate_type];
      totalTips = 8;
      console.log("totalMedia 96 well plate", totalMedia);
    }
    let dissociationReagent = well_array_to_process.length * this.dissociationReagentConsumed[plate_type];
    let transfectionWells: Well[] = [];
    let optimemWells: Well[] = [];

    


    if (media_type === "opti-mem w/ plasmid") {
      totalMedia = well_array_to_process.length;
      totalTips = well_array_to_process.length
    }

    // if media type is dissociation reagent, then we let totalMedia = dissociationReagent
    if (media_type === "ReleSR") {
      totalMedia = Math.floor(dissociationReagent);
      totalTips = 1;
    }
    // console.log("totalMedia", totalMedia);
    if (percent_change === 50 && plate_type !== "384 well") {
      totalMedia *= 0.5; // Halve the value and update totalMedia
    }
    const tipType = this.mapPlateTypeTotipTypeOLD(plate_type,percent_change);
    var media_wells: Well[] | undefined = undefined;
    var media_plate: Plate | undefined = undefined;
    var media_ids: number[] | undefined = undefined;
    var tip_wells: Well[] | undefined = undefined;
    var tip_box: Plate | undefined = undefined;
    var tip_ids: number[] | undefined = undefined;
    var plates_found: Plate[] | undefined = undefined;
    var tip_boxes_found: Plate[] = [];
    var wells_found: Well[] = [];
    var medias_found: Reagent[] = [];
    var pairedWells: Well[][] = [];
    var transfectionPlateFound: Plate | undefined = undefined;
    medias_found = this.raw_inventory.reagents.filter((reagent) => reagent.name === media_type);
    wells_found = this.raw_inventory.wells.filter((well) =>
      medias_found.some((reagent) => reagent.well_id === well.id)
    );
    plates_found = this.raw_inventory.plates.filter((plate) =>
      wells_found.some((well) => well.plate_id === plate.id)
    );

    
    
    // console.log("medias_found", medias_found);
    // console.log("wells_found", wells_found);
    // console.log("plates_found", plates_found)

    const tips_found = this.raw_inventory.reagents.filter((reagent) => reagent.name === tipType);
    const wells_tips_found = this.raw_inventory.wells.filter((well) =>
      tips_found.some((reagent) => reagent.well_id === well.id)
    );
    tip_boxes_found = this.raw_inventory.plates.filter((plate) =>
      wells_tips_found.some((well) => well.plate_id === plate.id)
    );

    // console.log("tips_found", tips_found);
    // console.log("wells_tips_found", wells_tips_found);
    // console.log("tip_boxes_found", tip_boxes_found);
    // console.log("reagent_boxes_found", reagent_boxes_found);
    // console.log("tip_boxes_found", tip_boxes_found);
    if (media_type === "opti-mem w/ plasmid") {

      this.raw_inventory.wells.forEach(well => {
        const reagent = this.raw_inventory.reagents.find(reagent => reagent.well_id === well.id);
        if (reagent) {
          if (reagent.name === "opti-mem w/ plasmid") {
            transfectionWells.push(well);
            media_wells = transfectionWells;
            
          }
          else if (reagent.name === "opti-mem w/ lipo") {
            optimemWells.push(well);
            media_wells = optimemWells;
          }
          // return plate containing these wells
          transfectionPlateFound = this.raw_inventory.plates.find(plate => plate.id === well.plate_id);
          
        }
      });

      const pairCount = Math.min(transfectionWells.length, optimemWells.length);
      for (let i = 0; i < pairCount; i++) {
        pairedWells.push([transfectionWells[i], optimemWells[i]]);
      }
    }
    //reduce pairedWells to length of totalMedia
    if (pairedWells.length > totalMedia) {
      pairedWells = pairedWells.slice(0, totalMedia);
    }

    for (let plate of plates_found) {
      // filter plates that do not contain hotel nest id
      let mediaPlateInstrument = this.plateInstrumentArray.find((p) => p.key == plate.id)?.instrument.name.toLocaleLowerCase();
      console.log("Media instrument is " + mediaPlateInstrument);
      if (!mediaPlateInstrument?.includes("hotel")) { continue; }
    
      const wells_in_plate = wells_found.filter((well) => well.plate_id === plate.id);
    
      if (plate_type === "384 well" || plate_type === "96 well") {
        // Group wells by column
        const wellsByColumn: { [key: number]: Well[] } = {};
        wells_in_plate.forEach((well) => {
          const column = parseInt(well.column.toString(), 10);
          if (!wellsByColumn[column]) {
            wellsByColumn[column] = [];
          }
          wellsByColumn[column].push(well);
        });
    
        // Check for sets of three full columns
        let fullColumns: Well[] = [];
        let columnsCount = 0;
        for (let column in wellsByColumn) {
          if (wellsByColumn[column].length === 8) { // 384-well plate has 8 rows (A to H) per column
            fullColumns = fullColumns.concat(wellsByColumn[column]);
            columnsCount++;
            if (columnsCount >= 3) { // Need three full columns for media
              break;
            }
          }
        }
        if (plate_type === "384 well" && columnsCount >= 3) {
          media_wells = fullColumns.slice(0, totalMedia);
          media_plate = plate;
          if (media_wells === undefined) continue;
          media_ids = medias_found
            .filter((reagent) => media_wells!.some((well) => well.id === reagent.well_id))
            .map((reagent) => reagent.id);
          break;
        }
        else if (plate_type === "96 well" && columnsCount >= 2) {
          media_wells = fullColumns.slice(0, totalMedia);
          media_plate = plate;
          if (media_wells === undefined) continue;
          media_ids = medias_found
            .filter((reagent) => media_wells!.some((well) => well.id === reagent.well_id))
            .map((reagent) => reagent.id);
          break;
        }
      }
      else {
        // Original logic for non-384 well plates
        if (wells_in_plate.length >= totalMedia) {
          media_wells = wells_in_plate.slice(0, totalMedia);
          media_plate = plate;
          if (media_wells === undefined) continue;
          media_ids = medias_found
            .filter((reagent) => media_wells!.some((well) => well.id === reagent.well_id))
            .map((reagent) => reagent.id);
          break;
        }
      }
    }
    
    // console.log("Media_plate", media_plate);
    // should return one tip for multichannel
    // for tip boxes
    for (let box of tip_boxes_found) {
      const tip_wells_in_plate = wells_tips_found.filter((well) => well.plate_id === box.id);
      if (tip_wells_in_plate.length >= totalTips) {
        tip_wells = tip_wells_in_plate.slice(0, totalTips);
        tip_box = box;
        if (tip_wells === undefined) continue;
        tip_ids = tips_found
          .filter((tip) => tip_wells!.some((well) => well.id === tip.well_id))
          .map((tip) => tip.id);
        break;
      }
    }
    // if (media_wells === undefined) console.log("Not enough reagent on a single plate");
    // if (tip_wells === undefined) console.log("Not enough tips on a single plate");
    // if (media_plate === undefined) console.log("Not enough reagent on a single plate");
    // if (tip_box === undefined) console.log("Not enough tips on a single plate");
    return {
      wells: media_wells,
      plate: media_plate,
      transfectionPlatesFound: transfectionPlateFound,
      pairedWells: pairedWells,
      tips: tip_wells,
      tip_box: tip_box,
      consumable_ids: [...(tip_ids || []), ...(media_ids || [])],
    };
  }

    mapWellsToRequirements(options: MapWellsToRequirementsOptions): any {
      const { well_array_to_process, plate_type, protocol_name, percent_change, media_type, new_tip, plate_id} = options;


      var consumable_ids: number[] = [];
      const tipTypes = this.mapPlateTypeTotipType(plate_type);
      let totalTipsNeededForEachType: Record<string, number> = {};
      let tipsFoundForEachType: Record<string, any[]> = {};
      let tipBoxesFound: Plate[] = [];
      // Calculate the total number of tips needed for each tip type
      tipTypes.forEach(tipType => {
        // console.log("tipType", tipType);
        const numberOfTipsNeeded = this.calculateNumberOfTipsNeeded(tipType, plate_type, protocol_name, well_array_to_process.length, new_tip);
        totalTipsNeededForEachType[tipType] = numberOfTipsNeeded;
      });
      Object.entries(totalTipsNeededForEachType).forEach(([tipType, tipsNeeded]) => {
        tipsFoundForEachType[tipType] = this.fetchTipsFromInventory(tipType, tipsNeeded);
      }
      );
      var totalMedia = well_array_to_process.length * this.mediaConsumed[plate_type];
      if (percent_change === 0 && plate_type === "384 well") {
        totalMedia = well_array_to_process.length
      }
      let dissociationReagent = well_array_to_process.length * this.dissociationReagentConsumed[plate_type];
      let optimemWells: Well[] = [];
      let lipoWell: Well | undefined = undefined;
      let p3000Well: Well | undefined = undefined;
      var transfectionReagents: any = undefined;
      var transfectionPlateFound: Plate | undefined = undefined;
      var DNAPlateFound: Plate | undefined = undefined;
      var DNAPlatesFound: Plate[] = [];
      var transfectReagent_ids: number[] | undefined = undefined;
      if (protocol_name === "transfection") {
        this.calculated_inventory.wells.forEach(well => {
          const reagent = this.calculated_inventory.reagents.find(reagent => reagent.well_id === well.id);
          if (reagent) {
            if (reagent.name === "opti-mem") {
              optimemWells.push(well);         
              transfectionPlateFound = this.calculated_inventory.plates.find(plate => plate.id === well.plate_id);
              // add id to transfectReagent_ids
              if (transfectReagent_ids === undefined) {
                transfectReagent_ids = [];
              }
              transfectReagent_ids.push(reagent.id);
               
            }
            else if (reagent.name === "Lipofectamine 3000") {
              lipoWell = well;
              if (transfectReagent_ids === undefined) {
                transfectReagent_ids = [];
              }
              transfectReagent_ids.push(reagent.id);
            }
            else if (reagent.name === "P3000") {
              p3000Well = well;
              if (transfectReagent_ids === undefined) {
                transfectReagent_ids = [];
              }
              transfectReagent_ids.push(reagent.id);
            }
            // add plate id must be equal to DNA Plate ID
            else if (reagent.name === "Plasmid" || reagent.name === "plasmid") {
              DNAPlateFound = this.calculated_inventory.plates.find(plate => plate.id === well.plate_id);
              if (DNAPlateFound !== undefined && DNAPlateFound.name !== null && DNAPlateFound.name.toString() === plate_id) {
                DNAPlatesFound.push(DNAPlateFound);
              }
              if (transfectReagent_ids === undefined) {
                transfectReagent_ids = [];
              }
              transfectReagent_ids.push(reagent.id);
            }       
            
          }

        }); 
    // console.log("DNAPlatesFound", DNAPlatesFound);
    }
    transfectionReagents = {
      lipoWell: lipoWell,
      p3000Well: p3000Well,
      optimemWells: optimemWells,
      transfectionPlateFound: transfectionPlateFound,
      transfectReagent_ids,
      DNAPlatesFound: DNAPlatesFound,
    }
    // push transfectionReagent ids to consumable_ids
    if (transfectReagent_ids === undefined) {
      transfectReagent_ids = [];
    }
    // consumable_ids.push(...transfectReagent_ids);
  
      // if media type is dissociation reagent, then we let totalMedia = dissociationReagent
      if (protocol_name.includes("passage")) {
        totalMedia = Math.floor(dissociationReagent);
      }
      if (percent_change === 50) {
        totalMedia *= 0.5; // Halve the value and update totalMedia
      }
      const tipType = this.mapPlateTypeTotipType(plate_type);
      var media_wells: Well[] | undefined = undefined;
      var media_plate: Plate | undefined = undefined;
      var media_ids: number[] | undefined = undefined;
      var tip_wells: Well[] | undefined = undefined;
      var tip_box: Plate | undefined = undefined;
      var tip_ids: number[] | undefined = undefined;
      var plates_found: Plate[] = [];
      var tip_boxes_found: Plate[] = [];
      var wells_found: Well[] = [];
      var medias_found: Reagent[] = [];
      var transfectionPlateFound: Plate | undefined = undefined;


      medias_found = this.calculated_inventory.reagents.filter((reagent) => reagent.name === media_type);
      wells_found = this.calculated_inventory.wells.filter((well) =>
        medias_found.some((reagent) => reagent.well_id === well.id)
      );
      plates_found = this.calculated_inventory.plates.filter((plate) =>
        wells_found.some((well) => well.plate_id === plate.id)
      );
  
      const tips_found = this.calculated_inventory.reagents.filter((reagent) => reagent.name === "20 ul tip" || reagent.name === "200 ul tip" || reagent.name === "1000 ul tip");

      const wells_tips_found = this.calculated_inventory.wells.filter((well) =>
        tips_found.some((reagent) => reagent.well_id === well.id)
      );
      tip_boxes_found = this.calculated_inventory.plates.filter((plate) =>
        wells_tips_found.some((well) => well.plate_id === plate.id)
      );

      // for media plates

      for (let plate of plates_found) {
        // filter plates that do not contain hotel nest id
        let mediPlateInstrument = this.plateInstrumentArray.find((p)=>p.key == plate.id)?.instrument.name;
        if(!mediPlateInstrument?.includes("hotel")){continue;}
        const wells_in_plate = wells_found.filter((well) => well.plate_id === plate.id);
        if (wells_in_plate.length >= totalMedia) {   
          media_wells = wells_in_plate.slice(0, totalMedia);
          media_plate = plate;
          if (media_wells === undefined) continue;
          media_ids = medias_found
            .filter((reagent) => media_wells!.some((well) => well.id === reagent.well_id))
            .map((reagent) => reagent.id);
          // push to consumable_ids
          if (protocol_name !== "transfection") {
            consumable_ids.push(...media_ids);
          }
          break;
        }
      }
      let selectedTips: { [key: string]: any[] } = {}; // To store selected tips for each type
      let selectedTipBoxes: { [key: string]: Plate } = {}; // To store selected boxes for each type
      // console.log("tipsFoundForEachType", tipsFoundForEachType);  
    // Assuming this exists somewhere in your function where you process the wells and tips
    // Assuming matchingWells is already defined and populated with well objects


     // console.log("tipsFoundForEachType", tipsFoundForEachType);

    Object.entries(tipsFoundForEachType).forEach(([tipType, tips]) => {
      const wellIdsForTips = tips.map(tip => tip.id);
    
      // Filter wells_tips_found to those that match the well IDs collected from the tips.
      const matchingWells = wells_tips_found.filter(well => wellIdsForTips.includes(well.id));
    
      
      // Now, use these matching wells to filter for boxes.
      const boxesForTipType = tip_boxes_found.filter(box =>
        matchingWells.some(well => well.plate_id === box.id)
      );

      // Add boxes to the selectedTipBoxes object
      selectedTipBoxes[tipType] = boxesForTipType[0]; // Assuming there is at least one box available
      tip_ids = tips.map(tip => tip.id);
      // push to consumable_ids
      // console.log("true tip ids", tips.filter((reagent) => media_wells!.some((well) => well.id === reagent.well_id))
      //.map((reagent) => reagent.id));
      consumable_ids.push(...tip_ids);
      // Add tips to the selectedTips object
      selectedTips[tipType] = tips.slice(0, totalTipsNeededForEachType[tipType]);

     });

      return {
        wells: media_wells,
        plate: media_plate,
        transfectionReagents: transfectionReagents,
        tips: selectedTips,
        tip_box: selectedTipBoxes,
        consumable_ids: consumable_ids,
      };
    }


    getProtocolParameters(routine:Routine):Params{
      let output : Params = {};
      switch(routine.name){
        case "Image Culture Plate":
          // console.log("routine", routine);  
          var liconicReqs = this.getLiconicNest(routine);
          output = {
            workflow_step_ids: routine.metadata.helix_workflow_step_ids,
            cytationProgram: routine.parameters.protocol_name,
            nestName: liconicReqs.nestName,
            liconic_cassette: liconicReqs.liconicCassette || "❓",
            liconic_level: liconicReqs.liconicLevel || "❓",
            wellPlateID: routine.parameters.wellPlateID || "❓",
            cultureIDs: routine.parameters.culture_ids || "❓",
            culturePlateBarcode: liconicReqs.culturePlateBarcode || "❓",
            wellAddresses: routine.parameters.well_array_to_process || "❓",
            culturePlateType: routine.parameters.plate_type,
          }
          return output
        case "Media Exchange":
            var liconicReqs = this.getLiconicNest(routine);
            console.log("plate type", routine.parameters.plate_type)
            var cultureWells: number[] | string[] = routine.parameters.well_array_to_process;
            if (routine.parameters.plate_type === "96 well"){
              // starting from 0 to 95
              cultureWells = Array.from({length: 96}, (_, i) => i);
              console.log("culture wells", cultureWells)
            }
            else {
              cultureWells = routine.parameters.well_array_to_process;
            }
            var media_plate_well_found = this.mapWellsToRequirementsOLD(
              cultureWells,
              routine.parameters.plate_type,
              routine.parameters.media_type,
              Number(routine.parameters.percent_media_change)
            );

          var mediaPlateLocation = this.raw_inventory.nests.find(
            (nest) => nest.id === media_plate_well_found.plate?.nest_id
          )?.name;
          console.log("Media plate location is"+mediaPlateLocation);
          var mediaPlateBarcode = media_plate_well_found.plate?.barcode;
          var mediaPlateWells = media_plate_well_found.wells
            ? media_plate_well_found.wells.map((well: Well) => `${well.row}${well.column}`): "❓";

          var tipType = "";
          if (routine.parameters.plate_type == "384 well"){
            tipType = "200 ul tip";
          }
          else if (routine.parameters.plate_type == "6 well" || routine.parameters.plate_type == "24 well" ){
            tipType = "1000 ul tip";
          }
          else{
            tipType = "unknown";
          }
          console.log("media plate tip box", media_plate_well_found.tip_box)
          // if (media_plate_well_found.tip_box[tipType] === undefined){
          //   tiprackLocation = "❓";
          // }
          // else{
          //   var tiprackLocation = this.raw_inventory.nests.find(
          //     (nest) => nest.id === media_plate_well_found.tip_box[tipType]?.nest_id
          //   )?.name;
          // }
          // console.log("tip box location", media_plate_well_found.tip_box);
          if (media_plate_well_found.tip_box === undefined){
            tiprackLocation = "❓";
          }
          else {
           var tiprackLocation = this.raw_inventory.nests.find(
              (nest) => nest.id === media_plate_well_found.tip_box[tipType]?.nest_id
            )?.name;
          }
          //  tiprackLocation = "❓";
            var mediaPlateBarcode = media_plate_well_found.plate?.barcode;
            var mediaPlateWells = media_plate_well_found.wells
              ? media_plate_well_found.wells.map((well: Well) => `${well.row}${well.column}`): "❓";
  
            var tiprackLocation = this.raw_inventory.nests.find(
                (nest) => nest.id === media_plate_well_found.tip_box?.nest_id
              )?.name;
            if(tiprackLocation){
              const key = tiprackLocation.split('_').slice(2, 5).join('_');
              var slotNumber : number | null = this.OT2SlotMapping[key];
            }

            else{
              var slotNumber: number | null  = null;
            }
            console.log("culture wells", cultureWells)
            var tiprackWells = media_plate_well_found.tips
            ? media_plate_well_found.tips.map((well: Well) => `${well.row}${well.column}`): "❓";
            this.updateReagentInventoryOLD(media_plate_well_found.wells);
            this.updateReagentInventoryOLD(media_plate_well_found.tips);
            output = {
                workflow_step_ids: routine.metadata.helix_workflow_step_ids,
                culturePlateBarcode: liconicReqs.culturePlateBarcode || "❓",
                cultureIDs: routine.parameters.culture_ids || "❓",
                culturePlateCassette: liconicReqs.liconicCassette || "❓",
                culturePlateLevel: liconicReqs.liconicLevel || "❓",
                culturePlateType: routine.parameters.plate_type,
                culturePlateWells: cultureWells,
                mediaPlateLocation: mediaPlateLocation || "❓",
                mediaPlateBarcode: mediaPlateBarcode|| "❓",
                mediaPlateWells: mediaPlateWells|| "❓",
                tiprackWells: tiprackWells|| "❓",
                tiprackLocation: tiprackLocation || "❓",
                tiprackSlot:  slotNumber || "❓",
                wellPlateID: routine.parameters.wellPlateID || "❓",
                percentChange: Number(routine.parameters.percent_media_change) || "❓",
                consumableIDs:  media_plate_well_found.consumable_ids.join(","),
            }
            return output
        case "Passage":
          return this.getPassagingParams(routine);
        case "Transfect":
          return this.getTransfectionParams(routine);
        default:
          return {};
      }
    }

    getTransfectionParams(routine:Routine):Params {
      const transfectionConsumsables = this.mapWellsToRequirements(
        {
        well_array_to_process: routine.parameters.well_array_to_process,
        plate_type: routine.parameters.plate_type,
        protocol_name:"transfection",
        plate_id: routine.parameters.DNAPlateID,
        }
      );
  
      // this.updateReagentInventory(transfectionConsumsables);
      this.updateReagentInventory(transfectionConsumsables.tips);

      var liconicReqs = this.getLiconicNest(routine);
      // console.log("tip box location", transfectionConsumsables.tip_box);
      const tiprackLocation = this.raw_inventory.nests.find(
        (nest) => nest.id === transfectionConsumsables.tip_box["20 ul tip"]?.nest_id)?.name;

      var DNAPlateID = routine.parameters.DNAPlateID;
      var dnaConcentration = routine.parameters.dnaConcentration;
      // console.log("DNA concentration", dnaConcentration)
      var plasmidWells = routine.parameters.plasmidWells;
      var DNAPlateType = routine.parameters.DNAPlateType;

      let optimemWells = transfectionConsumsables.transfectionReagents.optimemWells;
      if (plasmidWells === undefined) {
        plasmidWells = ["❓"];
      }

      const t_tips_1 = transfectionConsumsables.tips;
      // console.log("transfectionConsumsables", transfectionConsumsables)
      // console.log("t_tips_1", t_tips_1);
      if (t_tips_1 === undefined) {
        console.error("t_tips_1 is undefined");
      }
      if (plasmidWells === null || plasmidWells === undefined) {
        plasmidWells = ["❓"];
      }
      const t_tips_1_1000 = t_tips_1["1000 ul tip"].slice(0,plasmidWells.length);
      var t_tips_1_20 = t_tips_1["20 ul tip"];
      if (t_tips_1_20 === "") {
        t_tips_1_20 = "❓";
      }
      const t_tips_2 = transfectionConsumsables.tips;
      const t_tips_2_1000 = t_tips_2["1000 ul tip"].slice(plasmidWells.length, plasmidWells.length*2);
      const t_tips_2_20 = t_tips_2["20 ul tip"];

      const tr_wells_1 = {
        "20 ul tips": t_tips_1_20 ? t_tips_1_20.map((well: Well) => `${well.row}${well.column}`) : "❓",
        "1000 ul tips": t_tips_1_1000 ? t_tips_1_1000.map((well: Well) => `${well.row}${well.column}`) : "❓",
      }

      const tr_wells_2 = {
        "20 ul tips": [],
        "1000 ul tips": t_tips_2_1000 ? t_tips_2_1000.map((well: Well) => `${well.row}${well.column}`) : "❓",
      }

      const transfection_plate_location = this.raw_inventory.nests.find(
        (nest) => nest.id === transfectionConsumsables.transfectionReagents.transfectionPlateFound?.nest_id)?.name;
      // console.log("dna plate found", transfectionConsumsables.transfectionReagents.DNAPlateFound)
      const DNA_plate_location = this.raw_inventory.nests.find(
        (nest) => nest.id === transfectionConsumsables.transfectionReagents.DNAPlatesFound[0]?.nest_id)?.name;

      console.log("transfectionConsumsables", transfectionConsumsables);
      const consumable_ids = transfectionConsumsables.consumable_ids.join(",");

      // console.log("consumable_ids", consumable_ids.length);
      var lipo_well = transfectionConsumsables.transfectionReagents?.lipoWell;
      lipo_well = lipo_well ? `${lipo_well.row}${lipo_well.column}` : "❓";

      var p3000_well = transfectionConsumsables.transfectionReagents?.p3000Well;
      p3000_well = p3000_well ? `${p3000_well.row}${p3000_well.column}` : "❓";
      
      var t_reagents_plate_wells = "❓";
      var dna_reagents_plate_wells = "❓";
      if (plasmidWells === undefined || plasmidWells === null) {
        plasmidWells = ["❓"];
      }
      console.log("optimemWells", optimemWells.length)
      console.log("plasmidWells", plasmidWells.length)
      if (optimemWells.length >= plasmidWells.length*2) {
     
        const t_wells = optimemWells.slice(0, plasmidWells.length);
        const dna_wells = optimemWells.slice(plasmidWells.length, plasmidWells.length*2);
        this.updateReagentInventory(t_wells);
        this.updateReagentInventory(dna_wells);
        t_reagents_plate_wells = t_wells.map((well: Well) => `${well.row}${well.column}`);
        dna_reagents_plate_wells = dna_wells.map((well: Well) => `${well.row}${well.column}`);
      }
      let output = {
          workflow_step_ids: routine.metadata.helix_workflow_step_ids,
          culturePlateBarcode: liconicReqs.culturePlateBarcode || "❓",
          cultureIDs: routine.parameters.culture_ids || "❓", 
          lipoWell: lipo_well || "❓",
          p3000Well: p3000_well || "❓",
          tReagentsPlateLocation: transfection_plate_location || "❓",
          tReagentsPlateWells: t_reagents_plate_wells, 
          plasmidWells: plasmidWells || "❓",
          dnaConcentration: dnaConcentration || "❓",
          DNAPlateType: DNAPlateType || "❓",
          DNAPlateID: DNAPlateID || "❓",
          DNAMass: routine.parameters.DNAMass || "❓",
          DNAReagentsPlateLocation: DNA_plate_location || "❓",
          DNAReagentsPlateWells: dna_reagents_plate_wells,
          tiprackLocation: tiprackLocation || "cf_ot2_1_1_1_nest",
          tiprackWells_1: tr_wells_1 || "❓",
          tiprackWells_2: tr_wells_2 || "❓",
          culturePlateCassette: liconicReqs.liconicCassette || "❓",
          culturePlateLevel: liconicReqs.liconicLevel || "❓",
          culturePlateType: routine.parameters.plate_type,
          culturePlateWells: routine.parameters.well_array_to_process,
          consumableIDs: consumable_ids,
        };
        return output;
    }
    

    getPassagingParams(routine:Routine) : Params {
      var liconicReqs = this.getLiconicNest(routine);
      const findAvailableGeltrexPlates = (): Plate[] => {
        const medias_found: Reagent[] = this.raw_inventory.reagents.filter((reagent: Reagent) => reagent.name === "Geltrex");
        const wells_found: Well[] = this.raw_inventory.wells.filter((well:Well) =>medias_found.some((reagent:Reagent) => reagent.well_id === well.id));
        const plates_found: Plate[] = this.raw_inventory.plates.filter((plate:Plate) =>wells_found.some((well:Well) => well.plate_id === plate.id));
        return plates_found;
      }
    
      var cultureWells = routine.parameters.well_array_to_process;
      // cultureWells = cultureWells.slice(0, 20);
      var newCultureWells = cultureWells;
      if (routine.parameters.plate_type === "6 well") {
        // if well array to process exists, then take the first element of it and set cultureWells equal to that
        if (routine.parameters.well_array_to_process) {
          cultureWells = routine.parameters.well_array_to_process.map(e => Number(e)).filter(e => !isNaN(e));
          cultureWells = [cultureWells[0]];
        }
      }
      let newPlateNestName: string | undefined = undefined;
      //find available plate 
      const available_plates = findAvailableGeltrexPlates();
      let currentPlateIndex = 0
      //const [currentPlateIndex, setCurrentPlateIndex] = useState(0);

      function getNextAvailablePlate() {
        if (available_plates.length === 0) {
          // console.log("No available plates");
          return null;
        }
        let newPlate = available_plates[currentPlateIndex % available_plates.length] || "❓";
        // setCurrentPlateIndex(prevIndex => (prevIndex + 1) % available_plates.length);
        return newPlate;
      }
      let newPlate = getNextAvailablePlate();
      if (!newPlate) {
        // Handle the case where no plate is available
        // console.log("No new plate available");
        return {"error": "No new plate available"};
      }

      const UpdateGeltrexPlateInventory = (plate: Plate) => {
        // remove geltrex from the wells of the plate
        if (!plate) {
          // console.log("No plate to update", plate);
          return;
        }
        const wells_found = this.raw_inventory.wells.filter((well) => well.plate_id === plate.id);
        const medias_found = this.raw_inventory.reagents.filter((reagent) => reagent.name === "Geltrex");
        const wells_with_geltrex = wells_found.filter((well) => medias_found.some((reagent) => reagent.well_id === well.id));
        wells_with_geltrex.forEach((well) => {
          this.raw_inventory.reagents = this.raw_inventory.reagents.filter((reagent) => reagent.well_id !== well.id);
        });
      };

      
      UpdateGeltrexPlateInventory(newPlate);
      let nestName: string | undefined = undefined;
      let newPlateBarcode = "❓";
      let newPlateType = "❓";
      if (newPlate) {
        // console.log("new plate", newPlate);
        newPlateBarcode = newPlate.barcode;
        newPlateType = newPlate.plate_type;
        let newPlateNestId = newPlate.nest_id;
        newPlateNestName = this.raw_inventory.nests.find((nest) => nest.id === newPlateNestId)?.name;
      }
      let plate = this.raw_inventory.plates.find(
        (plate) => plate.name === routine.parameters.wellPlateID
      );
      
      let plateBarcode = "❓";
      if (plate) {
        plateBarcode = plate.barcode;
        let plateNestId = plate.nest_id;
        nestName = this.raw_inventory.nests.find((nest) => nest.id === plateNestId)?.name;
      }
      let newPlateLevel: string | undefined = undefined;
      let newPlateCassette: string | undefined = undefined;
      let newPlateWells: number[] = [];
      if (newPlateNestName) {
        let parts = newPlateNestName.split("_");
        newPlateLevel = parts[1];
        newPlateCassette = parts[2];
      } else {
        newPlateNestName = undefined;
      }
      // Assuming maxWells is the new number that's being passed in
      let maxWells = newCultureWells.length;
      let plateLength = Number(newPlateType.split(" ")[0]);
      let actualLength = Math.min(plateLength, maxWells);

      newPlateWells = Array.from({length: actualLength}, (_, i) => i);

      //Add first available plate as param 
      const percent_change = 0;
      // 1. Media and tips for prepping new plate
      const prep_media_plate_and_tips = this.mapWellsToRequirements(
        {
        well_array_to_process: newPlateWells,
        plate_type: routine.parameters.plate_type,
        media_type: routine.parameters.media_type,
        protocol_name: "passage - prep",
        percent_change: percent_change,
        new_tip: false
        }
      );

      this.updateReagentInventory(prep_media_plate_and_tips.wells);
      this.updateReagentInventory(prep_media_plate_and_tips.tips);

      // 2. dissociation reagent and tips
      const dissociation_plate_and_tips = this.mapWellsToRequirements(
        {
        well_array_to_process: cultureWells,
        plate_type: routine.parameters.plate_type,
        media_type: "Passaging Reagents",
        protocol_name: "passage - dissociation",
        percent_change: percent_change,
        new_tip: true
        }
      );

      this.updateReagentInventory(dissociation_plate_and_tips.wells);
      this.updateReagentInventory(dissociation_plate_and_tips.tips);

      // 3. media and tips
      const wash_media_plate_and_tips = this.mapWellsToRequirements({
        well_array_to_process: cultureWells,
        plate_type: routine.parameters.plate_type,
        media_type: routine.parameters.media_type,
        protocol_name: "passage - wash",
        percent_change: percent_change,
        new_tip: true
      }
      );

      this.updateReagentInventory(wash_media_plate_and_tips.wells);
      this.updateReagentInventory(wash_media_plate_and_tips.tips);

      // 4. Tips for dispensing cell suspension
      const cell_suspension_tips = this.mapWellsToRequirements({
        well_array_to_process: cultureWells,
        plate_type: routine.parameters.plate_type,
        media_type: routine.parameters.media_type,
        protocol_name: "passage - cell suspension",
        percent_change: percent_change,
        new_tip: true
      }
      );
      
      this.updateReagentInventory(cell_suspension_tips.tips);

      //update new plate
      const prep_media_plate_location = this.raw_inventory.nests.find(
        (nest) => nest.id === prep_media_plate_and_tips.plate?.nest_id)?.name;
      const prep_media_plate_barcode = prep_media_plate_and_tips.plate?.barcode;
      const prep_media_wells = prep_media_plate_and_tips.wells
        ? prep_media_plate_and_tips.wells.map((well: Well) => `${well.row}${well.column}`): "❓";

      const prep_tiprack_location = this.raw_inventory.nests.find(
        (nest) => nest.id === prep_media_plate_and_tips.tip_box["1000 ul tip"]?.nest_id)?.name;
      const prep_tiprack_wells = prep_media_plate_and_tips.tips
        ? prep_media_plate_and_tips.tips["1000 ul tip"].map((well: Well) => `${well.row}${well.column}`): "❓";

      const dissociation_plate_location = this.raw_inventory.nests.find(
        (nest) => nest.id === dissociation_plate_and_tips.plate?.nest_id)?.name;
      const dissociation_plate_barcode = dissociation_plate_and_tips.plate?.barcode;
      const dissociation_plate_well_found = dissociation_plate_and_tips.wells
        ? dissociation_plate_and_tips.wells.map((well: Well) => `${well.row}${well.column}`): "❓";
      //   console.log("dissociation_plate_and_tips", dissociation_plate_and_tips);
      // console.log("dissociation_plate_well_found", dissociation_plate_well_found);
      const dissociation_tiprack_location = this.raw_inventory.nests.find(
        (nest) => nest.id === dissociation_plate_and_tips.tip_box["1000 ul tip"]?.nest_id)?.name;
      const dissociation_tiprack_wells = dissociation_plate_and_tips.tips
        ? dissociation_plate_and_tips.tips["1000 ul tip"].map((well: Well) => `${well.row}${well.column}`): "❓";

      const wash_media_plate_location = this.raw_inventory.nests.find(
        (nest) => nest.id === wash_media_plate_and_tips.plate?.nest_id)?.name;
      const wash_media_plate_barcode = wash_media_plate_and_tips.plate?.barcode;
      const wash_media_wells = wash_media_plate_and_tips.wells
        ? wash_media_plate_and_tips.wells.map((well: Well) => `${well.row}${well.column}`): "❓";
      const wash_tiprack_location = this.raw_inventory.nests.find(
        (nest) => nest.id === wash_media_plate_and_tips.tip_box["1000 ul tip"]?.nest_id)?.name;
      const wash_tiprack_wells = wash_media_plate_and_tips.tips
        ? wash_media_plate_and_tips.tips["1000 ul tip"].map((well: Well) => `${well.row}${well.column}`): "❓";

      const cell_suspension_media_plate_location = this.raw_inventory.nests.find(
        (nest) => nest.id === cell_suspension_tips.plate?.nest_id)?.name;
      const cell_suspension_media_plate_barcode = cell_suspension_tips.plate?.barcode;
      const cell_suspension_media_wells = cell_suspension_tips.wells
        ? cell_suspension_tips.wells.map((well: Well) => `${well.row}${well.column}`): "❓";
      const cell_suspension_tiprack_location = this.raw_inventory.nests.find(
        (nest) => nest.id === cell_suspension_tips.tip_box["1000 ul tip"]?.nest_id)?.name;
      const cell_suspension_tiprack_wells = cell_suspension_tips.tips
        ? cell_suspension_tips.tips["1000 ul tip"].map((well: Well) => `${well.row}${well.column}`): "❓";
      // console.log("newPlate",newPlate)
      
      let output = {
        workflow_step_ids: routine.metadata.helix_workflow_step_ids,
        // source plates is an array of culturePlates containing barcode, id,cassette,level,plateType, wells
        sourcePlates: [
          {
            culturePlateBarcode: plateBarcode,
            cultureIDs: routine.parameters.culture_ids,
            wellPlateIDs: [Number(routine.parameters.wellPlateID)],
            culturePlateCassette: liconicReqs.liconicCassette || "❓",
            culturePlateLevel: liconicReqs.liconicLevel || "❓",
            culturePlateType: routine.parameters.plate_type,
            culturePlateWells: routine.parameters.well_array_to_process,
          },
        ],
        
        // destination plate is the new plate
        
        destinationPlates: [
          {
            culturePlateBarcode: newPlateBarcode,
            cultureIDs: [0],
            culturePlateCassette:  newPlateCassette || "❓",
            culturePlateLevel: newPlateLevel || "❓",
            wellPlateIDs: [newPlate.id],
            culturePlateWells: newPlateWells,
            culturePlateType: newPlateType,
          },
        ],
        
        prep_media_plate_location: prep_media_plate_location || "❓",
        prep_media_plate_barcode:  prep_media_plate_barcode || "❓",
        prep_media_wells: prep_media_wells || "❓",
        prep_tiprack_location: prep_tiprack_location || "❓",
        prep_tiprack_wells: prep_tiprack_wells || "❓",
        prep_tiprack_slot: 6,

        dissociation_plate_location: dissociation_plate_location || "❓",
        dissociation_plate_barcode: dissociation_plate_barcode || "❓",
        dissociation_plate_well_found: dissociation_plate_well_found || "❓",
        dissociation_tiprack_location: dissociation_tiprack_location || "❓",
        dissociation_tiprack_wells: dissociation_tiprack_wells || "❓",
        dissociation_tiprack_slot: 6,

        wash_media_plate_location: wash_media_plate_location || "❓",
        wash_media_plate_barcode: wash_media_plate_barcode || "❓",
        wash_media_wells: wash_media_wells || "❓",
        wash_tiprack_location: wash_tiprack_location || "❓",
        wash_tiprack_slot: 6,
        wash_tiprack_wells: wash_tiprack_wells || "❓",

        cell_suspension_media_plate_location: cell_suspension_media_plate_location || "❓",
        cell_suspension_media_plate_barcode: cell_suspension_media_plate_barcode || "❓",
        cell_suspension_media_wells: cell_suspension_media_wells || "❓",
        cell_suspension_tiprack_location: cell_suspension_tiprack_location || "❓",
        cell_suspension_tiprack_wells: cell_suspension_tiprack_wells || "❓",
        cell_suspension_tiprack_slot: 6,
        percent_change: 0,
        consumableIDs: [
          ...prep_media_plate_and_tips.consumable_ids,
          ...dissociation_plate_and_tips.consumable_ids,
          ...wash_media_plate_and_tips.consumable_ids,
          ...cell_suspension_tips.consumable_ids,
        ].join(","),
    };
    return output;
  }
}