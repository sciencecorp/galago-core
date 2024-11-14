import axios, { AxiosInstance } from "axios";
import { log } from "console";
import { DateTime } from "luxon";

export enum LogTypesEnum {
  "ALL" = 0,
  "ERROR" = 1,
  "WARNING" = 2,
  "DEBUG" = 3,
  "INFO" = 4,
  "PLATE_MOVE" = 5,
  "RUN_START" = 6,
  "RUN_END" = 7,
  "PLATE_READ" = 8,
  "RUN_DURATION" = 9,
}

export interface WorkcellCreate {
  name: string;
}

export interface WorkcellUpdate {
  name?: string;
}

export interface Workcell extends WorkcellCreate {
  id: number;
}

export interface InstrumentCreate {
  name: string;
  workcell_id: number;
}

export interface InstrumentUpdate {
  name?: string;
  workcell_id?: number;
}

export interface Instrument extends InstrumentCreate {
  id: number;
}

export interface NestCreate {
  name: string;
  row: number;
  column: number;
  instrument_id: number;
}

export interface NestUpdate {
  name?: string;
  row?: number;
  column?: number;
  instrument_id?: number;
}

export interface Nest extends NestCreate {
  id: number;
}

export interface PlateCreate {
  name: string | null;
  barcode: string;
  plate_type: string;
  nest_id: number | null;
}

export interface PlateUpdate {
  name?: string | null;
  barcode?: string;
  plate_type?: string;
  nest_id?: number | null;
}

export interface Plate extends PlateCreate {
  id: number;
}

export interface WellCreate {
  row: string;
  column: number;
  plate_id: number;
}

export interface WellUpdate {
  row?: string;
  column?: number;
  plate_id?: number;
}

export interface Well extends WellCreate {
  id: number;
}

export interface ReagentCreate {
  name: string;
  expiration_date: string;
  volume: number;
  well_id: number;
}

export interface ReagentUpdate {
  name?: string;
  expiration_date?: string;
  volume?: number;
  well_id?: number;
}

export interface Reagent extends ReagentCreate {
  id: number;
}

export interface PlateInfo extends Plate {
  nest: Nest | null;
  wells: Well[];
}
export interface Inventory {
  workcell: Workcell;
  instruments: Instrument[];
  nests: Nest[];
  plates: Plate[];
  wells: Well[];
  reagents: Reagent[];
}

export interface SlackAlert {
  messageId: string;
  messageChannel: string;
  workcell: string;
  tool: string;
  protocol: string;
  error: string;
  update: string;
}

export class InventoryApiClient {
  private apiClient: AxiosInstance;
  constructor() {
    console.log("Client initianting with url " + `http://${process.env.NEXT_PUBLIC_API_URL}`);

    this.apiClient = axios.create({
      baseURL: `http://${process.env.NEXT_PUBLIC_API_URL}`,
    });
  }

  // Get Inventory
  async getInventory(workcellName: string): Promise<Inventory> {
    // console.log("Calling getInventory with workcellName "+workcellName);
    const inventory = await this.apiClient.get<Inventory>(
      "/inventory?workcell_name=" + workcellName,
    );
    return inventory.data;
  }

  async getPlateInfo(plateId: number): Promise<PlateInfo> {
    const response = await this.apiClient.get(`/plates/${plateId}/info`);
    return response.data;
  }

  // workcell crud
  async getWorkcells(): Promise<Workcell[]> {
    const response = await this.apiClient.get<Workcell[]>("/workcells");
    return response.data;
  }

  async getWorkcell(workcell_id: number): Promise<Workcell> {
    const response = await this.apiClient.get<Workcell>(`/workcells/${workcell_id}`);
    return response.data;
  }

  async createWorkcell(workcell: WorkcellCreate): Promise<Workcell> {
    const response = await this.apiClient.post<Workcell>("/workcells", workcell);
    return response.data;
  }

  async updateWorkcell(workcell_id: number, workcellUpdate: WorkcellUpdate): Promise<Workcell> {
    const response = await this.apiClient.put<Workcell>(
      `/workcells/${workcell_id}`,
      workcellUpdate,
    );
    return response.data;
  }

  async deleteWorkcell(workcell_id: number): Promise<Workcell> {
    const response = await this.apiClient.delete<Workcell>(`/workcells/${workcell_id}`);
    return response.data;
  }

  // instrument crud
  async getInstruments(workcellName: string): Promise<Instrument[]> {
    const response = await this.apiClient.get("/instruments?workcell_name=" + workcellName);
    return response.data;
  }

  async getInstrument(instrumentId: number): Promise<Instrument> {
    const response = await this.apiClient.get(`/instruments/${instrumentId}`);
    return response.data;
  }

  async createInstrument(instrument: InstrumentCreate): Promise<Instrument> {
    const response = await this.apiClient.post("/instruments", instrument);
    return response.data;
  }

  async updateInstrument(
    instrumentId: number,
    instrumentUpdate: InstrumentUpdate,
  ): Promise<Instrument> {
    const response = await this.apiClient.put(`/instruments/${instrumentId}`, instrumentUpdate);
    return response.data;
  }

