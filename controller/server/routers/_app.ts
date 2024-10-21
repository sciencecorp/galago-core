import { router } from "../trpc";
import { commandQueueRouter } from "./command_queue";
import { protocolRouter } from "./protocol";
import { runRouter } from "./run";
import { toolRouter } from "./tool";
import { variableRouter } from "./variable";

export const appRouter = router({
  tool: toolRouter,
  protocol: protocolRouter,
  run: runRouter,
  commandQueue: commandQueueRouter,
  variable: variableRouter
});

export type AppRouter = typeof appRouter;
