import { EditableStylesProvider } from "@chakra-ui/editable/dist/editable-context";
import { default as axios } from "axios";
import { get } from "http";
import { DateTime } from "luxon";
import { text } from "stream/consumers";

import ControllerConfig from "server/utils/ControllerConfig";
import * as tool_base from "gen-interfaces/tools/grpc_interfaces/tool_base"

const SYNOLOGY_PATH = "H:\\SynologyDrive";
export const HELIX_HOST = "https://app.science.xyz";
const WORKING_BRANCH = process.env.WORKCELL_BOT_TOKEN;


export enum PlateLocation { 
  'Unknown' = 0,
  'Baymax' = 299,
  'Ultralight' = 304,
  'Checked Out' = 58,
}

export interface DataObject {
  id: number;
  data_type:string;
  object_data:any;
  created_at:string;
  updated_at:string;
  stats:any|null;
}

export interface WellPlateResponse {
  id: number;
  well_plate_type_id: number;
  created_at: string;
  updated_at: string;
  name: string | null;
  location: string;
  model_type: string;
  well_plate_type: WellPlateType;
  barcode: Barcode;
  storage_slot: any | null;
  wells: Well[];
  cultures: Culture[];
  data_objects: DataObject[] | null;
}

interface WellPlateType {
  id: number;
  name: string;
  rows: number;
  columns: number;
  created_at: string;
  updated_at: string;
  volume_per_well_ml: string;
  model_type: string;
}

interface Barcode {
  id: number;
  barcodable_type: string;
  barcodable_id: number;
  barcode_type: string;
  code: string;
  model_type: string;
}

export interface Well {
  id: number;
  well_plate_id: number;
  culture_id: number;
  column_index: number;
  row_index: number;
  notes: string;
  model_type: string;
}

interface Culture {
  id: number;
  parent_id: number;
  created_at: string;
  updated_at: string;
  passage_number: number;
  cell_line: string;
  status: string;
  well_plate_id: number;
  model_type: string;
  document: Document;
}

interface Document {
  id: number;
  documentable_type: string;
  documentable_id: number;
  content: Content;
  text_content: string;
  model_type: string;
}

interface Content {
  type: string;
  content: Paragraph[];
}

interface Paragraph {
  type: string;
  content: (Hashtag | Text)[];
}

interface Hashtag {
  type: string;
  attrs: Attrs;
}

interface Text {
  type: string;
  text: string;
}

interface Attrs {
  id: string;
  label: string;
  type: string | null;
}

export type wellPlateType = {
  id: number;
  name: string;
  rows: number;
  columns: number;
  model_type: string;
  updated_at: string;
  volume_per_well_ml: string;
  created_at: string;
};

export interface RoutineParameters {
  culture_ids: number[];  // comma separated string of culture IDs
  media_type: string;
  well_array_to_process: number[] | string[];
  protocol_name?: string;
  plate_type: string;
  percent_media_change?: number;
  plate_barcode?: string;
  plate_location?: string | null;
  wellPlateID?: string;
  DNAPlateType?: string | null;
  DNAPlateID?: string;
  dnaConcentration?: number[] | null;
  DNAMass?: number[] | null;
  plasmidWells?: string[] | null;
}

export interface ConsumableRequirements {
  consumableRequirements: ConsumableRequirementMapType;
  tiprackRequirements: ConsumableRequirementMapType;
}
export interface RoutineMetadata {
  helix_workflow_run_id: number;
  helix_workflow_step_ids: number[];
  helix_workflow_id: number;
  helix_workflow_name: string;
}

export interface Routine {
  unique_key:string;
  name: string;
  protocol_id:string;
  parameters: RoutineParameters;
  metadata: RoutineMetadata;
}

export type ConsumableRequirementMapType = {
  [key: string]: number;
};

export class RoutineFromHelix {
  constructor(public routineObj: Routine) {}
  config?: tool_base.Config;
  toString(): string {
    const r = this.routineObj;
    return `Item(${r.parameters.culture_ids.join(",")},${r.parameters.media_type},${r.parameters.well_array_to_process.join(",")},${r.parameters.plate_type},${r.parameters.percent_media_change},${r.parameters.protocol_name},${r.metadata.helix_workflow_run_id},${r.metadata.helix_workflow_step_ids},${r.metadata.helix_workflow_id},${r.metadata.helix_workflow_name})`;
  }

