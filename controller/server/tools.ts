import { ToolCommandInfo } from "@/types";
import * as grpc from "@grpc/grpc-js";
import * as controller_protos from "gen-interfaces/controller";
import * as tool_base from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import * as tool_driver from "gen-interfaces/tools/grpc_interfaces/tool_driver";
import { ToolType } from "gen-interfaces/controller";
import { PromisifiedGrpcClient, promisifyGrpcClient } from "./utils/promisifyGrpcCall";
import { setInterval, clearInterval } from "timers";
import { get } from "@/server/utils/api";
import { Script } from "@/types/api";
import { Variable } from "@/types/api";
import { Labware } from "@/types/api";
import { logAction } from "./logger";
import { JavaScriptExecutor } from "@/server/scripting/javascript/javascript-executor";
import { CSharpExecutor } from "@/server/scripting/csharp/csharp-executor";

type ToolDriverClient = PromisifiedGrpcClient<tool_driver.ToolDriverClient>;

export default class Tool {
  info: controller_protos.ToolConfig;
  static allTools: controller_protos.ToolConfig[] = [Tool.toolBoxConfig()];
  config?: tool_base.Config;
  grpc: ToolDriverClient;
  status: ToolStatus = ToolStatus.UNKNOWN_STATUS;
  uptime?: number;

  private heartbeat: ReturnType<typeof setInterval> | undefined;

  constructor(info: controller_protos.ToolConfig) {
    this.info = info;
    this.config = info.config;
    const grpcServerIp = info.ip === "localhost" ? "host.docker.internal" : info.ip;
    const target = `${grpcServerIp}:${info.port}`;

    this.grpc = promisifyGrpcClient(
      new tool_driver.ToolDriverClient(target, grpc.credentials.createInsecure()),
    );
  }

  startHeartbeat(heartbeatInterval: number) {
    if (this.heartbeat) {
      return;
    }
    this.heartbeat = setInterval(() => this.fetchStatus(), heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
      this.heartbeat = undefined;
    }
  }

  async fetchStatus() {
    try {
      const statusReply = await this.grpc.getStatus({});
      this.status = statusReply.status;
      this.uptime = statusReply.uptime;
      return statusReply;
    } catch (e) {
      console.error(`Failed to fetch status for tool ${this.info.name}: ${e}`);
      this.status = ToolStatus.UNKNOWN_STATUS;
      this.stopHeartbeat();
      return { uptime: 0, status: ToolStatus.UNKNOWN_STATUS } as tool_base.StatusReply;
    }
  }

  get id(): string {
    return this.info.name;
  }

  get type(): controller_protos.ToolType {
    return this.info.type;
  }

  async loadPF400Waypoints() {
    return Tool.loadPF400Waypoints(this.info.name);
  }

  async loadLabwareToPF400() {
    return Tool.loadLabwareToPF400(this.info.name);
  }

  static async executeJavaScript(script: string) {
    return await JavaScriptExecutor.executeScript(script);
  }

  static async executeCSharp(script: string) {
    return await CSharpExecutor.executeScript(script);
  }

  static async loadPF400Waypoints(toolId: string) {
    const normalizedId = Tool.normalizeToolId(toolId);

    const tool = Tool.forId(normalizedId);
    if (tool.type !== ToolType.pf400) {
      return; // Only proceed if the tool is of type PF400
    }
    try {
      const waypointsResponse = await get<any>(`/robot-arm-waypoints?tool_id=${toolId}`);

      await tool.executeCommand({
        toolId: normalizedId,
        toolType: ToolType.pf400,
        command: "load_waypoints",
        params: {
          waypoints: waypointsResponse,
        },
      });

      logAction({
        level: "info",
        action: "PF400 Configuration",
        details: `Successfully loaded waypoints for PF400 tool: ${toolId}`,
      });
    } catch (error) {
      logAction({
        level: "error",
        action: "PF400 Configuration Error",
        details: `Failed to load waypoints for PF400 tool: ${toolId}. Error: ${error}`,
      });
      console.error(`Failed to load waypoints for PF400 tool: ${toolId}`, error);
    }
  }

  static async loadLabwareToPF400(toolId: string) {
    const labwareResponse = await get<Labware>(`/labware`);
    await this.executeCommand({
      toolId: Tool.normalizeToolId(Tool.normalizeToolId(toolId)),
      toolType: ToolType.pf400,
      command: "load_labware",
      params: {
        labwares: { labwares: labwareResponse },
      },
    });
  }

