import { useRef } from "react";
import { trpc } from "@/utils/trpc";
import { Workcell, Tool } from "@/types/api";
import { successToast, warningToast, errorToast } from "@/components/ui/Toast";

// Helper function to trigger download
export const downloadJson = (data: unknown, filename: string) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2),
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = filename;
  link.click();
};

export const useWorkcellImportExport = (
  workcells: Workcell[],
  selectedWorkcellName: string | undefined,
  refetch: () => Promise<unknown>,
  refetchSelected: () => Promise<unknown>,
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const getWorkcellMutation = trpc.workcell.get.useMutation();
  const editWorkcellMutation = trpc.workcell.edit.useMutation();
  const addWorkcellMutation = trpc.workcell.add.useMutation();
  const addToolMutation = trpc.tool.add.useMutation();

  // Export logic
  const handleExportConfig = async () => {
    if (!selectedWorkcellName) {
      warningToast("No Workcell Selected", "Please select a workcell to export its configuration.");
      return;
    }

    // Find the workcell ID from the name
    const selectedWorkcell = workcells.find((wc) => wc.name === selectedWorkcellName);

    if (!selectedWorkcell) {
      errorToast(
        "Error Finding Workcell",
        `Could not find details for workcell named "${selectedWorkcellName}".`,
      );
      return;
    }

    const workcellId = selectedWorkcell.id;

    console.log(`Exporting config for: ${selectedWorkcellName} (ID: ${workcellId})...`);
    try {
      // Pass the ID (as a string) to the mutation
      const workcellData = await getWorkcellMutation.mutateAsync(String(workcellId));

      // Check if data was actually returned
      if (!workcellData) {
        throw new Error("No data returned from the server.");
      }

      downloadJson(workcellData, `${selectedWorkcellName}-config.json`);
      successToast("Export Successful", `Configuration for ${selectedWorkcellName} downloaded.`);
    } catch (error) {
      console.error("Export failed:", error);
      // Log the specific error from the mutation if available
      const errorDetails = error instanceof Error ? error.message : String(error);
      const mutationError = getWorkcellMutation.error;
      const detailedMessage = mutationError
        ? `${mutationError.message} (${errorDetails})`
        : errorDetails;

      errorToast("Export Failed", `Could not fetch or export configuration. ${detailedMessage}`);
      // Reset mutation state in case of error
      getWorkcellMutation.reset();
    }
  };

  // Import logic
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    console.log("Attempting to import file:", file.name);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") {
        errorToast("Error Reading File", "Could not read file content.");
        return;
      }

      try {
        const importedConfig = JSON.parse(text);

        // Basic Validation
        if (
          typeof importedConfig !== "object" ||
          importedConfig === null ||
          !("name" in importedConfig) ||
          !("tools" in importedConfig)
        ) {
          throw new Error("Invalid file format: Missing required fields (e.g., name, tools).");
        }

        // CREATING A NEW WORKCELL (when no workcell is selected)
        if (!selectedWorkcellName) {
          const { name, description, location, tools } = importedConfig;

          // Add validation for the workcell name
          if (!name || typeof name !== "string" || name.trim() === "") {
            throw new Error("Invalid workcell name in imported file. Name cannot be empty.");
          }

          // Check if a workcell with this name already exists
          const existingWorkcell = workcells.find((w) => w.name === name);
          if (existingWorkcell) {
            throw new Error(
              `A workcell with name "${name}" already exists. Please select it or use a different name.`,
            );
          }

          // Create a new workcell
          try {
            console.log("Attempting to create workcell with data:", {
              name,
              description: description || "",
              location: location || "",
            });

            // Create the workcell first
            const newWorkcellResponse = await addWorkcellMutation.mutateAsync({
              name,
              description: description || "",
              location: location || "",
            });

            // Verify that we got a valid response with an id
            if (
              !newWorkcellResponse ||
              typeof newWorkcellResponse !== "object" ||
              !newWorkcellResponse.id
            ) {
              throw new Error("Failed to create workcell: Invalid or missing response data");
            }

            const workcellId = newWorkcellResponse.id;

            // Add each tool to the new workcell
            let addedToolCount = 0;
            let failedToolCount = 0;

            if (Array.isArray(tools) && tools.length > 0) {
              for (const tool of tools) {
                try {
                  if (!tool.name || !tool.type) {
                    console.error("Invalid tool data:", tool);
                    failedToolCount++;
                    continue;
                  }

                  // Ensure the tool port is a number
                  const port =
                    typeof tool.port === "number"
                      ? tool.port
                      : typeof tool.port === "string"
                        ? parseInt(tool.port, 10)
                        : 0;

                  // Prepare the tool data for the API
                  const toolData = {
                    name: tool.name,
                    type: tool.type,
                    description: tool.description || "",
                    image_url: tool.image_url || "",
                    ip: tool.ip || "localhost",
                    port: port,
                    workcell_id: workcellId,
                    config: tool.config || {},
                  };

                  await addToolMutation.mutateAsync(toolData);
                  addedToolCount++;
                } catch (toolError) {
                  console.error(`Failed to add tool ${tool.name}:`, toolError);
                  failedToolCount++;
                  warningToast(
                    "Warning",
                    `Failed to add tool "${tool.name}": ${toolError instanceof Error ? toolError.message : String(toolError)}`,
                  );
                }
              }
            }

            successToast(
              "Import Successful",
              `Created new workcell "${name}" with ${addedToolCount} tools${failedToolCount > 0 ? ` (${failedToolCount} failed)` : ""}`,
            );

            // Refresh the workcell list
            refetch();
          } catch (createError) {
            console.error("Failed to create workcell:", createError);
            // Get more detailed error message if possible
            let errorMessage = "Could not create workcell";
            if (createError instanceof Error) {
              errorMessage += `: ${createError.message}`;
              // Log additional details for debugging
              console.error("Full error details:", JSON.stringify(createError));
            } else {
              errorMessage += `: ${String(createError)}`;
            }
            errorToast("Import Failed", errorMessage);
            // Don't throw here to prevent double error toasts
            return;
          }
        }
        // UPDATING EXISTING WORKCELL
        else {
          // Check if the imported name matches the selected workcell name
          if (importedConfig.name !== selectedWorkcellName) {
            throw new Error(
              `Imported name ('${importedConfig.name}') does not match selected workcell ('${selectedWorkcellName}'). Select the matching workcell or import as new.`,
            );
          }

          // Find the selected workcell from the list to get its ID
          const selectedWorkcell = workcells.find((wc) => wc.name === selectedWorkcellName);
          if (!selectedWorkcell) {
            throw new Error(
              `Could not find the selected workcell '${selectedWorkcellName}' to update.`,
            );
          }
          const workcellId = selectedWorkcell.id;
          const createdAt = selectedWorkcell.created_at;

          // Prepare data for the edit mutation
          const dataToUpdate: Workcell = {
            ...importedConfig,
            id: workcellId,
            name: selectedWorkcellName,
            created_at: createdAt,
          };

          // Call the edit mutation
          await editWorkcellMutation.mutateAsync(dataToUpdate);

          successToast(
            "Import Successful",
            `Configuration successfully imported into '${selectedWorkcellName}'.`,
          );

          refetch();
          refetchSelected();
        }
      } catch (error) {
        console.error("Import failed:", error);
        errorToast(
          "Import Failed",
          error instanceof Error ? error.message : "Could not parse or apply configuration.",
        );
      }
    };

    reader.onerror = (e) => {
      console.error("File reading error:", e);
      errorToast("Error Reading File", "An error occurred while reading the file.");
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = "";
  };

  return {
    fileInputRef,
    handleExportConfig,
    handleImportClick,
    handleFileChange,
    isImporting:
      addWorkcellMutation.isLoading || editWorkcellMutation.isLoading || addToolMutation.isLoading,
    isExporting: getWorkcellMutation.isLoading,
  };
};
