import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";
import { logAction } from "@/server/logger";
import {
  BravoProtocol,
  zBravoProtocolCreate,
  zBravoProtocolUpdate,
  BravoProtocolCommand,
  zBravoProtocolCommandCreate,
  zBravoProtocolCommandUpdate,
} from "@/server/schemas/bravo";

export const bravoProtocolRouter = router({
  // ===== Protocol Operations =====
  protocol: router({
    // Get all protocols
    getAll: procedure
      .input(z.object({ toolId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const url = input?.toolId ? `/bravo-protocols?tool_id=${input.toolId}` : "/bravo-protocols";
        const response = await get<BravoProtocol[]>(url);
        return response;
      }),

    // Get a specific protocol by ID
    get: procedure.input(z.number()).query(async ({ input }) => {
      const response = await get<BravoProtocol>(`/bravo-protocols/${input}`);
      return response;
    }),

    // Create new protocol
    create: procedure.input(zBravoProtocolCreate).mutation(async ({ input }) => {
      const response = await post<BravoProtocol>("/bravo-protocols", input);
      logAction({
        level: "info",
        action: "Bravo Protocol Created",
        details: `Bravo protocol "${input.name}" created successfully for tool ID ${input.tool_id}.`,
      });
      return response;
    }),

    // Update protocol
    update: procedure
      .input(
        z.object({
          id: z.number(),
          data: zBravoProtocolUpdate,
        }),
      )
      .mutation(async ({ input }) => {
        const { id, data } = input;
        const response = await put<BravoProtocol>(`/bravo-protocols/${id}`, data);
        logAction({
          level: "info",
          action: "Bravo Protocol Updated",
          details: `Bravo protocol "${data.name || "ID:" + id}" updated successfully.`,
        });
        return response;
      }),

    // Update protocol commands
    updateCommands: procedure
      .input(
        z.object({
          id: z.number(),
          commands: z.array(
            z.object({
              command_type: z.enum([
                "home",
                "mix",
                "aspirate",
                "dispense",
                "tips_on",
                "tips_off",
                "move_to_location",
                "configure_deck",
                "show_diagnostics",
                "loop",
                "group",
              ]),
              label: z.string(),
              params: z.record(z.any()),
              position: z.number(),
              protocol_id: z.number(),
              parent_command_id: z.number().optional(),
            }),
          ),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, commands } = input;
        const response = await put<BravoProtocolCommand[]>(
          `/bravo-protocols/${id}/commands`,
          commands,
        );
        logAction({
          level: "info",
          action: "Bravo Protocol Commands Updated",
          details: `Updated ${commands.length} commands for protocol ID ${id}.`,
        });
        return response;
      }),

    // Delete protocol
    delete: procedure.input(z.number()).mutation(async ({ input }) => {
      // Get protocol details before deletion for logging
      let protocolName = `ID: ${input}`;
      try {
        const protocol = await get<BravoProtocol>(`/bravo-protocols/${input}`);
        protocolName = protocol.name;
      } catch (error) {
        console.warn("Could not fetch protocol name for logging:", error);
      }

      await del(`/bravo-protocols/${input}`);
      logAction({
        level: "info",
        action: "Bravo Protocol Deleted",
        details: `Bravo protocol "${protocolName}" deleted successfully.`,
      });
      return { message: "Bravo protocol deleted successfully" };
    }),
  }),

  // ===== Command Operations =====
  command: router({
    // Get all commands
    getAll: procedure
      .input(
        z
          .object({
            protocolId: z.number().optional(),
            parentCommandId: z.number().optional(),
          })
          .optional(),
      )
      .query(async ({ input }) => {
        const params = new URLSearchParams();
        if (input?.protocolId) {
          params.append("protocol_id", input.protocolId.toString());
        }
        if (input?.parentCommandId !== undefined) {
          params.append("parent_command_id", input.parentCommandId.toString());
        }

        const url = params.toString()
          ? `/bravo-protocol-commands?${params.toString()}`
          : "/bravo-protocol-commands";
        const response = await get<BravoProtocolCommand[]>(url);
        return response;
      }),

    // Get a specific command by ID
    get: procedure.input(z.number()).query(async ({ input }) => {
      const response = await get<BravoProtocolCommand>(`/bravo-protocol-commands/${input}`);
      return response;
    }),

    // Create new command
    create: procedure.input(zBravoProtocolCommandCreate).mutation(async ({ input }) => {
      const response = await post<BravoProtocolCommand>("/bravo-protocol-commands", input);
      logAction({
        level: "info",
        action: "Bravo Command Created",
        details: `Bravo command "${input.label}" (${input.command_type}) created at position ${input.position}.`,
      });
      return response;
    }),

    // Update command
    update: procedure
      .input(
        z.object({
          id: z.number(),
          data: zBravoProtocolCommandUpdate,
        }),
      )
      .mutation(async ({ input }) => {
        const { id, data } = input;
        const response = await put<BravoProtocolCommand>(`/bravo-protocol-commands/${id}`, data);
        logAction({
          level: "info",
          action: "Bravo Command Updated",
          details: `Bravo command "${data.label || "ID:" + id}" updated successfully.`,
        });
        return response;
      }),

    // Delete command
    delete: procedure.input(z.number()).mutation(async ({ input }) => {
      // Get command details before deletion for logging
      let commandLabel = `ID: ${input}`;
      try {
        const command = await get<BravoProtocolCommand>(`/bravo-protocol-commands/${input}`);
        commandLabel = command.label;
      } catch (error) {
        console.warn("Could not fetch command label for logging:", error);
      }

      await del(`/bravo-protocol-commands/${input}`);
      logAction({
        level: "info",
        action: "Bravo Command Deleted",
        details: `Bravo command "${commandLabel}" deleted successfully.`,
      });
      return { message: "Bravo command deleted successfully" };
    }),

    // Reorder commands
    reorder: procedure
      .input(
        z.object({
          protocolId: z.number(),
          commandIds: z.array(z.number()),
        }),
      )
      .mutation(async ({ input }) => {
        const response = await post("/bravo-protocol-commands/reorder", {
          protocol_id: input.protocolId,
          command_ids: input.commandIds,
        });
        logAction({
          level: "info",
          action: "Bravo Commands Reordered",
          details: `Reordered ${input.commandIds.length} commands in protocol ${input.protocolId}.`,
        });
        return response;
      }),

    // Bulk create commands
    bulkCreate: procedure
      .input(z.array(zBravoProtocolCommandCreate))
      .mutation(async ({ input }) => {
        const response = await post<BravoProtocolCommand[]>(
          "/bravo-protocol-commands/bulk-create",
          input,
        );
        logAction({
          level: "info",
          action: "Bravo Commands Bulk Created",
          details: `Created ${input.length} Bravo commands in bulk.`,
        });
        return response;
      }),
  }),
});
