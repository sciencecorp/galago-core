import { Protocol } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";

// TODO: This is a stub, implement the real thing
export default function protocolsHandler(
  req: NextApiRequest,
  res: NextApiResponse<Protocol>,
) {
  const { query, method } = req;
  const id = parseInt(query.id as string, 10);
  const name = query.name as string;

  switch (method) {
    case "GET":
      // Get data from your database
      res.status(200).json({ id, name: `Protocol ${id}`, params: {} });
      break;
    case "PUT":
      // Update or create data in your database
      res.status(200).json({ id, name: name || `Protocol ${id}`, params: {} });
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
