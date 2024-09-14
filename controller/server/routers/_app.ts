import { router } from "../trpc";
import { commandQueueRouter } from "./command_queue";
import { protocolRouter } from "./protocol";
import { runRouter } from "./run";
import { toolRouter } from "./tool";
import { scicloneRouter } from "./sciclone";

export const appRouter = router({
  tool: toolRouter,
  protocol: protocolRouter,
  run: runRouter,
  commandQueue: commandQueueRouter,
  sciclone: scicloneRouter,
});

export type AppRouter = typeof appRouter;
