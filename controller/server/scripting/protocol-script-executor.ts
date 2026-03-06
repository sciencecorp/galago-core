import * as vm from "vm";
import { ToolCommandInfo } from "@/types";
import { logAction } from "@/server/logger";

export interface ScriptExecutionResult {
  commands: ToolCommandInfo[];
  logs: string[];
  success: boolean;
  error?: string;
}

export async function executeProtocolScript(
  scriptContent: string,
  params: Record<string, string>,
  timeout: number = 5000,
): Promise<ScriptExecutionResult> {
  const commands: ToolCommandInfo[] = [];
  const logs: string[] = [];

  const galago = {
    command(toolId: string, command: string, cmdParams: Record<string, any> = {}) {
      commands.push({
        toolId,
        toolType: "unknown" as any,
        command,
        params: cmdParams,
        label: "",
        advancedParameters: {
          skipExecutionVariable: { variable: null, value: "" },
          runAsynchronously: false,
        },
      });
    },

    timer({ minutes = 0, seconds = 30, message = "Timer in progress..." } = {}) {
      this.command("Tool Box", "timer", { minutes, seconds, message });
    },

    pause(message = "Run is paused. Click Continue to resume.") {
      this.command("Tool Box", "pause", { message });
    },

    showMessage(message: string, title = "Message") {
      this.command("Tool Box", "show_message", { message, title });
    },

    note(message: string) {
      this.command("Tool Box", "note", { message });
    },

    assignVariable(name: string, value: string) {
      this.command("Tool Box", "variable_assignment", { name, value });
    },

    userForm(name: string) {
      this.command("Tool Box", "user_form", { name });
    },
  };

  const sandboxConsole = {
    log: (...args: any[]) => logs.push(args.map(String).join(" ")),
    warn: (...args: any[]) => logs.push("[WARN] " + args.map(String).join(" ")),
    error: (...args: any[]) => logs.push("[ERROR] " + args.map(String).join(" ")),
  };

  try {
    const sandbox = {
      galago,
      params,
      console: sandboxConsole,
      Math,
      Array,
      Object,
      String,
      Number,
      Boolean,
      JSON,
      Date,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    };

    const context = vm.createContext(sandbox);

    const wrappedScript = `(async () => {\n${scriptContent}\n})()`;

    const script = new vm.Script(wrappedScript, {
      filename: "protocol-script.js",
      timeout,
    });

    await script.runInContext(context);

    if (commands.length === 0) {
      return {
        commands: [],
        logs,
        success: false,
        error: "Script produced no commands. Use galago.command() to emit commands.",
      };
    }

    logAction({
      level: "info",
      action: "Protocol Script Execution",
      details: `Script generated ${commands.length} commands`,
    });

    return { commands, logs, success: true };
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    logAction({
      level: "error",
      action: "Protocol Script Error",
      details: `Script execution failed: ${errorMessage}`,
    });

    return {
      commands: [],
      logs,
      success: false,
      error: errorMessage,
    };
  }
}
