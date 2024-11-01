import Protocol from "@/protocols/protocol";
import { Protocols } from "@/server/protocols";
import { z } from "zod";

import { procedure, router } from "@/server/trpc";
import { inferProcedureOutput } from "@trpc/server";

export type AllNamesOutput = {
  name: string;
  id: string;
  category: string;
  workcell: string;
  number_of_commands: number;
  description?: string;
  icon?: any;
}[];

export const protocolRouter = router({
  all: procedure
    .input(
      z.object({
        // pagination will go here. later
      }),
    )
    .query(async () => {
      return Protocols.map((protocol: Protocol) => {
        return {
          name: protocol.name,
          id: protocol.protocolId,
          category: protocol.category,
          workcell: protocol.workcell,
          commands: protocol.preview(),
          uiParams: protocol.uiParams(),
        };
      });
    }),
  allNames: procedure
    .input(z.object({ workcellName: z.string() }))
    .query<AllNamesOutput>(async ({ input }): Promise<AllNamesOutput> => {
      const { workcellName } = input;
      return Protocols.filter((protocol: Protocol) => protocol.workcell === workcellName).map(
        (
          protocol: Protocol,
        ): {
          name: string;
          id: string;
          category: string;
          workcell: string;
          number_of_commands: number;
          description?: string;
          icon?: any;
        } => {
          return {
            name: protocol.name,
            id: protocol.protocolId,
            category: protocol.category,
            workcell: protocol.workcell,
            number_of_commands: protocol.preview().length,
            description: protocol.description,
            icon: protocol.icon,
          };
        },
      );
    }),
  get: procedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const protocol = Protocols.find((p: Protocol) => p.protocolId === id);

      if (!protocol) return null;

      return {
        name: protocol.name,
        id: protocol.protocolId,
        category: protocol.category,
        workcell: protocol.workcell,
        commands: protocol.preview(),
        uiParams: protocol.uiParams(),
        icon: protocol.icon,
        description: protocol.description,
      };
    }),
});