  async deleteInstrument(instrumentId: number): Promise<Instrument> {
    const response = await this.apiClient.delete(`/instruments/${instrumentId}`);
    return response.data;
  }

  // nest crud
  async getNests(workcellName: string): Promise<Nest[]> {
    const response = await this.apiClient.get("/nests?workcell_name=" + workcellName);
    return response.data;
  }

  async getNest(nestId: number): Promise<Nest> {
    const response = await this.apiClient.get(`/nests/${nestId}`);
    return response.data;
  }

  async createNest(nest: NestCreate): Promise<Nest> {
    const response = await this.apiClient.post("/nests", nest);
    return response.data;
  }

  async updateNest(nestId: number, nestUpdate: NestUpdate): Promise<Nest> {
    const response = await this.apiClient.put(`/nests/${nestId}`, nestUpdate);
    return response.data;
  }

  async deleteNest(nestId: number): Promise<Nest> {
    const response = await this.apiClient.delete(`/nests/${nestId}`);
    return response.data;
  }

  // plate crud
  async getPlates(workcellName: string): Promise<Plate[]> {
    const response = await this.apiClient.get("/plates?workcell_name=" + workcellName);
    return response.data;
  }

  async getPlate(plateId: number): Promise<Plate> {
    const response = await this.apiClient.get(`/plates/${plateId}`);
    return response.data;
  }

  async createPlate(plate: PlateCreate): Promise<Plate> {
    const response = await this.apiClient.post("/plates", plate);
    return response.data;
  }

  async updatePlate(plateId: number, plateUpdate: PlateUpdate): Promise<Plate> {
    const response = await this.apiClient.put(`/plates/${plateId}`, plateUpdate);
    return response.data;
  }

  async deletePlate(plateId: number): Promise<Plate> {
    const response = await this.apiClient.delete(`/plates/${plateId}`);
    return response.data;
  }

  // well crud
  async getWellsInWorkcell(workcellName: string): Promise<Well[]> {
    const response = await this.apiClient.get("/wells?workcell_name=" + workcellName);
    return response.data;
  }

  async getWells(plateId: number): Promise<Well[]> {
    const response = await this.apiClient.get("/wells?plate_id=" + plateId);
    return response.data;
  }

  async getWell(wellId: number): Promise<Well> {
    const response = await this.apiClient.get(`/wells/${wellId}`);
    return response.data;
  }

  async createWell(well: WellCreate): Promise<Well> {
    const response = await this.apiClient.post("/wells", well);
    return response.data;
  }

  async updateWell(wellId: number, wellUpdate: WellUpdate): Promise<Well> {
    const response = await this.apiClient.put(`/wells/${wellId}`, wellUpdate);
    return response.data;
  }

  async deleteWell(wellId: number): Promise<Well> {
    const response = await this.apiClient.delete(`/wells/${wellId}`);
    return response.data;
  }

  // reagent crud
  async getReagents(plateId: number): Promise<Reagent[]> {
    const response = await this.apiClient.get("/reagents?plate_id=" + plateId);
    return response.data;
  }

  async getWorkcellReagents(workcellName: string): Promise<Reagent[]> {
    const response = await this.apiClient.get("/reagents?workcell_name=" + workcellName);
    return response.data;
  }

  async getReagent(reagentId: number): Promise<Reagent> {
    const response = await this.apiClient.get(`/reagents/${reagentId}`);
    return response.data;
  }

  async createReagent(reagent: ReagentCreate): Promise<Reagent> {
    const response = await this.apiClient.post("/reagents", reagent);
    return response.data;
  }

  async updateReagent(reagentId: number, reagentUpdate: ReagentUpdate): Promise<Reagent> {
    const response = await this.apiClient.put(`/reagents/${reagentId}`, reagentUpdate);
    return response.data;
  }

  async deleteReagent(reagentId: number): Promise<Reagent> {
    const response = await this.apiClient.delete(`/reagents/${reagentId}`);
    return response.data;
  }

  async getNextAvailableNest(instrumentId: string): Promise<Nest> {
    const response = await this.apiClient.get(`/nests/next_available/${instrumentId}`);
    return response.data;
  }

  async getImageBytes(): Promise<string> {
    try {
      const response = await this.apiClient.get("/image_test", {
        responseType: "arraybuffer",
      });
      const result = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ""),
      );
      return result;
    } catch (error) {
      console.error("Error fetching the image:", error);
      throw error; // Re-throw the error if needed
    }
  }

  async getSlackError(alertStatus: string): Promise<SlackAlert[]> {
    let url = "/slack_errors";
    if (alertStatus) {
      url = `${url}?=${alertStatus}`;
    }
    const response = await this.apiClient.get(url);
    return response.data;
  }

  async createSlackError(slackAlert: SlackAlert): Promise<SlackAlert[]> {
    const response = await this.apiClient.post(`/slack_errors`, slackAlert);
    return response.data;
  }

  async clearSlackError(): Promise<SlackAlert> {
    const response = await this.apiClient.put("/slack_errors");
    return response.data;
  }
}

export const inventoryApiClient = new InventoryApiClient();
