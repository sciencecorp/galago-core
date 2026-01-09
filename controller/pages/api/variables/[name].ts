// pages/api/variables/[name].ts
import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);
  const { name } = req.query;

  if (typeof name !== "string") {
    return res.status(400).json({ error: "Invalid variable name" });
  }

  try {
    if (req.method === "GET") {
      const variable = await caller.variable.get(name);
      return res.status(200).json(variable);
    }

    if (req.method === "PUT") {
      // Get existing variable first
      const existing = await caller.variable.get(name);

      // Update with new data - workcellId is NOT included (it never changes)
      const updated = await caller.variable.edit({
        id: existing.id!,
        name: req.body.name || existing.name,
        value: req.body.value !== undefined ? req.body.value : existing.value,
        type: req.body.type || existing.type,
      });

      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      const variable = await caller.variable.get(name);
      await caller.variable.delete(variable.id!);
      return res.status(200).json({ message: "Variable deleted successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Variable API error:", error);
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
