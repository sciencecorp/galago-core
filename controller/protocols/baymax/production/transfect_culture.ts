import { ToolCommandInfo } from "@/types";
import Protocol from "@/protocols/protocol";
import { z } from "zod";
import Paths from "./paths";
import { ToolType } from "gen-interfaces/controller";
import Tool from "@/server/tools";
const paths = Paths();
// const zBarcode = z.string().regex(/^\d{12}$/, "Barcode must be 12 digits");
const zWellPlateSelection = (wells: number) => z.number().int().max(wells).array();
const zConsumableWellPlateSelection = (wells: number) => z.string().max(wells).array();
// const zNestedStringArray = z.array(z.array(z.string()));
const zNumberArray = z.array(z.number());
const zTipRackWellsSchema = z.record(z.array(z.string()));
export const TransfectCultureParams = z.object({
    workflow_step_ids:zNumberArray.describe("The IDs of the routine to run"),
    culturePlateBarcode: z.string().describe("The barcode of the plate to load"),
    cultureIDs: zNumberArray.describe("The IDs of the cultures to process"),
    culturePlateCassette: z.number().positive().int().describe("The cassette number to load from the Liconic"),
    culturePlateLevel: z.number().positive().int().describe("The level number to load from the Liconic"),
    culturePlateWells: zWellPlateSelection(96).describe("The numeric index of wells of to process"),
    culturePlateType: z.string().default("6 well").describe("The type of plate (6,12,24,96)"),
    lipoWell: z.string().default("A1").describe("The well containing the lipofectamine"),
    p3000Well: z.string().default("A2").describe("The well containing the p3000"),
    tReagentsPlateLocation: z.string().default("Hotel 1 Nest 1").describe("The location of the plate"),
    tReagentsPlateWells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing tips to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),
    plasmidWells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing plasmids to consume").default(["B1", "B2", "B3", "B4", "B5", "B6"]),
    DNAReagentsPlateLocation: z.string().default("Hotel 1 Nest 1").describe("The location of the plate"),
    DNAPlateID: z.string().default("1234").describe("The ID of the DNA plate"),
    DNAReagentsPlateWells: zConsumableWellPlateSelection(96).describe("The numeric index of wells containing tips to consume").default(["A1", "A2", "A3", "A4", "A5", "A6"]),
    tiprackWells_1: zTipRackWellsSchema.describe("The wells of the tiprack to consume").default({ "20 ul tips": ["A1", "A2", "A3", "A4", "A5", "A6"], "1000 ul tips": ["B1", "B2", "B3", "B4", "B5", "B6"]}),
    tiprackWells_2: zTipRackWellsSchema.describe("The wells of the tiprack to consume").default({ "20 ul tips": ["A1", "A2", "A3", "A4", "A5", "A6"], "1000 ul tips": ["B1", "B2", "B3", "B4", "B5", "B6"]}),
    tiprackLocation: z.string().default("Opentrons 1").describe("The location of the tiprack"),
    consumableIDs: z.string().default("").describe("Comma separated string of reagent/tip IDs to consume"),  
    dnaConcentration: zNumberArray.describe("The concentration of DNA to add to each well").default([3.5, 2.5, 2.5, 2.5, 2.5, 2.5]),
    DNAPlateType: z.string().default("96-well deepwell").describe("The type of plate (6,12,24,96)"),
    DNAMass: zNumberArray.describe("The mass of DNA to add to each well").default([2.5, 2.5, 2.5, 2.5, 2.5, 2.5]),
  });

export default class TransfectCulture extends Protocol<typeof TransfectCultureParams> {
  protocolId = "transfect_culture";
  category = "production";
  workcell = "Baymax";
  name = "Transfection"
  paramSchema = TransfectCultureParams;

