import { Button, HStack, useToast, Input } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { FiUpload } from "react-icons/fi";
import { useRef } from "react";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "./types";
import { downloadJson, validateImportedData, exportTeachPendantData } from "./teachPointUtils";

interface TeachPendantActionsProps {
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: GripParams[];
  sequences: Sequence[];
  onImport: (data: {
    teachPoints: TeachPoint[];
    motionProfiles: MotionProfile[];
    gripParams: GripParams[];
    sequences: Sequence[];
  }) => Promise<void>;
}

export const TeachPendantActions: React.FC<TeachPendantActionsProps> = ({
  teachPoints,
  motionProfiles,
  gripParams,
  sequences,
  onImport
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const exportData = exportTeachPendantData(
      teachPoints,
      motionProfiles,
      gripParams,
      sequences
    );
    
    downloadJson(exportData, `teach-pendant-data-${new Date().toISOString()}.json`);
    
    toast({
      title: "Export Successful",
      description: "All teach pendant data has been exported to JSON",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!validateImportedData(data)) {
        throw new Error("Invalid teach pendant data file format");
      }

      await onImport(data.data);

      toast({
        title: "Import Successful",
        description: `Imported ${data.data.teachPoints.length} teach points, ${data.data.motionProfiles.length} motion profiles, ${data.data.gripParams.length} grip parameters, and ${data.data.sequences.length} sequences`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import teach pendant data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <HStack spacing={4}>
      <Input
        type="file"
        accept=".json"
        onChange={handleImport}
        ref={fileInputRef}
        display="none"
      />
      <Button
        leftIcon={<FiUpload />}
        onClick={() => fileInputRef.current?.click()}
        colorScheme="blue"
        variant="outline"
      >
        Import All
      </Button>
      <Button
        leftIcon={<DownloadIcon />}
        onClick={handleExport}
        colorScheme="blue"
        variant="outline"
      >
        Export All
      </Button>
    </HStack>
  );
};