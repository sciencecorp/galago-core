import { ToolCommandInfo } from "@/types";
import Protocol from "@/protocols/protocol";
//import "../paths";
import { z } from "zod";
import { ToolType } from "gen-interfaces/controller";
import Paths from "./paths";

const paths = Paths();
const zBarcode = z.string().regex(/^\d{12}$/, "Barcode must be 12 digits");
const zNumberArray = z.array(z.number());
const zWellPlateSelection = (wells: number) => z.number().int().max(wells).array();
const zConsumableWellPlateSelection = (wells: number) => z.string().max(wells).array();

export const opentronsMediaExchange96w384Params = z.object({
  workflow_step_ids: zNumberArray.describe("The IDs of the routine to run"),
  culturePlateBarcode: z.string().describe("The barcode of the plate to load"),
  cultureIDs: zNumberArray.describe("The IDs of the cultures to process"),
  wellPlateID: z.string().describe("ID of the well plate"),
  culturePlateCassette: z
    .number()
    .positive()
    .int()
    .describe("The cassette number to load from the Liconic"),
  culturePlateLevel: z
    .number()
    .positive()
    .int()
    .describe("The level number to load from the Liconic"),
  culturePlateWells: zWellPlateSelection(384).describe("The numeric index of wells of to process"),
  culturePlateType: z.string().default("6 well").describe("The type of plate (6,12,24,96)"),
  mediaPlateBarcode: zBarcode.describe("The barcode of the plate to load"),
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
    .describe("Comma separated string of reagent/tip IDs to consume"),
});


export default class OpentronsMediaExchange96w384Ultralight extends Protocol<typeof opentronsMediaExchange96w384Params> {
  protocolId = "opentrons_media_exchange_96_384";
  category = "production";
  workcell = "Ultralight";
  name = "Media Exchange - Multi-Channel"

  paramSchema = opentronsMediaExchange96w384Params;

  _generateCommands(params: z.infer<typeof opentronsMediaExchange96w384Params>) {
        let protocol_cmds: ToolCommandInfo[] = [ 
          {
            label: "Slack Start Message",
            toolId: "toolbox",
            toolType: ToolType.toolbox,
            command: "slack_message",
            params: {
              message: `:petri_dish: Media Exchange has started for  Well Plate: ${params.wellPlateID}`,
            },
          },
          ...paths.hotelToOpentrons({labware:"96-well deepwell",location:"Nest2",reagentPlateLocation:params.mediaPlateLocation}),
          {
            label: "Unload plate from Liconic",
            toolId: "Liconic",
            toolType:  ToolType.liconic,
            command: "fetch_plate",
            params: {
              cassette: params.culturePlateCassette,
              level: params.culturePlateLevel,
            },
          },
          ...paths.liconicToOpentrons({labware:"384-well celltreat", location:"Nest5"}),
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "deLidOTNest2",
              labware: "96-well deepwell",
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "deLidOTNest5",
              labware: "384-well celltreat",
            },
          },
          {
            toolId: "opentrons2_1",
            toolType: ToolType.opentrons2,
            command: "run_program",
            params: {
              program_name: "ultralight_media_exchange",
              params: {
                plate_type: params.culturePlateType,
                percent_change: params.percentChange,
                tiprack_wells: params.tiprackWells,
                tipbox_slot: params.tiprackSlot,
                reagent_wells: params.mediaPlateWells,
                well_array_to_process: params.culturePlateWells,
                new_tip: "False",
              },
            },
          },
          {
            toolId: "toolbox",
            toolType: ToolType.toolbox,
            command: "log_media_exchange",
            params: {
              source_barcode: params.mediaPlateBarcode,
              destination_name: params.wellPlateID,
              destination_barcode: params.culturePlateBarcode,
              source_wells: params.mediaPlateWells,
              percent_exchange: params.percentChange,
              new_tips:false
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "reLidOTNest5",
              labware: "384-well celltreat",
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "reLidOTNest2",
              labware: "96-well deepwell",
            },
          },
          ...paths.opentronToLiconic({labware:"384-well celltreat", location:"Nest5"}),
          {
            label: "Load plate into Liconic",
            toolId: "Liconic",
            toolType:  ToolType.liconic,
            command: "store_plate",
            params: {
              cassette: params.culturePlateCassette,
              level: params.culturePlateLevel,
            },
          },
          ...paths.opentronToHotel({labware:"96-well deepwell", location:"Nest2", reagentPlateLocation: params.mediaPlateLocation}),
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
            label: "Slack Start Message",
            toolId: "toolbox",
            toolType: ToolType.toolbox,
            command: "slack_message",
            params: {
              message: `:white_check_mark: Media Exchange Complete for Well Plate: ${params.wellPlateID}`,
            },
          },
        ];
    
          for (const workflow_step_id of params.workflow_step_ids) {
            protocol_cmds.push({
              label: "Check Off Todo for Workflow Step " + workflow_step_id,
              toolId: "helix_tool_1",
              toolType: ToolType.helix_tool,
              command: "complete_todo",
              params: {
                todo_id: workflow_step_id.toString(),
              },
            });
          }

          return protocol_cmds;
  }
}
