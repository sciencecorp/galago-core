import { router } from "../trpc";
import { commandQueueRouter } from "./command_queue";
import { protocolRouter } from "./protocol";
import { runRouter } from "./run";
import { toolRouter } from "./tool";
import { variableRouter } from "./variable";
import { loggingRouter } from "./logging";
import { log } from "console";
import { workcellRouter } from "./workcell";
import { labwareRouter } from "./labware";
export const appRouter = router({
  tool: toolRouter,
  workcell: workcellRouter,
  protocol: protocolRouter,
  run: runRouter,
  commandQueue: commandQueueRouter,
  variable: variableRouter,
  logging: loggingRouter,
  labware: labwareRouter,
});

export type AppRouter = typeof appRouter;
