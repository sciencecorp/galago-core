import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid workcell ID" });
  }

  try {
    if (req.method === "GET") {
      const workcell = await caller.workcell.get(id);
      return res.status(200).json(workcell);
    }

    if (req.method === "PUT") {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        return res.status(400).json({ error: "Invalid workcell ID" });
      }

      const updated = await caller.workcell.edit({
        id: numericId,
        name: req.body.name,
        location: req.body.location,
        description: req.body.description,
      });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        return res.status(400).json({ error: "Invalid workcell ID" });
      }

      await caller.workcell.delete(numericId);
      return res.status(200).json({ message: "Workcell deleted successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Workcell API error:", error);
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
