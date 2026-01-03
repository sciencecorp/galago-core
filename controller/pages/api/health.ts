// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Set proper content type to ensure JSON response
    res.setHeader("Content-Type", "application/json");

    // You can add additional health checks here if needed
    // For example: check database connection, check critical services, etc.

    return res.status(200).json({ status: "ok" });
  } catch (error: any) {
    console.error("Health check error:", error);
    res.setHeader("Content-Type", "application/json");
    return res.status(503).json({
      status: "error",
      error: error.message || "Service unavailable",
    });
  }
}
