import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";
import { zLabware } from "./labware";
import { Labware } from "@/types/api";
const zRobotArmLocation = z.object({
  id: z.number().optional(),
  name: z.string(),
  location_type: z.enum(["j", "c"]),
  j1: z.number().optional(),
  j2: z.number().optional(),
  j3: z.number().optional(),
  j4: z.number().optional(),
  j5: z.number().optional(),
  j6: z.number().optional(),
  tool_id: z.number(),
});

const zRobotArmNest = z.object({
  id: z.number().optional(),
  name: z.string(),
  orientation: z.enum(["portrait", "landscape"]),
  location_type: z.enum(["j", "c"]),
  j1: z.number().optional(),
  j2: z.number().optional(),
  j3: z.number().optional(),
  j4: z.number().optional(),
  j5: z.number().optional(),
  j6: z.number().optional(),
  safe_location_id: z.number(),
  tool_id: z.number(),
});

const zRobotArmMotionProfile = z.object({
  id: z.number(),
  name: z.string(),
  profile_id: z.number().min(1).max(14),
  speed: z.number(),
  speed2: z.number(),
  acceleration: z.number(),
  deceleration: z.number(),
  accel_ramp: z.number(),
  decel_ramp: z.number(),
  inrange: z.number(),
  straight: z.number(),
  tool_id: z.number(),
});

const zRobotArmGripParams = z.object({
  id: z.number().optional(),
  name: z.string(),
  width: z.number(),
  speed: z.number(),
  force: z.number(),
  tool_id: z.number(),
});

const zRobotArmSequence = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  commands: z.array(z.object({
    command: z.string(),
    params: z.record(z.any()),
    order: z.number()
  })),
  tool_id: z.number(),
});

const zRobotArmWaypoints = z.object({
  id: z.number(),
  name: z.string(),
  locations: z.array(zRobotArmLocation),
  nests: z.array(zRobotArmNest),
  motionProfiles: z.array(zRobotArmMotionProfile),
  gripParams: z.array(zRobotArmGripParams),
  sequences: z.array(zRobotArmSequence),
  labware: z.array(zLabware),
  tool_id: z.number(),
});

export type RobotArmLocation = z.infer<typeof zRobotArmLocation>;
export type RobotArmNest = z.infer<typeof zRobotArmNest>;
export type RobotArmMotionProfile = z.infer<typeof zRobotArmMotionProfile>;
export type RobotArmGripParams = z.infer<typeof zRobotArmGripParams>;
export type RobotArmSequence = z.infer<typeof zRobotArmSequence>;


export const robotArmRouter = router({
  location: router({
    getAll: procedure
      .input(z.object({ toolId: z.number() }))
      .query(
        ({ input }): Promise<RobotArmLocation[]> =>
          get(`/robot-arm-locations?tool_id=${input.toolId}`),
      ),
    create: procedure
      .input(zRobotArmLocation.omit({ id: true }))
      .mutation(({ input }) => post("/robot-arm-locations", input)),
    update: procedure
      .input(zRobotArmLocation)
      .mutation(({ input }) => put(`/robot-arm-locations/${input.id}`, input)),
    delete: procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => del(`/robot-arm-locations/${input.id}`)),
  }),
  nest: router({
    getAll: procedure
      .input(z.object({ toolId: z.number() }))
      .query(
        ({ input }): Promise<RobotArmNest[]> => get(`/robot-arm-nests?tool_id=${input.toolId}`),
      ),
    create: procedure
      .input(zRobotArmNest.omit({ id: true }))
      .mutation(({ input }) => post("/robot-arm-nests", input)),
    update: procedure
      .input(zRobotArmNest)
      .mutation(({ input }) => put(`/robot-arm-nests/${input.id}`, input)),
    delete: procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => del(`/robot-arm-nests/${input.id}`)),
  }),
  motionProfile: router({
    getAll: procedure
      .input(z.object({ toolId: z.number() }))
      .query(
        ({ input }): Promise<RobotArmMotionProfile[]> =>
          get(`/robot-arm-motion-profiles?tool_id=${input.toolId}`),
      ),
    create: procedure
      .input(zRobotArmMotionProfile.omit({ id: true }))
      .mutation(({ input }) => post("/robot-arm-motion-profiles", input)),
    update: procedure
      .input(zRobotArmMotionProfile)
      .mutation(({ input }) => put(`/robot-arm-motion-profiles/${input.id}`, input)),
    delete: procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => del(`/robot-arm-motion-profiles/${input.id}`)),
  }),

  gripParams: router({
    getAll: procedure
      .input(z.object({ toolId: z.number() }))
      .query(
        ({ input }): Promise<RobotArmGripParams[]> =>
          get(`/robot-arm-grip-params?tool_id=${input.toolId}`),
      ),
    create: procedure
      .input(zRobotArmGripParams.omit({ id: true }))
      .mutation(({ input }) => post("/robot-arm-grip-params", input)),
    update: procedure
      .input(zRobotArmGripParams)
      .mutation(({ input }) => put(`/robot-arm-grip-params/${input.id}`, input)),
    delete: procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => del(`/robot-arm-grip-params/${input.id}`)),
  }),

  sequence: router({
    getAll: procedure
      .input(z.object({ toolId: z.number() }))
      .query(
        ({ input }): Promise<RobotArmSequence[]> =>
          get(`/robot-arm-sequences?tool_id=${input.toolId}`),
      ),
    create: procedure
      .input(zRobotArmSequence.omit({ id: true }))
      .mutation(({ input }) => post("/robot-arm-sequences", input)),
    update: procedure
      .input(zRobotArmSequence)
      .mutation(({ input }) => put(`/robot-arm-sequences/${input.id}`, input)),
    delete: procedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => del(`/robot-arm-sequences/${input.id}`)),
  }),

  labware: router({
    getAll: procedure
      .input(z.object({ toolId: z.number() }))
      .query(
        ({ input }): Promise<Labware[]> =>
          get(`/labware?tool_id=${input.toolId}`),
      ),
  }),
  waypoints: router({
    getAll: procedure
      .input(z.object({ toolId: z.number() }))
      .query(async ({ input }): Promise<z.infer<typeof zRobotArmWaypoints>> => {
        const [nests, locations, sequences, motionProfiles, gripParams, labware] = await Promise.all([
          get(`/robot-arm-nests?tool_id=${input.toolId}`) as Promise<RobotArmNest[]>,
          get(`/robot-arm-locations?tool_id=${input.toolId}`) as Promise<RobotArmLocation[]>,
          get(`/robot-arm-sequences?tool_id=${input.toolId}`) as Promise<RobotArmSequence[]>,
          get(`/robot-arm-motion-profiles?tool_id=${input.toolId}`) as Promise<
            RobotArmMotionProfile[]
          >,
          get(`/robot-arm-grip-params?tool_id=${input.toolId}`) as Promise<RobotArmGripParams[]>,
          get(`/labware?tool_id=${input.toolId}`) as Promise<Labware[]>,
        ]);

        return {
          id: input.toolId,
          name: `Waypoints for Tool ${input.toolId}`,
          locations: locations,
          nests: nests,
          sequences: sequences,
          motionProfiles: motionProfiles,
          gripParams: gripParams,
          labware: labware,
          tool_id: input.toolId,
        };
      }),
  }),
  command: procedure
    .input(z.object({
      command: z.string(),
      params: z.record(z.any())
    }))
    .mutation(({ input }) => post("/robot-arm-command", input)),
});
