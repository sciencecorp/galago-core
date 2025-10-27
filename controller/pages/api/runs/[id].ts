import RunStore from "@/server/runs";
import { Run } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default function runsHandler(req: NextApiRequest, res: NextApiResponse<Run>) {
  const { query, method } = req;
  const id = String(query.id);

  switch (method) {
    case "GET":
      // Get data from your database
      const r = RunStore.global.get(id);
      if (!r) {
        res.status(404).end();
        return;
      }
      res.status(200).json({ ...r });
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
