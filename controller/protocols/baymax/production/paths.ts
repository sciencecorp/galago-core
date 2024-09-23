import { ToolType } from "gen-interfaces/controller";
type StepParams = {
    source_nest?: any;
    destination_nest?: any;
    width?: number;
    speed?: number;
    force?: number;
    waypoint?: string;
    nest?: string;
    motion_profile_id?: number;
    cassette?: string;
    level?: number;
    barcode?: string;
    z_offset?:number;
    ignore_safepath?: string;
    labware?:string;
    location?:string;
    sequence_name?:string;
  };
  
  type Step = {
    label?: string;
    toolId: string;
    toolType: ToolType;
    command: string;
    params: StepParams;
  };



function hotelToOpentrons(params:{labware:string, location:string, reagentPlateLocation:string}):Step[]{
    return [
      {
        label: "Unwind",
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "unwind",
        params: {},
      }, 
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "retrieve_plate",
        params: {
          labware: params.labware,
          location:params.reagentPlateLocation,
          motion_profile_id: 4,
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "regripPortraitToLandscape",
          labware: params.labware,
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "dropPlateOT"+params.location,
          labware: params.labware,
        },
      },
  ];
}


function opentronToHotel(params:{labware:string, location:string, reagentPlateLocation:string}):Step[]{
  return [
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "getPlateOT"+params.location,
        labware: params.labware,
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "regripLandscapetoPortrait",
        labware: params.labware,
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "dropoff_plate",
      params: {
        labware: params.labware,
        location:params.reagentPlateLocation,
        motion_profile_id: 4,
      },
    },
];
}

function liconicToOpentrons(params:{labware:string, location:string}):Step[]{
  return [
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "getPlateLiconic",
        labware: params.labware
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "dropPlateOT"+params.location,
        labware: params.labware,
      },
    },
];
}


function opentronToLiconic(params:{labware:string, location:string}):Step[]{
  return [
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "getPlateOT"+params.location,
        labware: params.labware,
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "dropPlateLiconic",
        labware: params.labware,
      },
    },
];
}


  export default function pf400Paths(): Record<string, (params: any) => Step[]> {
    return {
      hotelToOpentrons,
      liconicToOpentrons,
      opentronToLiconic,
      opentronToHotel
    };
  }