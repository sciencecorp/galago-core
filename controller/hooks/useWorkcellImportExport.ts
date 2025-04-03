import { useRef, useState } from "react";
import { trpc } from "@/utils/trpc";
import { Workcell } from "@/types/api";
import { warningToast, errorToast, successToast } from "@/components/ui/Toast";

// Helper function to trigger download
const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Function to interact with backend API
async function fetchApi<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = "http://localhost:8000/api";
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export const useWorkcellImportExport = (
  workcells: Workcell[],
  selectedWorkcellName: string | undefined,
  refetch: () => Promise<unknown>,
  refetchSelected: () => Promise<unknown>,
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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
    setIsExporting(true);

    try {
      // Use the new server-side export endpoint
      const response = await fetchApi<Workcell>(`/workcells/${workcellId}/export`);

      if (!response) {
        throw new Error("No data returned from the server.");
      }

      downloadJson(response, `${selectedWorkcellName}-config.json`);
      successToast("Export Successful", `Configuration for ${selectedWorkcellName} downloaded.`);
    } catch (error) {
      console.error("Export failed:", error);
      const errorDetails = error instanceof Error ? error.message : String(error);
      errorToast("Export Failed", `Could not fetch or export configuration. ${errorDetails}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Import logic
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    console.log("Attempting to import file:", file.name);
    setIsImporting(true);

    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") {
        errorToast("Error Reading File", "Could not read file content.");
        setIsImporting(false);
        return;
      }

      try {
        const importedConfig = JSON.parse(text);

        // Basic Validation
        if (
          typeof importedConfig !== "object" ||
          importedConfig === null ||
          !("name" in importedConfig)
        ) {
          throw new Error("Invalid file format: Missing required fields (e.g., name).");
        }

        try {
          // Use the new server-side import endpoint
          const result = await fetchApi<Workcell>("/workcells/import", {
            method: "POST",
            body: JSON.stringify(importedConfig),
            headers: {
              "Content-Type": "application/json",
            },
          });

          // Refresh data
          await refetch();
          if (selectedWorkcellName === importedConfig.name) {
            await refetchSelected();
          }

          successToast(
            "Import Successful",
            `Workcell ${result.name} ${selectedWorkcellName === importedConfig.name ? "updated" : "created"} successfully.`,
          );
        } catch (error) {
          console.error("Import failed in API call:", error);
          const errorDetails = error instanceof Error ? error.message : String(error);
          errorToast("Import Failed", `Server error: ${errorDetails}`);
        }
      } catch (error) {
        console.error("Import failed in parsing:", error);
        const errorDetails = error instanceof Error ? error.message : String(error);
        errorToast("Import Failed", errorDetails);
      } finally {
        setIsImporting(false);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.onerror = () => {
      errorToast("Error Reading File", "Failed to read the uploaded file.");
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  return {
    fileInputRef,
    handleExportConfig,
    handleImportClick,
    handleFileChange,
    isImporting,
    isExporting,
  };
};
