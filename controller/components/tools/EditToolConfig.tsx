import React, { useState, useEffect, useRef } from "react";
import {
  VStack,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  Divider,
  InputGroup,
  InputRightElement,
  Tooltip,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { RiAddFill, RiFolderOpenLine } from "react-icons/ri";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";
import { Tool } from "@/types/api";
import { successToast, errorToast } from "../ui/Toast";

interface EditToolModalProps {
  toolId: string;
  toolInfo: ToolConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const EditToolModal: React.FC<EditToolModalProps> = (props) => {
  const { toolId, isOpen, onClose } = props;
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newConfig, setNewConfig] = useState<Record<string, Record<string, any>>>({});
  const editTool = trpc.tool.edit.useMutation();
  const getTool = trpc.tool.info.useQuery({ toolId: toolId });
  const { description, name, config, type } = getTool.data || {};
  // const { name, description, config, type } = toolInfo;
  const context = trpc.useContext();

  const comPorts = Array.from({ length: 20 }, (_, i) => `COM${i + 1}`);

  // Supported GPL versions for PF400
  const gplVersions = ["v1", "v2"];

  useEffect(() => {
    if (
      isOpen &&
      config &&
      type !== ToolType.unknown &&
      type !== ToolType.UNRECOGNIZED &&
      type != undefined
    ) {
      setNewConfig({ [type]: { ...config[type] } });
    }
  }, [isOpen, config, type]);

  const handleConfigChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: string,
  ) => {
    const { value } = e.target;
    if (!type) return;
    if (type !== ToolType.unknown && type !== ToolType.UNRECOGNIZED) {
      setNewConfig((prev) => ({
        ...prev,
        [type]: {
          ...(prev[type] || {}),
          [key]: value,
        },
      }));
    }
  };

  const handleSave = async () => {
    try {
      let id = toolId;
      const editedTool = {
        name: newName || name,
        description: newDescription || description,
        config: newConfig || config,
      };
      await editTool.mutateAsync({ id: id, config: editedTool });
      successToast("Tool updated successfully", "");
      onClose();
      context.tool.info.invalidate({ toolId });
    } catch (error) {
      errorToast("Error updating tool", `Please try again. ${error}`);
    }
  };

  // Helper function to handle the directory selection
  const handleDirectorySelect = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Get the directory path from the selected file(s)
      const path = files[0].webkitRelativePath.split("/")[0];

      // Create a synthetic event to update the input value
      const syntheticEvent = {
        target: { value: path },
      } as React.ChangeEvent<HTMLInputElement>;

      handleConfigChange(syntheticEvent, key);
    }
  };

  // Helper function to validate IP addresses
  const isValidIP = (ip: string): boolean => {
    // Simple IP address validation regex
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip) || ip === "localhost";
  };

  // Helper function to determine what type of input to render
  const renderInputForKey = (key: string, value: any) => {
    // For COM port fields, render a dropdown
    if (key.toLowerCase().includes("com_port")) {
      return (
        <Select
          value={newConfig[type!]?.[key] || value}
          onChange={(e) => handleConfigChange(e, key)}
          placeholder="Select COM port">
          {comPorts.map((port) => (
            <option key={port} value={port}>
              {port}
            </option>
          ))}
        </Select>
      );
    }

    // For IP address fields
    if (
      key.toLowerCase().includes("ip") ||
      key.toLowerCase().includes("host") ||
      key.toLowerCase().includes("address")
    ) {
      const currentValue = newConfig[type!]?.[key] || value || "";
      const isValid = currentValue === "" || isValidIP(currentValue);

      return (
        <InputGroup>
          <Input
            value={currentValue}
            onChange={(e) => handleConfigChange(e, key)}
            placeholder="Enter IP address (e.g., 192.168.1.1)"
            isInvalid={!isValid}
            borderColor={isValid ? undefined : "red.300"}
          />
          <InputRightElement width="4.5rem">
            <Tooltip label={isValid ? "Valid IP format" : "Invalid IP format"}>
              <Button
                h="1.75rem"
                size="sm"
                colorScheme={isValid ? "teal" : "red"}
                variant="outline"
                onClick={() => {
                  if (!isValid) {
                    errorToast(
                      "Invalid IP Address",
                      "Please enter a valid IP address (e.g., 192.168.1.1) or 'localhost'",
                    );
                  } else {
                    successToast("Valid IP Address", "IP address format is valid");
                  }
                }}>
                {isValid ? "✓" : "✗"}
              </Button>
            </Tooltip>
          </InputRightElement>
        </InputGroup>
      );
    }

    // For directory path fields, render with a browse button
    if (
      key.toLowerCase().includes("dir") ||
      key.toLowerCase().includes("path") ||
      key.toLowerCase().includes("directory")
    ) {
      // Special placeholder for Cytation directories
      const isCytationConfig =
        type === ToolType.cytation && (key === "protocol_dir" || key === "experiment_dir");

      const placeholder = isCytationConfig
        ? `Enter full absolute path (e.g., C:\\cytation_${key.includes("protocol") ? "protocols" : "experiments"})`
        : `Enter full path for ${key.replaceAll("_", " ")}`;

      return (
        <Input
          value={newConfig[type!]?.[key] || value}
          onChange={(e) => handleConfigChange(e, key)}
          placeholder={placeholder}
        />
      );
    }

    // For PF400 GPL version
    if (type === ToolType.pf400 && key.toLowerCase().includes("gpl_version")) {
      return (
        <Select
          value={newConfig[type!]?.[key] || value}
          onChange={(e) => handleConfigChange(e, key)}
          placeholder="Select GPL version">
          {gplVersions.map((version) => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </Select>
      );
    }

    // For numeric fields like ports
    if (key.toLowerCase().includes("port") && !key.toLowerCase().includes("com_port")) {
      const currentValue = newConfig[type!]?.[key] || value || "";
      // Parse as number and validate port range (0-65535)
      const numValue = Number(currentValue);
      const isValid =
        currentValue === "" ||
        (!isNaN(numValue) && Number.isInteger(numValue) && numValue >= 0 && numValue <= 65535);

      return (
        <InputGroup>
          <Input
            value={currentValue}
            onChange={(e) => {
              // Only allow numbers
              if (e.target.value === "" || /^\d+$/.test(e.target.value)) {
                handleConfigChange(e, key);
              }
            }}
            placeholder="Enter port number (0-65535)"
            isInvalid={!isValid}
            type="number"
            min={0}
            max={65535}
          />
          {!isValid && (
            <InputRightElement>
              <Tooltip label="Port must be a number between 0-65535">
                <Button size="sm" colorScheme="red" variant="ghost">
                  !
                </Button>
              </Tooltip>
            </InputRightElement>
          )}
        </InputGroup>
      );
    }

    // For other numeric fields
    if (
      key.toLowerCase().includes("speed") ||
      key.toLowerCase().includes("timeout") ||
      key.toLowerCase().includes("count") ||
      key.toLowerCase().includes("duration") ||
      key.toLowerCase().includes("interval")
    ) {
      const currentValue = newConfig[type!]?.[key] || value || "";
      const numValue = Number(currentValue);
      const isValid = currentValue === "" || (!isNaN(numValue) && Number.isInteger(numValue));

      return (
        <Input
          value={currentValue}
          onChange={(e) => {
            // Only allow numbers
            if (e.target.value === "" || /^-?\d+$/.test(e.target.value)) {
              handleConfigChange(e, key);
            }
          }}
          placeholder={`Enter ${key.replaceAll("_", " ")}`}
          isInvalid={!isValid}
          type="number"
        />
      );
    }

    // Default text input for everything else
    return (
      <Input
        value={newConfig[type!]?.[key] || value}
        onChange={(e) => {
          handleConfigChange(e, key);
        }}
        placeholder={`Enter ${key.replaceAll("_", " ")}`}
      />
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Tool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {config &&
                type != ToolType.unknown &&
                type != ToolType.UNRECOGNIZED &&
                type != undefined &&
                Object.entries(config[type] || {}).map(([key, value]) => (
                  <FormControl key={key}>
                    <FormLabel>{capitalizeFirst(key).replaceAll("_", " ")}</FormLabel>
                    {renderInputForKey(key, value)}
                  </FormControl>
                ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleSave}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
