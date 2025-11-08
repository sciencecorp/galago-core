import { RunRequest, ToolCommandInfo } from "@/types";
import { AnyZodObject, z, ZodError } from "zod";
import { ProtocolParamInfo } from "./params";
import {
  MaybeWrappedZodType,
  innerZodObjectShape,
  zodSchemaToTypeName,
  zodSchemaToDescription,
  zodSchemaToDefault,
  zodSchemaToEnumValues,
} from "./zodHelpers";
import { get } from "@/server/utils/api";
import { Protocol as ProtocolWithProcesses } from "@/types/api";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export default class Protocol<
  ParamSchema extends MaybeWrappedZodType<AnyZodObject> = MaybeWrappedZodType<AnyZodObject>,
> {
  name: string = "";
  protocolId: string = "";
  category: string = "";
  workcell: string = "";
  description?: string;
  private commands: any;
  private data: ProtocolWithProcesses | null = null;

  constructor(dbProtocol?: ProtocolWithProcesses) {
    if (dbProtocol) {
      this.name = dbProtocol.name;
      this.category = dbProtocol.category;
      this.workcell = dbProtocol.workcell_id.toString();
      this.description = dbProtocol.description;
      this.protocolId = dbProtocol.id.toString();
      this.data = dbProtocol;
    }
  }

  validationErrors(params: Record<string, any>) {
    // no loner relevant on params but we should implement command validation
  }

  preview() {
    return {
      name: this.name,
      category: this.category,
      workcell: this.workcell,
      description: this.description,
    };
  }

  _generateCommands(): CommandInfo[] | null {
    try {
      // Check if data exists
      if (!this.data) {
        console.error(`No data available for protocol ${this.protocolId}`);
        return null;
      }

      const commands: CommandInfo[] = [];

      // Check if processes exist
      if (!this.data.processes || this.data.processes.length === 0) {
        console.error(`No processes found for protocol ${this.protocolId}`);
        return null;
      }

      console.log(
        `Processing ${this.data.processes.length} processes for protocol ${this.protocolId}`,
      );

      // Sort processes by position
      const sortedProcesses = [...this.data.processes].sort((a, b) => a.position - b.position);

      for (const process of sortedProcesses) {
        console.log(
          `Processing process ${process.id} (${process.name}) with ${process.commands?.length || 0} commands`,
        );

        // Check if commands exist in this process
        if (!process.commands || process.commands.length === 0) {
          console.warn(`No commands found for process ${process.id} (${process.name})`);
          continue;
        }

        // Sort commands within each process by position
        const sortedCommands = [...process.commands].sort((a, b) => a.position - b.position);

        for (const command of sortedCommands) {
          commands.push({
            name: command.name,
            toolType: command.tool_type,
            toolId: command.tool_id,
            label: command.label,
            command: command.command,
            params: command.params,
            advancedParameters: command.advanced_parameters,
            processId: process.id,
            processName: process.name,
          });
        }
      }

      console.log(`Generated ${commands.length} total commands for protocol ${this.protocolId}`);

      if (commands.length === 0) {
        console.error(`No commands generated for protocol ${this.protocolId}`);
        return null;
      }

      return commands;
    } catch (error) {
      console.error(`Error generating commands for protocol ${this.protocolId}:`, error);
      return null;
    }
  }

  paramInfo(param: z.ZodTypeAny): ProtocolParamInfo {
    return {
      type: zodSchemaToTypeName(param),
      options: zodSchemaToEnumValues(param),
      placeHolder: zodSchemaToDefault(param),
    };
  }

  static async loadFromDatabase(protocolId: string): Promise<Protocol | null> {
    const protocolData = await get<ProtocolWithProcesses>(`/protocols/${protocolId}`);
    console.log("Loaded protocol data:", protocolData);
    if (!protocolData) {
      return null;
    }

    // Protocol data now includes processes with their commands
    return new Protocol(protocolData);
  }
}
