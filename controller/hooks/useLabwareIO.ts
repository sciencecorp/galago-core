import { useRef } from "react";
import { trpc } from "@/utils/trpc";
import { Labware } from "@/types/api";

/**
 * React hook for labware import/export functionality
 * Provides an interface to the server-side import/export operations
 */
export const useLabwareIO = (labware: Labware[], refetch: () => Promise<unknown>) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations
  const exportConfigMutation = trpc.labware.exportConfig.useMutation();
  const importConfigMutation = trpc.labware.importConfig.useMutation();

  // Export logic
  const handleExportConfig = async (labwareId: number) => {
    if (!labwareId) {
      return { success: false, message: "Please select a labware to export its configuration." };
    }

    // Find the labware by ID
    const selectedLabware = labware.find((lw) => lw.id === labwareId);
    if (!selectedLabware) {
      return {
        success: false,
        message: `Could not find labware with ID "${labwareId}".`,
      };
    }

    try {
      // The exportConfig mutation returns the labware data directly
      const labwareData = await exportConfigMutation.mutateAsync(labwareId);

      // Create a Blob from the labware data and trigger download
      const blob = new Blob([JSON.stringify(labwareData, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `${selectedLabware.name.replace(/ /g, "_")}-config.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up the URL object after download
      window.URL.revokeObjectURL(url);

      return { success: true, message: `Configuration for ${selectedLabware.name} downloaded.` };
    } catch (error) {
      console.error("Export failed:", error);
      return {
        success: false,
        message: `${error instanceof Error ? error.message : String(error)}`,
      };
    }
  };

  // Import logic
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return { success: false, message: "No file selected." };

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);

      // Make a direct fetch call to the FastAPI endpoint instead of using tRPC
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/labware/import`,
        {
          method: "POST",
          body: formData,
          // Don't set Content-Type header, the browser will set it with the boundary
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Import failed: ${errorData.detail || response.statusText}`);
      }

      const result = await response.json();

      // Refresh data
      await refetch();

      return {
        success: true,
        message: `Labware ${result?.name || "unknown"} imported successfully.`,
      };
    } catch (error) {
      console.error("Import failed:", error);
      return {
        success: false,
        message: `${error instanceof Error ? error.message : String(error)}`,
      };
    } finally {
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return {
    fileInputRef,
    handleExportConfig,
    handleImportClick,
    handleFileChange,
    isImporting: importConfigMutation.isLoading,
    isExporting: exportConfigMutation.isLoading,
  };
};
