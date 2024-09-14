import { ToolCommandInfo } from "@/types";
import * as grpc from "@grpc/grpc-js";
import * as controller_protos from "gen-interfaces/controller";
import * as tool_base from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import * as tool_driver from "gen-interfaces/tools/grpc_interfaces/tool_driver";
import { ToolType } from "gen-interfaces/controller";
import ControllerConfig from "./utils/ControllerConfig";
import { PromisifiedGrpcClient, promisifyGrpcClient } from "./utils/promisifyGrpcCall";
import { setInterval,clearInterval } from 'timers';
import { trpc } from "@/utils/trpc";

type ToolDriverClient = PromisifiedGrpcClient<tool_driver.ToolDriverClient>;

export default class Tool {
  // Controller config is "what does the controller need to know about the tool?"
  info: controller_protos.ToolConfig;

  // Tool config is "what configuration is the tool currently using?"
  config?: tool_base.Config;

  grpc: ToolDriverClient;
  heartbeat?: NodeJS.Timer;
  status: ToolStatus = ToolStatus.UNKNOWN_STATUS;
  uptime?: number;

  constructor(info: controller_protos.ToolConfig) {
    this.info = info;
    this.config = info.config;

    var target = `${info.ip}:${info.port}`;
    this.grpc = promisifyGrpcClient(
      new tool_driver.ToolDriverClient(target, grpc.credentials.createInsecure())
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
      let failedReply = {uptime:0, status:ToolStatus.UNKNOWN_STATUS} as tool_base.StatusReply
      return failedReply;
    }
  }

  get id(): string {
    return this.info.id;
  }

  get type(): controller_protos.ToolType {
    return this.info.type;
  }

  async configure(config: tool_base.Config) {
    this.config = config;
    const reply = await this.grpc.configure(config);
    if(reply.response !== tool_base.ResponseCode.SUCCESS){
      throw new ToolCommandExecutionError(
        reply.error_message ?? "Connect Command failed",
        reply.response
      );
    }
  }

  async configureAllTools(){
    for(const tool in ControllerConfig.tools){
      const toolConfig = tool
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
        reply.response
      );
    }
  }

  async estimateDuration(command: ToolCommandInfo) {
    const reply = await this.grpc.estimateDuration(this._payloadForCommand(command));
    if (reply.response !== tool_base.ResponseCode.SUCCESS) {
      throw new ToolCommandExecutionError(
        reply.error_message ?? "Estimating duration failed",
        reply.response
      );
    }
    return reply.estimated_duration_seconds;
  }

  // Static lookup
  static forId(id: string): Tool {
    //console.log("Tool id is " + id);
    const global_key = "__global_tool_store";
    const me = global as any;
    if (!me[global_key]) {
      me[global_key] = new Map();
    }
    const store: Map<string, Tool> = me[global_key];
    let tool = store.get(id);
    if (!tool) {
      let toolInfo = {} as controller_protos.ToolConfig ;
      if(id == "toolbox"){
        const result = this.toolBoxConfig()
        toolInfo = result;
      }
      else{
        const result = ControllerConfig.tools.find((tool) => tool.id === id);
        if (!result) {
          throw new Error(
            `Tool with id ${id} not found in local config file. Found ${ControllerConfig.tools
              .map((tool) => tool.id)
              .join(", ")}`
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

  static availableIDs(): string[] {
    let toolIds : string[] = []
    if(ControllerConfig.tools){
      toolIds = ControllerConfig.tools.map((tool) => tool.id);
    }
    toolIds.push(this.toolboxId())
    return toolIds;
  }

  static workcellName(): string {
    return ControllerConfig.name;
  }

  static helixToolId(): string {
    const helix_tool = ControllerConfig.tools.find((tool) => tool.type === ToolType.helix_tool);
    if (!helix_tool) {
      throw new Error("No helix tool found in config");
    }
    return helix_tool.id;
  }
  
  static toolBoxConfig(): controller_protos.ToolConfig {
    return {
      name:"Tool Box",
      id:"toolbox",
      type:"toolbox" as ToolType, 
      description:"General Tools",
      image_url:"/tool_icons/toolbox.png",
      ip:"localhost",
      port:1010,
      config:{
        "simulated":false, 
        "toolbox": {
          "tool_id":"toolbox"
        }
      }
    }
  }

  static toolboxId(): string {
    return "toolbox" 
  }

}

export class ToolCommandExecutionError extends Error {
  constructor(message: string, public code: tool_base.ResponseCode) {
    super(message);
    this.name = "ToolCommandExecutionError";
  }
}