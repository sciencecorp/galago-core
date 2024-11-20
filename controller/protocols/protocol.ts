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
import { ToolConfig } from "gen-interfaces/controller";

export default abstract class Protocol<
  ParamSchema extends MaybeWrappedZodType<AnyZodObject> = MaybeWrappedZodType<AnyZodObject>,
> {
  abstract name: string;
  abstract protocolId: string;
  abstract paramSchema: ParamSchema;
  abstract _generateCommands(params: z.infer<ParamSchema>): ToolCommandInfo[];
  abstract category: string; //  "development" | "qc" | "production";
  abstract workcell: string; // "biolab" | "cell_foundry";
  description?: string;
  icon?: any;

  generate(runRequest: RunRequest): ToolCommandInfo[] | false {
    const params = this.maybeParseParams(runRequest.params);
    if (!params) return false;
    return this._generateCommands(params);
  }

  validationErrors(params: Record<string, any>): ZodError | undefined {
    const parsed = this.paramSchema.safeParse(params);
    if (parsed.success) return;
    return parsed.error;
  }

  maybeParseParams(params: Record<string, any>): z.infer<ParamSchema> | undefined {
    console.log("Raw params are: ", params);
    const parsed = this.paramSchema.safeParse(params);
    console.log("Parsed params are: ", parsed);
    if (parsed.success) return parsed.data;
  }

  preview() {
    const keys = Object.keys(innerZodObjectShape(this.paramSchema));
    const previewParams = Object.fromEntries(keys.map((key) => [key, `param:${key}`]));
    return this._generateCommands(previewParams as any);
  }

  paramInfo(param: z.ZodTypeAny): ProtocolParamInfo {
    return {
      type: zodSchemaToTypeName(param),
      description: zodSchemaToDescription(param),
      options: zodSchemaToEnumValues(param),
      default: zodSchemaToDefault(param),
    };
  }

  uiParams(): Record<string, ProtocolParamInfo> {
    return Object.fromEntries(
      Object.entries(innerZodObjectShape(this.paramSchema)).map(([key, value]) => {
        return [key, this.paramInfo(value)];
      }),
    );
  }
}
