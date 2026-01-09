import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);
  const { id } = req.query;

  const plateId = parseInt(id as string);
  if (isNaN(plateId)) {
    return res.status(400).json({ error: "Invalid plate ID" });
  }

  try {
    if (req.method === "GET") {
      const plate = await caller.inventory.getPlateInfo(plateId);
      return res.status(200).json(plate);
    }

    if (req.method === "PUT") {
      const updated = await caller.inventory.updatePlate({
        id: plateId,
        ...req.body,
      });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await caller.inventory.deletePlate(plateId);
      return res.status(200).json({ message: "Plate deleted successfully" });
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