  async configure(config: tool_base.Config) {
    //Log tool configuration
    logAction({
      level: "info",
      action: "Tool Configuration",
      details: `Configuring tool ${this.info.name} of type ${this.info.type} with config: ${JSON.stringify(config).replaceAll("{", "").replaceAll("}", "")}`,
    });
    this.config = config;
    this.config.toolId = this.info.name;
    const reply = await this.grpc.configure(this.config);
    if (reply.response !== tool_base.ResponseCode.SUCCESS) {
      logAction({
        level: "error",
        action: "Tool Configuration Error",
        details: `Failed to configure tool ${this.info.name}. Error: ${reply.error_message}`,
      });
      throw new ToolCommandExecutionError(
        reply.error_message ?? "Connect Command failed",
        reply.response,
      );
    }
    if (config.pf400) {
      await this.loadLabwareToPF400();
      await this.loadPF400Waypoints();
    }
  }

  _payloadForCommand(command: ToolCommandInfo): tool_base.Command {
    return {
      [this.type]: {
        [command.command]: command.params,
      },
    };
  }

  static async executeCommand(command: ToolCommandInfo) {
    logAction({
      level: "info",
      action: "Tool Command Execution",
      details: `Executing command: ${command.command}, Tool: ${command.toolId}, Params:${JSON.stringify(command.params).replaceAll("{", "").replaceAll("}", "")}`,
    });
    return await Tool.forId(this.normalizeToolId(command.toolId)).executeCommand(command);
  }

