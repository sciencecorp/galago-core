export interface ProtocolStepComment {
  process: "Comment";
  name: string;
  description: string;
  waitForUser: boolean;
  pauseMessage: string | null;
}

export interface ProtocolStepDelay {
  process: "Delay";
  name: string;
  description: string;
  delayTime: number;
}

export interface PipetteTipInfo {
  pipetteSlot: "left" | "right";
  pickUpTipLocation: string;
  pickUpTipStart?: string;
  dropOffTipLocation: string;
  singleChannelMode?: boolean;
}

export interface TransferInfo {
  volume: number | number[];
  source_wells_name: string;
  destination_wells_name: string;
  new_tip: string;
  trash: boolean;
  touch_tip: boolean;
  blow_out: boolean;
  blowout_location: string | null;
  mix_before: [number, number];
  mix_after: [number, number];
  carryover: boolean;
  air_gap: number;
  flow_rate: number;
}

export interface ProtocolStepTransfer {
  process: "Transfer";
  name: string;
  description: string;
  pipetteTipInfo: PipetteTipInfo;
  transferInfo: TransferInfo;
}

export interface DistributeInfo extends TransferInfo {
  disposal_volume: number;
}

export interface ProtocolStepDistribute {
  process: "Distribute";
  name: string;
  description: string;
  pipetteTipInfo: PipetteTipInfo;
  distributeInfo: DistributeInfo;
}

export interface ConsolidateInfo extends TransferInfo {}

export interface ProtocolStepConsolidate {
  process: "Consolidate";
  name: string;
  description: string;
  pipetteTipInfo: PipetteTipInfo;
  consolidateInfo: ConsolidateInfo;
}

export interface ProtocolStepTemperatureModule {
  process: "TemperatureModule";
  name: string;
  description: string;
  setPoint: number | null;
}

export type ProtocolStep =
  | ProtocolStepTransfer
  | ProtocolStepDistribute
  | ProtocolStepConsolidate
  | ProtocolStepDelay
  | ProtocolStepComment
  | ProtocolStepTemperatureModule;

export type Slot = number; // You may want to add a validator function here to ensure value is between 1 and 11

export interface PipetteEntry {
  type: string;
  mount: "left" | "right";
}

export interface LabwareEntry {
  name: string;
  type: string;
  size: number;
  slot: Slot;
  offset?: [number, number, number];
}

export interface WellInfo {
  name: string;
  initial_volume: number;
}

export interface WellsEntry {
  name: string;
  labware_name: string;
  wells: string[];
  initial_volume: number;
}

export interface PipetteTipBoxEntry {
  name: string;
  type: string;
  max_volume: number;
  slot: Slot;
  offset?: [number, number, number];
}

export interface ModuleEntry {
  type: string;
  slot: Slot;
}

export interface OpentronsProgram {
  pipettes: PipetteEntry[];
  labwares: LabwareEntry[];
  wells: WellsEntry[];
  tip_boxes: PipetteTipBoxEntry[];
  steps: ProtocolStep[];
  modules: ModuleEntry[];
}
