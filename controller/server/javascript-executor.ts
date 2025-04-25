import { logAction } from "./logger";
import * as vm from "vm";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios";

/**
 * A wrapper class that provides methods for managing variables through API calls
 */
class VariablesWrapper {
  private axios: AxiosInstance;
  private API_URL: string;

  constructor(axiosInstance: AxiosInstance) {
    this.axios = axiosInstance;
    this.API_URL = "http://db:8000"; // Using the docker container hostname
  }

  /**
   * Get a variable by name
   * @param {string} name - The name of the variable to retrieve
   * @returns {Promise<any>} - The retrieved variable data
   */
  async get_variable(name: string): Promise<any> {
    try {
      const response = await this.axios.get(`${this.API_URL}/variables/${name}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.warn(`Resource with name ${name} not found in variables.`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all variables
   * @returns {Promise<any>} - All variables data
   */
  async get_all_variables(): Promise<any> {
    const response = await this.axios.get(`${this.API_URL}/variables`);
    return response.data;
  }

  /**
   * Create a new variable
   * @param {object} data - The variable data to create
   * @returns {Promise<any>} - The created variable data
   */
  async create_variable(data: Record<string, any>): Promise<any> {
    const response = await this.axios.post(`${this.API_URL}/variables`, data);
    return response.data;
  }

  /**
   * Update a variable by name
   * @param {string} name - The name of the variable to update
   * @param {string|number|boolean} new_value - The new value for the variable
   * @returns {Promise<any>} - The updated variable data
   */
  async update_variable(name: string, new_value: string | number | boolean): Promise<any> {
    const variable = { value: new_value };
    const response = await this.axios.put(`${this.API_URL}/variables/${name}`, variable);
    return response.data;
  }

  /**
   * Delete a variable by name
   * @param {string} name - The name of the variable to delete
   * @returns {Promise<any>} - The response from the delete operation
   */
  async delete_variable(name: string): Promise<any> {
    const response = await this.axios.delete(`${this.API_URL}/variables/${name}`);
    return response.data;
  }
}

export class JavaScriptExecutor {
  /**
   * Executes a JavaScript script in a sandboxed context
   * @param script The JavaScript script to execute as a string
   * @param context Optional context object to provide to the script
   * @param timeout Optional timeout in milliseconds (default: 30000ms)
   * @returns Promise that resolves with the result of the script execution
   */
  static async executeScript(
    script: string,
    context: Record<string, any> = {},
    timeout: number = 30000,
  ): Promise<any> {
    logAction({
      level: "info",
      action: "JavaScript Execution",
      details: `Executing JavaScript script with ${Object.keys(context).length} context variables`,
    });

    // Create an array to capture all console logs
    const logCapture: string[] = [];
    let hasError = false;

    try {
      // Check for import statements and provide appropriate error or transform
      if (script.includes("import ")) {
        // For now, we'll just provide a clear error message
        logCapture.push(
          "ERROR: Import statements are not supported in this JavaScript environment. Please use require() instead.",
        );
        return {
          output: logCapture.join("\n"),
          success: false,
        };
      }

      // Create a list to track pending promises
      const pendingPromises: Promise<any>[] = [];

      // Create a function that will track promises
      const trackPromise = (promise: Promise<any>) => {
        pendingPromises.push(promise);
        return promise;
      };

      // Create a properly typed wrapper for axios
      const wrappedAxios = (function () {
        // Define the main axios function with proper typing
        const axiosFn = function (
          url: string,
          config?: AxiosRequestConfig,
        ): Promise<AxiosResponse> {
          const promise = axios(url, config);
          return trackPromise(promise);
        } as AxiosInstance;

        // Copy all properties from the original axios
        Object.assign(axiosFn, axios);

        // Wrap all methods that return promises with proper typing
        const methodsToWrap = [
          "request",
          "get",
          "delete",
          "head",
          "options",
          "post",
          "put",
          "patch",
        ];

        methodsToWrap.forEach((method) => {
          // Use type assertion to ensure TypeScript understands this is a valid property
          (axiosFn as any)[method] = function (...args: any[]): Promise<AxiosResponse> {
            // Use type assertion here as well for the method access
            const promise = (axios as any)[method].apply(axios, args);
            return trackPromise(promise);
          };
        });

        return axiosFn;
      })();

      // Create Variables Wrapper instance
      const variables = new VariablesWrapper(wrappedAxios);

      // Create a sandbox with the provided context
      const sandbox = {
        axios: wrappedAxios,
        variables: variables, // Add the variables wrapper to the sandbox
        console: {
          log: (...args: any[]) => {
            const logMessage = args
              .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
              .join(" ");
            // Add to our log capture
            logCapture.push(logMessage);
            // Also log to the system logger for tracking
            logAction({
              level: "info",
              action: "Script Log",
              details: logMessage,
            });
          },
          error: (...args: any[]) => {
            const errorMessage = args
              .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
              .join(" ");
            logCapture.push(`ERROR: ${errorMessage}`);
            logAction({
              level: "error",
              action: "Script Error",
              details: errorMessage,
            });
            hasError = true;
          },
          warn: (...args: any[]) => {
            const warnMessage = args
              .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg)))
              .join(" ");
            logCapture.push(`WARNING: ${warnMessage}`);
            logAction({
              level: "warning",
              action: "Script Warning",
              details: warnMessage,
            });
          },
        },
        require: require,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        // Add context variables to the sandbox
        ...context,
      };

      // Create a context for VM execution
      const vmContext = vm.createContext(sandbox);

      // Wrap the script in an async function to allow await
      const wrappedScript = `
        (async function() {
          "use strict";
          try {
            ${script}
          } catch (error) {
            console.error(error.message);
          }
        })();
      `;

      // Execute the script
      await vm.runInContext(wrappedScript, vmContext, {
        timeout,
        displayErrors: true,
      });

      // If there are pending promises, wait for them to resolve
      if (pendingPromises.length > 0) {
        logAction({
          level: "info",
          action: "JavaScript Execution",
          details: `Waiting for ${pendingPromises.length} pending promises to complete...`,
        });

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                `Timed out waiting for ${pendingPromises.length} promises to complete after ${timeout}ms`,
              ),
            );
          }, timeout);
        });

        // Wait for either all promises to complete or timeout
        await Promise.race([Promise.allSettled(pendingPromises), timeoutPromise]);
      }
      // Check if any errors were logged before returning success
      if (hasError || logCapture.some((msg) => msg.startsWith("ERROR:"))) {
        // If errors were detected, return success: false
        logAction({
          level: "error",
          action: "JavaScript Execution Failed",
          details: `Script execution encountered errors during runtime`,
        });

        return {
          output: logCapture.join("\n"),
          success: false,
        };
      }

      logAction({
        level: "info",
        action: "JavaScript Execution Completed",
        details: `Script executed successfully`,
      });

      // Only return the console output
      return {
        output: logCapture.join("\n"),
        success: true,
      };
    } catch (error) {
      // If execution fails, return an error result with any logs that were captured before the error
      const errorMessage = error instanceof Error ? error.message : String(error);

      logAction({
        level: "error",
        action: "JavaScript Execution Failed",
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
}
