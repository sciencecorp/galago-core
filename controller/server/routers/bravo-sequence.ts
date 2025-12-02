import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";
import { logAction } from "@/server/logger";
import {
  BravoSequence,
  zBravoSequenceCreate,
  zBravoSequenceUpdate,
  BravoSequenceStep,
  zBravoSequenceStepCreate,
  zBravoSequenceStepUpdate,
} from "@/server/schemas";

export const bravoSequenceRouter = router({
  // ===== Sequence Operations =====
  sequence: router({
    // Get all sequences
    getAll: procedure
      .input(z.object({ toolId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const url = input?.toolId ? `/bravo-sequences?tool_id=${input.toolId}` : "/bravo-sequences";
        const response = await get<BravoSequence[]>(url);
        return response;
      }),

    // Get a specific sequence by ID
    get: procedure.input(z.number()).query(async ({ input }) => {
      const response = await get<BravoSequence>(`/bravo-sequences/${input}`);
      return response;
    }),

    // Create new sequence
    create: procedure.input(zBravoSequenceCreate).mutation(async ({ input }) => {
      const response = await post<BravoSequence>("/bravo-sequences", input);
      logAction({
        level: "info",
        action: "Bravo Sequence Created",
        details: `Bravo sequence "${input.name}" created successfully for tool ID ${input.tool_id}.`,
      });
      return response;
    }),

    // Update sequence
    update: procedure
      .input(
        z.object({
          id: z.number(),
          data: zBravoSequenceUpdate,
        }),
      )
      .mutation(async ({ input }) => {
        const { id, data } = input;
        const response = await put<BravoSequence>(`/bravo-sequences/${id}`, data);
        logAction({
          level: "info",
          action: "Bravo Sequence Updated",
          details: `Bravo sequence "${data.name || "ID:" + id}" updated successfully.`,
        });
        return response;
      }),

    // Update sequence steps
    updateSteps: procedure
      .input(
        z.object({
          id: z.number(),
          steps: z.array(
            z.object({
              command_name: z.enum([
                "home",
                "mix",
                "aspirate",
                "dispense",
                "tips_on",
                "tips_off",
                "move_to_location",
                "configure_deck",
                "show_diagnostics",
              ]),
              label: z.string(),
              params: z.record(z.any()),
              position: z.number(),
              sequence_id: z.number(),
            }),
          ),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, steps } = input;
        const response = await put<BravoSequenceStep[]>(`/bravo-sequences/${id}/steps`, steps);
        logAction({
          level: "info",
          action: "Bravo Sequence Steps Updated",
          details: `Updated ${steps.length} steps for sequence ID ${id}.`,
        });
        return response;
      }),

    // Delete sequence
    delete: procedure.input(z.number()).mutation(async ({ input }) => {
      // Get sequence details before deletion for logging
      let sequenceName = `ID: ${input}`;
      try {
        const sequence = await get<BravoSequence>(`/bravo-sequences/${input}`);
        sequenceName = sequence.name;
      } catch (error) {
        console.warn("Could not fetch sequence name for logging:", error);
      }

      await del(`/bravo-sequences/${input}`);
      logAction({
        level: "info",
        action: "Bravo Sequence Deleted",
        details: `Bravo sequence "${sequenceName}" deleted successfully.`,
      });
      return { message: "Bravo sequence deleted successfully" };
    }),
  }),

  // ===== Step Operations =====
  step: router({
    // Get all steps
    getAll: procedure
      .input(z.object({ sequenceId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const url = input?.sequenceId
          ? `/bravo-sequence-steps?sequence_id=${input.sequenceId}`
          : "/bravo-sequence-steps";
        const response = await get<BravoSequenceStep[]>(url);
        return response;
      }),

    // Get a specific step by ID
    get: procedure.input(z.number()).query(async ({ input }) => {
      const response = await get<BravoSequenceStep>(`/bravo-sequence-steps/${input}`);
      return response;
    }),

    // Create new step
    create: procedure.input(zBravoSequenceStepCreate).mutation(async ({ input }) => {
      const response = await post<BravoSequenceStep>("/bravo-sequence-steps", input);
      logAction({
        level: "info",
        action: "Bravo Step Created",
        details: `Bravo step "${input.label}" (${input.command_name}) created at position ${input.position}.`,
      });
      return response;
    }),

    // Update step
    update: procedure
      .input(
        z.object({
          id: z.number(),
          data: zBravoSequenceStepUpdate,
        }),
      )
      .mutation(async ({ input }) => {
        const { id, data } = input;
        const response = await put<BravoSequenceStep>(`/bravo-sequence-steps/${id}`, data);
        logAction({
          level: "info",
          action: "Bravo Step Updated",
          details: `Bravo step "${data.label || "ID:" + id}" updated successfully.`,
        });
        return response;
      }),

    // Delete step
    delete: procedure.input(z.number()).mutation(async ({ input }) => {
      // Get step details before deletion for logging
      let stepLabel = `ID: ${input}`;
      try {
        const step = await get<BravoSequenceStep>(`/bravo-sequence-steps/${input}`);
        stepLabel = step.label;
      } catch (error) {
        console.warn("Could not fetch step label for logging:", error);
      }

      await del(`/bravo-sequence-steps/${input}`);
      logAction({
        level: "info",
        action: "Bravo Step Deleted",
        details: `Bravo step "${stepLabel}" deleted successfully.`,
      });
      return { message: "Bravo step deleted successfully" };
    }),

    // Reorder steps
    reorder: procedure
      .input(
        z.object({
          sequenceId: z.number(),
          stepIds: z.array(z.number()),
        }),
      )
      .mutation(async ({ input }) => {
        const response = await post("/bravo-sequence-steps/reorder", {
          sequence_id: input.sequenceId,
          step_ids: input.stepIds,
        });
        logAction({
          level: "info",
          action: "Bravo Steps Reordered",
          details: `Reordered ${input.stepIds.length} steps in sequence ${input.sequenceId}.`,
        });
        return response;
      }),

    // Bulk create steps
    bulkCreate: procedure.input(z.array(zBravoSequenceStepCreate)).mutation(async ({ input }) => {
      const response = await post<BravoSequenceStep[]>("/bravo-sequence-steps/bulk-create", input);
      logAction({
        level: "info",
        action: "Bravo Steps Bulk Created",
        details: `Created ${input.length} Bravo steps in bulk.`,
      });
      return response;
    }),
  }),
});
