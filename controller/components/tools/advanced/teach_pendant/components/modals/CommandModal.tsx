import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
} from "@chakra-ui/react";
import { TeachPoint, MotionProfile, GripParams } from "../types";
import { trpc } from "@/utils/trpc";
import { Labware } from "@/types/api";
import { commandFields } from "@/components/tools/constants";

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCommand: (command: { command: string; params: Record<string, any> }) => void;
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: GripParams[];
}

interface CommandField {
  name: string;
  type: string;
  defaultValue?: any;
}

export const CommandModal: React.FC<CommandModalProps> = ({
  isOpen,
  onClose,
  onAddCommand,
  teachPoints,
  motionProfiles,
  gripParams,
}) => {
  const [selectedCommand, setSelectedCommand] = useState("");
  const [params, setParams] = useState<Record<string, any>>({});
  const { data: labwareList } = trpc.labware.getAll.useQuery(undefined, {
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: isOpen,
  });

  // Get the available commands for PF400 from the commandFields
  const availableCommands = commandFields.pf400;

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedCommand("");
      setParams({});
    }
  }, [isOpen]);

  const handleCommandSelect = (command: string) => {
    setSelectedCommand(command);
    const commandFields = availableCommands[command] || [];
    const defaultParams = commandFields.reduce(
      (acc, field) => {
        acc[field.name] = field.defaultValue ?? "";
        return acc;
      },
      {} as Record<string, any>,
    );
    setParams(defaultParams);
  };

  const handleSubmit = () => {
    const processedParams = { ...params };

    // Convert selected objects to their required format
    if (processedParams.motion_profile_id) {
      const profile = motionProfiles.find(
        (p) => p.id === Number(processedParams.motion_profile_id),
      );
      if (profile) {
        processedParams.motion_profile_id = profile.profile_id;
      }
    }

    if (processedParams.grip_params) {
      const grip = gripParams.find((g) => g.id === Number(processedParams.grip_params));
      if (grip) {
        processedParams.width = grip.width;
        processedParams.speed = grip.speed;
        processedParams.force = grip.force;
        delete processedParams.grip_params;
      }
    }

    if (processedParams.waypoint || processedParams.location || processedParams.nest) {
      const point = teachPoints.find(
        (p) =>
          p.id ===
          Number(processedParams.waypoint || processedParams.location || processedParams.nest),
      );
      if (point) {
        if (processedParams.waypoint) {
          processedParams.waypoint = point.name;
        }
        if (processedParams.location) processedParams.location = point.name;
        if (processedParams.nest) {
          processedParams.nest_id = point.id;
          delete processedParams.nest;
        }
      }
    }

    if (processedParams.labware) {
      const labware = labwareList?.find((l) => l.id === Number(processedParams.labware));
      if (labware) {
        processedParams.labware = labware.id;
      }
    }

    onAddCommand({
      command: selectedCommand,
      params: processedParams,
    });
    onClose();
  };

  const renderField = (field: { name: string; type: string; defaultValue?: any }) => {
    // Special handling for field names regardless of type
    if (field.name === "labware" && field.type === "text") {
      return (
        <Select
          value={params[field.name]}
          onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
          placeholder="Select labware">
          {(labwareList || []).map((labware) => (
            <option key={labware.id} value={labware.id}>
              {labware.name}
            </option>
          ))}
        </Select>
      );
    } else if (field.name === "location" && field.type === "text") {
      // For location fields, show a dropdown of teach points
      return (
        <Select
          value={params[field.name]}
          onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
          placeholder="Select location">
          {(teachPoints || [])
            .filter((p) => p.type === "location")
            .map((point) => (
              <option key={point.id} value={point.id}>
                {point.name}
              </option>
            ))}
        </Select>
      );
    } else if (field.name === "name" && selectedCommand === "move" && field.type === "text") {
      // For move command's name field, show a dropdown of waypoints
      return (
        <Select
          value={params[field.name]}
          onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
          placeholder="Select waypoint">
          {(teachPoints || [])
            .filter((p) => p.type === "location")
            .map((point) => (
              <option key={point.id} value={point.name}>
                {point.name}
              </option>
            ))}
        </Select>
      );
    }

    // Handle by type
    switch (field.type) {
      case "nest":
        return (
          <Select
            value={params[field.name]}
            onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
            placeholder="Select location">
            {(teachPoints || [])
              .filter((p) => p.type === "location")
              .map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name}
                </option>
              ))}
          </Select>
        );

      case "motion_profile":
        return (
          <Select
            value={params[field.name]}
            onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
            placeholder="Select motion profile">
            {(motionProfiles || []).map((profile) => (
              <option key={profile.id} value={profile.profile_id}>
                {profile.name} (Profile {profile.profile_id})
              </option>
            ))}
          </Select>
        );

      case "grip_params":
        return (
          <Select
            value={params[field.name]}
            onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
            placeholder="Select grip parameters">
            {(gripParams || []).map((param) => (
              <option key={param.id} value={param.id}>
                {param.name}
              </option>
            ))}
          </Select>
        );

      case "text":
        return (
          <Input
            value={params[field.name]}
            onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
          />
        );

      case "boolean":
        return (
          <Select
            value={params[field.name]}
            onChange={(e) => setParams({ ...params, [field.name]: e.target.value === "true" })}>
            <option value="false">False</option>
            <option value="true">True</option>
          </Select>
        );

      case "number":
        return (
          <NumberInput
            value={params[field.name]}
            onChange={(_, value) => setParams({ ...params, [field.name]: value })}>
            <NumberInputField />
          </NumberInput>
        );

      case "text_array":
        return (
          <Input
            value={
              Array.isArray(params[field.name]) ? params[field.name].join(", ") : params[field.name]
            }
            onChange={(e) => {
              const value = e.target.value;
              const arrayValue = value.split(",").map((item) => item.trim());
              setParams({ ...params, [field.name]: arrayValue });
            }}
            placeholder="Enter comma-separated values"
          />
        );

      default:
        return (
          <Input
            value={params[field.name]}
            onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Command</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Command</FormLabel>
              <Select
                placeholder="Select command"
                value={selectedCommand}
                onChange={(e) => handleCommandSelect(e.target.value)}>
                {Object.keys(availableCommands).map((cmd) => (
                  <option key={cmd} value={cmd}>
                    {cmd.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedCommand &&
              availableCommands[selectedCommand]?.map((field) => (
                <FormControl key={field.name}>
                  <FormLabel>{field.name.replace(/_/g, " ")}</FormLabel>
                  {renderField(field)}
                </FormControl>
              ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isDisabled={!selectedCommand}>
            Add Command
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
