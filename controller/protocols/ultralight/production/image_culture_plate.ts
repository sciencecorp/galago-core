import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { buildGoogleStructValue } from "utils/struct";
import { DateTime } from "luxon";
import Protocol from "@/protocols/protocol";
import { z } from "zod";
import Tool from "@/server/tools";
import { trpc } from "@/utils/trpc";

const zWellSelection = z.array(
  z.string().regex(/^[A-Z]\d{1,2}$/, "Well name must be a letter followed by a number")
);
const zNumberArray = z.array(z.number());
export const ImageCulturePlateParams = z
  .object({
    workflow_step_ids:zNumberArray.default([1,2,3,4]),
    cytationProgram: z.string().describe("The name of the Cytation protocol to run"),
    liconic_cassette: z.number().positive().int(),
    liconic_level: z.number().positive().int(),
    wellPlateID: z.string().describe("ID of the well plate"),
    cultureIDs: zNumberArray.describe("The IDs of the cultures to process").default([1,2,3]),
    culturePlateBarcode: z.string().regex(/^\d{12}$/, "Barcode must be 12 digits"),
    culturePlateType: z.string().default("6 well").describe("The type of plate (6,12,24,96)"),
    wellAddresses: zWellSelection
      .default(["A1", "B2", "A3"])
      .describe("The addresses of the wells to image (eg, A1,C3,C4,D2 )."),
    nestName:z.string()
  })
  .strict();

export default class ImageCulturePlateUltralight extends Protocol<typeof ImageCulturePlateParams> {
  protocolId = "image_culture_plate";
  category = "production";
  workcell = "Ultralight";
  name = "Plate Imaging"
  paramSchema = ImageCulturePlateParams;

  _generateCommands(params: z.infer<typeof ImageCulturePlateParams>) {
    
    const cassette = params.liconic_cassette;
    const level = params.liconic_level;
    const wellPlateID: string = params.wellPlateID;
    const cytProgName: string = params.cytationProgram.split(".")[0];
    const experiment_name: string = `${params.cytationProgram.split(".")[0]}_${wellPlateID}_`;
    let cultureLabware = "default";
    if(params.culturePlateType.includes("6 well")){
      cultureLabware = "384-well celltreat";
    }
    if(params.culturePlateType.includes("384 well")){
      cultureLabware = "6-well celltreat";
    }  
 
    let protocol_cmds: ToolCommandInfo[] = [
      {
        label: "Slack Start Message",
        toolId: "toolbox",
        toolType: ToolType.toolbox,
        command: "slack_message",
        params: {
          message: `:microscope: Imaging has started for WellPlate: ${params.wellPlateID}`,
        },
      },
      {
        label: "Unload plate from Liconic",
        toolId: "Liconic",
        toolType: ToolType.liconic,
        command: "fetch_plate",
        params: {
          cassette: cassette,
          level: level,
        },
      },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "getPlateLiconic",
            labware: cultureLabware
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripLandscapeToPortrait",
            labware: cultureLabware
          },
        },
      {
        label: "Open Cytation",
        toolId: "cytation_1",
        toolType: ToolType.cytation,
        command: "open_carrier",
        params: {},
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "dropPlateCytation",
          labware: cultureLabware,
        },
      }
    ];

    let now: string | null = DateTime.now()
                          .setZone("US/Pacific")
                          .toISO({ format: "basic", suppressMilliseconds: true });
   
    const object_data_record: Record<string, any> = {
        well_plate_id: wellPlateID,
        well_plate_barcode: params.culturePlateBarcode,
        well_addresses: String(params.wellAddresses),
        liconic_cassette: Number(params.liconic_cassette),
        liconic_level: Number(params.liconic_level),
        cytation_protocol: cytProgName,
        todo_id: params.workflow_step_ids[0].toString(),
        acquired_at: now,
      };
    const object_data: any = buildGoogleStructValue(object_data_record);

 
    protocol_cmds.push(
      {
        label: "Image Plate/Run Cytation Program",
        toolId: "cytation_1",
        toolType: ToolType.cytation,
        command: "start_read",
        params: {
          protocol_file: `${params.cytationProgram}`,
          experiment_name: experiment_name,
          well_addresses: params.wellAddresses,
        },
    });

    protocol_cmds.push({
      label: "Post Local Data To Helix for Culture " + wellPlateID,
      toolId: "helix_tool_1",
      toolType: ToolType.helix_tool,
      command: "post_data_object_from_local_directory",
      params: {
        data_type: "Cytation",
        dirpath: "C:\\cytation_experiments\\" + experiment_name,
        val_only: false,
        object_data: object_data,
      },
    });
    
    for (let i = 0; i < params.cultureIDs.length; i++) {
      protocol_cmds.push({
        label: "Send Confluency Slack",
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "send_confluency_slack",
        params: {
          data_file:"C:\\cytation_experiments\\"+`${experiment_name}\\${experiment_name}_DATA.csv`,
          culture_id: params.cultureIDs[i],
          threshold: 40,
        },
      });
    }
    protocol_cmds = protocol_cmds.concat( [
      {
        label: "Open Cytation",
        toolId: "cytation_1",
        toolType: "cytation",
        command: "open_carrier",
        params: {},
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "getPlateCytation",
          labware: cultureLabware,
        },
      },
      {
        label: "Close Cytation",
        toolId: "cytation_1",
        toolType: "cytation",
        command: "close_carrier",
        params: {},
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "regripPortraitToLandscape",
          labware: cultureLabware,
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "dropPlateLiconic",
          labware: cultureLabware,
        },
      },
      {
        label: "Load plate into Liconic",
        toolId: "Liconic",
        toolType:  ToolType.liconic,
        command: "store_plate",
        params: {
          cassette: cassette,
          level: level,
        },
      },
      {
        label: "Slack Start Message",
        toolId: "toolbox",
        toolType: ToolType.toolbox,
        command: "slack_message",
        params: {
          message: `:white_check_mark: Imaging Run has finished for Well Plate: ${params.wellPlateID} \n... data upload confirmed in separate message.`,
        },
      }
    ] as ToolCommandInfo[]);

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
