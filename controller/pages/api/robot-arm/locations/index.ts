import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);

  try {
    if (req.method === "GET") {
      const { toolId } = req.query;
      const locations = await caller.robotArm.location.getAll({
        toolId: toolId ? (isNaN(Number(toolId)) ? String(toolId) : Number(toolId)) : undefined,
      });
      return res.status(200).json(locations);
    }

    if (req.method === "POST") {
      const result = await caller.robotArm.location.create(req.body);
      return res.status(201).json(result);
    }

    if (req.method === "PUT") {
      const result = await caller.robotArm.location.update(req.body);
      return res.status(200).json(result);
    }

    if (req.method === "DELETE") {
      const { id, toolId } = req.body;
      const result = await caller.robotArm.location.delete({ id, toolId });
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Robot Arm Location API error:", error);
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
