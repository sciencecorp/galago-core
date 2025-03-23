import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import { ProtocolParamInfo } from "@/protocols/params";

/**
 * Hook to manage variable updates when parameters change
 * @param params The protocol parameters
 * @param userDefinedParams The user-defined parameter values
 * @returns Functions to handle parameter and variable updates
 */
export function useVariableUpdates(
  params: Record<string, ProtocolParamInfo>,
  userDefinedParams: Record<string, any>,
) {
  const [variablesToUpdate, setVariablesToUpdate] = useState<
    Array<{ name: string; value: string; type: string }>
  >([]);

  // Get all variables for reference
  const allVariables = trpc.variable.getAll.useQuery();

  // Mutation to update variables
  const updateVariableMutation = trpc.variable.edit.useMutation();
  const createVariableMutation = trpc.variable.add.useMutation();

  // Track parameter changes
  useEffect(() => {
    if (!params) return;

    const updatedVariables: Array<{ name: string; value: string; type: string }> = [];

    // Loop through all parameters
    Object.entries(params).forEach(([paramName, paramInfo]) => {
      // If the parameter has a variable_name and a value is set
      if (paramInfo.variable_name && userDefinedParams[paramName] !== undefined) {
        // Convert the value to string as required by the API
        const value =
          typeof userDefinedParams[paramName] === "boolean"
            ? userDefinedParams[paramName].toString()
            : Array.isArray(userDefinedParams[paramName])
              ? JSON.stringify(userDefinedParams[paramName])
              : String(userDefinedParams[paramName]);

        // Determine the variable type based on parameter type
        let varType: "string" | "number" | "boolean" | "array" | "object" = "string";

        switch (paramInfo.type) {
          case "number":
            varType = "number";
            break;
          case "boolean":
            varType = "boolean";
            break;
          case "enum":
          case "string":
          default:
            varType = "string";
            break;
        }

        // Add to variables queue
        updatedVariables.push({
          name: paramInfo.variable_name,
          value,
          type: varType,
        });
      }
    });

    setVariablesToUpdate(updatedVariables);
  }, [params, userDefinedParams]);

  // Function to commit all variable updates
  const commitVariableUpdates = async () => {
    if (!allVariables.data) return;

    const existingVariables = allVariables.data;
    const promises = [];

    for (const variable of variablesToUpdate) {
      const existingVar = existingVariables.find((v) => v.name === variable.name);

      if (existingVar) {
        // Update existing variable
        promises.push(
          updateVariableMutation.mutateAsync({
            id: existingVar.id,
            name: variable.name,
            value: variable.value,
            type: variable.type as any,
          }),
        );
      } else {
        // Create new variable
        promises.push(
          createVariableMutation.mutateAsync({
            name: variable.name,
            value: variable.value,
            type: variable.type as any,
          }),
        );
      }
    }

    await Promise.all(promises);
    return true;
  };

  return {
    variablesToUpdate,
    commitVariableUpdates,
    isUpdating: updateVariableMutation.isLoading || createVariableMutation.isLoading,
  };
}