  _generateCommands(params: z.infer<typeof TransfectCultureParams>) {
    
    if(!params.workflow_step_ids){
      params.workflow_step_ids = [1234];
    }
    let cultureLabware = "6-well celltreat";
    let DNAPlate = params.DNAPlateType;
    let protocol_cmds: ToolCommandInfo[] = [
      {
        label: "Slack Start Message",
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "slack_message",
        params: {
          message: `:dna: Transfection has started for culture(s): ${params.cultureIDs}`,
        },
      },
      ...paths.hotelToOpentrons({labware:"96-well deepwell",location:"Nest5",reagentPlateLocation:params.tReagentsPlateLocation}),

      ...paths.hotelToOpentrons({labware:DNAPlate,location:"Nest2",reagentPlateLocation:params.DNAReagentsPlateLocation }), // move DNA plate from hotel to OT2
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
          sequence_name: "deLidOTNest2",
          labware: DNAPlate,
        },
      },
      {
        toolId: "opentrons2_1",
        toolType: ToolType.opentrons2,
        command: "run_program",
        params: {
          program_name: "transfect_1",
          params: {
            tiprack_wells: params.tiprackWells_1,
            lipoWell: params.lipoWell,
            p3000Well: params.p3000Well,
            dna_wells: params.DNAReagentsPlateWells, 
            t_wells: params.tReagentsPlateWells,
            plasmid_wells: params.plasmidWells,
            tipbox_slot: params.tiprackLocation,
            dna_concentration: params.dnaConcentration,
            DNAMass: params.DNAMass,
            DNAPlateType: params.DNAPlateType,
          },
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "reLidOTNest2",
          labware: DNAPlate,
        },
      },
      {
        toolId: "opentrons2_1",
        toolType: ToolType.opentrons2,
        command: "run_program",
        params: {
          program_name: "transfect_2",
          params: {
            tiprack_wells: params.tiprackWells_1,
            lipoWell: params.lipoWell,
            p3000Well: params.p3000Well,
            dna_wells: params.DNAReagentsPlateWells, 
            t_wells: params.tReagentsPlateWells,
            plasmid_wells: params.plasmidWells,
            tipbox_slot: params.tiprackLocation,
            DNAMass: params.DNAMass,
            dna_concentration: params.dnaConcentration,
          },
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
      {
        label: "Slack Start Message",
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "slack_message",
        params: {
          message: `:dna: Transfection reagents have been combined for culture(s): ${params.cultureIDs}`,
        },
      },
      ...paths.opentronToHotel({labware:DNAPlate, location:"Nest2", reagentPlateLocation: params.DNAReagentsPlateLocation}), // move DNA plate from OT2 to hotel
      {
        toolId: "opentrons2_1",
        toolType: ToolType.opentrons2,
        command: "sleep",
        label: `Incubate transfection reagents for 10 minutes`,
        params: {
          seconds: 360,
        },
      },
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
      ...paths.liconicToOpentrons({labware:cultureLabware, location:"Nest1"}),
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
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "deLidOTNest5",
          labware: "96-well deepwell",
        },
      },
      {
        toolId: "opentrons2_1",
        toolType: ToolType.opentrons2,
        command: "run_program",
        params: {
          program_name: "add_reagent",
          params: {
            plate_type: params.culturePlateType,
            tiprack_wells: params.tiprackWells_2,
            reagent_wells: params.DNAReagentsPlateWells,
            well_array_to_process: params.culturePlateWells,
            tipbox_slot:params.tiprackLocation,
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
      ...paths.opentronToLiconic({labware:cultureLabware, location:"Nest1"}),
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
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "reLidOTNest5",
          labware: "96-well deepwell",
        },
      },
      ...paths.opentronToHotel({labware:"96-well deepwell", location:"Nest5", reagentPlateLocation: params.tReagentsPlateLocation}),
      // {
      //   label: "Update consumables in inventory",
      //   toolId: "helix_tool_1",
      //   toolType: ToolType.helix_tool,
      //   command: "update_consumables",
      //   params: {
      //     reagent_ids: params.consumableIDs
      //       .split(",")
      //       .map((id) => parseInt(id.replace(/\s+/g, ""))),
      //   },
      // },     
      
      {
        label: "Check Off Todo",
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "complete_todo",
        params: {
          todo_id: params.workflow_step_ids[0].toString(),
        },
      },
      {
        label: "Slack End Message",
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "slack_message",
        params: {
          message: `:white_check_mark:Transfection Complete for culture(s): ${params.cultureIDs}`,
        },
      },
    ] 
    params.plasmidWells.forEach(plasmid_well => {
      protocol_cmds.push({
        label: "Posting note for plasmid well: " + plasmid_well,
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "post_note_to_helix",
        params: {
          culture_id: params.cultureIDs[0],
          well: params.culturePlateWells[params.plasmidWells.indexOf(plasmid_well)],
          note: plasmid_well,
        },
      });
    }
    );
    return protocol_cmds;
  }
}