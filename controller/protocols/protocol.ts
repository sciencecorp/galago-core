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
import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export default class Protocol<
  ParamSchema extends
    MaybeWrappedZodType<AnyZodObject> = MaybeWrappedZodType<AnyZodObject>,
> {
  name: string = "";
  protocolId: string = "";
  category: string = "";
  workcell: string = "";
  description?: string;
  icon?: any;
  private commands: any;

  constructor(dbProtocol?: any) {
    if (dbProtocol) {
      this.name = dbProtocol.name;
      this.category = dbProtocol.category;
      this.workcell = dbProtocol.workcell;
      this.description = dbProtocol.description;
      this.icon = dbProtocol.icon;
      this.protocolId = dbProtocol.id;
      this.commands = dbProtocol.commands;
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
      icon: this.icon,
    };
  }

  _generateCommands(): ToolCommandInfo[] | null {
    if (!this.commands) {
      return null;
    }
    return this.commands.map((cmd: any) => ({
      toolId: cmd.toolId,
      toolType: cmd.toolType,
      command: cmd.command,
      params: cmd.params,
      advancedParameters: cmd.advancedParameters,
    }));
  }

  paramInfo(param: z.ZodTypeAny): ProtocolParamInfo {
    return {
      type: zodSchemaToTypeName(param),
      options: zodSchemaToEnumValues(param),
      placeHolder: zodSchemaToDefault(param),
    };
  }

  static async loadFromDatabase(protocolId: string): Promise<Protocol> {
    const response = await axios.get(`${API_BASE_URL}/protocols/${protocolId}`);
    return new Protocol(response.data);
  }
}
