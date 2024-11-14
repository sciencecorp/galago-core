import { ToolCommandInfo } from "@/types";
import * as grpc from "@grpc/grpc-js";
import * as controller_protos from "gen-interfaces/controller";
import * as tool_base from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import * as tool_driver from "gen-interfaces/tools/grpc_interfaces/tool_driver";
import { ToolType } from "gen-interfaces/controller";
import ControllerConfig from "./utils/ControllerConfig";
import { PromisifiedGrpcClient, promisifyGrpcClient } from "./utils/promisifyGrpcCall";
import { setInterval, clearInterval } from "timers";
import { trpc } from "@/utils/trpc";
import { get } from "@/server/utils/api";
import { Tool as ToolResponse } from "@/types/api";

type ToolDriverClient = PromisifiedGrpcClient<tool_driver.ToolDriverClient>;
const toolStore: Map<number, Tool> = new Map();

export default class Tool {
  // Controller config is "what does the controller need to know about the tool?"
  info: controller_protos.ToolConfig;
  static allTools : controller_protos.ToolConfig[] = [];

  // Tool config is "what configuration is the tool currently using?"
  config?: tool_base.Config;

  grpc: ToolDriverClient;
  status: ToolStatus = ToolStatus.UNKNOWN_STATUS;
  uptime?: number;

  private heartbeat: ReturnType<typeof setInterval> | undefined;

  constructor(info: controller_protos.ToolConfig) {
    this.info = info;
    this.config = info.config;
    const grpcServerIp =  "host.docker.internal";
    console.log("grpcServerIp is" + grpcServerIp);
    const target = `${grpcServerIp}:${info.port}`;
    console.log("target is" + target);
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
      let failedReply = { uptime: 0, status: ToolStatus.UNKNOWN_STATUS } as tool_base.StatusReply;
      return failedReply;
    }
  }

  get id(): number {
    return this.info.id;
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

  async configureAllTools() {
    for (const tool in ControllerConfig.tools) {
      const toolConfig = tool;
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
    return await Tool.forId(command.toolId).executeCommand(command);
  }

  async executeCommand(command: ToolCommandInfo) {
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


  static reloadWorkcellConfig(tools:controller_protos.ToolConfig[]) {
    this.allTools = tools;
  }

  static  async getToolConfigDefinition(toolType:ToolType){
    const toolTypeName = ToolType[toolType];
    if (!toolTypeName) {
      throw new Error(`Unsupported ToolType: ${toolType}`);
    }
    const modulePath = `gen-interfaces/tools/grpc_interfaces/${toolType.toLowerCase()}`;
    try {
      // Dynamically import the module
      const toolModule = await import(/* webpackInclude: /\.ts$/ */ `gen-interfaces/tools/grpc_interfaces/${toolType}`);
      if (!toolModule || !toolModule.Config) {
        throw new Error(`Config type not found in module: ${modulePath}`);
      }
      return toolModule.Config.create({});
    } catch (error) {
      throw new Error(`Failed to load config for ToolType: ${toolTypeName}. Error: ${error}`);
    }
  }
  
  static forId(id: number): Tool {
    const global_key = "__global_tool_store";
    const me = global as any;
    if (!me[global_key]) {
      me[global_key] = new Map();
    }
    const store: Map<number, Tool> = me[global_key];
    let tool = store.get(id);
    if (!tool) {
      let toolInfo = {} as controller_protos.ToolConfig;
      if (id == 1203) {
        const result = this.toolBoxConfig();
        toolInfo = result;
      } else {
        const result = this.allTools.find((tool) => tool.id === id);
        console.log("Tool info is" + result);
        if (!result) {
          throw new Error(
            `Tool with id ${id} not found in in database'`,
          );
        }
        toolInfo = result;
      }
      tool = new Tool(toolInfo);
      tool.startHeartbeat(5000);
      store.set(id, tool);
    }
    return tool;
  }

  static workcellName(): string {
    return ControllerConfig.name;
  }

  static toolBoxConfig(): controller_protos.ToolConfig {
    return {
      name: "Tool Box",
      id: 1203,
      type: "toolbox" as ToolType,
      description: "General Tools",
      image_url: "/tool_icons/toolbox.png",
      ip: "host.docker.internal",
      port: 1010,
      config: {
        simulated: false,
        toolbox: {
          tool_id: "toolbox",
        },
      },
    };
  }

  static toolboxId(): string {
    return "toolbox";
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