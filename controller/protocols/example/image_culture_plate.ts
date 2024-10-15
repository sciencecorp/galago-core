import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import Protocol from "@/protocols/protocol";
import { z } from "zod";

const zWellSelection = z.array(
  z.string().regex(/^[A-Z]\d{1,2}$/, "Well name must be a letter followed by a number")
);


export const ImageCulturePlateParams = z
  .object({
    cytationProgram: z.string().describe("The name of the Cytation protocol to run"),
    liconic_cassette: z.number().positive().int(),
    liconic_level: z.number().positive().int(),
    wellPlateID: z.string().describe("ID of the well plate"),
    culturePlateType: z.string().default("6 well").describe("The type of plate (6,12,24,96)"),
    wellAddresses: zWellSelection
      .default(["A1", "B2", "A3"])
      .describe("The addresses of the wells to image (eg, A1,C3,C4,D2 )."),
  })
  .strict();

<<<<<<<< HEAD:controller/protocols/workcell_1/production/image_culture_plate.ts
export default class ImageCulturePlateWorkcell1 extends Protocol<typeof ImageCulturePlateParams> {
  protocolId = "image_culture_plate";
  category = "production";
  workcell = "workcell_1";
========
export default class ImageCulturePlate extends Protocol<typeof ImageCulturePlateParams> {
  protocolId = "image_culture_plate";
  category = "production";
  workcell = "Workcell 1";
>>>>>>>> clean-up:controller/protocols/example/image_culture_plate.ts
  name = "Plate Imaging"
  paramSchema = ImageCulturePlateParams;

  _generateCommands(params: z.infer<typeof ImageCulturePlateParams>) {
    
    const cassette = params.liconic_cassette;
    const level = params.liconic_level;
    const wellPlateID: string = params.wellPlateID;
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
      
      }
    ] as ToolCommandInfo[]);
    return protocol_cmds;
  }
}
