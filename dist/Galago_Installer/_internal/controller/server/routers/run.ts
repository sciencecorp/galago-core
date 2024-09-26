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
      })
    )
    .query(async () => {
      return RunStore.global.all();
    }),

  get: procedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;

      const run = RunStore.global.get(id);
      if (!run) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No run found for this ID.",
          // optional: pass the original error to retain stack trace
        });
      }

      return run;
    }),

  create: procedure
    .input(
      z.object({
        workcellName: z.string(),
        protocolId: z.string(),
        params: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const {workcellName, protocolId, params } = input;

      try {
        const run = await RunStore.global.createFromProtocol(workcellName, protocolId, params);
        return run;
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
