import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);

  try {
    if (req.method === "GET") {
      const { workcellName } = req.query;
      const hotels = await caller.inventory.getHotels(
        workcellName ? (workcellName as string) : undefined,
      );
      return res.status(200).json(hotels);
    }

    if (req.method === "POST") {
      const result = await caller.inventory.createHotel(req.body);
      return res.status(201).json(result);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Hotel API error:", error);
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
