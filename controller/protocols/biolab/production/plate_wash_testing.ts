import { ToolCommandInfo } from "@/types";
import Protocol from "@/protocols/protocol";
//import "../patchs";
import { z } from "zod";
import { ToolType } from "gen-interfaces/controller";
import Paths from "./pf400_paths";

const paths = Paths();

export const PlateWashParams = z.object({
  user_name: z.string().describe("user id").default("silvioo"),
  plate_count: z.number().positive().int().describe("Number of plates to wash"),
});


export default class PlateWashBiolabTesting extends Protocol<typeof PlateWashParams> {
  name = "Patch Plate Washing"
  protocolId = "patch_plate_wash";
  category = "production";
  workcell = "Biolab";
  description = "Protein engineering's patch plates wash protocols."

  paramSchema = PlateWashParams;

  _generateCommands(params: z.infer<typeof PlateWashParams>) {
    let protocol_cmds: ToolCommandInfo[] = [
      {
        toolId: "bravo_1",
        toolType: ToolType.bravo,
        command: "run_runset",
        params: {
            runset_file: "C:\\VWorks Workspace\\RunSet Files\\move_to_location_3.rst",
        },
    },
    {
      label: "Unwind",
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "unwind",
      params: {},
    }, 
    ]
    
    //1st wash     
    for(var i=0; i < params.plate_count;i++){
        let hotelLocation = "r1:l"+(i+1);
        protocol_cmds.push(
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
              labware: "default",
              location:hotelLocation,
              motion_profile_id: 4,
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "dropPlateBravoNest4",
              labware: "default",
            },
          },
        {
            toolId: "bravo_1",
            toolType: ToolType.bravo,
            command: "run_runset",
            params: {
                runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_h20_in.rst",
            },
        },
        {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "getPlateBravoNest4",
              labware: "default",
            },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:hotelLocation,
            motion_profile_id: 4,
          },
        },
    )
  }

  let platesCentrifugedRound1 : number= 0; 
  //Centrifuge all plates round 2
  for(var i=0; i<= params.plate_count;i+=2){
    console.log("Current index "+i);
    console.log("Plates centrifuged round 1 "+platesCentrifugedRound1);
    if(platesCentrifugedRound1 > params.plate_count){
      break;
    }
    let firstPlateLocation = "r1:l"+(i+1);
    protocol_cmds.push(
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "retrieve_plate",
        params: {
          labware: "default",
          location:firstPlateLocation,
          motion_profile_id: 4,
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "regripPortraitToLandscape",
          labware: "default",
        },
      },
      {
        toolId:"biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"open_shield",
        params: {
          bucket_id: 0,
        }
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "dropPlateHiG",
          labware: "default",
        },
      }
    );
    platesCentrifugedRound1 = platesCentrifugedRound1 +1; 
    let secondplateLocation = "r1:l"+(i+2);
    if(i+2 <= params.plate_count){
      protocol_cmds.push(
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "retrieve_plate",
          params: {
            labware: "default",
            location:secondplateLocation,
            motion_profile_id: 4,
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripPortraitToLandscape",
            labware: "default",
          },
        },
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 1,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "dropPlateHiG",
            labware: "default",
          },
        }
      );
      platesCentrifugedRound1 = platesCentrifugedRound1 +1; 
    }
    protocol_cmds.push(
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"spin",
        params: {
          speed: 500,
          acceleration: 80,
          decceleration: 80,
          duration:300,
        }
      },
    {
      toolId:"biolab_hig_centrifuge",
      toolType: ToolType.hig_centrifuge,
      command:"open_shield",
      params: {
        bucket_id: 0,
      }
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "getPlateHig",
        labware: "default",
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "regripLandscapetoPortrait",
        labware: "default",
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "dropoff_plate",
      params: {
        labware: "default",
        location:firstPlateLocation,
        motion_profile_id: 4,
      },
    });

    if(i+2 <= params.plate_count){
      protocol_cmds.push(
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 1,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "getPlateHig",
            labware: "default",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripLandscapetoPortrait",
            labware: "default",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:secondplateLocation,
            motion_profile_id: 4,
          },
        });
    }
  }

      //2nd wash 
      //1st wash     
      for(var i=0; i< params.plate_count;i++){
        let hotelLocation = "r1:l"+(i+1);
        protocol_cmds.push(
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
              labware: "default",
              location:hotelLocation,
              motion_profile_id: 4,
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "dropPlateBravoNest4",
              labware: "default",
            },
          },
          {
            toolId: "bravo_1",
            toolType: ToolType.bravo,
            command: "run_runset",
            params: {
                runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_full_dispense.rst",
            },
        },

        {
            toolId: "bravo_1",
            toolType: ToolType.bravo,
            command: "run_runset",
            params: {
                runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_h20_t1_t2.rst",
            },
        },
        {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "getPlateBravoNest4",
              labware: "default",
            },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:hotelLocation,
            motion_profile_id: 4,
          },
        },
    )
  }
    let platesCentrifugedRound2 = 0;
    //Centrifuge all plates round 2
    for(var i=0; i<= params.plate_count;i+=2){
      console.log("Current index "+i);
      console.log("Plates centrifuged round 1 "+platesCentrifugedRound2);
      if(platesCentrifugedRound2 > params.plate_count){
        break;
      }
      let firstPlateLocation = "r1:l"+(i+1);
      protocol_cmds.push(
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "retrieve_plate",
          params: {
            labware: "default",
            location:firstPlateLocation,
            motion_profile_id: 4,
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripPortraitToLandscape",
            labware: "default",
          },
        },
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 0,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "dropPlateHiG",
            labware: "default",
          },
        }
      );
      platesCentrifugedRound2 = platesCentrifugedRound2 +1; 
      let secondplateLocation = "r1:l"+(i+2);
      if(i+2 <= params.plate_count){
        protocol_cmds.push(
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "retrieve_plate",
            params: {
              labware: "default",
              location:secondplateLocation,
              motion_profile_id: 4,
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "regripPortraitToLandscape",
              labware: "default",
            },
          },
          {
            toolId:"biolab_hig_centrifuge",
            toolType: ToolType.hig_centrifuge,
            command:"open_shield",
            params: {
              bucket_id: 1,
            }
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "dropPlateHiG",
              labware: "default",
            },
          }
        );
        platesCentrifugedRound2 = platesCentrifugedRound2 +1; 
      }
      protocol_cmds.push(
        {
          toolId: "biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"spin",
          params: {
            speed: 500,
            acceleration: 80,
            decceleration: 80,
            duration:300,
          }
        },
      {
        toolId:"biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"open_shield",
        params: {
          bucket_id: 0,
        }
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "getPlateHig",
          labware: "default",
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "regripLandscapetoPortrait",
          labware: "default",
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "dropoff_plate",
        params: {
          labware: "default",
          location:firstPlateLocation,
          motion_profile_id: 4,
        },
      });
  
      if(i+2 <= params.plate_count){
        protocol_cmds.push(
          {
            toolId:"biolab_hig_centrifuge",
            toolType: ToolType.hig_centrifuge,
            command:"open_shield",
            params: {
              bucket_id: 1,
            }
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "getPlateHig",
              labware: "default",
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "regripLandscapetoPortrait",
              labware: "default",
            },
          },
          
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "dropoff_plate",
            params: {
              labware: "default",
              location:secondplateLocation,
              motion_profile_id: 4,
            },
          });

      }
      ///////////////////// Reagent 2: Tergazyme
      //1st wash     

    
    for(var i=0; i < params.plate_count;i++){
      let hotelLocation = "r1:l"+(i+1);
      protocol_cmds.push(
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
            labware: "default",
            location:hotelLocation,
            motion_profile_id: 4,
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "dropPlateBravoNest4",
            labware: "default",
          },
        },
      {
          toolId: "bravo_1",
          toolType: ToolType.bravo,
          command: "run_runset",
          params: {
              runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_terg_in.rst",
          },
      },
      {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "getPlateBravoNest4",
            labware: "default",
          },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "dropoff_plate",
        params: {
          labware: "default",
          location:hotelLocation,
          motion_profile_id: 4,
        },
      },
  )
}

