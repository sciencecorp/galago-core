import { z } from "zod";
import CommandQueue from "../command_queue";

import { procedure, router } from "@/server/trpc";

// type NonEmptyArray<T> = [T, ...T[]];
// const zToolStatus = z.enum(Object.values(ToolStatus) as NonEmptyArray<ToolStatus>);

export const commandQueueRouter = router({
  state: procedure.query(async () => {
    return CommandQueue.global.state;
  }),

  restart: procedure.mutation(() => {
    CommandQueue.global._start();
  }),

  stop: procedure.mutation(() => {
    CommandQueue.global.stop();
  }),

  getError : procedure.query(async () => {
    return CommandQueue.global.getError();
  }),

  skipCommand: procedure.input(z.number()).mutation(async ({ input }) => {
    CommandQueue.global.skipCommand(input);
  }),

  skipCommandsUntil: procedure.input(z.number()).mutation(async ({ input }) => {
    // Skip all commands previous to the given command ID
    CommandQueue.global.skipCommandsUntil(input);
  }),

  clearCompleted: procedure.mutation(() => {
    CommandQueue.global.clearCompleted();
  }),

  clearAll: procedure.mutation(() => {
    CommandQueue.global.clearAll();
  }),

  clearByRunId: procedure.input(z.string()).mutation(async ({ input }) => {
    CommandQueue.global.clearByRunId(input);
  }),

  getRunsTotal: procedure.query(async () => {
    return CommandQueue.global.getRunsTotal();
  }),

  getRun: procedure.input(z.string()).mutation(async ({ input }) => {
    CommandQueue.global.getRun(input);
  }),

  getAllRuns: procedure.query(async () => {
    return CommandQueue.global.getAllRuns();
  }),

  getAll: procedure.query(async ({}) => {
    return await CommandQueue.global.allCommands();
  }),

  commands: procedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { limit = 20000, offset = 0 } = input; // default values if not provided
      return await CommandQueue.global.getPaginated(offset, limit);
      // const allCommands = await CommandQueue.global.allCommands();
    }),
});
