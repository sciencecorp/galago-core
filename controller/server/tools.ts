import { ToolCommandInfo } from "@/types";
import * as grpc from "@grpc/grpc-js";
import * as controller_protos from "gen-interfaces/controller";
import * as tool_base from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import * as tool_driver from "gen-interfaces/tools/grpc_interfaces/tool_driver";
import { ToolType } from "gen-interfaces/controller";
import { PromisifiedGrpcClient, promisifyGrpcClient } from "./utils/promisifyGrpcCall";
import { setInterval, clearInterval } from "timers";
import { trpc } from "@/utils/trpc";
import { get } from "@/server/utils/api";
import { Tool as ToolResponse } from "@/types/api";
import { ToolConfig } from "gen-interfaces/controller";
import {Script} from "@/types/api";

type ToolDriverClient = PromisifiedGrpcClient<tool_driver.ToolDriverClient>;
const toolStore: Map<number, Tool> = new Map();

export default class Tool {
  // Controller config is "what does the controller need to know about the tool?"
  info: controller_protos.ToolConfig;
  static allTools: ToolConfig[] = [Tool.toolBoxConfig()];

  // Tool config is "what configuration is the tool currently using?"
  config?: tool_base.Config;

  grpc: ToolDriverClient;
  status: ToolStatus = ToolStatus.UNKNOWN_STATUS;
  uptime?: number;

  private heartbeat: ReturnType<typeof setInterval> | undefined;

  constructor(info: controller_protos.ToolConfig) {
    this.info = info;
    this.config = info.config;
    const grpcServerIp = "host.docker.internal";
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
    return this.info.name.toLocaleLowerCase().replaceAll(" ","_");
  }

  get type(): controller_protos.ToolType {
    return this.info.type;
  }

  async configure(config: tool_base.Config) {
    this.config = config;
    const reply = await this.grpc.configure(config);
    if (reply.response !== tool_base.ResponseCode.SUCCESS) {
      throw new ToolCommandExecutionError(
        reply.error_message ?? "Connect Command failed",
        reply.response,
      );
    }
  }

  async configureAllTools() {}

  _payloadForCommand(command: ToolCommandInfo): tool_base.Command {
    return {
      [this.type]: {
        [command.command]: command.params,
      },
    };
  }

  static async executeCommand(command: ToolCommandInfo) {
    return await Tool.forId(command.toolId).executeCommand(command);
  }

  async executeCommand(command: ToolCommandInfo) {
    if(command.command === "run_python_script" && command.toolId === "tool_box") {
      command.params.script_content = (await get<Script>(`/scripts/${command.params.script_content}`)).content;
    }
    const reply = await this.grpc.executeCommand(this._payloadForCommand(command));
    if (reply.return_reply) {
      return reply;
    }
    if (reply.response !== tool_base.ResponseCode.SUCCESS) {
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


  static async removeTool(toolId: string) {
    const global_key = "__global_tool_store";
    const me = global as any;
    if (!me[global_key]) {
      return;
    }
    const store: Map<string, Tool> = me[global_key];
    const tool = store.get(toolId);
    if (!tool) {
      return;
    }
    try {
      tool.stopHeartbeat();
      if (tool.grpc) {
        tool.grpc.close();
      }
      store.delete(toolId);
    } catch (error) {
      console.error(`Error while removing tool ${toolId}: ${error}`);
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

  static forId(id: string): Tool {
    const global_key = "__global_tool_store";
    const me = global as any;
    if (!me[global_key]) {
      me[global_key] = new Map();
    }
    const store: Map<string, Tool> = me[global_key];
    let tool = store.get(id);
    if (!tool) {
      let toolInfo = {} as controller_protos.ToolConfig;
      if (id == "tool_box") {
        const result = this.toolBoxConfig();
        toolInfo = result;
      } else {
        const result = this.allTools.find((tool) => tool.name.toLocaleLowerCase().replaceAll(" ","_") === id);
        if (!result) {
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
        simulated: false,
        toolbox: {},
      },
    };
  }

  static toolboxId(): string {
    return "tool_box";
  }
}

export class ToolCommandExecutionError extends Error {
  constructor(
    message: string,
    public code: tool_base.ResponseCode,
  ) {
    super(message);
    this.name = "ToolCommandExecutionError";
  }
}