let platesCentrifugedRound3 : number= 0; 
//Centrifuge all plates round 2
for(var i=0; i<= params.plate_count;i+=2){
  console.log("Current index "+i);
  console.log("Plates centrifuged round 1 "+platesCentrifugedRound3);
  if(platesCentrifugedRound3 > params.plate_count){
    break;
  }
  let firstPlateLocation = "r1:l"+(i+1);
  protocol_cmds.push(
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "retrieve_plate",
      params: {
        labware: "default",
        location:firstPlateLocation,
        motion_profile_id: 4,
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "regripPortraitToLandscape",
        labware: "default",
      },
    },
    {
      toolId:"biolab_hig_centrifuge",
      toolType: ToolType.hig_centrifuge,
      command:"open_shield",
      params: {
        bucket_id: 0,
      }
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "dropPlateHiG",
        labware: "default",
      },
    }
  );
  platesCentrifugedRound3 = platesCentrifugedRound3 +1; 
  let secondplateLocation = "r1:l"+(i+2);
  if(i+2 <= params.plate_count){
    protocol_cmds.push(
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "retrieve_plate",
        params: {
          labware: "default",
          location:secondplateLocation,
          motion_profile_id: 4,
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "regripPortraitToLandscape",
          labware: "default",
        },
      },
      {
        toolId:"biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"open_shield",
        params: {
          bucket_id: 1,
        }
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "dropPlateHiG",
          labware: "default",
        },
      }
    );
    platesCentrifugedRound3 = platesCentrifugedRound3 +1; 
  }
  protocol_cmds.push(
    {
      toolId: "biolab_hig_centrifuge",
      toolType: ToolType.hig_centrifuge,
      command:"spin",
      params: {
        speed: 500,
        acceleration: 80,
        decceleration: 80,
        duration:300,
      }
    },
  {
    toolId:"biolab_hig_centrifuge",
    toolType: ToolType.hig_centrifuge,
    command:"open_shield",
    params: {
      bucket_id: 0,
    }
  },
  {
    toolId: "pf400_1",
    toolType:  ToolType.pf400,
    command: "run_sequence",
    params: {
      sequence_name: "getPlateHig",
      labware: "default",
    },
  },
  {
    toolId: "pf400_1",
    toolType:  ToolType.pf400,
    command: "run_sequence",
    params: {
      sequence_name: "regripLandscapetoPortrait",
      labware: "default",
    },
  },
  {
    toolId: "pf400_1",
    toolType:  ToolType.pf400,
    command: "dropoff_plate",
    params: {
      labware: "default",
      location:firstPlateLocation,
      motion_profile_id: 4,
    },
  });

  if(i+2 <= params.plate_count){
    protocol_cmds.push(
      {
        toolId:"biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"open_shield",
        params: {
          bucket_id: 1,
        }
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "getPlateHig",
          labware: "default",
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "regripLandscapetoPortrait",
          labware: "default",
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "dropoff_plate",
        params: {
          labware: "default",
          location:secondplateLocation,
          motion_profile_id: 4,
        },
      });
  }
}

