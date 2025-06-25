import { Button, HStack, Menu, MenuButton, MenuList, MenuItem, Input } from "@chakra-ui/react";
import { ChevronDownIcon, DownloadIcon } from "@chakra-ui/icons";
import { FiUpload } from "react-icons/fi";
import React, { useRef } from "react";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "../../types";
import { successToast, errorToast } from "@/components/ui/Toast";

interface TeachPendantActionsProps {
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: GripParams[];
  sequences: Sequence[];
  onImport: (data: any) => Promise<void>;
  toolId: number;
  onTeach?: () => void;
  onMove?: (point: TeachPoint, action?: "approach" | "leave") => void;
  onUnwind?: () => void;
  onGripperOpen?: () => void;
  onGripperClose?: () => void;
  jogEnabled?: boolean;
}

export const TeachPendantActions: React.FC<TeachPendantActionsProps> = ({
  teachPoints,
  motionProfiles,
  gripParams,
  sequences,
  onImport,
  toolId,
  onTeach,
  onMove,
  onUnwind,
  onGripperOpen,
  onGripperClose,
  jogEnabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (
    format: "json" | "xml",
    dataType?: "teachPoints" | "motionProfiles" | "gripParams" | "sequences",
  ) => {
    let exportData: any = {};

    // If a specific data type is selected, only export that type
    if (dataType) {
      switch (dataType) {
        case "teachPoints":
          exportData.teach_points = teachPoints;
          break;
        case "motionProfiles":
          exportData.motion_profiles = motionProfiles;
          break;
        case "gripParams":
          exportData.grip_params = gripParams;
          break;
        case "sequences":
          exportData.sequences = sequences;
          break;
      }
    } else {
      // Export all data
      exportData = {
        teach_points: teachPoints.map((point) => ({
          ...point,
          coordinates: Array.isArray(point.coordinates)
            ? point.coordinates.join(" ")
            : point.coordinates,
        })),
        motion_profiles: motionProfiles,
        grip_params: gripParams,
        sequences: sequences,
      };
    }

    const fileName = `teach-pendant-${dataType || "all"}-${new Date().toISOString()}.${format}`;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    successToast("Export Successful", `Data has been exported as ${format.toUpperCase()}`);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("tool_id", String(toolId));

        const response = await fetch("http://localhost:8000/waypoints/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Failed to import ${files[i].name}: ${error.detail || "Unknown error"}`);
        }

        const result = await response.json();

        // Show a summary toast for each file
        if (result.summary) {
          const summaryText = Object.entries(result.summary as Record<string, number>)
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => `${count} ${type.replace(/_/g, " ")}`)
            .join(", ");

          successToast(
            `Imported ${files[i].name}`,
            summaryText ? `Imported ${summaryText}` : "File imported successfully",
          );
        }

        await onImport(result.data);
      }
    } catch (error) {
      errorToast("Import Failed", error instanceof Error ? error.message : "Failed to import data");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTeach = () => {
    onTeach?.();
    successToast("Position Taught", "Current position has been saved");
  };

  return (
    <HStack spacing={4}>
      <Input
        type="file"
        accept=".json,.xml"
        onChange={handleImport}
        ref={fileInputRef}
        multiple
        display="none"
      />
      <Button
        leftIcon={<FiUpload />}
        onClick={() => fileInputRef.current?.click()}
        colorScheme="blue"
        variant="outline">
        Import
      </Button>
      <Button
        leftIcon={<DownloadIcon />}
        colorScheme="blue"
        variant="outline"
        onClick={() => handleExport("json")}>
        Export
      </Button>
    </HStack>
  );
};
