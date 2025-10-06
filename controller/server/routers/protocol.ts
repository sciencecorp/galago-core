import { Protocol, Tool, Variable, Script, Labware } from "@/types/api";
import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import axios from "axios";
import { logAction } from "@/server/logger";
import { get, post, put } from "../utils/api";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

// Helper function to extract variable references from params
function extractVariableReferences(params: Record<string, any>): string[] {
  const variableNames = new Set<string>();

  for (const value of Object.values(params)) {
    if (typeof value === "string" && value.startsWith("{{") && value.endsWith("}}")) {
      const varName = value.slice(2, -2);
      variableNames.add(varName);
    }
  }

  return Array.from(variableNames);
}

// Helper function to extract script names from commands
function extractScriptReferences(commands: any[]): string[] {
  const scriptNames = new Set<string>();

  for (const cmd of commands) {
    if (cmd.command === "run_script" && cmd.params?.name) {
      const scriptName = cmd.params.name
        .replaceAll(".js", "")
        .replaceAll(".py", "")
        .replaceAll(".cs", "");
      scriptNames.add(scriptName);
    }
  }

  return Array.from(scriptNames);
}

// Helper function to extract unique tool IDs from commands
function extractToolIds(commands: any[]): string[] {
  const toolIds = new Set<string>();

  for (const cmd of commands) {
    if (cmd.toolId) {
      toolIds.add(cmd.toolId);
    }
  }

  return Array.from(toolIds);
}

// Helper function to extract labware names from commands
function extractLabwareReferences(commands: any[]): string[] {
  const labwareNames = new Set<string>();

  for (const cmd of commands) {
    // Check all parameters in the command, not just 'labware'
    if (cmd.params) {
      for (const [key, value] of Object.entries(cmd.params)) {
        // Look for any parameter that contains 'labware' in the key name
        if (key.toLowerCase().includes("labware") && typeof value === "string") {
          // Skip 'default' and empty strings as they're placeholders
          if (value !== "default" && value !== "") {
            labwareNames.add(value);
          }
        }
      }
    }
  }

  return Array.from(labwareNames);
}

const protocolSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  workcell_id: z.number(),
  description: z.string().optional(),
  commands: z.array(z.any()),
});