  async executeCommand(command: ToolCommandInfo) {
    const params = command.params;

    // Substitute params with variables
    for (const key in params) {
      if (params[key] == null) continue;
      const paramValue = String(params[key]);
      if (paramValue.startsWith("{{") && paramValue.endsWith("}}")) {
        try {
          const varValue = await get<Variable>(`/variables/${paramValue.slice(2, -2)}`);
          params[key] = varValue.value;
        } catch (e) {
          logAction({
            level: "error",
            action: "Variable Error",
            details: `Variable ${paramValue.slice(2, -2)} not found`,
          });
          throw new Error(`Variable ${paramValue.slice(2, -2)} not found`);
        }
      }
    }

    // For pf400 run_sequence commands, ensure labware parameter is never empty
    if (command.toolType === ToolType.pf400 && command.command === "run_sequence") {
      // If labware is undefined, null, or empty string, set it to "default"
      if (!params.labware) {
        logAction({
          level: "warning",
          action: "Parameter Validation",
          details: `Adding missing labware parameter to run_sequence command for ${command.toolId}`,
        });
        params.labware = "default";
      }
    }

    //Handle script execution
    if (
      command.command === "run_script" &&
      (command.toolType === ToolType.toolbox ||
        command.toolType === ToolType.plr ||
        command.toolType === ToolType.pyhamilton)
    ) {
      if (!command.params.name || command.params.name.trim() === "") {
        throw new Error("Script name is required for run_script command");
      }

      const scriptName = command.params.name
        .replaceAll(".js", "")
        .replaceAll(".py", "")
        .replaceAll(".cs", "");

      try {
        const script = await get<Script>(`/scripts/${scriptName}`);
        if (command.toolType === ToolType.plr && script.language !== "python") {
          throw new Error("PLR tool only supports Python scripts");
        }
        if (script.language === "javascript") {
          const result = await JavaScriptExecutor.executeScript(script.content);
          if (!result.success) {
            const errorMessage = result.output;
            logAction({
              level: "error",
              action: "JavaScript Execution Error",
              details: `JavaScript execution failed: ${errorMessage}`,
            });

            // Throw a ToolCommandExecutionError to ensure proper error propagation
            throw new ToolCommandExecutionError(
              errorMessage || "JavaScript execution failed",
              tool_base.ResponseCode.ERROR_FROM_TOOL,
            );
          }
          return {
            response: tool_base.ResponseCode.SUCCESS,
            return_reply: true,
            meta_data: { response: result.output } as any,
          } as tool_base.ExecuteCommandReply;
        } else if (script.language === "csharp") {
          // Execute C# script
          const result = await CSharpExecutor.executeScript(script.content);
          if (!result.success) {
            const errorMessage = result.output;
            logAction({
              level: "error",
              action: "C# Execution Error",
              details: `C# execution failed: ${errorMessage}`,
            });

            // Throw a ToolCommandExecutionError to ensure proper error propagation
            throw new ToolCommandExecutionError(
              errorMessage || "C# execution failed",
              tool_base.ResponseCode.ERROR_FROM_TOOL,
            );
          }
          return {
            response: tool_base.ResponseCode.SUCCESS,
            return_reply: true,
            meta_data: { response: result.output } as any,
          } as tool_base.ExecuteCommandReply;
        } else if (script.language === "python") {
          command.params.script_content = script.content;
          command.params.blocking = true;
        } else {
          throw new Error(`Unsupported script language: ${script.language}`);
        }
      } catch (e: any) {
        console.warn("Error at fetching script", e);
        logAction({
          level: "error",
          action: "Script Error",
          details: `Failed to fetch ${scriptName}. ${e}`,
        });
        if (e.status === 404) {
          throw new Error(`Script ${scriptName} not found`);
        }
        throw new Error(`Failed to fetch ${scriptName}. ${e}`);
      }
    }

    const reply = await this.grpc.executeCommand(this._payloadForCommand(command));

    if (reply.response !== tool_base.ResponseCode.SUCCESS) {
      // Generate a more user-friendly error message based on the error code
      let userFriendlyErrorMessage: string;

      // Handle specific error codes
      switch (reply.response) {
        case tool_base.ResponseCode.UNRECOGNIZED_COMMAND:
          userFriendlyErrorMessage = `The command "${command.command}" is not recognized by the tool "${command.toolId}". Please verify that this command is supported by this tool or page view.`;
          break;
        case tool_base.ResponseCode.INVALID_ARGUMENTS:
          userFriendlyErrorMessage = `Invalid arguments provided for command "${command.command}". Check the parameters and try again.`;
          break;
        case tool_base.ResponseCode.NOT_READY:
          userFriendlyErrorMessage = `The tool "${command.toolId}" is currently not ready. Please wait and try again.`;
          break;
        case tool_base.ResponseCode.WRONG_TOOL:
          userFriendlyErrorMessage =
            "The command was sent to the wrong tool type. Please check that you're using the correct tool for this operation.";
          break;
        case tool_base.ResponseCode.ERROR_FROM_TOOL:
          userFriendlyErrorMessage = reply.error_message
            ? `Error from tool "${command.toolId}": ${reply.error_message}`
            : `An error occurred while executing the command "${command.command}" on tool "${command.toolId}".`;
          break;
        default:
          userFriendlyErrorMessage =
            reply.error_message ||
            `Failed to execute command "${command.command}" on tool "${command.toolId}"`;
      }

      logAction({
        level: "error",
        action: "Tool Command Execution Error",
        details: `Failed to execute command: ${command.command}, Tool: ${command.toolId}. Error: ${userFriendlyErrorMessage} (Code: ${reply.response})`,
      });

      throw new ToolCommandExecutionError(userFriendlyErrorMessage, reply.response);
    } else if (reply.return_reply && !reply?.error_message) {
      return reply;
    } else if (reply?.error_message) {
      logAction({
        level: "error",
        action: "Tool Command Execution Error",
        details: `Failed to execute command: ${command.command}, Tool: ${command.toolId}. Error: ${reply.error_message}`,
      });
      throw new ToolCommandExecutionError(
        reply.error_message ?? "Tool command failed",
        reply.response,
      );
    }
  }
  async estimateDuration(command: ToolCommandInfo) {
    const reply = await this.grpc.estimateDuration(this._payloadForCommand(command));
    if (reply.response !== tool_base.ResponseCode.SUCCESS) {
      throw new ToolCommandExecutionError(
        reply.error_message ?? "Estimating duration failed",
        reply.response,
      );
    }
    return reply.estimated_duration_seconds;
  }

  static normalizeToolId(id: string): string {
    return id.toLocaleLowerCase().replaceAll(" ", "_");
  }

  static async removeTool(toolId: string) {
    const normalizedId = Tool.normalizeToolId(toolId);
    const global_key = "__global_tool_store";
    const me = global as any;
    if (!me[global_key]) {
      return;
    }
    const store: Map<string, Tool> = me[global_key];
    const tool = store.get(normalizedId);
    if (!tool) {
      return;
    }
    try {
      tool.stopHeartbeat();
      if (tool.grpc) {
        tool.grpc.close();
      }
      store.delete(normalizedId);
    } catch (error) {
      console.error(`Error while removing tool ${normalizedId}: ${error}`);
    }
  }

  static async clearToolStore() {
    const global_key = "__global_tool_store";
    const me = global as any;

    if (!me[global_key]) {
      return;
    }

    const store: Map<string, Tool> = me[global_key];
    let counter = 0;

    for (const [toolId, tool] of store.entries()) {
      try {
        counter++;
        tool.stopHeartbeat();
        if (tool.grpc) {
          tool.grpc.close();
        }
        store.delete(toolId);
      } catch (error) {
        console.error(`Error while clearing tool ${toolId}: ${error}`);
      }
    }
    // Clear the global tool store reference
    me[global_key] = new Map();
  }

