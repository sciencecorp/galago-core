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
    plateLocation?:string;
    sequence_name?:string;
  };
  
  type Step = {
    label?: string;
    toolId: string;
    toolType: ToolType;
    command: string;
    params: StepParams;
  };

  function BravoToHiG(params:{labware:string, location:string, reagentPlateLocation:string}):Step[]{
    return []
  }

  function HiGtoBravo(params:{labware:string, location:string, reagentPlateLocation:string}):Step[]{
    return []
  }

  function BravoToHotel(params:{labware:string, location:string, plateLocation:string}):Step[]{
    return [
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "getPlateBravo"+params.location,
          labware: params.labware,
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "dropoff_plate",
        params: {
          labware: params.labware,
          location:params.plateLocation,
          motion_profile_id: 4,
        },
      },
  ];
  }
  function hotelToBravo(params:{labware:string, location:string, plateLocation:string}):Step[]{
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
          location:params.plateLocation,
          motion_profile_id: 4,
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "dropPlateBravo"+params.location,
          labware: params.labware,
        },
      },
  ];
}

 


  
  export default function pf400Paths(): Record<string, (params: any) => Step[]> {
    return {
      hotelToBravo,
      BravoToHotel
    };
  }
