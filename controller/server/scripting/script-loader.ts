import axios from "axios";
import { Script } from "@/types/api";
import { logAction } from "@/server/logger";

/**
 * Utility class to gather a script together with its full transitive
 * dependency closure.  Order is topologically sorted such that each
 * dependency appears before the script that requires it.
 */
export class ScriptLoader {
  private static api = axios.create({
    baseURL: process.env.API_BASE_URL || "http://localhost:8000/api",
    timeout: 10000,
  });

  /**
   * Parse import statements from script content and extract dependency names
   * Supports multiple import formats:
   * JavaScript: require("script_name") or require('script_name')
   * Python: import script_name or from script_name import *
   */
  static parseImports(content: string, language: string = "javascript"): string[] {
    const imports: string[] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      if (language === "javascript") {
        // JavaScript patterns - require() statements
        const jsPatterns = [
          /^require\s*\(\s*["']([^"']+)["']\s*\)/, // require("script_name")
          /^require\s*\(\s*["']([^"']+)["']\s*,\s*["'][^"']+["']\s*\)/, // require("script_name", "alias")
        ];

        for (const pattern of jsPatterns) {
          const match = trimmed.match(pattern);
          if (match && match[1]) {
            const scriptName = match[1].trim();
            if (scriptName && !imports.includes(scriptName)) {
              imports.push(scriptName);
            }
            break;
          }
        }
      } else if (language === "python") {
        // Python patterns - import statements
        const pythonPatterns = [
          /^import\s+([a-zA-Z_][a-zA-Z0-9_]*)/, // import script_name
          /^from\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+import/, // from script_name import
        ];

        for (const pattern of pythonPatterns) {
          const match = trimmed.match(pattern);
          if (match && match[1]) {
            const scriptName = match[1].trim();
            if (scriptName && !imports.includes(scriptName)) {
              imports.push(scriptName);
            }
            break;
          }
        }
      }
    }

