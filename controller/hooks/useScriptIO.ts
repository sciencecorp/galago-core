import { useRef } from "react";
import { trpc } from "@/utils/trpc";
import { Script } from "@/types/api"; // Assuming Script type exists or will be created

/**
 * React hook for script import/export functionality
 * Provides an interface to the server-side import/export operations
 */
export const useScriptIO = (
  scripts: Script[], // Assuming you'll pass the list of scripts
  selectedScriptId: number | undefined, // Assuming scripts are identified by ID
  refetchScripts: () => Promise<unknown>, // Specific refetch for scripts
  refetchFolders: () => Promise<unknown>, // Specific refetch for folders
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations (assuming these will be created in the script router)
  const exportConfigMutation = trpc.script.exportConfig.useMutation();
  const importConfigMutation = trpc.script.importConfig.useMutation(); // Placeholder

  // Export logic
  const handleExportConfig = async () => {
    if (!selectedScriptId) {
      return { success: false, message: "Please select a script to export." };
    }

    const selectedScript = scripts.find((s) => s.id === selectedScriptId);
    if (!selectedScript) {
      return {
        success: false,
        message: `Could not find script with ID "${selectedScriptId}".`,
      };
    }
    // Correct filename handling: remove existing extension before adding the correct one
    const baseName = selectedScript.name.replace(/\.py$/i, ""); // Remove only .py
    const scriptNameForDisplay = selectedScript.name; // Keep original name for messages

    try {
      const scriptData = await exportConfigMutation.mutateAsync(selectedScriptId);

      // Always use .py extension
      const fileExtension = "py";
      const blob = new Blob([scriptData.content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      // Use the corrected baseName + extension for the download filename
      downloadLink.download = `${baseName}.${fileExtension}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      window.URL.revokeObjectURL(url);

      // Use original name in success message
      return { success: true, message: `Script ${scriptNameForDisplay} downloaded.` };
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
      // Optionally add parent_id if needed for import context
      // formData.append("parent_id", String(currentFolderId || ''));

      // Make a direct fetch call to the FastAPI endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/scripts/import`,
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

      // Refresh data using individual refetch functions
      await refetchScripts();
      await refetchFolders(); // Assuming import might create scripts in new folders or affect folder structure

      return {
        success: true,
        message: `Script ${result?.name || "unknown"} imported successfully.`,
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
    isImporting: importConfigMutation.isLoading, // Use the correct mutation status
    isExporting: exportConfigMutation.isLoading,
  };
};
