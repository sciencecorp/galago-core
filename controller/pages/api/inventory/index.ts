import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);

  try {
    if (req.method === "GET") {
      const { workcellName } = req.query;

      if (!workcellName || typeof workcellName !== "string") {
        return res.status(400).json({ error: "workcellName query parameter is required" });
      }

      // Get all inventory data
      const [nests, plates, wells, reagents, hotels] = await Promise.all([
        caller.inventory.getNests(),
        caller.inventory.getPlates(workcellName),
        caller.inventory.getWells({ workcellName }),
        caller.inventory.getReagents({ workcellName }),
        caller.inventory.getHotels(workcellName),
      ]);

      return res.status(200).json({
        workcellName,
        nests,
        plates,
        wells,
        reagents,
        hotels,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Inventory API error:", error);
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

export default handler;
