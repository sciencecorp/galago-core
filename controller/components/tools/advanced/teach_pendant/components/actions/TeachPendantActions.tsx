import { Button, HStack, useToast, Input, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { DownloadIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { FiUpload } from "react-icons/fi";
import { useRef } from "react";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "../types";
import { fileFormatHandlers, detectFileFormat, downloadFile, TeachPendantData } from "../utils/fileFormatHandlers";

interface TeachPendantActionsProps {
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: GripParams[];
  sequences: Sequence[];
  onImport: (data: TeachPendantData) => Promise<void>;
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

  const handleExport = (format: 'json' | 'xml', dataType?: keyof TeachPendantData) => {
    const handler = fileFormatHandlers[format];
    let exportData: TeachPendantData = {};
    
    // If a specific data type is selected, only export that type
    if (dataType) {
      switch (dataType) {
        case 'teachPoints':
          exportData.teachPoints = teachPoints;
          break;
        case 'motionProfiles':
          exportData.motionProfiles = motionProfiles;
          break;
        case 'gripParams':
          exportData.gripParams = gripParams;
          break;
        case 'sequences':
          exportData.sequences = sequences;
          break;
      }
    } else {
      // Export all data
      exportData = {
        teachPoints,
        motionProfiles,
        gripParams,
        sequences
      };
    }

    const serialized = handler.serialize(exportData);
    const fileName = `teach-pendant-${dataType || 'all'}-${new Date().toISOString()}${handler.fileExtension}`;
    
    downloadFile(serialized, fileName, handler.mimeType);
    
    toast({
      title: "Export Successful",
      description: `Data has been exported as ${format.toUpperCase()}`,
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
      const handler = detectFileFormat(file.name);
      const parsed = handler.parse(text);

      if (!handler.validate(parsed)) {
        throw new Error(`Invalid ${handler.fileExtension.slice(1).toUpperCase()} file format`);
      }

      await onImport(parsed);

      // Create a summary of what was imported
      const summary = Object.entries(parsed)
        .filter(([key, value]) => Array.isArray(value) && value.length > 0)
        .map(([key, value]) => `${(value as any[]).length} ${key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`)
        .join(", ");

      toast({
        title: "Import Successful",
        description: `Imported ${summary}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        status: "error",
        duration: 5000,
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
        accept=".json,.xml"
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
        Import
      </Button>
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" variant="outline" leftIcon={<DownloadIcon />}>
          Export
        </MenuButton>
        <MenuList zIndex={1000} maxH="300px" overflowY="auto">
          <MenuItem onClick={() => handleExport('json')}>Export All (JSON)</MenuItem>
          <MenuItem onClick={() => handleExport('xml')}>Export All (XML)</MenuItem>
          <MenuItem onClick={() => handleExport('json', 'teachPoints')}>Export Teach Points (JSON)</MenuItem>
          <MenuItem onClick={() => handleExport('xml', 'teachPoints')}>Export Teach Points (XML)</MenuItem>
          <MenuItem onClick={() => handleExport('json', 'sequences')}>Export Sequences (JSON)</MenuItem>
          <MenuItem onClick={() => handleExport('json', 'motionProfiles')}>Export Motion Profiles (JSON)</MenuItem>
          <MenuItem onClick={() => handleExport('json', 'gripParams')}>Export Grip Parameters (JSON)</MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};