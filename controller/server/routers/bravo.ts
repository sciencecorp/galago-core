import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import Tool from "@/server/tools";
import { ToolType } from "gen-interfaces/controller";
import { logAction } from "@/server/logger";

// Zod schemas for Bravo command parameters
const zInitialize = z.object({
  profile: z.string(),
});

const zMix = z.object({
  volume: z.number(),
  pre_aspirate_volume: z.number(),
  blow_out_volume: z.number(),
  cycles: z.number(),
  plate_location: z.number(),
  distance_from_well_bottom: z.number(),
  retract_distance_per_microliter: z.number(),
});

const zWash = z.object({
  volume: z.number(),
  empty_tips: z.boolean(),
  pre_aspirate_volume: z.number(),
  blow_out_volume: z.number(),
  cycles: z.number(),
  plate_location: z.number(),
  distance_from_well_bottom: z.number(),
  retract_distance_per_microliter: z.number(),
  pump_in_flow_speed: z.number(),
  pump_out_flow_speed: z.number(),
});

const zAspirate = z.object({
  volume: z.number(),
  plate_location: z.number(),
  distance_from_well_bottom: z.number().optional(),
  pre_aspirate_volume: z.number().optional(),
  post_aspirate_volume: z.number().optional(),
  retract_distance_per_microliter: z.number().optional(),
});

const zDispense = z.object({
  volume: z.number(),
  empty_tips: z.boolean(),
  blow_out_volume: z.number(),
  plate_location: z.number(),
  distance_from_well_bottom: z.number().optional(),
  retract_distance_per_microliter: z.number().optional(),
});

const zTipsOn = z.object({
  plate_location: z.number(),
});

const zTipsOff = z.object({
  plate_location: z.number(),
});

const zMoveToLocation = z.object({
  plate_location: z.number(),
  only_z: z.boolean().optional(),
});

const zSetLabwareAtLocation = z.object({
  plate_location: z.number(),
  labware_type: z.string(),
});

const zSetLiquidClass = z.object({
  liquid_class: z.string(),
});

const zPickAndPlace = z.object({
  source_location: z.number(),
  dest_location: z.number(),
  gripper_offset: z.number(),
  labware_thickness: z.number(),
});

// Helper function to execute Bravo commands
async function executeBravoCommand(
  toolId: string,
  command: string,
  params: Record<string, any>
) {
  const commandInfo = {
    toolId,
    toolType: ToolType.bravo,
    command,
    params,
  };

  logAction({
    level: "info",
    action: "Bravo Command Execution",
    details: `Executing ${command} on ${toolId} with params: ${JSON.stringify(params)}`,
  });

  return await Tool.executeCommand(commandInfo);
}

export const bravoRouter = router({
  // Initialize
  initialize: procedure
    .input(z.object({ toolId: z.string(), params: zInitialize }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "initialize", input.params);
    }),

  // Close
  close: procedure
    .input(z.object({ toolId: z.string() }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "close", {});
    }),

  // Home W axis
  homeW: procedure
    .input(z.object({ toolId: z.string() }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "home_w", {});
    }),

  // Home XYZ axes
  homeXYZ: procedure
    .input(z.object({ toolId: z.string() }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "home_xyz", {});
    }),

  // Mix
  mix: procedure
    .input(z.object({ toolId: z.string(), params: zMix }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "mix", input.params);
    }),

  // Wash
  wash: procedure
    .input(z.object({ toolId: z.string(), params: zWash }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "wash", input.params);
    }),

  // Aspirate
  aspirate: procedure
    .input(z.object({ toolId: z.string(), params: zAspirate }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "aspirate", input.params);
    }),

  // Dispense
  dispense: procedure
    .input(z.object({ toolId: z.string(), params: zDispense }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "dispense", input.params);
    }),

  // Tips On
  tipsOn: procedure
    .input(z.object({ toolId: z.string(), params: zTipsOn }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "tips_on", input.params);
    }),

  // Tips Off
  tipsOff: procedure
    .input(z.object({ toolId: z.string(), params: zTipsOff }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "tips_off", input.params);
    }),

  // Move to Location
  moveToLocation: procedure
    .input(z.object({ toolId: z.string(), params: zMoveToLocation }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "move_to_location", input.params);
    }),

  // Set Labware at Location
  setLabwareAtLocation: procedure
    .input(z.object({ toolId: z.string(), params: zSetLabwareAtLocation }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "set_labware_at_location", input.params);
    }),

  // Set Liquid Class
  setLiquidClass: procedure
    .input(z.object({ toolId: z.string(), params: zSetLiquidClass }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "set_liquid_class", input.params);
    }),

  // Pick and Place
  pickAndPlace: procedure
    .input(z.object({ toolId: z.string(), params: zPickAndPlace }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "pick_and_place", input.params);
    }),

  // Get Device Configuration
  getDeviceConfiguration: procedure
    .input(z.object({ toolId: z.string() }))
    .query(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "get_device_configuration", {});
    }),

  // Get Firmware Version
  getFirmwareVersion: procedure
    .input(z.object({ toolId: z.string() }))
    .query(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "get_firmware_version", {});
    }),

  // Enumerate Profiles
  enumerateProfiles: procedure
    .input(z.object({ toolId: z.string() }))
    .query(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "enumerate_profiles", {});
    }),

  // Show Diagnostics
  showDiagnostics: procedure
    .input(z.object({ toolId: z.string() }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "show_diagnostics", {});
    }),

  // Estimate duration for any command
  estimateDuration: procedure
    .input(
      z.object({
        toolId: z.string(),
        command: z.string(),
        params: z.record(z.any()),
      })
    )
    .query(async ({ input }) => {
      const tool = Tool.forId(input.toolId);
      return await tool.estimateDuration({
        toolId: input.toolId,
        toolType: ToolType.bravo,
        command: input.command,
        params: input.params,
      });
    }),
});