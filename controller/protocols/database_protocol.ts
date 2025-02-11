import { z } from "zod";
import Protocol from "./protocol";
import { ToolCommandInfo } from "@/types";
import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export class DatabaseProtocol extends Protocol {
  name: string;
  category: string;
  workcell: string;
  description?: string;
  icon?: any;
  paramSchema: z.ZodObject<any>;
  private commandsTemplate: any;
  protocolId: string;

  constructor(dbProtocol: any) {
    super();
    this.name = dbProtocol.name;
    this.category = dbProtocol.category;
    this.workcell = dbProtocol.workcell;
    this.description = dbProtocol.description;
    this.icon = dbProtocol.icon;
    this.protocolId = dbProtocol.id.toString();
    
    // Convert the JSON schema back to a Zod schema
    this.paramSchema = this.jsonToZodSchema(dbProtocol.parameters_schema);
    this.commandsTemplate = dbProtocol.commands_template;
  }

  private jsonToZodSchema(jsonSchema: any): z.ZodObject<any> {
    // Convert the stored JSON schema back to a Zod schema
    const schemaShape: Record<string, z.ZodTypeAny> = {};
    
    for (const [key, value] of Object.entries(jsonSchema)) {
      const fieldSchema = value as any;
      let zodField: z.ZodTypeAny;
      
      switch (fieldSchema.type) {
        case "string":
          zodField = z.string();
          if (fieldSchema.regex !== undefined) {
            zodField = (zodField as z.ZodString).regex(new RegExp(fieldSchema.regex));
          }
          break;
        case "number":
          zodField = z.number();
          if (fieldSchema.min !== undefined) {
            zodField = (zodField as z.ZodNumber).min(fieldSchema.min);
          }
          if (fieldSchema.max !== undefined) {
            zodField = (zodField as z.ZodNumber).max(fieldSchema.max);
          }
          break;
        case "boolean":
          zodField = z.boolean();
          break;
        case "array":
          const itemSchema = this.jsonToZodSchema({ item: fieldSchema.items }).shape.item;
          zodField = z.array(itemSchema);
          break;
        case "enum":
          zodField = z.enum(fieldSchema.values as [string, ...string[]]);
          break;
        default:
          throw new Error(`Unsupported schema type: ${fieldSchema.type}`);
      }

      // Make optional if specified
      schemaShape[key] = fieldSchema.optional ? zodField.optional() : zodField;
    }

    return z.object(schemaShape);
  }

  _generateCommands(params: any): ToolCommandInfo[] {
    // Use the commands template to generate commands
    // The template can contain variable substitutions using ${param.name} syntax
    let commands: ToolCommandInfo[] = JSON.parse(JSON.stringify(this.commandsTemplate));
    
    // Replace parameter placeholders in the commands
    commands = this.replaceParameterPlaceholders(commands, params);
    
    return commands;
  }

  private replaceParameterPlaceholders(obj: any, params: any): any {
    if (typeof obj === 'string') {
      return obj.replace(/\${([^}]+)}/g, (_, path) => {
        return path.split('.').reduce((value: any, key: string) => value?.[key], params);
      });
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.replaceParameterPlaceholders(item, params));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.replaceParameterPlaceholders(value, params);
      }
      return result;
    }
    
    return obj;
  }

  static async loadFromDatabase(protocolId: string): Promise<DatabaseProtocol> {
    try {
      const response = await axios.get(`${API_BASE_URL}/protocols/${protocolId}`);
      return new DatabaseProtocol(response.data);
    } catch (error) {
      throw new Error(`Failed to load protocol ${protocolId} from database: ${error}`);
    }
  }
} 