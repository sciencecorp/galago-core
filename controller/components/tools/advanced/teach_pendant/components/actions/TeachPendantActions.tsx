import { Button, HStack, useToast, Input, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { DownloadIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { FiUpload } from "react-icons/fi";
import { useRef } from "react";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "../types";

interface TeachPendantActionsProps {
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: GripParams[];
  sequences: Sequence[];
  onImport: (data: any) => Promise<void>;
  toolId: number;
}

export const TeachPendantActions: React.FC<TeachPendantActionsProps> = ({
  teachPoints,
  motionProfiles,
  gripParams,
  sequences,
  onImport,
  toolId
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = (format: 'json' | 'xml', dataType?: 'teachPoints' | 'motionProfiles' | 'gripParams' | 'sequences') => {
    let exportData: any = {};
    
    // If a specific data type is selected, only export that type
    if (dataType) {
      switch (dataType) {
        case 'teachPoints':
          exportData.teach_points = teachPoints;
          break;
        case 'motionProfiles':
          exportData.motion_profiles = motionProfiles;
          break;
        case 'gripParams':
          exportData.grip_params = gripParams;
          break;
        case 'sequences':
          exportData.sequences = sequences;
          break;
      }
    } else {
      // Export all data
      exportData = {
        teach_points: teachPoints,
        motion_profiles: motionProfiles,
        grip_params: gripParams,
        sequences: sequences
      };
    }

    const fileName = `teach-pendant-${dataType || 'all'}-${new Date().toISOString()}.${format}`;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tool_id', toolId.toString());

      const response = await fetch('http://localhost:8000/waypoints/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to import data');
      }

      const result = await response.json();
      
      // Show a summary toast with the imported items
      if (result.summary) {
        const summaryText = Object.entries(result.summary as Record<string, number>)
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => `${count} ${type.replace(/_/g, ' ')}`)
          .join(', ');

        toast({
          title: "Import Successful",
          description: `Imported ${summaryText}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }

      await onImport(result.data);
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