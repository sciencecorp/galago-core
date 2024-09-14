import { ToolCommandInfo } from "@/types";
import Protocol from "@/protocols/protocol";
//import "../paths";
import { z } from "zod";
import { ToolType } from "gen-interfaces/controller";
import Paths from "./paths";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const slackChannel = process.env.ACTIVE_CULTURE_CHANNEL;

const paths = Paths();
const zBarcode = z.string().regex(/^\d{12}$/, "Barcode must be 12 digits");
const zConsumableWellPlateSelection = (wells: number) => z.string().max(wells).array();
const zWellPlateSelection = (wells: number) => z.number().int().max(wells).array();
const zNumberArray = z.array(z.number());

export const OpentronsMediaExchangeParams = z.object({
  workflow_step_ids: zNumberArray.describe("The IDs of the routine to run").default([1234, 1235, 1236]),
  culturePlateBarcode: z.string().describe("The barcode of the plate to load").default("123456789012"),
  cultureIDs: zNumberArray.describe("The IDs of the cultures to process").default([1, 2, 3]),
  culturePlateCassette: z
    .number()
    .positive()
    .int()
    .describe("The cassette number to load from the Liconic")
    .default(1),
  culturePlateLevel: z
    .number()
    .positive()
    .int()
    .describe("The level number to load from the Liconic")
    .default(2),
  culturePlateWells: zWellPlateSelection(96).describe("The numeric index of wells of to process").default([0,1,2,3,4,5]),
  culturePlateType: z.string().default("6 well").describe("The type of plate (6,12,24,96)"),
  mediaPlateBarcode: zBarcode.describe("The barcode of the plate to load").default("123456789012"),
  mediaPlateLocation: z.string().default("Hotel 1 Nest 1").describe("The location of the plate"),
  mediaPlateWells: zConsumableWellPlateSelection(96)
    .describe("The numeric index of wells containing reagents to consume")
    .default(["A1", "A2", "A3", "A4", "A5", "A6"]),
  tiprackWells: zConsumableWellPlateSelection(96)
    .describe("The numeric index of wells containing tips to consume")
    .default(["A1", "A2", "A3", "A4", "A5", "A6"]),
  tiprackLocation: z.string().default("Hotel 1 Nest 3").describe("The location of the tiprack"),
  tiprackSlot: z.number().int().default(3).describe("The slot of the tiprack"),
  percentChange: z.number().positive().int().default(100).describe("The percent change to make"),
  consumableIDs: z
    .string()
    .default("")
    .describe("Comma separated string of reagent/tip IDs to consume")
    .default("1,2,3,4,5,6")
});


export default class OpentronsMediaExchangeBaymax extends Protocol<typeof OpentronsMediaExchangeParams> {
  protocolId = "opentrons_media_exchange";
  category = "production";
  workcell = "Baymax";
  name = "OT Media Exchange 6-well"
  paramSchema = OpentronsMediaExchangeParams;

  _generateCommands(params: z.infer<typeof OpentronsMediaExchangeParams>) {
    let cultureLabware = "6-well celltreat";
    if(params.culturePlateType.includes("96 well")){
      cultureLabware = "96-well Phenoplate";
    }
    else if(params.culturePlateType.includes("384 well")){
      cultureLabware = "384-well celltreat";
    }

    let protocol_cmds: ToolCommandInfo[] = [
      {
        label: "Slack Start Message",
        toolId: "toolbox",
        toolType: ToolType.toolbox,
        command: "slack_message",
        params: {
          message: `:petri_dish: Media Exchange has started for culture(s): ${params.cultureIDs}`,
          recipients: slackChannel,
        },
      },
      ...paths.hotelToOpentrons({labware:"96-well deepwell",location:"Nest5",reagentPlateLocation:params.mediaPlateLocation}),
      {
        label: "Unload plate from Liconic",
        toolId: "liconic_1",
        toolType:  ToolType.liconic,
        command: "fetch_plate",
        params: {
          cassette: params.culturePlateCassette,
          level: params.culturePlateLevel,
        },
      },
      ...paths.liconicToOpentrons({labware:cultureLabware, location:"Nest1"}),
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
          labware: cultureLabware,
        },
      },
      {
        toolId: "opentrons2_1",
        toolType: ToolType.opentrons2,
        command: "run_program",
        params: {
          program_name: "baymax_media_exchange",
          params: {
            plate_type: params.culturePlateType,
            percent_change: params.percentChange,
            tiprack_wells: params.tiprackWells,
            tipbox_slot: params.tiprackSlot,
            reagent_wells: params.mediaPlateWells,
            well_array_to_process: params.culturePlateWells,
            new_tip: "True",
          },
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "reLidOTNest1",
          labware: cultureLabware,
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
      ...paths.opentronToLiconic({labware:cultureLabware, location:"Nest1"}),
      {
        label: "Load plate into Liconic",
        toolId: "liconic_1",
        toolType:  ToolType.liconic,
        command: "store_plate",
        params: {
          cassette: params.culturePlateCassette,
          level: params.culturePlateLevel,
        },
      },
      ...paths.opentronToHotel({labware:"96-well deepwell", location:"Nest5", reagentPlateLocation: params.mediaPlateLocation}),
      {
        label: "Update consumables in inventory",
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "update_consumables",
        params: {
          reagent_ids: params.consumableIDs
            .split(",")
            .map((id) => parseInt(id.replace(/\s+/g, ""))),
        },
      },
      {
        label: "Slack End Message",
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "slack_message",
        params: {
          message: `:white_check_mark:Media Exchange Complete for culture(s): ${params.cultureIDs}`,
        },
      },
      
    ];
    for(let i=0; i< params.workflow_step_ids.length;i++){
      let todoId = params.workflow_step_ids[i].toString();
      protocol_cmds.push({
        label: "Check Off Todo for Workflow Step " + todoId,
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "complete_todo",
        params: {
          todo_id: todoId,
        },
      });
    }
    return protocol_cmds;
}
}