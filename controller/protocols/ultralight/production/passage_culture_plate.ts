import { ToolCommandInfo } from "@/types";
import Protocol from "@/protocols/protocol";
import Paths from "./paths";
const paths = Paths();
import { z } from "zod";
export type ProtocolParamType =
  | "boolean"
  | "string"
  | "number"
  | "enum"
  | "Barcode"
  | "WellPlateWithWells";
import { ToolType } from "gen-interfaces/controller";
export interface ProtocolParamInfo {
  type: ProtocolParamType;
  description: string;
  options: string[];
  default?: string;
}
const zBarcode = z.string().regex(/^\d{12}$/, "Barcode must be 12 digits");
const zWellPlateSelection = (wells: number) => z.number().int().max(wells).array();
const zConsumableWellPlateSelection = (wells: number) => z.string().max(wells).array();
const zNumberArray = z.array(z.number());
// new object for well plates for culture, contains the barcode, ID, Cassette, levels, wells, and type
export const index = z.string();
type Param<T extends z.ZodTypeAny, B extends ProtocolParamType> = z.ZodBranded<T, B> & {
  _def: { _paramType: B };
};

function Param<T extends z.ZodTypeAny, B extends ProtocolParamType>(name: B, type: T): Param<T, B> {
  const branded = type.brand(name) as Param<T, B>;
  branded._def._paramType = name;
  return branded;
}
export const zCultureWellPlate = z.object({
  culturePlateBarcode: z.string().describe("The barcode of the plate to load"),
  cultureIDs: zNumberArray.describe("The IDs of the cultures to process"),
  wellPlateIDs: zNumberArray.describe("The IDs of the well plates to process"),
  culturePlateCassette: z.number().positive().int().describe("The cassette number to load from the Liconic"),
  culturePlateLevel: z.number().positive().int().describe("The level number to load from the Liconic"),
  culturePlateWells: zWellPlateSelection(384).describe("The numeric index of wells to process").default([0,1]),
  culturePlateType: z.string().default("6 well").describe("The type of plate (6,12,24,96)"),
})
.brand<"zCultureWellPlate">();
export type zCultureWellPlate = z.infer<typeof zCultureWellPlate>;
export const OpentronsPassageParams = z.object({
  workflow_step_ids:zNumberArray.describe("The IDs of the routine to run"),
  
  sourcePlates : z.array(zCultureWellPlate).describe("The source plates to process"),
  destinationPlates : z.array(zCultureWellPlate).describe("The destination plates to process"),

  mediaPlateLocation: z.string().default("Hotel 1 Nest 1").describe("The location of the plate"),
  mediaPlateBarcode: zBarcode.describe("The barcode of the plate to load").default("123123123123"),
  mediaPlateWells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing reagents to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),

  
  prep_media_plate_location: z.string().default("Hotel 1 Nest 1").describe("The location of the plate"),
  prep_media_plate_barcode: zBarcode.describe("The barcode of the plate to load").default("123123123123"),
  prep_media_wells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing reagents to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),
  prep_tiprack_location: z.string().default("Hotel 1 Nest 3").describe("The location of the tiprack"),
  prep_tiprack_slot: z.number().int().default(3).describe("The slot of the tiprack"),
  prep_tiprack_wells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing tips to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),

  dissociation_plate_location: z.string().default("Hotel 1 Nest 2").describe("The location of the plate"),
  dissociation_plate_barcode: zBarcode.describe("The barcode of the plate to load").default("123123123123"),
  dissociation_plate_wells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing reagents to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),
  dissociation_tiprack_location: z.string().default("Hotel 1 Nest 4").describe("The location of the tiprack"),
  dissociation_tiprack_slot: z.number().int().default(6).describe("The slot of the tiprack"),
  dissociation_tiprack_wells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing tips to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),

  wash_media_plate_location: z.string().default("Hotel 1 Nest 1").describe("The location of the plate"),
  wash_media_plate_barcode: zBarcode.describe("The barcode of the plate to load").default("123123123123"),
  wash_media_wells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing reagents to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),
  wash_tiprack_location: z.string().default("Hotel 1 Nest 3").describe("The location of the tiprack"),
  wash_tiprack_slot: z.number().int().default(3).describe("The slot of the tiprack"),
  wash_tiprack_wells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing tips to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),

  cell_suspension_media_plate_location: z.string().default("Hotel 1 Nest 1").describe("The location of the plate"),
  cell_suspension_media_plate_barcode: zBarcode.describe("The barcode of the plate to load").default("123123123123"),
  cell_suspension_media_wells:  zConsumableWellPlateSelection(96).describe("The numeric index of wells containing reagents to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),
  cell_suspension_tiprack_location: z.string().default("Hotel 1 Nest 3").describe("The location of the tiprack"),
  cell_suspension_tiprack_slot: z.number().int().default(3).describe("The slot of the tiprack"),
  cell_suspension_tiprack_wells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing tips to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),
  
  percentChange: z.number().positive().int().default(100).describe("The percent change to make"),
  consumableIDs: z.string().default("").describe("Comma separated string of reagent/tip IDs to consume"),
});