  equals(other: RoutineFromHelix): boolean {
    return this.hashCode() === other.hashCode();
  }

  hashCode(): number {
    return this.toString()
      .split("")
      .reduce((acc, curr) => {
        acc = (acc << 5) - acc + curr.charCodeAt(0);
        return acc & acc;
      }, 0);
  }
}

async function getJson(url: string, options?: any): Promise<any> {
  try {
    console.log("Url is "+ url)

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    const response = await axios.get(url, {headers: headers, ...options});
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(`Unable to parse response from ${url}. Expected JSON.`);
  }
}

function getRuntimeProtocolFromRoutine(routineName:string, plateType:string): string {
  let protocol = "unknown";
  switch(routineName){
    case "Image Culture Plate":
      return "image_culture_plate";
    case "Media Exchange":
      protocol = "opentrons_media_exchange"
      if (plateType === "96 well" || plateType=== "384 well") {
        protocol = protocol+ "_96_384";
      } 
      return protocol
    case "Passage":
      return "passage_culture";
    case "Transfect":
      return "transfect_culture";
    case "Cherrypick":
      return "cherry_pick";
    case "qPCR":
      return "qpcr";
    case "Boil":
      return "boil";
    case "gDNA Extraction":
      return "gDNA_extraction";
    default:
      return "unknown"
  }
}



export default class HelixClient {
  constructor(public domain: string = HELIX_HOST) {}
  async getWorkflowRuns(daysForward: number = 0): Promise<any[]> {
    const now = DateTime.now().setZone("US/Pacific");
    const endOfDay = now
      .startOf("day")
      .plus({ days: daysForward + 1 })
      .minus({ seconds: 1 });
    const endOfDayIso = endOfDay.toISO();

    const responseCulture = await getJson(
      `${this.domain}/api/workflow_runs/todo?input_type=Culture&now=${endOfDayIso}`,
      { timeout: 60000 }
    );
    
    const workflowRunsCulture = responseCulture.workflow_runs;
    return workflowRunsCulture;
  }

  async checkNameMatches(name_str: string = "", table_name: string = ""): Promise<boolean> {
    if (name_str === "") {
      return false;
    }
    const response = await getJson(
      `${this.domain}/api/${table_name}/?q[tag_number_cont]=${name_str}`,
      { timeout: 10000 }
    );

    const results = response.results;
    // return true if length results equals 1
    return results.length === 1;
  }

  //Not being used
  async getDataObjectIDsFromWellPlateID(wellPlateID: number): Promise<any> {
    const response = await getJson(`${this.domain}/api/well_plates/${wellPlateID}`, {
      timeout: 10000,
    });
    return response["data_objects"];
  }

  async getDataObjectFromID(dataObjectID: number): Promise<any> {
    const response = await getJson(`${this.domain}/api/data_objects/${dataObjectID}`, {
      timeout: 10000,
    });
    return response;
  }


  //Not being used
  async getDataObjects(dataType: string = ""): Promise<any[]> {
    const base_url = `${this.domain}/api/data_objects/32`;
    if (dataType === "") {
      const response = await getJson(base_url, { timeout: 10000 });
      return response;
    } else {
      const response = await getJson(`${base_url}?data_type=${dataType}`, { timeout: 10000 });
      return response;
    }
  }

  
  async getCulture(cultureId: number): Promise<any> {
    try {
      const json = await getJson(`${this.domain}/api/cultures/${cultureId}`, {
        timeout: 10000,
      });
      return json;
    } catch (error) {
      console.error(`There was an error with the request: ${error}`);
    }
  }

  async getWellPlateFromCultureId(cultureId: number): Promise<any> {
    try {
      const json = await getJson(`${this.domain}/api/cultures/${cultureId}`, {
        timeout: 10000,
      });
      return json["well_plates"];
    } catch (error) {
      console.error(`There was an error with the request: ${error}`);
    }
  }

