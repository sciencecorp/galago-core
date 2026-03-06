import { ToolCommandInfo } from "@/types";
import { db } from "@/db/client";
import { tools } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ToolType } from "gen-interfaces/controller";

export async function resolveToolTypes(
  commands: ToolCommandInfo[],
  workcellId: number,
): Promise<ToolCommandInfo[]> {
  const workcellTools = await db
    .select({ name: tools.name, type: tools.type })
    .from(tools)
    .where(eq(tools.workcellId, workcellId));

  const toolTypeMap = new Map<string, string>();
  toolTypeMap.set("Tool Box", "toolbox");
  for (const t of workcellTools) {
    toolTypeMap.set(t.name, t.type);
  }

  const errors: string[] = [];
  const resolved = commands.map((cmd) => {
    const toolType = toolTypeMap.get(cmd.toolId);
    if (!toolType) {
      errors.push(`Tool "${cmd.toolId}" not found in workcell`);
      return cmd;
    }
    return {
      ...cmd,
      toolType: toolType as ToolType,
    };
  });

  if (errors.length > 0) {
    throw new Error(`Unknown tools: ${[...new Set(errors)].join(", ")}`);
  }

  return resolved;
}
