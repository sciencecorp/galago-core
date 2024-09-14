import RunStore from "@/server/runs";
import { RunStatusList, RunSubmissionStatus } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";

function getHandler(req: NextApiRequest, res: NextApiResponse<RunStatusList>) {
  const runs = RunStore.global.all();
  res.status(200).json({ count: runs.length, data: runs });
}

async function postHandler(req: NextApiRequest, res: NextApiResponse<RunSubmissionStatus>) {
  try {
    const run = await RunStore.global.createFromProtocol(req.body.workcellName, req.body.protocolId, req.body.params);
    res.status(201).json({ id: run.id, status: run.status });
  } catch (e: any) {
    switch (e.name) {
      case "ProtocolNotFoundError":
        res.status(404).end(e.message);
        break;
      case "ZodError":
        res.status(400).end(e.message);
        break;
      default:
        res.status(500).end(e.message);
    }
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;

  switch (method) {
    case "GET":
      getHandler(req, res);
      break;
    case "POST":
      postHandler(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
