import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";
import Tool from "../tools";
import { Tool as ToolResponse } from "@/types/api";

const zRobotArmLocation = z.object({
  id: z.number().optional(),
  name: z.string(),
  location_type: z.enum(["j", "c"]),
  coordinates: z.string(), // Space-separated coordinates values
  orientation: z.enum(["portrait", "landscape"]),
  tool_id: z.number(),
});

const zRobotArmNest = z.object({
  id: z.number().optional(),
  name: z.string(),
  orientation: z.enum(["portrait", "landscape"]),
  location_type: z.enum(["j", "c"]),
  coordinates: z.string(), // Space-separated coordinates values
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
  commands: z.array(
    z.object({
      command: z.string(),
      params: z.record(z.any()),
      order: z.number(),
    }),
  ),
  tool_id: z.number(),
  labware: z.string().optional(),
});

const zRobotArmWaypoints = z.object({
  id: z.number(),
  name: z.string(),
  locations: z.array(zRobotArmLocation),
  nests: z.array(zRobotArmNest),
  motionProfiles: z.array(zRobotArmMotionProfile),
  gripParams: z.array(zRobotArmGripParams),
  sequences: z.array(zRobotArmSequence),
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
    create: procedure.input(zRobotArmLocation.omit({ id: true })).mutation(async ({ input }) => {
      const result = await post("/robot-arm-locations", input);
      const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
      await Tool.loadPF400Waypoints(tool.name);
      return result;
    }),

    update: procedure.input(zRobotArmLocation).mutation(async ({ input }) => {
      const result = await put(`/robot-arm-locations/${input.id}`, input);
      const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
      await Tool.loadPF400Waypoints(tool.name);
      return result;
    }),
    delete: procedure
      .input(z.object({ id: z.number(), tool_id: z.number() }))
      .mutation(async ({ input }) => {
        const result = await del(`/robot-arm-locations/${input.id}`);
        const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
        await Tool.loadPF400Waypoints(tool.name);
        return result;
      }),
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
      .mutation(async ({ input }) => {
        const result = await post("/robot-arm-motion-profiles", input);
        const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
        await Tool.loadPF400Waypoints(tool.name);
        return result;
      }),
    update: procedure.input(zRobotArmMotionProfile).mutation(async ({ input }) => {
      const result = await put(`/robot-arm-motion-profiles/${input.id}`, input);
      const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
      await Tool.loadPF400Waypoints(tool.name);
      return result;
    }),
    delete: procedure
      .input(z.object({ id: z.number(), tool_id: z.number() }))
      .mutation(async ({ input }) => {
        const result = await del(`/robot-arm-motion-profiles/${input.id}`);
        const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
        await Tool.loadPF400Waypoints(tool.name);
        return result;
      }),
  }),

  gripParams: router({
    getAll: procedure
      .input(z.object({ toolId: z.number() }))
      .query(
        ({ input }): Promise<RobotArmGripParams[]> =>
          get(`/robot-arm-grip-params?tool_id=${input.toolId}`),
      ),

    create: procedure.input(zRobotArmGripParams.omit({ id: true })).mutation(async ({ input }) => {
      const result = await post("/robot-arm-grip-params", input);
      const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
      await Tool.loadPF400Waypoints(tool.name);
      return result;
    }),

    update: procedure.input(zRobotArmGripParams).mutation(async ({ input }) => {
      const result = await put(`/robot-arm-grip-params/${input.id}`, input);
      const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
      await Tool.loadPF400Waypoints(tool.name);
      return result;
    }),

    delete: procedure
      .input(z.object({ id: z.number(), tool_id: z.number() }))
      .mutation(async ({ input }) => {
        const result = await del(`/robot-arm-grip-params/${input.id}`);
        const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
        await Tool.loadPF400Waypoints(tool.name);
        return result;
      }),
  }),

  sequence: router({
    getAll: procedure
      .input(z.object({ toolId: z.number() }))
      .query(
        ({ input }): Promise<RobotArmSequence[]> =>
          get(`/robot-arm-sequences?tool_id=${input.toolId}`),
      ),
    create: procedure.input(zRobotArmSequence.omit({ id: true })).mutation(async ({ input }) => {
      const result = await post("/robot-arm-sequences", input);
      const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
      await Tool.loadPF400Waypoints(tool.name);
      return result;
    }),
    update: procedure.input(zRobotArmSequence).mutation(async ({ input }) => {
      const result = await put(`/robot-arm-sequences/${input.id}`, input);
      const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
      await Tool.loadPF400Waypoints(tool.name);
      return result;
    }),

    delete: procedure
      .input(z.object({ id: z.number(), tool_id: z.number() }))
      .mutation(async ({ input }) => {
        const result = await del(`/robot-arm-sequences/${input.id}`);
        const tool = await get<ToolResponse>(`/tools/${input.tool_id}`);
        await Tool.loadPF400Waypoints(tool.name);
        return result;
      }),
  }),
  waypoints: router({
    getAll: procedure
      .input(z.object({ toolId: z.number() }))
      .query(
        ({ input }): Promise<z.infer<typeof zRobotArmWaypoints>> =>
          get(`/robot-arm-waypoints?tool_id=${input.toolId}`),
      ),
  }),
  command: procedure
    .input(
      z.object({
        command: z.string(),
        params: z.record(z.any()),
      }),
    )
    .mutation(({ input }) => post("/robot-arm-command", input)),
});
