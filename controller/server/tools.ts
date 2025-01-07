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
import { WaypointConfig } from "gen-interfaces/tools/grpc_interfaces/pf400";

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
        console.log("Tool", this);
        console.log("End of Tool");
        const numericId = this.info.id
        console.log("Numeric ID:", numericId);
        console.log('Fetching waypoints for PF400 configuration...');
        const response = await get<any>(`/robot-arm-waypoints?tool_id=${numericId}`);
        // console.log("Response:", response);
        // First configure basic settings
        if (!config.pf400) {
          throw new Error("PF400 config is missing");
        }

        const pf400Config = {
          host: String(config.pf400.host),
          port: Number(config.pf400.port),
          joints: Number(config.pf400.joints),
          waypoints: [] as WaypointConfig[]
        };

        config = {
          ...config,
          pf400: pf400Config
        };

        // Send basic config first
        const reply = await this.grpc.configure(config);
        if (reply.response !== tool_base.ResponseCode.SUCCESS) {
          throw new ToolCommandExecutionError(
            reply.error_message ?? "Configure Command failed",
            reply.response,
          );
        }

        // Then register each component separately using commands
        if (response.motion_profiles?.length) {
          console.log("Registering motion profiles...");
          for (const profile of response.motion_profiles) {
            await this.executeCommand({
              toolId: this.id,
              toolType: this.type,
              command: "register_motion_profile",
              params: {
                name: profile.name,
                profile_id: profile.profile_id,
                speed: profile.speed,
                speed2: profile.speed2,
                accel: profile.acceleration,
                decel: profile.deceleration,
                accel_ramp: profile.accel_ramp,
                decel_ramp: profile.decel_ramp,
                inrange: profile.inrange,
                straight: profile.straight
              }
            });
          }
        }

        // Register grip parameters
        if (response.grip_params?.length) {
          console.log("Registering grip parameters...");
          for (const param of response.grip_params) {
            await this.executeCommand({
              toolId: this.id,
              toolType: this.type,
              command: "register_grip_param",
              params: {
                name: param.name,
                width: param.width,
                force: param.force,
                speed: param.speed
              }
            });
          }
        }

        // Register locations
        if (response.locations?.length) {
          console.log("Registering locations...");
          for (const loc of response.locations) {
            const location = `${loc.j1} ${loc.j2} ${loc.j3} ${loc.j4} ${loc.j5} ${loc.j6}`;
            await this.executeCommand({
              toolId: this.id,
              toolType: this.type,
              command: "register_location",
              params: {
                name: loc.name,
                location: location,
                location_type: loc.location_type
              }
            });
          }
        }

        // Register nests
        if (response.nests?.length) {
          console.log("Registering nests...");
          for (const nest of response.nests) {
            const location = `${nest.j1} ${nest.j2} ${nest.j3} ${nest.j4} ${nest.j5} ${nest.j6}`;
            await this.executeCommand({
              toolId: this.id,
              toolType: this.type,
              command: "register_nest",
              params: {
                name: nest.name,
                location: location,
                location_type: nest.location_type,
                orientation: nest.orientation,
                safe_location_id: nest.safe_location_id
              }
            });
          }
        }

        // Register labware
        if (response.labware?.length) {
          console.log("Registering labware...");
          for (const item of response.labware) {
            await this.executeCommand({
              toolId: this.id,
              toolType: this.type,
              command: "register_labware",
              params: {
                id: item.id,
                name: item.name,
                description: "",
                number_of_rows: 2,
                number_of_columns: 3,
                z_offset: 0,
                width: 0,
                height: 0,
                plate_lid_offset: 0,
                lid_offset: 0,
                stack_height: 0,
                has_lid: false,
                image_url: "",
                created_at: "2024-12-30T21:58:58.172326",
                updated_at: "2024-12-30T21:58:58.172347",
              }
            });
          }
        }

        return reply;
      } catch (error) {
        console.error('Failed to configure PF400:', error);
        throw error;
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
