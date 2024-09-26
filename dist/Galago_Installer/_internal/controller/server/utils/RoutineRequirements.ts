import { Instrument, Inventory, Nest, Plate, Well, Reagent} from "@/server/utils/InventoryClient";
import { Any } from "@grpc/grpc-js/build/src/generated/google/protobuf/Any";
import React, { useState, useEffect } from "react";

export interface Routine {
  name: string;
  parameters: {
    [key: string]: any;
    wellPlateID?: string;
    culture_ids?: string[];
    plate_type?: string;
    well_array_to_process?: number[] | string[];
    media_type?: string;
    percent_media_change?: number;
  };
  metadata: {
  };
}

export interface RoutineQueueItem {
  routine: Routine, 
  params: Params, 
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
        default:
          return {};
      }
    }
  }