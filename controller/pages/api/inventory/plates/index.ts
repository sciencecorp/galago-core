import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);

  try {
    if (req.method === "GET") {
      const { workcellName, toolId, nestId } = req.query;

      let plates = await caller.inventory.getPlates(
        workcellName ? (workcellName as string) : undefined,
      );

      // Filter by toolId if provided
      if (toolId) {
        const nests = await caller.inventory.getNests();
        const toolNests = nests.filter((n) => n.toolId === parseInt(toolId as string));
        const nestIds = toolNests.map((n) => n.id);
        plates = plates.filter((p) => p.nestId && nestIds.includes(p.nestId));
      }

      // Filter by nestId if provided
      if (nestId) {
        plates = plates.filter((p) => p.nestId === parseInt(nestId as string));
      }

      return res.status(200).json(plates);
    }

    if (req.method === "POST") {
      const result = await caller.inventory.createPlate(req.body);
      return res.status(201).json(result);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Plate API error:", error);
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
