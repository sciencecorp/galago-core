import { TRPCError } from "@trpc/server";
import { z } from "zod";
import RunStore from "../runs";
import {
  ProtocolGenerationFailedError,
  ProtocolNotFoundError,
  ProtocolParamsInvalidError,
} from "../runs";
import { procedure, router } from "@/server/trpc";

export const runRouter = router({
  all: procedure
    .input(
      z.object({
        // pagination will go here. later
      }),
    )
    .query(async () => {
      return RunStore.global.all();
    }),

  get: procedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const run = RunStore.global.get(id);
      if (!run) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No run found for this ID.",
        });
      }
      return run;
    }),

  create: procedure
    .input(
      z.object({
        protocolId: z.number(), // Changed from z.string() to z.number()
        numberOfRuns: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { protocolId } = input;
      try {
        // Convert number to string for RunStore if needed
        const protocolIdString = protocolId.toString();

        //Promise to create multiple runs
        if (input.numberOfRuns) {
          const runs = [];
          for (let i = 0; i < input.numberOfRuns; i++) {
            const run = await RunStore.global.createFromProtocol(protocolIdString);
            runs.push(run);
          }
          return runs;
        }
      } catch (e) {
        if (e instanceof ProtocolNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No protocol found for this ID.",
          });
        }
        if (e instanceof ProtocolGenerationFailedError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Could not generate commands for the given params.",
          });
        }
        if (e instanceof ProtocolParamsInvalidError) {
          // Ensure the ZodError gets thrown, so that the client can see it.
          // (We have a special formatter for ZodErrors.)
          throw e.cause;
        }
        throw e;
      }
    }),
});