  async getWP(wellPlateID: number): Promise<any> {
    try {
      const json = await getJson(`${this.domain}/api/well_plates/${wellPlateID}`, {
        timeout: 10000,
      });
      return json;
    } catch (error) {
      console.error(`There was an error with the request: ${error}`);
    }
  }
  
  async getPaginatedWellPlates(platesPerPage:number) : Promise<WellPlateResponse[]> {
    try {
      const json = await getJson(`${this.domain}/api/well_plates?per_page=${platesPerPage}`, {
        timeout: 30000,
      });
      const response  = json.results as WellPlateResponse[];
      return response;
    } catch (error) {
      console.error(`There was an error with the request: ${error}`);
      return {} as WellPlateResponse[];
    }
  }

  async getWellPlate(plateId: number): Promise<WellPlateResponse> {
    try {
      const json = await getJson(`${this.domain}/api/well_plates/${plateId}`, {
        timeout: 10000,
      });
      return json as WellPlateResponse;
    } catch (error) {
      console.error(`There was an error with the request: ${error}`);
      return {} as WellPlateResponse;
    }
  }

  getCultureBarcode(json: any): string | undefined {
    try {
      if (json.well_plate) {
        if (json.well_plate.barcode && json.well_plate.barcode.code) {
          return json.well_plate.barcode.code;
        }
      }
    } catch (error) {
      console.error(`There was an error with the request: ${error}`);
    }
    return undefined;
  }

  getCulturePlateType(json: any): string | undefined {
    try {
      if (json.well_plate) {
        return json.well_plate.well_plate_type.name;
      }
      return undefined;
    } catch (error) {
      console.error(`There was an error with the request: ${error}`);
    }
  }

  setWellPlateLocation(wellPlateID: number | null, location: number | null): void {
    axios.put(`${this.domain}/api/well_plates/${wellPlateID}`, {
      well_plate: {
        location_id: location,
      },
    });
  }

  getMediaNameFromMediaChangeStep(processStep: any): string {
    const references = processStep.references;
    const compoundReferences = references.filter((ref: any) => ref.referent_type === "Compound");

    if (compoundReferences.length === 0) {
      return "";
    }
    const compoundReference = compoundReferences[0];

    return compoundReference.referent.name;
  }

  getProtocolNameFromImageStep(processStep: any): string {
    const references = processStep.references;
    const protocolNameReferences = references.filter(
      (ref: any) => ref.reference_definition?.label === "Protocol Name"
    );

    if (protocolNameReferences.length === 0) {
      throw new Error(`Could not find protocol name reference for process_step ${processStep.id}`);
    }
    const protocolNameReference = protocolNameReferences[0];

    return protocolNameReference.value;
  }

  getCultureFromWorkflowRun(workflowRun: any, strict: boolean = false): any {
    for (const ref of workflowRun.references) {
      if (ref.referent_type === "Culture") {
        return ref;
      }
    }

    if (strict) {
      throw new Error(`Could not find culture reference for workflow_run ${workflowRun.id}`);
    }

    return null;
  }

