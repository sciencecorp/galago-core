import { ToolCommandInfo } from "@/types";
import Protocol from "@/protocols/protocol";
//import "../paths";
import { z } from "zod";
import { ToolType } from "gen-interfaces/controller";
import Paths from "./pf400_paths";

const paths = Paths();
const zBarcode = z.string().regex(/^\d{12}$/, "Barcode must be 12 digits");
const zConsumableWellPlateSelection = (wells: number) => z.string().max(wells).array();
const zWellPlateSelection = (wells: number) => z.number().int().max(wells).array();
const zNumberArray = z.array(z.number());

export const PlateWashParams = z.object({
  workflow_step_ids: zNumberArray.describe("The IDs of the routine to run"),
  wellPlateBarcode: z.string().describe("The barcode of the plate to load"),
  wellPlateIDs: zNumberArray.describe("The IDs of the wells to process"),
  wellPlateCassette: z
    .number()
    .positive()
    .int()
    .describe("The cassette number to load from the Liconic"),
  wellPlateLevel: z
    .number()
    .positive()
    .int()
    .describe("The level number to load from the Liconic"),
  wellPlateWells: zWellPlateSelection(96).describe("The numeric index of wells of to process"),
  wellPlateType: z.string().default("6 well").describe("The type of plate (6,12,24,96)"),
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


export default class PlateWashBiolab extends Protocol<typeof PlateWashParams> {
  protocolId = "plate_wash";
  category = "production";
  workcell = "Biolab";
  name = "Plate Wash"
  paramSchema = PlateWashParams;

  _generateCommands(params: z.infer<typeof PlateWashParams>) {
    let wellLabware = "96-well Patch Plate";

    let protocol_cmds: ToolCommandInfo[] = [
      {
        label: "Slack Start Message",
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "slack_message",
        params: {
          message: `:bathtub: Plate Washing has started for plate(s): ${params.wellPlateIDs}`,
        },
      },
      ...paths.hotelToBravo({labware:"96-well deepwell",location:"Nest5",reagentPlateLocation:params.mediaPlateLocation}),
      ...paths.hotelToBravo({labware:wellLabware, location:"Nest1"}),
      {
        toolId: "bravo_1",
        toolType: ToolType.opentrons2,
        command: "RunProtocol",
        params: {
          protocol: "plate_wash_step_1",
        },
      },
      ...paths.BravoToHiG({labware:wellLabware, location:"Nest1"}),
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"home",
        params: {}
      },
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"OpenShield",
        params: {
            bucket: 1,
        }
      },
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"Spin",
        params: {
            speed: 500,
            acceleration:80,
            decceleration: 80,
            duration: 300
        }
      },
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"OpenShield",
        params: {
            bucket: 1,
        }
      },
      ...paths.HiGtoBravo({labware:wellLabware, location:"Nest1"}),
      {
        toolId: "bravo_1",
        toolType: ToolType.opentrons2,
        command: "RunProtocol",
        params: {
          protocol: "plate_wash_step_1",
        },
      },
      ...paths.BravoToHiG({labware:wellLabware, location:"Nest1"}),
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"home",
        params: {}
      },
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"OpenShield",
        params: {
            bucket: 1,
        }
      },
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"Spin",
        params: {
            speed: 500,
            acceleration:80,
            decceleration: 80,
            duration: 300
        }
      },
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"OpenShield",
        params: {
            bucket: 1,
        }
      },
      ...paths.HiGtoBravo({labware:wellLabware, location:"Nest1"}),
      {
        toolId: "bravo_1",
        toolType: ToolType.opentrons2,
        command: "RunProtocol",
        params: {
          protocol: "plate_wash_step_1",
        },
      },

    
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
          message: `:white_check_mark:Media Exchange Complete for well(s): ${params.wellPlateIDs}`,
        },
      },
      
    ];
    return protocol_cmds;
}
}