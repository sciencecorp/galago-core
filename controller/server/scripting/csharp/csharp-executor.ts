import { logAction } from "@/server/logger";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export class CSharpExecutor {
  /**
   * Executes a C# script by compiling and running it in a safe environment
   * @param script The C# script to execute as a string
   * @param context Optional context object to provide to the script
   * @param timeout Optional timeout in milliseconds (default: 30000ms)
   * @returns Promise that resolves with the result of the script execution
   */
  static async executeScript(
    script: string,
    context: Record<string, any> = {},
    timeout: number = 30000,
  ): Promise<{
    output: string;
    success: boolean;
  }> {
    logAction({
      level: "info",
      action: "C# Execution",
      details: `Executing C# script with ${Object.keys(context).length} context variables`,
    });

    // Create an array to capture all console logs
    const logCapture: string[] = [];
    let hasError = false;

    try {
      // Create a unique ID for this execution to prevent file conflicts
      const executionId = crypto.randomBytes(8).toString("hex");
      const tempDir = path.join("/tmp", "csharp-execution", executionId);

      // Create the temporary directory
      await fs.promises.mkdir(tempDir, { recursive: true });

      // Prepare the C# program template
      const programTemplate = this.generateCSharpProgram(script, context);
      const programPath = path.join(tempDir, "Program.cs");
      const projectPath = path.join(tempDir, "project.csproj");

      // Write the C# program and project file
      await fs.promises.writeFile(programPath, programTemplate);
      await fs.promises.writeFile(projectPath, this.generateProjectFile());

      // Compile the C# program
      logCapture.push("Compiling C# program...");
      const compileCommand = `cd ${tempDir} && dotnet build -c Release -o ./bin`;

      try {
        const { stdout: compileStdout, stderr: compileStderr } = await execPromise(compileCommand, {
          timeout,
        });

        if (compileStderr) {
          logCapture.push(`Compilation warnings: ${compileStderr}`);
        }

        // Run the compiled program
        logCapture.push("Running C# program...");
        const runCommand = `cd ${tempDir} && dotnet ./bin/project.dll`;

        const { stdout: runStdout, stderr: runStderr } = await execPromise(runCommand, { timeout });

        if (runStdout) {
          logCapture.push(runStdout);
        }

        if (runStderr) {
          logCapture.push(`ERROR: ${runStderr}`);
          hasError = true;
        }
      } catch (execError: any) {
        logCapture.push(`ERROR: ${execError.message}`);
        if (execError.stdout) {
          logCapture.push(execError.stdout);
        }
        if (execError.stderr) {
          logCapture.push(`ERROR: ${execError.stderr}`);
        }
        hasError = true;
      }

      // Clean up the temporary directory
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        logAction({
          level: "warning",
          action: "C# Execution Cleanup",
          details: `Failed to clean up temporary directory: ${cleanupError}`,
        });
      }

      // Check if any errors were logged before returning success
      if (hasError || logCapture.some((msg) => msg.startsWith("ERROR:"))) {
        logAction({
          level: "error",
          action: "C# Execution Failed",
          details: `Script execution encountered errors during runtime`,
        });

        return {
          output: logCapture.join("\n"),
          success: false,
        };
      }

      logAction({
        level: "info",
        action: "C# Execution Completed",
        details: `Script executed successfully`,
      });

      // Return the console output
      return {
        output: logCapture.join("\n"),
        success: true,
      };
    } catch (error) {
      // If execution fails, return an error result
      const errorMessage = error instanceof Error ? error.message : String(error);

      logAction({
        level: "error",
        action: "C# Execution Failed",
        details: `Script execution failed: ${errorMessage}`,
      });

      // Add the error to the log capture
      logCapture.push(`ERROR: ${errorMessage}`);

      return {
        output: logCapture.join("\n"),
        success: false,
      };
    }
  }

  /**
   * Generates a C# program with the provided script and context
   * @param script The C# script to execute
   * @param context The context object to expose to the script
   * @returns A complete C# program as a string
   */
  private static generateCSharpProgram(script: string, context: Record<string, any>): string {
    // Create JSON string representation of the context
    const contextJson = JSON.stringify(context);

    return `using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        try
        {
            // Initialize context from JSON
            var contextJson = @"${contextJson.replace(/"/g, '\\"')}";
            var context = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(contextJson);
            
            // Note: Variables can now be accessed using static methods
            // Example: var allVariables = await Variables.GetAllVariablesAsync();
            // Configure API URL: Variables.Configure("https://api.example.com");
            
            // Execute the user's script
            ${script}
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error executing C# script: {ex.Message}");
            Console.Error.WriteLine(ex.StackTrace);
        }
    }
}

/// <summary>
/// Static service class that provides methods for managing variables through API calls
/// </summary>
public static class Variables
{
    private static readonly HttpClient _httpClient = new HttpClient();
    private static string _defaultApiUrl = "http://db:8000";


    /// <summary>
    /// Configure the default API URL for all operations
    /// </summary>
    /// <param name="apiUrl">The base API URL to use</param>
    public static void Configure(string apiUrl)
    {
        _defaultApiUrl = apiUrl ?? throw new ArgumentNullException(nameof(apiUrl));
    }

    /// <summary>
    /// Get the current default API URL
    /// </summary>
    /// <returns>The current default API URL</returns>
    public static string GetDefaultApiUrl() => _defaultApiUrl;


    /// <summary>
    /// Get a variable by name
    /// </summary>
    /// <param name="name">The name of the variable to retrieve</param>
    /// <param name="apiUrl">Optional custom API URL</param>
    /// <returns>The retrieved variable data</returns>
    public static async Task<JsonElement?> GetVariableAsync(string name, string? apiUrl = null)
    {
        var baseUrl = apiUrl ?? _defaultApiUrl;
        
        try
        {
            var response = await _httpClient.GetAsync($"{baseUrl}/variables/{name}");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<JsonElement>(content);
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine($"Resource with name {name} not found in variables.");
                return null;
            }
            else
            {
                throw new HttpRequestException($"Error retrieving variable {name}: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in GetVariableAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get all variables
    /// </summary>
    /// <param name="apiUrl">Optional custom API URL</param>
    /// <returns>All variables data</returns>
    public static async Task<JsonElement> GetAllVariablesAsync(string? apiUrl = null)
    {
        var baseUrl = apiUrl ?? _defaultApiUrl;
        
        try
        {
            var response = await _httpClient.GetAsync($"{baseUrl}/variables");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in GetAllVariablesAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Create a new variable
    /// </summary>
    /// <param name="data">The variable data to create</param>
    /// <param name="apiUrl">Optional custom API URL</param>
    /// <returns>The created variable data</returns>
    public static async Task<JsonElement> CreateVariableAsync(object data, string? apiUrl = null)
    {
        var baseUrl = apiUrl ?? _defaultApiUrl;
        
        try
        {
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{baseUrl}/variables", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.Error.WriteLine($"API Error {response.StatusCode}: {errorContent}");
                Console.Error.WriteLine($"Sent JSON: {json}");
            }
            
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(responseContent);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in CreateVariableAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Update a variable by name
    /// </summary>
    /// <param name="name">The name of the variable to update</param>
    /// <param name="newValue">The new value for the variable</param>
    /// <param name="apiUrl">Optional custom API URL</param>
    /// <returns>The updated variable data</returns>
    public static async Task<JsonElement> UpdateVariableAsync(string name, object newValue, string? apiUrl = null)
    {
        var baseUrl = apiUrl ?? _defaultApiUrl;
        
        try
        {
            var variable = new { value = newValue };
            var json = JsonSerializer.Serialize(variable);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PutAsync($"{baseUrl}/variables/{name}", content);
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(responseContent);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in UpdateVariableAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Delete a variable by name
    /// </summary>
    /// <param name="name">The name of the variable to delete</param>
    /// <param name="apiUrl">Optional custom API URL</param>
    /// <returns>The response from the delete operation</returns>
    public static async Task<JsonElement> DeleteVariableAsync(string name, string? apiUrl = null)
    {
        var baseUrl = apiUrl ?? _defaultApiUrl;
        
        try
        {
            var response = await _httpClient.DeleteAsync($"{baseUrl}/variables/{name}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in DeleteVariableAsync: {ex.Message}");
            throw;
        }
    }
}`;
  }

  /**
   * Generates a .NET project file for the C# program
   * @returns A .NET project file as a string
   */
  private static generateProjectFile(): string {
    return `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net7.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
  </ItemGroup>
</Project>`;
  }
}