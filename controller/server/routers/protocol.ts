import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { findOne, findMany, getSelectedWorkcellId } from "@/db/helpers";
import { protocols, workcells } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const zProtocol = z.object({
  id: z.number().optional(),
  name: z.string(),
  category: z.string(),
  workcellId: z.number().optional(),
  description: z.string().optional(),
  commands: z.array(z.any()),
});

const zProtocolCreate = z.object({
  name: z.string(),
  category: z.string(),
  workcellId: z.number().optional(),
  description: z.string().optional(),
  commands: z.array(z.any()).default([]),
});

const zProtocolUpdate = z.object({
  id: z.number(),
  name: z.string().optional(),
  category: z.string().optional(),
  description: z.string().nullable().optional(),
  commands: z.array(z.any()).optional(),
});

const zProtocolImport = z.object({
  workcellId: z.number(),
  protocol: z.object({
    name: z.string(),
    category: z.string().optional(),
    description: z.string().optional(),
    commands: z.array(z.any()).optional(),
  }),
});

export const protocolRouter = router({
  // Get all protocols
  getAll: procedure
    .input(
      z
        .object({
          workcellId: z.number().optional(),
          workcellName: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      let query = db.select().from(protocols);

      if (input?.workcellId) {
        const filtered = await db
          .select()
          .from(protocols)
          .where(eq(protocols.workcellId, input.workcellId));
        return filtered;
      }

      if (input?.workcellName) {
        const workcell = await findOne(workcells, eq(workcells.name, input.workcellName));
        if (workcell) {
          const filtered = await db
            .select()
            .from(protocols)
            .where(eq(protocols.workcellId, workcell.id));
          return filtered;
        }
        return [];
      }

      return await db.select().from(protocols);
    }),

  // Get single protocol by ID
  get: procedure.input(z.number()).query(async ({ input: protocolId }) => {
    const protocol = await findOne(protocols, eq(protocols.id, protocolId));
    if (!protocol) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Protocol not found",
      });
    }
    return protocol;
  }),

  // Get single protocol by name
  getByName: procedure.input(z.string()).query(async ({ input: protocolName }) => {
    const protocol = await findOne(protocols, eq(protocols.name, protocolName));
    if (!protocol) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Protocol not found",
      });
    }
    return protocol;
  }),

  // Create protocol
  create: procedure.input(zProtocolCreate).mutation(async ({ input }) => {
    try {
      // If no workcellId provided, use selected workcell
      let workcellId = input.workcellId;
      if (!workcellId) {
        workcellId = await getSelectedWorkcellId();
      }

      // Check if workcell exists
      const workcell = await findOne(workcells, eq(workcells.id, workcellId));
      if (!workcell) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Workcell with ID ${workcellId} not found`,
        });
      }

      // Create protocol
      const result = await db
        .insert(protocols)
        .values({
          name: input.name,
          category: input.category,
          workcellId: workcellId,
          description: input.description || null,
          commands: input.commands,
        })
        .returning();

      return result[0];
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to create protocol: ${error.message}`,
      });
    }
  }),

  // Update protocol
  update: procedure.input(zProtocolUpdate).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    const protocol = await findOne(protocols, eq(protocols.id, id));
    if (!protocol) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Protocol not found",
      });
    }

    const updated = await db
      .update(protocols)
      .set({
        ...(updateData.name !== undefined && { name: updateData.name }),
        ...(updateData.category !== undefined && { category: updateData.category }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.commands !== undefined && { commands: updateData.commands }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(protocols.id, id))
      .returning();

    return updated[0];
  }),

  // Delete protocol
  delete: procedure.input(z.number()).mutation(async ({ input: protocolId }) => {
    const protocol = await findOne(protocols, eq(protocols.id, protocolId));
    if (!protocol) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Protocol not found",
      });
    }

    await db.delete(protocols).where(eq(protocols.id, protocolId));
    return { success: true, message: "Protocol deleted successfully" };
  }),

  // Export protocol (returns data for download)
  export: procedure.input(z.number()).query(async ({ input: protocolId }) => {
    const protocol = await findOne(protocols, eq(protocols.id, protocolId));
    if (!protocol) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Protocol not found",
      });
    }

    return {
      protocol: {
        name: protocol.name,
        category: protocol.category,
        description: protocol.description,
        commands: protocol.commands,
      },
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
  }),

  // Import protocol
  import: procedure.input(zProtocolImport).mutation(async ({ input }) => {
    try {
      // Check if workcell exists
      const workcell = await findOne(workcells, eq(workcells.id, input.workcellId));
      if (!workcell) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Workcell with ID ${input.workcellId} not found`,
        });
      }

      // Create protocol from import data
      const result = await db
        .insert(protocols)
        .values({
          name: input.protocol.name,
          category: input.protocol.category || "development",
          description: input.protocol.description || null,
          commands: input.protocol.commands || [],
          workcellId: input.workcellId,
        })
        .returning();

      return result[0];
    } catch (error: any) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Import failed: ${error.message}`,
      });
    }
  }),
});