export const protocolRouter = router({
  all: procedure.input(z.object({})).query(async () => {
    const response = await get<Protocol[]>("/protocols");
    return response;
  }),

  allNames: procedure.input(z.object({ workcellName: z.string() })).query(async ({ input }) => {
    const { workcellName } = input;
    const response = await get<Protocol[]>(`protocols`, {
      params: { workcell_name: workcellName },
    });
    return response;
  }),

  get: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { id } = input;
    const response = await get<Protocol>(`/protocols/${id}`);
    return response;
  }),

  create: procedure.input(protocolSchema).mutation(async ({ input }) => {
    const protocolData = {
      ...input,
      commands: input.commands || [],
    };
    const response = await post<Protocol>(`${API_BASE_URL}/protocols`, protocolData);
    logAction({
      level: "info",
      action: "New Protocol Added",
      details: `Protocol ${input.name} added successfully.`,
    });
    return response;
  }),

  update: procedure
    .input(
      z.object({
        id: z.number(),
        data: protocolSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await axios.put(`${API_BASE_URL}/protocols/${input.id}`, input.data);
      logAction({
        level: "info",
        action: "Protocol Updated",
        details: `Protocol ${input.data.name} updated successfully.`,
      });
      return response.data;
    }),

  delete: procedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await axios.delete(`${API_BASE_URL}/protocols/${input.id}`);
    logAction({
      level: "info",
      action: "Protocol Deleted",
      details: `Protocol ${input.id} deleted successfully.`,
    });
    return { success: true };
  }),

  getById: procedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const response = await axios.get(`${API_BASE_URL}/protocols/${input.id}`);
    return response.data;
  }),

  export: procedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    // Get the protocol
    const protocol = await get<Protocol>(`/protocols/${input.id}`);

    if (!protocol) {
      throw new Error("Protocol not found");
    }

    // Extract tool IDs, variable names, script names, and labware names from commands
    const toolIds = extractToolIds(protocol.commands);
    const scriptNames = extractScriptReferences(protocol.commands);
    const labwareNames = extractLabwareReferences(protocol.commands);

    // Extract variable references from all command params
    const allVariableNames = new Set<string>();
    for (const cmd of protocol.commands) {
      const varRefs = extractVariableReferences(cmd.params || {});
      varRefs.forEach((v) => allVariableNames.add(v));
    }

    // Fetch tools
    const tools: any[] = [];
    for (const toolId of toolIds) {
      // Skip "Tool Box" as it's a built-in tool
      if (toolId === "Tool Box" || toolId === "tool_box") {
        continue;
      }
      try {
        const tool = await get<Tool>(`/tools/${toolId}`);
        tools.push(tool);
      } catch (error) {
        console.error(`Failed to fetch tool ${toolId}:`, error);
      }
    }

    // Fetch variables
    const variables: any[] = [];
    for (const varName of Array.from(allVariableNames)) {
      try {
        const variable = await get<Variable>(`/variables/${varName}`);
        variables.push(variable);
      } catch (error) {
        console.error(`Failed to fetch variable ${varName}:`, error);
      }
    }

    // Fetch scripts (only id and name, not content)
    const scripts: any[] = [];
    for (const scriptName of scriptNames) {
      try {
        const script = await get<Script>(`/scripts/${scriptName}`);
        // Only include id and name as specified
        scripts.push({
          id: script.id,
          name: script.name,
        });
      } catch (error) {
        console.error(`Failed to fetch script ${scriptName}:`, error);
      }
    }

    // Fetch labware
    const labware: any[] = [];
    if (labwareNames.length > 0) {
      try {
        // Fetch all labware and filter by the names we need
        const allLabware = await get<Labware[]>(`/labware`);

        // Filter to only include labware that matches our extracted names
        for (const labwareName of labwareNames) {
          const matchedLabware = allLabware.find(
            (lw) => lw.name.toLowerCase() === labwareName.toLowerCase(),
          );

          if (matchedLabware) {
            labware.push(matchedLabware);
          } else {
            logAction({
              level: "warning",
              action: "Labware Not Found",
              details: `Labware "${labwareName}" referenced in protocol but not found in database`,
            });
          }
        }
      } catch (error: any) {
        logAction({
          level: "error",
          action: "Labware Fetch Failed",
          details: `Could not fetch labware list during protocol export: ${error.message}`,
        });
      }
    }

    const exportData = {
      protocol: {
        name: protocol.name,
        category: protocol.category,
        description: protocol.description,
        commands: protocol.commands,
      },
      tools,
      variables,
      scripts,
      labware,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    logAction({
      level: "info",
      action: "Protocol Exported",
      details: `Protocol ${protocol.name} exported with ${tools.length} tools, ${variables.length} variables, ${scripts.length} scripts, and ${labware.length} labware.`,
    });

    return exportData;
  }),

  import: procedure
    .input(
      z.object({
        data: z.object({
          protocol: z.object({
            name: z.string(),
            category: z.string(),
            description: z.string().optional(),
            commands: z.array(z.any()),
          }),
          tools: z.array(z.any()).optional(),
          variables: z.array(z.any()).optional(),
          scripts: z.array(z.any()).optional(),
          labware: z.array(z.any()).optional(),
        }),
        workcell_id: z.number(),
        createDependencies: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      const { data, workcell_id, createDependencies } = input;

      if (createDependencies) {
        // Create/update tools
        if (data.tools && data.tools.length > 0) {
          for (const tool of data.tools) {
            try {
              // Check if tool exists
              try {
                await get<Tool>(`/tools/${tool.name}`);
                // Tool exists, skip or update
                logAction({
                  level: "info",
                  action: "Tool Import Skipped",
                  details: `Tool ${tool.name} already exists, skipping.`,
                });
              } catch {
                // Tool doesn't exist, create it
                const toolData = {
                  ...tool,
                  workcell_id,
                };
                delete toolData.id; // Remove id for creation
                await post<Tool>(`/tools`, toolData);
                logAction({
                  level: "info",
                  action: "Tool Imported",
                  details: `Tool ${tool.name} created.`,
                });
              }
            } catch (error) {
              console.error(`Failed to import tool ${tool.name}:`, error);
            }
          }
        }

        // Create/update variables
        if (data.variables && data.variables.length > 0) {
          for (const variable of data.variables) {
            try {
              // Check if variable exists
              try {
                await get<Variable>(`/variables/${variable.name}`);
                // Variable exists, skip
                logAction({
                  level: "info",
                  action: "Variable Import Skipped",
                  details: `Variable ${variable.name} already exists, skipping.`,
                });
              } catch {
                // Variable doesn't exist, create it
                const varData = {
                  ...variable,
                  workcell_id,
                };
                delete varData.id; // Remove id for creation
                await post<Variable>(`/variables`, varData);
                logAction({
                  level: "info",
                  action: "Variable Imported",
                  details: `Variable ${variable.name} created.`,
                });
              }
            } catch (error) {
              console.error(`Failed to import variable ${variable.name}:`, error);
            }
          }
        }

        // Create/update labware
        if (data.labware && data.labware.length > 0) {
          for (const labwareItem of data.labware) {
            try {
              // Check if labware exists
              try {
                await get<Labware>(`/labware/${labwareItem.name}`);
                // Labware exists, skip
                logAction({
                  level: "info",
                  action: "Labware Import Skipped",
                  details: `Labware ${labwareItem.name} already exists, skipping.`,
                });
              } catch {
                // Labware doesn't exist, create it
                const labwareData = {
                  ...labwareItem,
                  workcell_id,
                };
                delete labwareData.id; // Remove id for creation
                await post<Labware>(`/labware`, labwareData);
                logAction({
                  level: "info",
                  action: "Labware Imported",
                  details: `Labware ${labwareItem.name} created.`,
                });
              }
            } catch (error) {
              console.error(`Failed to import labware ${labwareItem.name}:`, error);
            }
          }
        }

        // Note: Scripts are only referenced by id and name, not created
        if (data.scripts && data.scripts.length > 0) {
          logAction({
            level: "warning",
            action: "Scripts Not Imported",
            details: `${data.scripts.length} scripts are referenced but not imported. Script IDs: ${data.scripts.map((s) => s.id).join(", ")}`,
          });
        }
      }

      // Create the protocol
      const protocolData = {
        name: data.protocol.name,
        category: data.protocol.category,
        description: data.protocol.description,
        commands: data.protocol.commands,
        workcell_id,
      };

      const createdProtocol = await post<Protocol>(`/protocols`, protocolData);

      if (!createdProtocol) {
        throw new Error("Failed to create protocol");
      }

      logAction({
        level: "info",
        action: "Protocol Imported",
        details: `Protocol ${createdProtocol.name} imported successfully.`,
      });

      return createdProtocol;
    }),
});
