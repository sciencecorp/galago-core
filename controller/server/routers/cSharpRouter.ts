import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { CSharpExecutor } from "@/server/scripting/csharp/csharp-executor";
import { logAction } from "@/server/logger";

// Define Zod schemas for C# execution inputs
export const zCSharpExecuteInput = z.object({
  script: z.string(),
  context: z.record(z.any()).optional().default({}),
  timeout: z.number().optional().default(30000),
});

// Define a type for C# execution result
export type CSharpExecutionResult = {
  output: string;
  success: boolean;
};

export const csharpRouter = router({
  // Execute a C# script
  execute: procedure
    .input(zCSharpExecuteInput)
    .mutation(async ({ input }): Promise<CSharpExecutionResult> => {
      try {
        logAction({
          level: "info",
          action: "C# Execution Request",
          details: `Executing C# script with ${Object.keys(input.context).length} context variables`,
        });

        const result = await CSharpExecutor.executeScript(
          input.script,
          input.context,
          input.timeout
        );

        return result;
      } catch (error) {
        logAction({
          level: "error",
          action: "C# Execution Error",
          details: `Failed to execute C# script: ${error instanceof Error ? error.message : String(error)}`,
        });

        return {
          output: `ERROR: ${error instanceof Error ? error.message : String(error)}`,
          success: false,
        };
      }
    }),

  // Get a template for C# scripts
  getTemplate: procedure.query(() => {
    return {
        template: `// C# Code Example
            // This is a simple C# program that demonstrates basic functionality

            // Example of using variables and output
            Console.WriteLine("Hello from C#!");

            // Basic arithmetic operations
            int a = 10;
            int b = 5;
            Console.WriteLine($"Addition: {a} + {b} = {a + b}");
            Console.WriteLine($"Subtraction: {a} - {b} = {a - b}");
            Console.WriteLine($"Multiplication: {a} * {b} = {a * b}");
            Console.WriteLine($"Division: {a} / {b} = {a / b}");

            // Using async/await for HTTP requests
            await FetchDataAsync();

            // Example of using the Variables API
            // Create a variable
            await variables.CreateVariableAsync(new { name = "csharp_counter", value = 1 });

            // Get a variable
            var counter = await variables.GetVariableAsync("csharp_counter");
            Console.WriteLine($"Current counter value: {counter}");

            // Update a variable
            await variables.UpdateVariableAsync("csharp_counter", 2);
            var updatedCounter = await variables.GetVariableAsync("csharp_counter");
            Console.WriteLine($"Updated counter value: {updatedCounter}");

            // Example of a method that fetches data from a REST API
            async Task FetchDataAsync()
            {
                try
                {
                    var response = await httpClient.GetAsync("https://jsonplaceholder.typicode.com/todos/1");
                    response.EnsureSuccessStatusCode();
                    var content = await response.Content.ReadAsStringAsync();
                    Console.WriteLine("API Response:");
                    Console.WriteLine(content);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error fetching data: {ex.Message}");
                }
            }`,
    };
  }),
});