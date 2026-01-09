// pages/api/settings/workcell.ts
import { NextApiRequest, NextApiResponse } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/trpc";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = createContext();
  const caller = appRouter.createCaller(ctx);

  try {
    if (req.method === "GET") {
      const selectedWorkcell = await caller.workcell.getSelectedWorkcell();
      return res.status(200).json({ value: selectedWorkcell });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const { value } = req.body;
      if (!value || typeof value !== "string") {
        return res.status(400).json({ error: "Invalid workcell name" });
      }

      await caller.workcell.setSelectedWorkcell(value);
      return res.status(200).json({ value });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Settings API error:", error);
    const statusCode = error.code === "NOT_FOUND" ? 404 : error.code === "BAD_REQUEST" ? 400 : 500;
    return res.status(statusCode).json({
      error: error.message || "Internal server error",
    });
  }
}
