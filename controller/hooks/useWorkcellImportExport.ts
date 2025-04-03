import { useRef } from "react";
import { trpc } from "@/utils/trpc";
import { Workcell } from "@/types/api";
import { warningToast, errorToast, successToast } from "@/components/ui/Toast";

/**
 * React hook for workcell import/export functionality
 * Provides an interface to the server-side import/export operations
 */
export const useWorkcellImportExport = (
  workcells: Workcell[],
  selectedWorkcellName: string | undefined,
  refetch: () => Promise<unknown>,
  refetchSelected: () => Promise<unknown>,
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations
  const exportConfigMutation = trpc.workcell.exportConfig.useMutation();
  const importConfigMutation = trpc.workcell.importConfig.useMutation();

  // Export logic
  const handleExportConfig = async () => {
    if (!selectedWorkcellName) {
      warningToast("No Workcell Selected", "Please select a workcell to export its configuration.");
      return;
    }

    // Find the workcell ID from the name
    const selectedWorkcell = workcells.find((wc) => wc.name === selectedWorkcellName);
    if (!selectedWorkcell) {
      errorToast("Error", `Could not find workcell named "${selectedWorkcellName}".`);
      return;
    }

    try {
      // Get the export URL and open it
      const result = await exportConfigMutation.mutateAsync(selectedWorkcell.id);
      window.open(result.url, "_blank");
      successToast("Export Initiated", `Download started for ${selectedWorkcellName}.`);
    } catch (error) {
      console.error("Export failed:", error);
      errorToast("Export Failed", `${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Import logic
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importConfigMutation.mutateAsync({ file });

      // Refresh data
      await refetch();
      await refetchSelected();

      successToast(
        "Import Successful",
        `Workcell ${result?.name || "unknown"} imported successfully.`,
      );
    } catch (error) {
      console.error("Import failed:", error);
      errorToast("Import Failed", `${error instanceof Error ? error.message : String(error)}`);
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
