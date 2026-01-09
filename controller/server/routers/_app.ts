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
import { settingsRouter } from "./settings";
import { secretsRouter } from "./secrets";
import { integrationsRouter } from "./integrations";
import { auditRouter } from "./audit";
import { backupRouter } from "./backup";

export const appRouter = router({
  inventory: inventoryRouter,
  tool: toolRouter,
  workcell: workcellRouter,
  settings: settingsRouter,
  secrets: secretsRouter,
  integrations: integrationsRouter,
  audit: auditRouter,
  backup: backupRouter,
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
});

export type AppRouter = typeof appRouter;
