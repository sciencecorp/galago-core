import { TRPCError } from "@trpc/server";
import { z } from "zod";
import RunStore, {
  ProtocolGenerationFailedError,
  ProtocolNotFoundError,
  ProtocolParamsInvalidError,
  upsertParameterVariables,
} from "../runs";
import { procedure, router } from "@/server/trpc";
import { getSelectedWorkcellId } from "@/db/helpers";
import { db } from "@/db/client";
import { protocols } from "@/db/schema";
import { eq } from "drizzle-orm";

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
        protocolId: z.number(),
        numberOfRuns: z.number().optional(),
        parameters: z.record(z.string(), z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { protocolId } = input;
      try {
        const protocolIdString = protocolId.toString();

        if (input.parameters && Object.keys(input.parameters).length > 0) {
          const workcellId = await getSelectedWorkcellId();
          const protocol = await db
            .select()
            .from(protocols)
            .where(eq(protocols.id, protocolId))
            .limit(1);

          if (!protocol[0]) {
            throw new ProtocolNotFoundError(protocolIdString);
          }

          const paramDefs = protocol[0].parameters ?? [];
          if (paramDefs.length > 0) {
            await upsertParameterVariables(paramDefs, input.parameters, workcellId);
          }
        }

        const numRuns = input.numberOfRuns ?? 1;
        const runs = [];
        for (let i = 0; i < numRuns; i++) {
          const run = await RunStore.global.createFromProtocol(protocolIdString);
          runs.push(run);
        }
        return runs;
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
          throw e.cause;
        }
        throw e;
      }
    }),
});