  static reloadWorkcellConfig(tools: controller_protos.ToolConfig[]) {
    this.allTools = tools;
  }

  static async getToolConfigDefinition(toolType: ToolType) {
    if (toolType === ToolType.UNRECOGNIZED || toolType === ToolType.unknown) {
      console.warn(`Received unsupported or unknown ToolType: ${toolType}`);
      return {}; // Return a default or empty config object
    }
    const toolTypeName = ToolType[toolType];
    if (!toolTypeName) {
      throw new Error(`Unsupported ToolType: ${toolType}`);
    }
    const modulePath = `gen-interfaces/tools/grpc_interfaces/${toolType.toLowerCase()}`;
    try {
      // Dynamically import the module
      const toolModule = await import(
        /* webpackInclude: /\.ts$/ */ `gen-interfaces/tools/grpc_interfaces/${toolType}`
      );
      if (!toolModule || !toolModule.Config) {
        throw new Error(`Config type not found in module: ${modulePath}`);
      }
      return toolModule.Config.create({});
    } catch (error) {
      throw new Error(`Failed to load config for ToolType: ${toolTypeName}. Error: ${error}`);
    }
  }

  static async reloadSingleToolConfig(tool: controller_protos.ToolConfig) {
    const normalizedName = Tool.normalizeToolId(tool.name);

    // Remove from tool store
    await this.removeTool(tool.name);

    // Update allTools list
    this.allTools = this.allTools.filter((t) => Tool.normalizeToolId(t.name) !== normalizedName);
    this.allTools.push(tool);

    // Update or recreate the tool in the global store
    const global_key = "__global_tool_store";
    const me = global as any;
    if (me[global_key]) {
      const store: Map<string, Tool> = me[global_key];
      const newTool = new Tool(tool);
      newTool.startHeartbeat(5000);
      store.set(normalizedName, newTool);
    }
  }

  static forId(toolId: string): Tool {
    const id = Tool.normalizeToolId(toolId);
    const global_key = "__global_tool_store";
    if (!id) {
      throw new Error("Tool ID is required");
    }
    const me = global as any;
    if (!me[global_key]) {
      me[global_key] = new Map();
    }
    const store: Map<string, Tool> = me[global_key];
    let tool = store.get(id);

    //If the tool does not exist in the store, create a new tool object
    if (!tool) {
      let toolInfo = {} as controller_protos.ToolConfig;
      if (id == "tool_box") {
        const result = this.toolBoxConfig();
        toolInfo = result;
      } else {
        const result = this.allTools.find(
          (tool) =>
            tool.name.toLocaleLowerCase().replaceAll(" ", "_") ===
            id.toLocaleLowerCase().replaceAll(" ", "_"),
        );
        if (!result) {
          console.warn(`Failed to find tool ${id} in allTools list: `, this.allTools);
          throw new Error(`Tool with id ${id} not found in in database'`);
        }
        toolInfo = result;
      }
      tool = new Tool(toolInfo);
      tool.startHeartbeat(5000);
      store.set(id, tool);
    }
    return tool;
  }

  static toolBoxConfig(): controller_protos.ToolConfig {
    return {
      name: "Tool Box",
      type: "toolbox" as ToolType,
      description: "General Tools",
      image_url: "/tool_icons/toolbox.png",
      ip: "host.docker.internal",
      port: 1010,
      config: {
        toolId: "Tool Box",
        simulated: false,
        toolbox: {},
      },
    };
  }
}

export class ToolCommandExecutionError extends Error {
  constructor(
    message: string,
    public code: tool_base.ResponseCode,
  ) {
    super(message);
    this.name = "ToolCommandExecutionError";

    // Add some helpful properties to make error handling easier
    this.codeString = this.getResponseCodeString(code);
    this.userFriendlyMessage = message;
  }

  // Add a property to get the string representation of the response code
  public codeString: string;

  // Add a property to store user-friendly message
  public userFriendlyMessage: string;

  // Helper method to get string representation of ResponseCode
  private getResponseCodeString(code: tool_base.ResponseCode): string {
    // Convert the numeric code to its string name
    const codeNames =
      Object.entries(tool_base.ResponseCode)
        .filter(([_, value]) => typeof value === "number")
        .find(([_, value]) => value === code)?.[0] || "UNKNOWN";

    return codeNames;
  }
}
