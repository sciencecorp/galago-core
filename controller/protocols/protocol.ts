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
  ParamSchema extends MaybeWrappedZodType<AnyZodObject> = MaybeWrappedZodType<AnyZodObject>,
> {
  name: string = "";
  protocolId: string = "";
  paramSchema: ParamSchema = z.object({}) as ParamSchema;
  category: string = "";
  workcell: string = "";
  description?: string;
  icon?: any;
  private commandsTemplate: any;

  constructor(dbProtocol?: any) {
    if (dbProtocol) {
      this.name = dbProtocol.name;
      this.category = dbProtocol.category;
      this.workcell = dbProtocol.workcell;
      this.description = dbProtocol.description;
      this.icon = dbProtocol.icon;
      this.protocolId = dbProtocol.id;
      this.commandsTemplate = dbProtocol.commands_template;
      this.paramSchema = this.jsonToZodSchema(dbProtocol.parameters_schema) as ParamSchema;
    }
  }

  private jsonToZodSchema(jsonSchema: any): z.ZodObject<any> {
    if (!jsonSchema) {
      return z.object({});
    }

    const shape: { [key: string]: z.ZodTypeAny } = {};

    // Handle both JSON Schema format and simple format
    const entries = jsonSchema.properties
      ? Object.entries(jsonSchema.properties)
      : Object.entries(jsonSchema);

    for (const [key, value] of entries) {
      const prop = value as any;
      let zodType: z.ZodTypeAny;

      // If it's the simple format, prop is the type string
      const type = typeof prop === "string" ? prop : prop.type;

      switch (type) {
        case "string":
          if (prop.enum) {
            zodType = z.enum(prop.enum as [string, ...string[]]);
          } else {
            zodType = z.string();
          }
          break;
        case "number":
          zodType = z.number();
          break;
        case "integer":
          zodType = z.number().int();
          break;
        case "boolean":
          zodType = z.boolean();
          break;
        case "array":
          if (prop.items?.type === "string") {
            if (prop.items.enum) {
              zodType = z.array(z.enum(prop.items.enum as [string, ...string[]]));
            } else {
              zodType = z.array(z.string());
            }
          } else if (prop.items?.type === "number") {
            zodType = z.array(z.number());
          } else if (prop.items?.type === "integer") {
            zodType = z.array(z.number().int());
          } else if (prop.items?.type === "boolean") {
            zodType = z.array(z.boolean());
          } else {
            zodType = z.array(z.any());
          }
          break;
        default:
          zodType = z.any();
      }

      // Handle required fields
      if (jsonSchema.required?.includes(key)) {
        shape[key] = zodType;
      } else {
        shape[key] = zodType.optional();
      }
    }

    return z.object(shape);
  }

  _generateCommands(params: z.infer<ParamSchema>): ToolCommandInfo[] {
    if (!this.commandsTemplate) {
      return [];
    }

    const commands = this.replaceParameterPlaceholders(this.commandsTemplate, params);
    return commands;
  }

  private replaceParameterPlaceholders(obj: any, params: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.replaceParameterPlaceholders(item, params));
    } else if (typeof obj === "object" && obj !== null) {
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = this.replaceParameterPlaceholders(value, params);
      }
      return newObj;
    } else if (typeof obj === "string") {
      return obj.replace(/\${([^}]+)}/g, (_, param) => {
        return params[param] !== undefined ? params[param] : `\${${param}}`;
      });
    }
    return obj;
  }

  generate(runRequest: RunRequest): ToolCommandInfo[] | false {
    const parsedParams = this.maybeParseParams(runRequest.params);
    if (!parsedParams) {
      return false;
    }
    return this._generateCommands(parsedParams);
  }

  validationErrors(params: Record<string, any>): ZodError | undefined {
    const result = this.paramSchema.safeParse(params);
    if (!result.success) {
      return result.error;
    }
  }

  maybeParseParams(params: Record<string, any>): z.infer<ParamSchema> | undefined {
    const result = this.paramSchema.safeParse(params);
    if (result.success) {
      return result.data;
    }
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

  paramInfo(param: z.ZodTypeAny): ProtocolParamInfo {
    return {
      type: zodSchemaToTypeName(param),
      description: zodSchemaToDescription(param),
      default: zodSchemaToDefault(param),
      options: zodSchemaToEnumValues(param),
    };
  }

  uiParams(): Record<string, ProtocolParamInfo> {
    const shape = innerZodObjectShape(this.paramSchema);
    const result: Record<string, ProtocolParamInfo> = {};
    for (const [key, value] of Object.entries(shape)) {
      result[key] = this.paramInfo(value);
    }
    return result;
  }

  static async loadFromDatabase(protocolId: string): Promise<Protocol> {
    const response = await axios.get(`${API_BASE_URL}/protocols/${protocolId}`);
    return new Protocol(response.data);
  }
}
