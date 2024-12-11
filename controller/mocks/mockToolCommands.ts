import { z } from "zod";

export const mockToolCommands = {
  pf400: {
    move: {
      schema: z.object({
        waypoint: z.string(),
        motion_profile_id: z.number().default(2),
      }),
    },
    grasp_plate: {
      schema: z.object({
        width: z.number().default(122),
        speed: z.number().default(10),
        force: z.number().default(20),
      }),
    },
    release_plate: {
      schema: z.object({
        width: z.number().default(130),
        speed: z.number().default(10),
      }),
    },
  },
  hamilton: {
    run_protocol: {
      schema: z.object({
        protocol: z.string(),
      }),
    },
    load_protocol: {
      schema: z.object({
        runset_file: z.string(),
      }),
    },
  },
  bioshake: {
    start_shake: {
      schema: z.object({
        speed: z.number().default(500),
        duration: z.number().default(60),
      }),
    },
    stop_shake: {
      schema: z.object({}),
    },
  },
};
