import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid tool ID" });
  }

  try {
    if (req.method === "GET") {
      const tool = await caller.tool.get(id);
      return res.status(200).json(tool);
    }

    if (req.method === "PUT") {
      // Try to parse as numeric ID first
      const numericId = parseInt(id);
      let toolId: number;

      if (isNaN(numericId)) {
        // If not numeric, get by name to find the ID
        const existing = await caller.tool.get(id);
        if (!existing.id) {
          return res.status(404).json({ error: "Tool not found" });
        }
        toolId = existing.id;
      } else {
        toolId = numericId;
      }

      const updated = await caller.tool.edit({
        id: toolId,
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        ip: req.body.ip,
        port: req.body.port,
        config: req.body.config,
      });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      // Try to parse as numeric ID first
      const numericId = parseInt(id);
      let toolId: number;

      if (isNaN(numericId)) {
        // If not numeric, get by name to find the ID
        const existing = await caller.tool.get(id);
        if (!existing.id) {
          return res.status(404).json({ error: "Tool not found" });
        }
        toolId = existing.id;
      } else {
        toolId = numericId;
      }

      await caller.tool.delete(toolId);
      return res.status(200).json({ message: "Tool deleted successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Tool API error:", error);
    const statusCode =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "CONFLICT"
          ? 409
          : error.code === "BAD_REQUEST"
            ? 400
            : 500;
    return res.status(statusCode).json({
      error: error.message || "Internal server error",
    });
  }
}
