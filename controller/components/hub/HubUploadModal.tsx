import React, { useMemo, useRef, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { UploadCloud } from "lucide-react";
import type { HubItemType } from "./hubTypes";

export function HubUploadModal({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (args: {
    file: File;
    type: HubItemType;
    name?: string;
    description?: string;
    tagsCsv?: string;
  }) => Promise<void>;
  isUploading?: boolean;
}): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<HubItemType>("workcells");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagsCsv, setTagsCsv] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const helpText = useMemo(() => {
    switch (type) {
      case "workcells":
        return "Workcell config JSON. Load will import and can auto-select it.";
      case "protocols":
        return "Protocol JSON. Load will import it into the currently selected workcell.";
      case "labware":
        return "Labware JSON. Load will import and reload labware in PF400 tools.";
      case "forms":
        return "Form JSON. Load will import it.";
      case "variables":
        return "Variable JSON or array. Load will upsert variables into the selected workcell.";
      case "scripts":
        return "Script JSON. Load will create scripts in the selected workcell.";
      case "inventory":
        return "Inventory snapshots are viewable; load support is evolving.";
      default:
        return "";
    }
  }, [type]);

  const cardBg = useColorModeValue("gray.50", "gray.800");
  const fileTextColor = useColorModeValue(
    file ? "gray.800" : "gray.500",
    file ? "gray.100" : "gray.500",
  );

  const handlePickFile = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    await onUpload({
      file,
      type,
      name: name.trim() ? name.trim() : undefined,
      description: description.trim() ? description.trim() : undefined,
      tagsCsv: tagsCsv.trim() ? tagsCsv.trim() : undefined,
    });
    setFile(null);
    setName("");
    setDescription("");
    setTagsCsv("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload to Galago Hub</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select value={type} onChange={(e) => setType(e.target.value as HubItemType)}>
                <option value="workcells">Workcells</option>
                <option value="protocols">Protocols</option>
                <option value="variables">Variables</option>
                <option value="scripts">Scripts</option>
                <option value="labware">Labware</option>
                <option value="forms">Forms</option>
                <option value="inventory">Inventory</option>
              </Select>
              <Text mt={2} fontSize="sm" color="gray.500">
                {helpText}
              </Text>
            </FormControl>

            <FormControl>
              <FormLabel>Display name (optional)</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PF400 Demo Workcell"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description (optional)</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this, and when should it be used?"
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <Input
                value={tagsCsv}
                onChange={(e) => setTagsCsv(e.target.value)}
                placeholder="pf400, demo, v1"
              />
            </FormControl>

            <FormControl>
              <FormLabel>JSON file</FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <HStack p={3} borderRadius="md" bg={cardBg} justify="space-between" align="center">
                <Text fontSize="sm" color={fileTextColor}>
                  {file ? file.name : "Choose a .json file to upload"}
                </Text>
                <Button
                  size="sm"
                  leftIcon={<UploadCloud size={16} />}
                  onClick={handlePickFile}
                  variant="outline">
                  Browse
                </Button>
              </HStack>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleUpload}
              isDisabled={!file}
              isLoading={!!isUploading}>
              Upload
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