//2nd wash 
    //1st wash     
    for(var i=0; i< params.plate_count;i++){
      let hotelLocation = "r1:l"+(i+1);
      protocol_cmds.push(
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
            labware: "default",
            location:hotelLocation,
            motion_profile_id: 4,
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "dropPlateBravoNest4",
            labware: "default",
          },
        },
        {
          toolId: "bravo_1",
          toolType: ToolType.bravo,
          command: "run_runset",
          params: {
              runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_full_dispense.rst",
          },
      },

      {
          toolId: "bravo_1",
          toolType: ToolType.bravo,
          command: "run_runset",
          params: {
              runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_terg_t1_t2.rst",
          },
      },
      {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "getPlateBravoNest4",
            labware: "default",
          },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "dropoff_plate",
        params: {
          labware: "default",
          location:hotelLocation,
          motion_profile_id: 4,
        },
      },
  )
}
  let platesCentrifugedRound4 = 0;
  //Centrifuge all plates round 2
  for(var i=0; i<= params.plate_count;i+=2){
    console.log("Current index "+i);
    console.log("Plates centrifuged round 1 "+platesCentrifugedRound4);
    if(platesCentrifugedRound4 > params.plate_count){
      break;
    }
    let firstPlateLocation = "r1:l"+(i+1);
    protocol_cmds.push(
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "retrieve_plate",
        params: {
          labware: "default",
          location:firstPlateLocation,
          motion_profile_id: 4,
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "regripPortraitToLandscape",
          labware: "default",
        },
      },
      {
        toolId:"biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"open_shield",
        params: {
          bucket_id: 0,
        }
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "dropPlateHiG",
          labware: "default",
        },
      }
    );
    platesCentrifugedRound4 = platesCentrifugedRound4 +1; 
    let secondplateLocation = "r1:l"+(i+2);
    if(i+2 <= params.plate_count){
      protocol_cmds.push(
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "retrieve_plate",
          params: {
            labware: "default",
            location:secondplateLocation,
            motion_profile_id: 4,
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripPortraitToLandscape",
            labware: "default",
          },
        },
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 1,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "dropPlateHiG",
            labware: "default",
          },
        }
      );
      platesCentrifugedRound4 = platesCentrifugedRound4 +1; 
    }
    protocol_cmds.push(
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"spin",
        params: {
          speed: 500,
          acceleration: 80,
          decceleration: 80,
          duration:300,
        }
      },
    {
      toolId:"biolab_hig_centrifuge",
      toolType: ToolType.hig_centrifuge,
      command:"open_shield",
      params: {
        bucket_id: 0,
      }
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "getPlateHig",
        labware: "default",
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "regripLandscapetoPortrait",
        labware: "default",
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "dropoff_plate",
      params: {
        labware: "default",
        location:firstPlateLocation,
        motion_profile_id: 4,
      },
    });

    if(i+2 <= params.plate_count){
      protocol_cmds.push(
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 1,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "getPlateHig",
            labware: "default",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripLandscapetoPortrait",
            labware: "default",
          },
        },
        
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:secondplateLocation,
            motion_profile_id: 4,
          },
        });
      
      }
    }

    /////////////////////////// Reagent 3: Bleach

    //1st wash     

    
      for(var i=0; i < params.plate_count;i++){
        let hotelLocation = "r1:l"+(i+1);
        protocol_cmds.push(
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
              labware: "default",
              location:hotelLocation,
              motion_profile_id: 4,
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "dropPlateBravoNest4",
              labware: "default",
            },
          },
        {
            toolId: "bravo_1",
            toolType: ToolType.bravo,
            command: "run_runset",
            params: {
                runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_bleach_in.rst",
            },
        },
        {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "getPlateBravoNest4",
              labware: "default",
            },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:hotelLocation,
            motion_profile_id: 4,
          },
        },
    )
  }
  
  let platesCentrifugedRound5 : number= 0; 
  //Centrifuge all plates round 2
  for(var i=0; i<= params.plate_count;i+=2){
    console.log("Current index "+i);
    console.log("Plates centrifuged round 1 "+platesCentrifugedRound5);
    if(platesCentrifugedRound5 > params.plate_count){
      break;
    }
    let firstPlateLocation = "r1:l"+(i+1);
    protocol_cmds.push(
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "retrieve_plate",
        params: {
          labware: "default",
          location:firstPlateLocation,
          motion_profile_id: 4,
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "regripPortraitToLandscape",
          labware: "default",
        },
      },
      {
        toolId:"biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"open_shield",
        params: {
          bucket_id: 0,
        }
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "dropPlateHiG",
          labware: "default",
        },
      }
    );
    platesCentrifugedRound5 = platesCentrifugedRound5 +1; 
    let secondplateLocation = "r1:l"+(i+2);
    if(i+2 <= params.plate_count){
      protocol_cmds.push(
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "retrieve_plate",
          params: {
            labware: "default",
            location:secondplateLocation,
            motion_profile_id: 4,
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripPortraitToLandscape",
            labware: "default",
          },
        },
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 1,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "dropPlateHiG",
            labware: "default",
          },
        }
      );
      platesCentrifugedRound5 = platesCentrifugedRound5 +1; 
    }
    protocol_cmds.push(
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"spin",
        params: {
          speed: 500,
          acceleration: 80,
          decceleration: 80,
          duration:300,
        }
      },
    {
      toolId:"biolab_hig_centrifuge",
      toolType: ToolType.hig_centrifuge,
      command:"open_shield",
      params: {
        bucket_id: 0,
      }
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "getPlateHig",
        labware: "default",
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "regripLandscapetoPortrait",
        labware: "default",
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "dropoff_plate",
      params: {
        labware: "default",
        location:firstPlateLocation,
        motion_profile_id: 4,
      },
    });
  
    if(i+2 <= params.plate_count){
      protocol_cmds.push(
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 1,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "getPlateHig",
            labware: "default",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripLandscapetoPortrait",
            labware: "default",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:secondplateLocation,
            motion_profile_id: 4,
          },
        });
    }
  }
  
  //2nd wash 
      //1st wash     
      for(var i=0; i< params.plate_count;i++){
        let hotelLocation = "r1:l"+(i+1);
        protocol_cmds.push(
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
              labware: "default",
              location:hotelLocation,
              motion_profile_id: 4,
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "dropPlateBravoNest4",
              labware: "default",
            },
          },
          {
            toolId: "bravo_1",
            toolType: ToolType.bravo,
            command: "run_runset",
            params: {
                runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_full_dispense.rst",
            },
        },
  
        {
            toolId: "bravo_1",
            toolType: ToolType.bravo,
            command: "run_runset",
            params: {
                runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_bleach_t1_t2.rst",
            },
        },
        {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "getPlateBravoNest4",
              labware: "default",
            },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:hotelLocation,
            motion_profile_id: 4,
          },
        },
    )
  }
    let platesCentrifugedRound6 = 0;
    //Centrifuge all plates round 2
    for(var i=0; i<= params.plate_count;i+=2){
      console.log("Current index "+i);
      console.log("Plates centrifuged round 1 "+platesCentrifugedRound6);
      if(platesCentrifugedRound6 > params.plate_count){
        break;
      }
      let firstPlateLocation = "r1:l"+(i+1);
      protocol_cmds.push(
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "retrieve_plate",
          params: {
            labware: "default",
            location:firstPlateLocation,
            motion_profile_id: 4,
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripPortraitToLandscape",
            labware: "default",
          },
        },
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 0,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "dropPlateHiG",
            labware: "default",
          },
        }
      );
      platesCentrifugedRound6 = platesCentrifugedRound6 +1; 
      let secondplateLocation = "r1:l"+(i+2);
      if(i+2 <= params.plate_count){
        protocol_cmds.push(
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "retrieve_plate",
            params: {
              labware: "default",
              location:secondplateLocation,
              motion_profile_id: 4,
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "regripPortraitToLandscape",
              labware: "default",
            },
          },
          {
            toolId:"biolab_hig_centrifuge",
            toolType: ToolType.hig_centrifuge,
            command:"open_shield",
            params: {
              bucket_id: 1,
            }
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "dropPlateHiG",
              labware: "default",
            },
          }
        );
        platesCentrifugedRound6 = platesCentrifugedRound6 +1; 
      }
      protocol_cmds.push(
        {
          toolId: "biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"spin",
          params: {
            speed: 500,
            acceleration: 80,
            decceleration: 80,
            duration:300,
          }
        },
      {
        toolId:"biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"open_shield",
        params: {
          bucket_id: 0,
        }
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "getPlateHig",
          labware: "default",
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "regripLandscapetoPortrait",
          labware: "default",
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "dropoff_plate",
        params: {
          labware: "default",
          location:firstPlateLocation,
          motion_profile_id: 4,
        },
      });
  
      if(i+2 <= params.plate_count){
        protocol_cmds.push(
          {
            toolId:"biolab_hig_centrifuge",
            toolType: ToolType.hig_centrifuge,
            command:"open_shield",
            params: {
              bucket_id: 1,
            }
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "getPlateHig",
              labware: "default",
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "regripLandscapetoPortrait",
              labware: "default",
            },
          },
          
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "dropoff_plate",
            params: {
              labware: "default",
              location:secondplateLocation,
              motion_profile_id: 4,
            },
          });
        }
      }

          /// Rinse 3x with Water 

          for(var i=0; i < params.plate_count;i++){
            let hotelLocation = "r1:l"+(i+1);
            protocol_cmds.push(
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
                  labware: "default",
                  location:hotelLocation,
                  motion_profile_id: 4,
                },
              },
              {
                toolId: "pf400_1",
                toolType:  ToolType.pf400,
                command: "run_sequence",
                params: {
                  sequence_name: "dropPlateBravoNest4",
                  labware: "default",
                },
              },
            {
                toolId: "bravo_1",
                toolType: ToolType.bravo,
                command: "run_runset",
                params: {
                    runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_h20_full_rinse.rst",
                },
            },
            {
              toolId: "bravo_1",
              toolType: ToolType.bravo,
              command: "run_runset",
              params: {
                  runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_h20_in.rst",
              },
          },

            {
                toolId: "pf400_1",
                toolType:  ToolType.pf400,
                command: "run_sequence",
                params: {
                  sequence_name: "getPlateBravoNest4",
                  labware: "default",
                },
            },
            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "dropoff_plate",
              params: {
                labware: "default",
                location:hotelLocation,
                motion_profile_id: 4,
              },
            },
        )
      
      
      let platesCentrifugedRound5 : number= 0; 
      //Centrifuge all plates round 2
      for(var i=0; i< params.plate_count;i++){
        console.log("Current index "+i);
        console.log("Plates centrifuged round 1 "+platesCentrifugedRound5);
        if(platesCentrifugedRound5 > params.plate_count){
          break;
        }
        let firstPlateLocation = "r1:l"+(i+1);
        protocol_cmds.push(
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "retrieve_plate",
            params: {
              labware: "default",
              location:firstPlateLocation,
              motion_profile_id: 4,
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "regripPortraitToLandscape",
              labware: "default",
            },
          },
          {
            toolId:"biolab_hig_centrifuge",
            toolType: ToolType.hig_centrifuge,
            command:"open_shield",
            params: {
              bucket_id: 0,
            }
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "dropPlateHiG",
              labware: "default",
            },
          }
        );
        platesCentrifugedRound5 = platesCentrifugedRound5 +1; 
        let secondplateLocation = "r1:l"+(i+2);
        if(i+2 <= params.plate_count){
          protocol_cmds.push(
            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "retrieve_plate",
              params: {
                labware: "default",
                location:secondplateLocation,
                motion_profile_id: 4,
              },
            },
            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "run_sequence",
              params: {
                sequence_name: "regripPortraitToLandscape",
                labware: "default",
              },
            },
            {
              toolId:"biolab_hig_centrifuge",
              toolType: ToolType.hig_centrifuge,
              command:"open_shield",
              params: {
                bucket_id: 1,
              }
            },
            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "run_sequence",
              params: {
                sequence_name: "dropPlateHiG",
                labware: "default",
              },
            }
          );
          platesCentrifugedRound5 = platesCentrifugedRound5 +1; 
        }
        protocol_cmds.push(
          {
            toolId: "biolab_hig_centrifuge",
            toolType: ToolType.hig_centrifuge,
            command:"spin",
            params: {
              speed: 500,
              acceleration: 80,
              decceleration: 80,
              duration:300,
            }
          },
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 0,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "getPlateHig",
            labware: "default",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripLandscapetoPortrait",
            labware: "default",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:firstPlateLocation,
            motion_profile_id: 4,
          },
        });
      
        if(i+2 <= params.plate_count){
          protocol_cmds.push(
            {
              toolId:"biolab_hig_centrifuge",
              toolType: ToolType.hig_centrifuge,
              command:"open_shield",
              params: {
                bucket_id: 1,
              }
            },
            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "run_sequence",
              params: {
                sequence_name: "getPlateHig",
                labware: "default",
              },
            },
            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "run_sequence",
              params: {
                sequence_name: "regripLandscapetoPortrait",
                labware: "default",
              },
            },
            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "dropoff_plate",
              params: {
                labware: "default",
                location:secondplateLocation,
                motion_profile_id: 4,
              },
            });
        }
      }
      
      //2nd wash 
          //1st wash     
          for(var i=0; i< params.plate_count;i++){
            let hotelLocation = "r1:l"+(i+1);
            protocol_cmds.push(
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
                  labware: "default",
                  location:hotelLocation,
                  motion_profile_id: 4,
                },
              },
              {
                toolId: "pf400_1",
                toolType:  ToolType.pf400,
                command: "run_sequence",
                params: {
                  sequence_name: "dropPlateBravoNest4",
                  labware: "default",
                },
              },
              {
                toolId: "bravo_1",
                toolType: ToolType.bravo,
                command: "run_runset",
                params: {
                    runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_h20_full_rinse.rst",
                },
            },
            {
                toolId: "pf400_1",
                toolType:  ToolType.pf400,
                command: "run_sequence",
                params: {
                  sequence_name: "getPlateBravoNest4",
                  labware: "default",
                },
            },

            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "dropoff_plate",
              params: {
                labware: "default",
                location:hotelLocation,
                motion_profile_id: 4,
              },
            },
        )
      }
        //Centrifuge all plates round 2
        for(var i=0; i< params.plate_count;i++){
          let firstPlateLocation = "r1:l"+(i+1);
          protocol_cmds.push(
            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "retrieve_plate",
              params: {
                labware: "default",
                location:firstPlateLocation,
                motion_profile_id: 4,
              },
            },
            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "run_sequence",
              params: {
                sequence_name: "regripPortraitToLandscape",
                labware: "default",
              },
            },
            {
              toolId:"biolab_hig_centrifuge",
              toolType: ToolType.hig_centrifuge,
              command:"open_shield",
              params: {
                bucket_id: 0,
              }
            },
            {
              toolId: "pf400_1",
              toolType:  ToolType.pf400,
              command: "run_sequence",
              params: {
                sequence_name: "dropPlateHiG",
                labware: "default",
              },
            }
          );
          platesCentrifugedRound6 = platesCentrifugedRound6 +1; 
          let secondplateLocation = "r1:l"+(i+2);
          if(i+2 <= params.plate_count){
            protocol_cmds.push(
              {
                toolId: "pf400_1",
                toolType:  ToolType.pf400,
                command: "retrieve_plate",
                params: {
                  labware: "default",
                  location:secondplateLocation,
                  motion_profile_id: 4,
                },
              },
              {
                toolId: "pf400_1",
                toolType:  ToolType.pf400,
                command: "run_sequence",
                params: {
                  sequence_name: "regripPortraitToLandscape",
                  labware: "default",
                },
              },
              {
                toolId:"biolab_hig_centrifuge",
                toolType: ToolType.hig_centrifuge,
                command:"open_shield",
                params: {
                  bucket_id: 1,
                }
              },
              {
                toolId: "pf400_1",
                toolType:  ToolType.pf400,
                command: "run_sequence",
                params: {
                  sequence_name: "dropPlateHiG",
                  labware: "default",
                },
              }
            );
            platesCentrifugedRound6 = platesCentrifugedRound6 +1; 
          }
          protocol_cmds.push(
            {
              toolId: "biolab_hig_centrifuge",
              toolType: ToolType.hig_centrifuge,
              command:"spin",
              params: {
                speed: 500,
                acceleration: 80,
                decceleration: 80,
                duration:300,
              }
            },
          {
            toolId:"biolab_hig_centrifuge",
            toolType: ToolType.hig_centrifuge,
            command:"open_shield",
            params: {
              bucket_id: 0,
            }
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "getPlateHig",
              labware: "default",
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "regripLandscapetoPortrait",
              labware: "default",
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "dropoff_plate",
            params: {
              labware: "default",
              location:firstPlateLocation,
              motion_profile_id: 4,
            },
          });
      
          if(i+2 <= params.plate_count){
            protocol_cmds.push(
              {
                toolId:"biolab_hig_centrifuge",
                toolType: ToolType.hig_centrifuge,
                command:"open_shield",
                params: {
                  bucket_id: 1,
                }
              },
              {
                toolId: "pf400_1",
                toolType:  ToolType.pf400,
                command: "run_sequence",
                params: {
                  sequence_name: "getPlateHig",
                  labware: "default",
                },
              },
              {
                toolId: "pf400_1",
                toolType:  ToolType.pf400,
                command: "run_sequence",
                params: {
                  sequence_name: "regripLandscapetoPortrait",
                  labware: "default",
                },
              },
              
              {
                toolId: "pf400_1",
                toolType:  ToolType.pf400,
                command: "dropoff_plate",
                params: {
                  labware: "default",
                  location:secondplateLocation,
                  motion_profile_id: 4,
                },
              }
        );
      }
        
        }
        
      }

       /// Rinse 3x with Water 

       for(var i=0; i < params.plate_count;i++){
        let hotelLocation = "r1:l"+(i+1);
        protocol_cmds.push(
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
              labware: "default",
              location:hotelLocation,
              motion_profile_id: 4,
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "dropPlateBravoNest4",
              labware: "default",
            },
          },
        {
            toolId: "bravo_1",
            toolType: ToolType.bravo,
            command: "run_runset",
            params: {
                runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_h20_full_rinse.rst",
            },
        },
        {
          toolId: "bravo_1",
          toolType: ToolType.bravo,
          command: "run_runset",
          params: {
              runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_h20_in.rst",
          },
      },

        {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "getPlateBravoNest4",
              labware: "default",
            },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:hotelLocation,
            motion_profile_id: 4,
          },
        },
    )
  }
  
  
  let platesCentrifugedRound7 : number= 0; 
  //Centrifuge all plates round 2
  for(var i=0; i<= params.plate_count;i+=2){
    console.log("Current index "+i);
    console.log("Plates centrifuged round 1 "+platesCentrifugedRound7);
    if(platesCentrifugedRound7 > params.plate_count){
      break;
    }
    let firstPlateLocation = "r1:l"+(i+1);
    protocol_cmds.push(
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "retrieve_plate",
        params: {
          labware: "default",
          location:firstPlateLocation,
          motion_profile_id: 4,
        },
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "regripPortraitToLandscape",
          labware: "default",
        },
      },
      {
        toolId:"biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"open_shield",
        params: {
          bucket_id: 0,
        }
      },
      {
        toolId: "pf400_1",
        toolType:  ToolType.pf400,
        command: "run_sequence",
        params: {
          sequence_name: "dropPlateHiG",
          labware: "default",
        },
      }
    );
    platesCentrifugedRound7 = platesCentrifugedRound7 +1; 
    let secondplateLocation = "r1:l"+(i+2);
    if(i+2 <= params.plate_count){
      protocol_cmds.push(
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "retrieve_plate",
          params: {
            labware: "default",
            location:secondplateLocation,
            motion_profile_id: 4,
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripPortraitToLandscape",
            labware: "default",
          },
        },
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 1,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "dropPlateHiG",
            labware: "default",
          },
        }

      );
      platesCentrifugedRound7 = platesCentrifugedRound7 +1; 
    }


    protocol_cmds.push(
      {
        toolId: "biolab_hig_centrifuge",
        toolType: ToolType.hig_centrifuge,
        command:"spin",
        params: {
          speed: 500,
          acceleration: 80,
          decceleration: 80,
          duration:300,
        }
      },
    {
      toolId:"biolab_hig_centrifuge",
      toolType: ToolType.hig_centrifuge,
      command:"open_shield",
      params: {
        bucket_id: 0,
      }
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "getPlateHig",
        labware: "default",
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "run_sequence",
      params: {
        sequence_name: "regripLandscapetoPortrait",
        labware: "default",
      },
    },
    {
      toolId: "pf400_1",
      toolType:  ToolType.pf400,
      command: "dropoff_plate",
      params: {
        labware: "default",
        location:firstPlateLocation,
        motion_profile_id: 4,
      },
    }
  
  );
    if(i+2 <= params.plate_count){
      protocol_cmds.push(
        {
          toolId:"biolab_hig_centrifuge",
          toolType: ToolType.hig_centrifuge,
          command:"open_shield",
          params: {
            bucket_id: 1,
          }
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "getPlateHig",
            labware: "default",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "run_sequence",
          params: {
            sequence_name: "regripLandscapetoPortrait",
            labware: "default",
          },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:secondplateLocation,
            motion_profile_id: 4,
          },
        });
    }
  
  //2nd wash 
      //1st wash     
      for(var i=0; i< params.plate_count;i++){
        let hotelLocation = "r1:l"+(i+1);
        protocol_cmds.push(
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
              labware: "default",
              location:hotelLocation,
              motion_profile_id: 4,
            },
          },
          {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "dropPlateBravoNest4",
              labware: "default",
            },
          },
          {
            toolId: "bravo_1",
            toolType: ToolType.bravo,
            command: "run_runset",
            params: {
                runset_file: "C:\\VWorks Workspace\\RunSet Files\\plate_washing_patch_h20_full_rinse.rst",
            },
        },
        {
            toolId: "pf400_1",
            toolType:  ToolType.pf400,
            command: "run_sequence",
            params: {
              sequence_name: "getPlateBravoNest4",
              labware: "default",
            },
        },
        {
          toolId: "pf400_1",
          toolType:  ToolType.pf400,
          command: "dropoff_plate",
          params: {
            labware: "default",
            location:hotelLocation,
            motion_profile_id: 4,
          },
        },
      )
    }
  }

  }
    return protocol_cmds  as ToolCommandInfo[];
  }
}
