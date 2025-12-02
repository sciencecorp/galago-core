import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import Tool from "@/server/tools";
import { ToolType } from "gen-interfaces/controller";
import { logAction } from "@/server/logger";
import {
  zInitialize,
  zMix,
  zWash,
  zAspirate,
  zDispense,
  zTipsOn,
  zTipsOff,
  zMoveToLocation,
  zPickAndPlace,
  zHome,
} from "../schemas";

async function executeBravoCommand(toolId: string, command: string, params: Record<string, any>) {
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
  close: procedure.input(z.object({ toolId: z.string() })).mutation(async ({ input }) => {
    return await executeBravoCommand(input.toolId, "close", {});
  }),

  // Home by axis
  home: procedure
    .input(z.object({ toolId: z.string(), params: zHome }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "home", input.params);
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

  // Pick and Place
  pickAndPlace: procedure
    .input(z.object({ toolId: z.string(), params: zPickAndPlace }))
    .mutation(async ({ input }) => {
      return await executeBravoCommand(input.toolId, "pick_and_place", input.params);
    }),

  // Show Diagnostics
  showDiagnostics: procedure.input(z.object({ toolId: z.string() })).mutation(async ({ input }) => {
    return await executeBravoCommand(input.toolId, "show_diagnostics", {});
  }),
});
