import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { buildGoogleStructValue } from "utils/struct";
import { DateTime } from "luxon";
import Protocol from "@/protocols/protocol";
import { any, z } from "zod";
import Tool from "@/server/tools";
import { trpc } from "@/utils/trpc";

const sourcePlateType = z.enum(["", "6-well", "96-well", "384-well"]).default("96-well");
const sourceWells = z.string().default("1,2,3,4");
const count_yesOrNo = z.enum(["", "YES", "NO"]).default("YES");
// const geltrex_yesOrNo = z.enum(["","YES", "NO"]).default("YES")
const labware = z.enum(["", "Tubes", "96 Deep wells"]).default("Tubes");
const dissociation_reagent = z
  .enum(["", "Accutase", "ReleSR", "Gentle Dissociation Cell Reagent (GDCR)"])
  .default("ReleSR");
const destination_vessel = z.enum(["", "Tubes", "Culture Plates"]).default("Culture Plates");
const destinationPlateType = z.enum(["", "6-well", "96-well", "384-well"]).default("96-well");
const number_of_source_plates = z.number().default(1);
const number_of_destination_plates = z.number().default(1);
const protocol_type = z
  .enum(["", "Custom", "1:6", "1:3", "Up/Down", "Stamp", "ConsoliPick"])
  .default("1:6");
export const PassagingHamiltonParams = z
  .object({
    Protocol_Type: protocol_type,
    Number_of_Source_Plates: number_of_source_plates,
    sourcePlateType: sourcePlateType,
    Number_of_Destination_Plates: number_of_destination_plates,
    Source_Wells: sourceWells,
    Source_Labware: labware,
    Dissociation_Reagent: dissociation_reagent,
    DestinationPlateType: destinationPlateType,
    Counting: count_yesOrNo,
    Destination_Vessel: destination_vessel,
  })
  .strict();

export default class PassagingHamilton extends Protocol<typeof PassagingHamiltonParams> {
  protocolId = "passaging_hamilton";
  category = "production";
  workcell = "Cell Culture Workcell";
  name = "Cell Passaging";
  description = "Walk up Passaging Protocol";
  paramSchema = PassagingHamiltonParams;

  _generateCommands(params: z.infer<typeof PassagingHamiltonParams>) {
    let dissociation_reagent = "gentle";
    let source_labware = "plate";
    let source_plate_type = params.sourcePlateType;
    let destination_plate_type = params.DestinationPlateType;
    let source_wells = params.Source_Wells?.split(",").map(Number);
    let counting = "NO";
    let destination_vessel = "PLATE";
    let source_plate_count = params.Number_of_Source_Plates;
    let destination_plate_count = params.Number_of_Destination_Plates;
    let geltrex_removal = "NO";
    let protocol_type = "";
    // let well_array = params.Source_Wells.split(',').map(Number);
    if (params.Dissociation_Reagent === "Accutase") {
      dissociation_reagent = "accutase";
    } else if (params.Dissociation_Reagent === "ReleSR") {
      dissociation_reagent = "ReleSR";
    } else if (params.Dissociation_Reagent === "Gentle Dissociation Cell Reagent (GDCR)") {
      dissociation_reagent = "Gentle Dissociation Cell Reagent (GDCR)";
    }
    if (params.Source_Labware === "Tubes") {
      source_labware = "TUBE";
    }
    if (params.Destination_Vessel === "Tubes") {
      destination_vessel = "TUBE";
    } else if (params.Destination_Vessel === "Culture Plates") {
      destination_vessel = "PLATE";
    }
    if (params.Counting === "YES") {
      counting = "YES";
    }
    // if (params.Remove_Geltrex === "YES"){
    //   geltrex_removal = "YES"
    // }
    // if (params.Source_Well === "A1"){
    //   source_well = 1
    // }
    // else if (params.Source_Well === "B1"){
    //   source_well = 2
    // }
    // else if (params.Source_Well === "A2"){
    //   source_well = 3
    // }
    // else if (params.Source_Well === "B2"){
    //   source_well = 4
    // }
    // else if (params.Source_Well === "A3"){
    //   source_well = 5
    // }
    // else if (params.Source_Well === "B3"){
    //   source_well = 6
    // }

    ///////////////////// Protocol //////////////////////////

    if (params.Protocol_Type === "1:6") {
      protocol_type = "C:\\Program Files (x86)\\HAMILTON\\Methods\\6well_passage_v2_silvio.med";
    } else if (params.Protocol_Type === "1:3") {
      protocol_type = "C:\\Program Files (x86)\\HAMILTON\\Methods\\6well_passage_v2_silvio.med";
    } else if (params.Protocol_Type === "Stamp") {
      protocol_type = "INSERT STAMP DIRECTORY HERE";
    } else if (params.Protocol_Type === "Custom") {
      protocol_type = "C:\\Program Files (x86)\\HAMILTON\\Methods\\6well_passage_v4_mo.med";
    } else if (params.Protocol_Type === "ConsoliPick") {
      protocol_type =
        "C:\\Program Files (x86)\\HAMILTON\\Methods\\6well_passage_v3_ConsoliPick.med";
    }

    const object_data_record: Record<string, any> = {
      protocol_type: params.Protocol_Type,
      source_wells: source_wells,
      source_plate_type: source_plate_type,
      remove_geltrex: geltrex_removal,
      tubes_or_dws: source_labware,
      dissociation_reagent: dissociation_reagent,
      destination_container: destination_vessel,
      source_plate_count: source_plate_count,
      destination_plate_count: destination_plate_count,
      destination_plate_type: destination_plate_type,
      counting: counting,
    };
    //const inputs: any = buildGoogleStructValue(object_data_record);

    let protocol_cmds: ToolCommandInfo[] = [
      {
        toolId: "toolbox",
        toolType: ToolType.toolbox,
        command: "write_to_json",
        params: {
          struct_object: object_data_record,
          file_path: "C:/galago-data/hamilton/inputs.json",
        },
      },
      {
        label: "Run Passaging Protocol",
        toolId: "hamilton_1",
        toolType: ToolType.hamilton,
        command: "run_protocol",
        params: {
          protocol: protocol_type,
        },
      },
    ] as ToolCommandInfo[];

    return protocol_cmds;
  }
}