  getDNAPlateIDFromRun(workflowRun: any, strict: boolean = false): string {
    const dnaPlateIDReference = workflowRun.references.find((ref: any) => 
      ref.reference_definition && ref.reference_definition.label === "DNA Plate ID"
    );
  
    if (dnaPlateIDReference) {
      return dnaPlateIDReference.value.replace(/\\/g, '').replace(/"/g, '');
    } else if (strict) {
      throw new Error(`Could not find DNA Plate ID reference for workflow_run ${workflowRun.id}`);
    } else {
      return "";
    }
  }

  getDNAPlateTypeFromRun(workflowRun: any, strict: boolean = false): string | null {
    const dnaPlateTypeReference = workflowRun.references.find((ref: any) =>
      ref.reference_definition && ref.reference_definition.label === "DNA Plate Type"
    );
    if (dnaPlateTypeReference) {
      // Attempt to parse the value if it's a stringified JSON
      try {
        // Parse the string to handle stringified JSON, or return as is if it's not JSON
        const parsedValue = JSON.parse(dnaPlateTypeReference.value);
        return typeof parsedValue === 'string' ? parsedValue : dnaPlateTypeReference.value;
      } catch (error) {
        // If JSON.parse fails, return the value as is
        return dnaPlateTypeReference.value;
      }
    } else if (strict) {
      throw new Error(`Could not find DNA Plate Type reference for workflow_run ${workflowRun.id}`);
    } else {
      return null;
    }
  }


  getDNAConcentrationFromRun(workflowRun: any, strict: boolean = false): number[] | null {
    const dnaConcentrationReference = workflowRun.references.find((ref: any) =>
      ref.reference_definition && ref.reference_definition.label === "DNA concentration"
    );
    if (dnaConcentrationReference) {
      let cleanedValue = dnaConcentrationReference.value.replace(/\\/g, '').replace(/"/g, '');
        // Optionally convert string to array or other transformations if needed
        return cleanedValue.split(',').map(Number); // Return the cleaned value
    } else if (strict) {
      throw new Error(`Could not find DNA Concentration reference for workflow_run ${workflowRun.id}`);
    } else {
      return null;
    }
  }

  getDNAMassFromRun(workflowRun: any, strict: boolean = false): number[] | null {
    const dnaMassReference = workflowRun.references.find((ref: any) =>
        ref.reference_definition && ref.reference_definition.label === "DNA Mass"
    );
    if (dnaMassReference) {
        // Assuming dnaMassReference.value is a string that needs cleaning
        let cleanedValue = dnaMassReference.value.replace(/\\/g, '').replace(/"/g, '');
        // Optionally convert string to array or other transformations if needed
        return cleanedValue.split(',').map(Number); // Return the cleaned value
    } else if (strict) {
        throw new Error(`Could not find DNA Mass reference for workflow_run ${workflowRun.id}`);
    } else {
        return null;
    }
}

  
  getPlasmidWellsFromRun(workflowRun: any, strict: boolean = false): string[] | null {
    const plasmidWellsReference = workflowRun.references.find((ref: any) =>
      ref.reference_definition && ref.reference_definition.label === "DNA well IDs"
    );
  
    if (plasmidWellsReference) {
      // First, remove the outermost quotes if they are part of the string
      let trimmedValue = plasmidWellsReference.value.trim();
  
      // If the value starts and ends with double quotes, remove them
      if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
        trimmedValue = trimmedValue.substring(1, trimmedValue.length - 1);
      }
  
      // Split the string by "," to get the array, removing internal quotes
      let wellsArray = trimmedValue.split('","').map((well: string) => well.replace(/"/g, ''));
      
      // separate the wells by comma into different strings
      wellsArray = wellsArray.join(',').split(',');
      return wellsArray;
    } else if (strict) {
      throw new Error(`Could not find Plasmid Wells reference for workflow_run ${workflowRun.id}`);
    } else {
      return null;
    }
  }
  
  


  getCultureIdFromWorkflowRun(workflowRun: any, strict: boolean = false): number | null {
    const culture = this.getCultureFromWorkflowRun(workflowRun, strict);

    if (culture) {
      return culture.referent_id;
    }
    return null;
  }

  async getMatchingStepForCultureId(cultureId: number, stepName: string): Promise<any | null> {
    const runs = await this.getWorkflowRuns(0);

    for (const run of runs) {
      for (const ref of run.references) {
        if (ref.referent_type === "Culture" && ref.referent_id === cultureId) {
          const steps = run.outstanding_todos;

          for (const step of steps) {
            if (step.workflow_step_definition.name === stepName) {
              return step;
            }
          }
        }
      }
    }

    return null;
  }

  //Not being used 
  async getPlateLocation(cultureId: number | null): Promise<string | null> {
    try {
      const culture = await this.getCulture(Number(cultureId));
      const location = culture["well_plate"]["location"];
      return location;
    } catch (error) {
      console.error(`There was an error with the request: ${error}`);
      return null;
    }
  }
  
  async getCloneWellArrayFromCultureID(cultureId: number | null): Promise<number[] | null> {
    try {
      const culture = await this.getCulture(Number(cultureId));
      // For now, we assume that all cultures have exactly one well_plate.
      const wellPlate = culture["well_plates"][0];
      // clone wells can be identified with a string name attached to each well with the string "clone" in it
      const cloneWellArray: number[] = [];
      const numRows = 24; // typically 24 rows in a 384 well plate
      const numCols = 16; // typically 16 columns in a 384 well plate
  
      for (const [index, well] of wellPlate.wells.entries()) {
        if (well.notes.includes("clones") || well.notes.includes("clone")) {
          // Calculate the row and column for the current index
          const row = index % numRows;
          const col = Math.floor(index / numRows);
  
          // Convert row and column back to index as if counting down columns
          const newIndex = row * numCols + col;
          cloneWellArray.push(newIndex);
        }
      }
      return cloneWellArray;
    } catch (error) {
      console.error(`There was an error with the request: ${error}`);
      return null;
    }
  }

  async getPassageWellArrayFromCultureID(cultureId: number | null): Promise<number[] | null> {
    try {
      const culture = await this.getCulture(Number(cultureId));
      // For now, we assume that all cultures have exactly one well_plate.
      const wellPlate = culture["well_plates"][0];
      // passage wells can be identified with a string name attached to each well with the string "passage" in it
      const passageWellArray: number[] = [];
      const numRows = 3
      const numCols = 2
  
      for (const [index, well] of wellPlate.wells.entries()) {
        if (well.notes.includes("passage")) {
          // Calculate the row and column for the current index
          const row = index % numRows;
          const col = Math.floor(index / numRows);
  
          // Convert row and column back to index as if counting down columns
          const newIndex = row * numCols + col;
          passageWellArray.push(newIndex);
        }
      }
      return passageWellArray;
    } catch (error) {
      console.error(`There was an error with the request: ${error}`);
      return null;
    }
  }
  

  getMediaExchangeCountByDay(workflowRuns: any[]): Map<string, number> {
    const mediaExchangeCounts = new Map<string, number>();

    for (const run of workflowRuns) {
      for (const step of run["outstanding_todos"]) {
        if (step["workflow_step_definition"]["name"] === "Media Change") {
          const stepScheduledTime = DateTime.fromISO(step["scheduled_at"], { zone: "utc" }).setZone(
            "US/Pacific"
          );
          const startOfDay = stepScheduledTime.startOf("day").toISO();
          if (startOfDay) {
            mediaExchangeCounts.set(startOfDay, (mediaExchangeCounts.get(startOfDay) || 0) + 1);
          }
        }
      }
    }
    return mediaExchangeCounts;
  }

  getWellArrayFromWorkflowRun(run: any, useNumericIDs: boolean): number[] | string[] {
    const culture = this.getCultureFromWorkflowRun(run);
    // For now, we assume that all cultures have exactly one well_plate.
    // TODO: Handle multiple well plates.
    const wellPlate = culture["referent"]["well_plates"][0];
    if (!wellPlate) {
      throw new Error(`Culture ${culture.referent_id} does not belong to a well plate`);
    }
    return this.getWellArrayFromWellPlate(wellPlate, culture.referent_id, useNumericIDs)
  }

  getWellArrayFromWellPlate(
    wellPlate: any,
    cultureId: number,
    useNumericIDs: boolean
  ): number[] | string[] {
    if (!wellPlate) {
      throw new Error(`Culture ${cultureId} does not belong to a well plate`);
    }
    const emptyWellArray: [number, number][] = wellPlate.wells
      .filter((well: { culture_id: number }) => well.culture_id !== cultureId)
      .map((well: { row_index: number; column_index: number }) => [
        well.row_index,
        well.column_index,
      ]);

    const occupiedWellArray: [number, number][] = wellPlate.wells
      .filter((well: { culture_id: number }) => well.culture_id === cultureId)
      .map((well: { row_index: number; column_index: number }) => [
        well.row_index,
        well.column_index,
      ]);

    if (useNumericIDs) {
      const wellPlateType = wellPlate["well_plate_type"];
      const rows = wellPlateType["rows"];
      const columns = wellPlateType["columns"];

      const wellArray: number[] = [];
      let wellIndex = 0;
      for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
          if (emptyWellArray.some(([row, col]: [number, number]) => row === r && col === c)) {
            wellIndex++;
            continue;
          } else {
            wellArray.push(wellIndex);
            wellIndex++;
          }
        }
      }
      return wellArray;
    } else {
      const wellArray: string[] = [];
      for (const well of occupiedWellArray) {
        const row = String.fromCharCode(65 + well[0]);
        wellArray.push(row + (well[1] + 1));
      }
      return wellArray;
    }
  }

  
  async createRoutinesFromWorkflowRuns(workflowRuns: any[], workcellName:string, dedupe = false): Promise<Routine[]> {
    const routines: Routine[] = [];
    const today = new Date();
    const yesterday = new Date(today);
    const twoDaysAgo = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    twoDaysAgo.setDate(today.getDate() - 2);

    for (const run of workflowRuns) {
      
      for (const step of run.outstanding_todos) {
        const todoDate = new Date(step.scheduled_at);
        const stepName = step.workflow_step_definition.name;
        if (today.toDateString() != todoDate.toDateString() && yesterday.toDateString() != todoDate.toDateString() && twoDaysAgo.toDateString() != todoDate.toDateString()) {
          continue;
        }
        var text_content = null;
        if (step.references[1].referent !== null) {
          text_content = step.references[1].referent.text_content;
        }        
        let useNumericID: boolean = true;
        let routineName: string | null = "Unknown";
        if(stepName === "Media Change"){
          useNumericID = true;
          routineName = "Media Exchange"
        }
        if(stepName === "Image Culture"){
          useNumericID = false;
          routineName = "Image Culture Plate";
        }
        if(stepName === "Passage"){
          useNumericID = true;
          routineName = "Passage";
        }
        if(stepName === "Transfect"){
          useNumericID = true;
          routineName = "Transfect";
        }

        if (stepName === "Media Change" || stepName === "Image Culture" || stepName === "Passage" || stepName === "Transfect") {
          let wellPlate: any | null = null;
          let wellPlateId: number | null = null;
          let wellPlateBarcode: string | null = null;
          let wellPlateTypeObject: wellPlateType | null = null;
          let wellPlateLocation: string | null = null;
          let plasmidWells: string[] | null = null;
          let DNAPlateID: string | null = null;
          let dnaConcentration: number[] | null = null;
          let DNAMass: number[] | null = null;
          let DNAPlateType: string | null = null;
          let locationId: number = 0;
          
          const cultureReference = run.references.find((r: { referent_type: string; }) => r.referent_type == "Culture");
          let cultureId = cultureReference.referent.id;
          if(!cultureId){
            throw new Error(`Could not find culture reference for workflow_run ${run.id}`);
          }
          wellPlate = cultureReference.referent.well_plates[0] as WellPlateResponse;
          if(wellPlate === undefined){ 
            console.warn("Well plate not defined for culture"+cultureId);
            continue;
          }
          wellPlateId = cultureReference.referent.well_plates[0].id;
          locationId = cultureReference.referent.well_plates[0].location_id;
          wellPlateBarcode = wellPlate.barcode.code;
          wellPlateTypeObject = wellPlate.well_plate_type;
          wellPlateLocation = PlateLocation[locationId];
          if(wellPlateLocation != workcellName){
            continue;
          }
          if (
            !wellPlateId ||
            !wellPlateBarcode ||
            !wellPlateTypeObject ||
            !wellPlate 
          ) {
            throw new Error(`Could not find well plate reference for workflow_run ${run.id}`);
          }
          
          const todoTypeId = step.workflow_step_definition.id
          let routinekey: string = `${todoDate.toDateString()}-${todoTypeId}-${wellPlateId}`;

          const wellPlateArray = this.getWellArrayFromWellPlate(wellPlate, cultureId, useNumericID);
          if (!wellPlateArray) {throw new Error(`Could not find well plate array for culture ${cultureId}`);}
          var commonRoutineParameters: any = {
            culture_ids: [cultureId],
            wellPlateID: String(wellPlateId),
            media_type: "", //empty by default.,
            well_array_to_process: wellPlateArray,
            plate_type: wellPlateTypeObject.name,
            plate_location: wellPlateLocation,
          }
          
          if(stepName == "Media Change"){
            let mediaType: string | null = step.references.find((x: { referent_type: string; }) => x.referent_type == "Compound").referent.name;
            let percentMediaChange: number | null = step.references.find((x: { reference_definition: { label: string; }; })=> x.reference_definition.label == "Percent").value;

            if (!mediaType || !percentMediaChange) {
              throw new Error(
                `Could not find media type or percent media change for workflow_run ${run.id}`
              );
            }
            commonRoutineParameters.media_type = mediaType;
            commonRoutineParameters.percent_media_change = percentMediaChange; 
            routinekey = `${mediaType}-${routinekey}`;
          }

          if (stepName == "Transfect"){
            
            DNAPlateID = this.getDNAPlateIDFromRun(run);
            dnaConcentration = this.getDNAConcentrationFromRun(run)
            DNAMass = this.getDNAMassFromRun(run);
            DNAPlateType = this.getDNAPlateTypeFromRun(run);
            plasmidWells = this.getPlasmidWellsFromRun(run);
            commonRoutineParameters.DNAPlateID = DNAPlateID;
            commonRoutineParameters.DNAMass = DNAMass;
            commonRoutineParameters.dnaConcentration = dnaConcentration;
            commonRoutineParameters.plasmidWells = plasmidWells;
            commonRoutineParameters.DNAPlateType = DNAPlateType;
          }
          if (stepName == "Passage"){
            let mediaType: string | null = step.references.find(
              (x: { referent_type: string; referent?: { compound_type?: string; name?: string } }) => 
              x.referent_type == "Compound" && x.referent?.compound_type == "Complete Media"
            )?.referent?.name || null;
          
            let percentMediaChange: 100 | null = 100;

            if (!mediaType || !percentMediaChange) {
              continue;
            }

            let cloneWellArray: number[] | null = await this.getCloneWellArrayFromCultureID(cultureId);
            let passageWellArray: number[] | null = await this.getPassageWellArrayFromCultureID(cultureId);

            if (!cloneWellArray || !passageWellArray) {
              continue;
            }
            // if plate type is 384 
            commonRoutineParameters.well_array_to_process = cloneWellArray;
            if (text_content === "One to One") {
              commonRoutineParameters.well_array_to_process = passageWellArray;
            }
            commonRoutineParameters.percent_media_change = percentMediaChange;
            commonRoutineParameters.media_type = mediaType;
          }
          if(stepName == "Image Culture"){
            commonRoutineParameters.protocol_name = this.getProtocolNameFromImageStep(step);
            routinekey = `${commonRoutineParameters.protocol_name }-${routinekey}`;
          }

          let thisRoutine : Routine = {
            unique_key: routinekey,
            name: routineName,
            protocol_id: getRuntimeProtocolFromRoutine(routineName, commonRoutineParameters.plate_type),
            parameters: commonRoutineParameters,
            metadata: {
              helix_workflow_run_id: run.id,
              helix_workflow_step_ids: [step.id],
              helix_workflow_id: run.workflow.id,
              helix_workflow_name: run.workflow.name,
            },
          };

          let existingRoutine : Routine | undefined= routines.find(r => r.unique_key === routinekey);
          
          if(existingRoutine === undefined){
            routines.push(thisRoutine);
          }
          else{

            let new_ids = existingRoutine.parameters.culture_ids;
            let well_arrays = existingRoutine.parameters.well_array_to_process as any[];

            if(!new_ids.includes(cultureId)){
              new_ids = new_ids.concat([cultureId]);
            } 
            for(var i=0; i < wellPlateArray.length;i++){
              var well = wellPlateArray[i];
              if(!well_arrays.includes(well)){
                well_arrays = well_arrays.concat(wellPlateArray[i]);
              }
            }
            let newParameters = existingRoutine.parameters;
            newParameters.culture_ids = new_ids;
            newParameters.well_array_to_process = well_arrays.sort((a,b) =>{return a-b}); 

            let newRoutine = existingRoutine;
            newRoutine.parameters = newParameters;
            newRoutine.metadata.helix_workflow_step_ids = existingRoutine.metadata.helix_workflow_step_ids.concat(step.id);

            let existingIndex = routines.lastIndexOf(existingRoutine);
            routines[existingIndex] =  newRoutine;
          }
        }
      }
    }

    if (dedupe) {
      const routineSet = new Set(
        routines.map((routine) => new RoutineFromHelix(routine).toString())
      );
      return Array.from(routineSet, (routineStr) => JSON.parse(routineStr));
    } else {
      return routines;
    }
  } 


  getPercentChangeFromMediaChangeStep(step: any): number {
    for (const ref of step.references) {
      if (ref.reference_definition.label == "Percent") {
        return Number(ref.value);
      }
    }
    throw new Error("No percent change found in media change step");
  }

  async postMeasurement(measurementJson: object): Promise<void> {
    await axios.post(`${this.domain}/api/measurements`, measurementJson);
  }

  async putTodoComplete(todoId: string): Promise<void> {
    await axios.put(`${this.domain}/api/todos/${todoId}`, {
      todo: { update_state: "complete" },
    });
  }

  //Not being used
  async getMediaNames(mediaType: string): Promise<string[]> {
    const response = await axios.get(`${this.domain}/api/compounds`, {
      params: { "q[compound_type_eq]": mediaType, per_page: -1 },
    });

    return response.data.results.map((media: any) => media.name);
  }

  getWellPlateTypeFromWorkflowRun(run: any): wellPlateType {
    const culture = this.getCultureFromWorkflowRun(run);

    const wellPlate = culture["referent"]["well_plates"][0];
    if (!wellPlate) {
      throw new Error(`Culture ${culture.referent_id} does not belong to a well plate`);
    }
    const wellPlateType = wellPlate["well_plate_type"];

    return wellPlateType;
  }

  checkConsumableRequirements(routines: Routine[]): ConsumableRequirements {
    const consumableRequirementMap: ConsumableRequirementMapType = {
      "6 well": 2000,
      "6 well with organoid inserts": 1000,
      "12 well": 1000,
      "24 well": 1000,
      "48 well": 1000,
      "96 well": 150,
      "384 well": 100,
      "MEA": 1000,
    };

    const tiprackRequirementMap: ConsumableRequirementMapType = {
      "6 well": 1,
      "6 well with organoid inserts": 1,
      "12 well": 1,
      "24 well": 1,
      "48 well": 1,
      "96 well": 1 / 8,
      "384 well": 1 / 8,
      "MEA": 1,
    };

    const consumableRequirements: ConsumableRequirementMapType = {};
    const tiprackRequirements: ConsumableRequirementMapType = {};
    for (const routine of routines) {
      if (routine.name === "Media Exchange") {

        const mediaVolume = routine.parameters.well_array_to_process.length * consumableRequirementMap[routine.parameters.plate_type];
        if (!(routine.parameters.media_type in consumableRequirements)) {
          consumableRequirements[routine.parameters.media_type] = 0;
        }
        const Tipcount =
          routine.parameters.well_array_to_process.length *
          tiprackRequirementMap[routine.parameters.plate_type];
        // console.log("Tipcount: ", Tipcount);
        if (!(routine.parameters.media_type in tiprackRequirements)) {
          tiprackRequirements[routine.parameters.media_type] = 0;
        }
        tiprackRequirements[routine.parameters.media_type] += Tipcount;
        consumableRequirements[routine.parameters.media_type] += mediaVolume;
      }
    }

    return {
      consumableRequirements: consumableRequirements,
      tiprackRequirements: tiprackRequirements,
    };
  }

  async getRoutines(workCellName:string): Promise<Routine[]> {
    const workflowRuns = await this.getWorkflowRuns();
    const routines = await (await this.createRoutinesFromWorkflowRuns(workflowRuns, workCellName)).sort((a,b) =>{
      const nameComparison = a.name.localeCompare(b.name);
      if (nameComparison !== 0) return nameComparison;

      // Sort by culture_ids
      const aCultureIds = a.parameters.culture_ids.sort().join(",");
      const bCultureIds = b.parameters.culture_ids.sort().join(",");
      const cultureIdsComparison = aCultureIds.localeCompare(bCultureIds);
      if (cultureIdsComparison !== 0) return cultureIdsComparison;

      // Sort by workflow_step_ids
      return a.metadata.helix_workflow_step_ids[0] - b.metadata.helix_workflow_step_ids[0];
    }
    );
    return routines.filter((routine) => routine.parameters.plate_location === workCellName);
  }

}

export const helixClient = new HelixClient();