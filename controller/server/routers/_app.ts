import { router } from "../trpc";
import { commandQueueRouter } from "./command_queue";
import { protocolRouter } from "./protocol";
import { runRouter } from "./run";
import { toolRouter } from "./tool";
import { variableRouter } from "./variable";
import { loggingRouter } from "./logging";
import { workcellRouter } from "./workcell";
import { labwareRouter } from "./labware";
import { scriptRouter } from "./script";
import { inventoryRouter } from "./inventory";
import { robotArmRouter } from "./robot-arm";
import { csharpRouter } from "./cSharpRouter";
import { formRouter } from "./form";
import { hubLibraryRouter } from "./hubLibrary";
import { appSettingsRouter } from "./appSettings";

export const appRouter = router({
  inventory: inventoryRouter,
  tool: toolRouter,
  workcell: workcellRouter,
  protocol: protocolRouter,
  run: runRouter,
  commandQueue: commandQueueRouter,
  variable: variableRouter,
  logging: loggingRouter,
  labware: labwareRouter,
  script: scriptRouter,
  robotArm: robotArmRouter,
  cSharp: csharpRouter,
  form: formRouter,
  hubLibrary: hubLibraryRouter,
  appSettings: appSettingsRouter,
});

export type AppRouter = typeof appRouter;
