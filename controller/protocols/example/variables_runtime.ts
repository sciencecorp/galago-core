import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import Protocol from "@/protocols/protocol";
import { z } from "zod";
import Tool from "@/server/tools";

const zWellSelection = z.array(
  z.string().regex(/^[A-Z]\d{1,2}$/, "Well name must be a letter followed by a number"),
);

export const Params = z.object({}).strict();

export default class VariablesDemo extends Protocol<typeof Params> {
  protocolId = "variables_runtime";
  category = "production";
  workcell = "Cell Culture Workcell";
  name = "Variables Runtime";
  description = "Passing variables to tool commands";
  paramSchema = Params;

  _generateCommands(params: z.infer<typeof Params>) {
    let protocol_cmds: ToolCommandInfo[] = [
      {
        label: "Test script",
        toolId: "Tool Box",
        command: "run_python_script",
        toolType: ToolType.toolbox,
        params: {
          script_content: "update_variables.py",
          blocking: false,
        },
      },
      {
        label: "Test script with Variable",
        toolId: "Tool Box",
        command: "run_python_script",
        toolType: ToolType.toolbox,
        params: {
          script_content: "test.py",
          blocking: false,
        },
      },
    ] as ToolCommandInfo[];
    return protocol_cmds;
  }
}
