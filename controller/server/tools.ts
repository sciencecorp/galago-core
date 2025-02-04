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
import { Script } from "@/types/api";
import { Variable } from "@/types/api";
import * as pf400_protos from "gen-interfaces/tools/grpc_interfaces/pf400";
import { Command } from "gen-interfaces/tools/grpc_interfaces/pf400";

type ToolDriverClient = PromisifiedGrpcClient<tool_driver.ToolDriverClient>;
const toolStore: Map<string, Tool> = new Map();

export default class Tool {
  // Controller config is "what does the controller need to know about the tool?"
  info: controller_protos.ToolConfig;
  static allTools: controller_protos.ToolConfig[] = [Tool.toolBoxConfig()];

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
    return this.info.name;
  }

  get type(): controller_protos.ToolType {
    return this.info.type;
  }

  async configure(config: tool_base.Config) {
    this.config = config;

    // Handle PF400 specific configuration
    if (this.type === ToolType.pf400) {
      try {
        // If in simulation mode, just send basic config
        if (config.simulated) {
          const pf400Config = {
            host: String(config.pf400?.host || ""),
            port: Number(config.pf400?.port || 0),
            joints: Number(config.pf400?.joints || 0),
            tool_id: this.info.name,
          };

          return await this.grpc.configure({
            ...config,
            pf400: pf400Config,
          });
        }

        // Not in simulation mode, fetch waypoints and labware
        const toolInfo = await get<any>(`/tools/${this.info.name}`);
        if (!toolInfo || !toolInfo.id) {
          throw new Error(`Could not find tool with name ${this.info.name}`);
        }

        // Fetch waypoints and labware data
        const [waypointsResponse, labwareResponse] = await Promise.all([
          get<any>(`/robot-arm-waypoints?tool_id=${toolInfo.id}`),
          get<any>(`/labware`)
        ]);

        // Configure with the fetched data
        const pf400Config = {
          host: String(config.pf400?.host || ""),
          port: Number(config.pf400?.port || 0),
          joints: Number(config.pf400?.joints || 0),
          tool_id: this.info.name,
          waypoints: waypointsResponse,
          labware: labwareResponse
        };

        return await this.grpc.configure({
          ...config,
          pf400: pf400Config,
        });
      } catch (e: any) {
        console.error("[PF400] Error during configuration:", e);
        throw e;
      }
    }

    // For non-PF400 tools
    return await this.grpc.configure(config);
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

  static isVariable(param: any) {}

  async executeCommand(command: ToolCommandInfo) {
    const params = command.params;
    for (const key in params) {
      if (params[key] == null) continue;

      const paramValue = String(params[key]);

      if (paramValue.startsWith("{{") && paramValue.endsWith("}}")) {
        try {
          const varValue = await get<Variable>(`/variables/${paramValue.slice(2, -2)}`);
          params[key] = varValue.value;
        } catch (e) {
          throw new Error(`Variable ${paramValue.slice(2, -2)} not found`);
        }
      }
    }

    if (command.command === "run_python_script" && command.toolId === "Tool Box") {
      const scriptId = String(command.params.script_content);
      command.params.script_content = (await get<Script>(`/scripts/${scriptId}`)).content;
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
      if (id == "Tool Box") {
        const result = this.toolBoxConfig();
        toolInfo = result;
      } else {
        const result = this.allTools.find((tool) => tool.name === id);
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

  async reloadWaypoints(): Promise<void> {
    if (this.type !== ToolType.pf400) {
      return; // Only PF400 tools have waypoints
    }

    try {
      // Get the tool's numeric ID from the database
      const toolInfo = await get<any>(`/tools/${this.info.name}`);
      if (!toolInfo || !toolInfo.id) {
        throw new Error(`Could not find tool with name ${this.info.name}`);
      }

      // Fetch waypoints from the database
      const waypointsResponse = await get<any>(`/robot-arm-waypoints?tool_id=${toolInfo.id}`);

      // Send waypoints to the tool
      const loadWaypointsCommand = {
        load_waypoints: {
          waypoints: [waypointsResponse],
        },
      };

      const reply = await this.grpc.executeCommand({
        pf400: loadWaypointsCommand,
      });

      if (reply.response !== tool_base.ResponseCode.SUCCESS) {
        throw new Error(reply.error_message ?? "Load waypoints failed");
      }
    } catch (error) {
      console.error("[Tool] Error reloading waypoints:", error);
      throw error;
    }
  }

  async reloadLabware(): Promise<void> {
    if (this.type !== ToolType.pf400) {
      return; // Only PF400 tools have labware
    }

    try {
      // First get the tool's numeric ID from the database
      const toolInfo = await get<any>(`/tools/${this.info.name}`);
      if (!toolInfo || !toolInfo.id) {
        throw new Error(`Could not find tool with name ${this.info.name}`);
      }

      // Fetch labware from the database
      const labwareResponse = await get<any>(`/labware`);

      // Format labware for loading
      const loadLabwareCommand = {
        load_labware: {
          labware: labwareResponse.map((item: any) => ({
            id: 1,  // Required by protobuf but not used by server
            name: item.name || "",
            width: item.width || 0,
            height: item.height || 0,
            zoffset: item.z_offset || 0,
            plate_lid_offset: item.plate_lid_offset || 0,
            lid_offset: item.lid_offset || 0
          }))
        }
      };

      const loadReply = await this.grpc.executeCommand({
        pf400: loadLabwareCommand,
      });

      if (loadReply.response !== tool_base.ResponseCode.SUCCESS) {
        throw new Error(loadReply.error_message ?? "Load labware failed");
      }
    } catch (error) {
      console.error("[Tool] Error reloading labware:", error);
      throw error;
    }
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
