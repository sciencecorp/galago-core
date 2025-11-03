import { Protocol } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";

// TODO: This is a stub, implement the real thing
export default function protocolsHandler(req: NextApiRequest, res: NextApiResponse<Protocol>) {
  const { query, method } = req;
  const id = parseInt(query.id as string, 10);
  const name = query.name as string;
}
