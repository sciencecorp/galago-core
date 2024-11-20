import Protocol from "@/protocols/protocol";
import { Protocols } from "@/server/protocols";
import { z } from "zod";
import { procedure, router } from "@/server/trpc";

export const protocolRouter = router({
  all: procedure
    .input(z.object({}))
    .query(async () => {
      return Protocols.map((protocol: Protocol) => ({
        name: protocol.name,
        id: protocol.protocolId,
        category: protocol.category,
        workcell: protocol.workcell,
        commands: protocol.preview(),
        uiParams: protocol.uiParams(),
      }));
    }),

  allNames: procedure
    .input(z.object({ workcellName: z.string() }))
    .query(async ({ input }) => {
      const { workcellName } = input;
      return Protocols.filter((protocol: Protocol) => !workcellName || protocol.workcell === workcellName)
        .map((protocol) => ({
          name: protocol.name,
          id: protocol.protocolId,
          category: protocol.category,
          workcell: protocol.workcell,
          number_of_commands: protocol.preview().length,
          description: protocol.description,
          icon: protocol.icon,
        }));
    }),

  get: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const protocol = Protocols.find((p: Protocol) => p.protocolId === input.id);
      if (!protocol) return null;

      return {
        name: protocol.name,
        id: protocol.protocolId,
        category: protocol.category,
        workcell: protocol.workcell,
        commands: protocol._generateCommands({}),
        uiParams: protocol.uiParams(),
        icon: protocol.icon,
        description: protocol.description,
        number_of_commands: protocol._generateCommands({}).length
      };
    }),

  create: procedure
    .input(z.object({
      name: z.string(),
      category: z.enum(["development", "qc", "production"]),
      workcell: z.string(),
      description: z.string().optional()
    }))
    .mutation(async () => {
      throw new Error("Creating new protocols is not supported");
    }),

  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async () => {
      throw new Error("Deleting protocols is not supported");
    })
});