export default class OpentronsPassageUltralight extends Protocol<typeof OpentronsPassageParams> {
  protocolId = "passage_culture_plate";
  category = "production";
  workcell = "Ultralight";
  name = "Passaging"
  paramSchema = OpentronsPassageParams;

  _generateCommands(params: z.infer<typeof OpentronsPassageParams>) {
    let commands = [
    ];

    // Loop through each destination plate
    for (let i = 0; i < params.destinationPlates.length; i++) {
      const plate = params.destinationPlates[i];

      // Append commands for each plate
      commands.push(
        // Slack start
        {
          label: "Passage Beginning",
          toolId: "helix_tool_1",
          toolType: "helix_tool",
          command: "slack_message",
          params: {
            message: `:petri_dish: -> :petri_dish: Passage has started for culture ${params.sourcePlates[0].cultureIDs[0]}`,
          },
        },
        ...paths.hotelToOpentrons({labware:"96-well deepwell",location:"Nest5",reagentPlateLocation:params.prep_media_plate_location}),
        {
          label: "Unload plate from Liconic",
          toolId: "Liconic",
          toolType:  ToolType.liconic,
          command: "fetch_plate",
          params: {
            cassette: plate.culturePlateCassette,
            level: plate.culturePlateLevel,
          },
        },
        ...paths.liconicToOpentrons({labware:"384-well celltreat", location:"Nest1"}),
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "deLidOTNest5",
            labware: "96-well deepwell",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "deLidOTNest1",
            labware: "6-well celltreat",
          },
        },
        {
          toolId: "opentrons2_1",
          toolType: "opentrons2",
          command: "run_program",
          params: {
            program_name: "media_exchange",
            params: {
              plate_type: plate.culturePlateType,
              tiprack_wells: params.prep_tiprack_wells,
              tipbox_slot: params.prep_tiprack_slot,
              reagent_wells: params.prep_media_wells,
              well_array_to_process: plate.culturePlateWells,
              new_tip: "False",
              percent_change: params.percentChange,
            },
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "reLidOTNest1",
            labware: "6-well celltreat",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "reLidOTNest5",
            labware: "96-well deepwell",
          },
        },
        ...paths.opentronToLiconic({labware:"6-well celltreat", location:"Nest1"}),
        {
          label: "Load plate into Liconic",
          toolId: "Liconic",
          toolType:  ToolType.liconic,
          command: "store_plate",
          params: {
            cassette: plate.culturePlateCassette,
            level: plate.culturePlateLevel,
          },
        },
        ...paths.opentronToHotel({labware:"96-well deepwell", location:"Nest5", reagentPlateLocation: params.prep_media_plate_location}),
      );
      }

      // Loop through each source plate
    for (let i = 0; i < params.sourcePlates.length; i++) {
      const plate = params.sourcePlates[i];
    
      commands.push(
        // part 2 of 4: Dissociation of cells from source culture plate

        ...paths.hotelToOpentrons({labware:"96-well deepwell",location:"Nest5",reagentPlateLocation:params.dissociation_plate_location}),
        {
          label: "Unload plate from Liconic",
          toolId: "Liconic",
          toolType:  ToolType.liconic,
          command: "fetch_plate",
          params: {
            cassette: plate.culturePlateCassette,
            level: plate.culturePlateLevel,
          },
        },
        ...paths.liconicToOpentrons({labware:"6-well celltreat", location:"Nest1"}),
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "deLidOTNest5",
            labware: "96-well deepwell",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "deLidOTNest1",
            labware: "6-well celltreat",
          },
        },
      {
        toolId: "opentrons2_1",
        toolType: "opentrons2",
        command: "run_program",
        params: {
          program_name: "dissociation",
          params: {
            plate_type: plate.culturePlateType,
            tiprack_wells: params.dissociation_tiprack_wells,
            tipbox_slot: params.dissociation_tiprack_slot,
            reagent_wells: params.dissociation_plate_wells,
            well_array_to_process: plate.culturePlateWells,
          },
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "reLidOTNest1",
          labware: "6-well celltreat",
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "reLidOTNest5",
          labware: "96-well deepwell",
        },
      },
      ...paths.opentronToLiconic({labware:"6-well celltreat", location:"Nest1"}),
      {
        label: "Load plate into Liconic",
        toolId: "Liconic",
        toolType:  ToolType.liconic,
        command: "store_plate",
        params: {
          cassette: plate.culturePlateCassette,
          level: plate.culturePlateLevel,
        },
      },
      ...paths.opentronToHotel({labware:"96-well deepwell", location:"Nest5", reagentPlateLocation: params.dissociation_plate_location}),
      );
      }

      commands.push(
      {
        toolId: "opentrons2_1",
        toolType: "opentrons2",
        command: "sleep",
        label: `Wait for 8 minutes for liconic stage to finish moving`,
        params: {
          seconds: 300,
        },
      }
      );


    for (let i = 0; i < params.sourcePlates.length; i++) {
      const plate = params.sourcePlates[i];
      commands.push(
        //Part 3 of 4: Collecting of cells from culture plate 

      // loop through source plates 
      ...paths.hotelToOpentrons({labware:"96-well deepwell",location:"Nest5",reagentPlateLocation:params.wash_media_plate_location}),
      {
        label: "Unload plate from Liconic",
        toolId: "Liconic",
        toolType:  ToolType.liconic,
        command: "fetch_plate",
        params: {
          cassette: plate.culturePlateCassette,
          level: plate.culturePlateLevel,
        },
      },
      ...paths.liconicToOpentrons({labware:"6-well celltreat", location:"Nest1"}),
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "deLidOTNest5",
          labware: "96-well deepwell",
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "deLidOTNest1",
          labware: "6-well celltreat",
        },
      },
      {
        toolId: "opentrons2_1",
        toolType: "opentrons2",
        command: "run_program",
        params: {
          program_name: "wash_plate",
          params: {
            plate_type: plate.culturePlateType,
            tiprack_wells: params.wash_tiprack_wells,
            tipbox_slot: params.wash_tiprack_slot,
            reagent_wells: params.wash_media_wells,
            well_array_to_process: plate.culturePlateWells,
          },
        },
      },

      // ...paths.cpFromOT2_slot1ToLiconic({ culturePlateBarcode: plate.culturePlateBarcode, culturePlateCassette: plate.culturePlateCassette, culturePlateLevel: plate.culturePlateLevel }),
      
      );
    } //end of loop 

    for (let i = 0; i < params.sourcePlates.length; i++) {
      const s_plate = params.sourcePlates[i];
      // commands.push(
      //   ...paths.cpFromLiconicToOT2_slot1({ culturePlateBarcode: s_plate.culturePlateBarcode, culturePlateCassette: s_plate.culturePlateCassette, culturePlateLevel: s_plate.culturePlateLevel }),
      // )
      for (let j = 0; j < params.destinationPlates.length; j++) {
      const d_plate = params.destinationPlates[j];
      commands.push(
      //Part 4 of 4: Dispense cells into new plate
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "reLidOTNest5",
          labware: "96-well deepwell",
        },
      },
      ...paths.opentronToHotel({labware:"96-well deepwell", location:"Nest5", reagentPlateLocation: params.wash_media_plate_location}),
      // Bring new culture plate to OT2 slot 5
      {
        label: "Unload plate from Liconic",
        toolId: "Liconic",
        toolType:  ToolType.liconic,
        command: "fetch_plate",
        params: {
          cassette: d_plate.culturePlateCassette,
          level: d_plate.culturePlateLevel,
        },
      },
      ...paths.liconicToOpentrons({labware:"6-well celltreat", location:"Nest5"}),
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "deLidOTNest5",
          labware: "6-well celltreat",
        },
      },
      {
        label: "Dispense Cell Suspension", 
        toolId: "opentrons2_1",
        toolType: "opentrons2",
        command: "run_program",
        params: {
          program_name: "dispense_cell_suspension",
          params: {
            s_plate_type: s_plate.culturePlateType,
            d_plate_type: d_plate.culturePlateType,
            tiprack_wells: params.cell_suspension_tiprack_wells,
            tipbox_slot: params.cell_suspension_tiprack_slot,
            reagent_wells: params.cell_suspension_media_wells,
            d_well_array_to_process: d_plate.culturePlateWells,
            s_well_array_to_process: s_plate.culturePlateWells,
          },
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "reLidOTNest5",
          labware: "6-well celltreat",
        },
      },
      ...paths.opentronToLiconic({labware:"6-well celltreat", location:"Nest5"}),
      {
        label: "Load plate into Liconic",
        toolId: "Liconic",
        toolType:  ToolType.liconic,
        command: "store_plate",
        params: {
          cassette: d_plate.culturePlateCassette,
          level: d_plate.culturePlateLevel,
        },
      },      
      );
    } 
    commands.push(
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "reLidOTNest1",
          labware: "6-well celltreat",
        },
      },
      ...paths.opentronToLiconic({labware:"6-well celltreat", location:"Nest1"}),
      {
        label: "Load plate into Liconic",
        toolId: "Liconic",
        toolType:  ToolType.liconic,
        command: "store_plate",
        params: {
          cassette: s_plate.culturePlateCassette,
          level: s_plate.culturePlateLevel,
        },
      },
      {
        label: "Passage Finishing",
        toolId: "helix_tool_1",
        toolType: "helix_tool",
        command: "slack_message",
        params: {
          message: `:petri_dish: -> :petri_dish: Passage has finished for culture ${params.sourcePlates[0].cultureIDs[0]}`,
        },
      }
      )
  }
      commands.push(
        {
          label: "Update consumables in inventory",
          toolId: "helix_tool_1",
          toolType: "helix_tool",
          command: "update_consumables",
          params: {
            reagent_ids: params.consumableIDs
              .split(",")
              .map((id) => parseInt(id.replace(/\s+/g, ""))),
          },
        },   
        {
          label: "Create Child Culture and attach to new well plate",
          toolId: "helix_tool_1",
          toolType: "helix_tool",
          command: "passage_culture",
          params: {
            culture_id: params.sourcePlates[0].cultureIDs[0],
            well_plate_id: params.destinationPlates[0].wellPlateIDs[0],
            mark_dead: false,
            plate_type: parseInt(params.destinationPlates[0].culturePlateType.match(/\d+/)?.[0] ?? "0", 10),
          },
        },
        {
          label: "Check Off Todo",
          toolId: "helix_tool_1",
          toolType: "helix_tool",
          command: "complete_todo",
          params: {
            todo_id: params.workflow_step_ids[0].toString(),
          },
        }
      );


    return commands as ToolCommandInfo[];
  }
}