    return imports;
  }

  /**
   * Auto-generate dependencies array from script content
   */
  static async generateDependencies(
    content: string,
    language: string = "javascript",
  ): Promise<string[]> {
    return this.parseImports(content, language);
  }

  /**
   * Fetch a script by name or ID
   */
  private static async fetchScript(nameOrId: string | number): Promise<Script> {
    try {
      const response = await this.api.get<Script>(`/scripts/${nameOrId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        `Script '${nameOrId}' not found. Please check that the script exists and the import statement is correct.`,
      );
    }
  }

  /**
   * Resolve imports at runtime by providing a requireScript function
   * that can be used within the script execution context
   */
  static createRequireScript(orderedScripts: Script[]): (scriptName: string) => any {
    const scriptMap = new Map<string, Script>();
    const moduleCache = new Map<string, any>();

    // Build map of script names to script objects
    for (const script of orderedScripts) {
      scriptMap.set(script.name, script);
    }

    return (scriptName: string) => {
      if (moduleCache.has(scriptName)) {
        return moduleCache.get(scriptName);
      }

      const script = scriptMap.get(scriptName);
      if (!script) {
        throw new Error(`Script '${scriptName}' not found`);
      }

      // Create a module object with the script's exports
      const module = {
        exports: {},
        name: script.name,
        content: script.content,
      };

      // Create a context for the script execution
      const scriptContext = {
        module,
        exports: module.exports,
        console: {
          log: (...args: any[]) => {
            const message = args
              .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
              .join(" ");
            logAction({
              level: "info",
              action: "Script Log",
              details: `[${scriptName}] ${message}`,
            });
          },
          error: (...args: any[]) => {
            const message = args
              .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
              .join(" ");
            logAction({
              level: "error",
              action: "Script Error",
              details: `[${scriptName}] ${message}`,
            });
          },
          warn: (...args: any[]) => {
            const message = args
              .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
              .join(" ");
            logAction({
              level: "warning",
              action: "Script Warning",
              details: `[${scriptName}] ${message}`,
            });
          },
        },
        // Provide access to other scripts through requireScript
        requireScript: (name: string) => {
          if (name === scriptName) {
            throw new Error(`Circular dependency detected: ${scriptName} requires itself`);
          }
          return moduleCache.get(name) || module.exports;
        },
      };

      try {
        // Execute the script in the context
        const vm = require("vm");
        const context = vm.createContext(scriptContext);
        vm.runInContext(script.content, context);

        // Cache the module exports
        moduleCache.set(scriptName, module.exports);
        return module.exports;
      } catch (error) {
        logAction({
          level: "error",
          action: "Script Execution Error",
          details: `Error executing script '${scriptName}': ${error}`,
        });
        throw error;
      }
    };
  }

  /**
   * Recursively load a script and all of its dependencies.
   * @param nameOrId Either the numeric id or the name of the root script.
   * @returns An object containing the root script and an ordered list of all unique scripts (dependencies first).
   */
  static async load(nameOrId: string | number): Promise<{
    root: Script;
    ordered: Script[];
  }> {
    const visited = new Set<number>();
    const stack = new Set<number>();
    const ordered: Script[] = [];

    async function dfs(idOrName: string | number) {
      // Fetch script – API accepts id or name transparently
      const script = await ScriptLoader.fetchScript(idOrName);

      if (visited.has(script.id)) {
        return; // already processed
      }

      if (stack.has(script.id)) {
        throw new Error(`Circular dependency detected involving script '${script.name}'`);
      }

      stack.add(script.id);

      // Resolve dependencies depth-first
      if (Array.isArray(script.dependencies)) {
        for (const dep of script.dependencies) {
          await dfs(dep);
        }
      }

      stack.delete(script.id);
      visited.add(script.id);
      ordered.push(script);
    }

    await dfs(nameOrId);

    const root = ordered[ordered.length - 1];
    return { root, ordered };
  }

  /**
   * Convenience helper that returns a single concatenated JS source string
   * for execution, with each dependency separated by a newline.
   */
  static async assembleJavaScript(nameOrId: string | number): Promise<string> {
    const { ordered } = await ScriptLoader.load(nameOrId);
    return ordered.map((s) => `// Script: ${s.name}\n${s.content}\n`).join("\n");
  }

  /**
   * Convenience helper that returns a single concatenated Python source string
   * for execution, with each dependency separated by a newline.
   */
  static async assemblePython(nameOrId: string | number): Promise<string> {
    const { ordered } = await ScriptLoader.load(nameOrId);

    // Create a map of script names to their content for import replacement
    const scriptMap = new Map<string, string>();
    for (const script of ordered) {
      scriptMap.set(script.name, script.content);
    }

    // Track which scripts have been included to avoid duplicates
    const includedScripts = new Set<string>();

    // First, include all dependency scripts at the top
    let assembledContent = "";
    for (const script of ordered.slice(0, -1)) {
      // All except the last (main) script
      if (!includedScripts.has(script.name)) {
        includedScripts.add(script.name);
        assembledContent += `# Script: ${script.name}\n${script.content}\n`;
      }
    }

    // Then process the main script (last one) to replace import statements
    const mainScript = ordered[ordered.length - 1];
    let processedContent = mainScript.content;

    // Replace import statements with namespace creation
    const importPatterns = [
      /^import\s+([a-zA-Z_][a-zA-Z0-9_]*)/gm, // import script_name
      /^from\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+import/gm, // from script_name import
    ];

    for (const pattern of importPatterns) {
      processedContent = processedContent.replace(pattern, (match, scriptName) => {
        const importedScript = scriptMap.get(scriptName);
        if (importedScript) {
          // Create namespace for the imported script
          return `# ${match} - creating namespace for imported script
${scriptName} = type('${scriptName}', (), locals())`;
        }
        return match; // Keep original if script not found
      });
    }

    assembledContent += `# Script: ${mainScript.name}\n${processedContent}\n`;

    return assembledContent;
  }

  /**
   * Enhanced assembly that provides import/require functionality
   */
  static async assembleJavaScriptWithImports(nameOrId: string | number): Promise<string> {
    const { ordered } = await ScriptLoader.load(nameOrId);

    // Create requireScript function
    const requireScript = this.createRequireScript(ordered);

    // Build the assembled code with requireScript available
    const requireFunction = `
// Auto-generated requireScript function
const requireScript = ${requireScript.toString()};
`;

    const assembledScripts = ordered.map((s) => `// Script: ${s.name}\n${s.content}\n`).join("\n");

    return requireFunction + assembledScripts;
  }
}
