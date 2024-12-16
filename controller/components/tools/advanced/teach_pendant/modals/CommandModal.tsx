import React, { useState } from "react";
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

const availableCommands: Record<string, CommandField[]> = {
  move: [
    { name: "waypoint", type: "waypoint" },
    { name: "motion_profile", type: "motion_profile" },
  ],
  grasp_plate: [
    { name: "grip_params", type: "grip_params" },
  ],
  release_plate: [
    { name: "grip_params", type: "grip_params" },
  ],
  approach: [
    { name: "nest", type: "nest" },
    { name: "x_offset", type: "number", defaultValue: 0 },
    { name: "y_offset", type: "number", defaultValue: 0 },
    { name: "z_offset", type: "number", defaultValue: 0 },
    { name: "motion_profile", type: "motion_profile" },
    { name: "ignore_safepath", type: "boolean", defaultValue: false },
  ],
  leave: [
    { name: "nest", type: "nest" },
    { name: "x_offset", type: "number", defaultValue: 0 },
    { name: "y_offset", type: "number", defaultValue: 0 },
    { name: "z_offset", type: "number", defaultValue: 0 },
    { name: "motion_profile", type: "motion_profile" },
  ],
  retrieve_plate: [
    { name: "labware", type: "text" },
    { name: "location", type: "location" },
    { name: "motion_profile", type: "motion_profile" },
  ],
  dropoff_plate: [
    { name: "labware", type: "text" },
    { name: "location", type: "location" },
    { name: "motion_profile", type: "motion_profile" },
  ],
  free: [],
  unfree: [],
  unwind: [],
};

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

  const handleCommandSelect = (command: string) => {
    setSelectedCommand(command);
    const defaultParams = availableCommands[command as keyof typeof availableCommands].reduce(
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
    if (processedParams.motion_profile) {
      const profile = motionProfiles.find(p => p.id === Number(processedParams.motion_profile));
      if (profile) {
        processedParams.motion_profile = {
          id: profile.profile_id,
          speed: profile.speed,
          speed2: profile.speed2,
          accel: profile.acceleration,
          decel: profile.deceleration,
          accel_ramp: profile.accel_ramp,
          decel_ramp: profile.decel_ramp,
          inrange: profile.inrange,
          straight: profile.straight,
        };
      }
    }

    if (processedParams.grip_params) {
      const grip = gripParams.find(g => g.id === Number(processedParams.grip_params));
      if (grip) {
        processedParams.width = grip.width;
        processedParams.speed = grip.speed;
        processedParams.force = grip.force;
        delete processedParams.grip_params;
      }
    }

    if (processedParams.waypoint || processedParams.location || processedParams.nest) {
      console.log("teachPoints", teachPoints);
      const point = teachPoints.find(p => p.id === Number(processedParams.waypoint || processedParams.location || processedParams.nest));
      if (point) {
        if (processedParams.waypoint) processedParams.waypoint = point.coordinate;
        if (processedParams.location) processedParams.location = point.name;
        if (processedParams.nest) processedParams.nest = point.name;
      }
    }

    onAddCommand({
      command: selectedCommand,
      params: processedParams,
    });
    onClose();
    setSelectedCommand("");
    setParams({});
  };

  const renderField = (field: { name: string; type: string; defaultValue?: any }) => {
    switch (field.type) {
      case "waypoint":
      case "location":
        return (
          <Select
            value={params[field.name]}
            onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
            placeholder={`Select ${field.type}`}
          >
            {(teachPoints || [])
              .filter(p => field.type === "waypoint" ? true : p.type === field.type)
              .map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name}
                </option>
              ))}
          </Select>
        );

      case "nest":
        return (
          <Select
            value={params[field.name]}
            onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
            placeholder="Select nest"
          >
            {(teachPoints || [])
              .filter(p => p.type === "nest")
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
            placeholder="Select motion profile"
          >
            {(motionProfiles || []).map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </Select>
        );

      case "grip_params":
        return (
          <Select
            value={params[field.name]}
            onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
            placeholder="Select grip parameters"
          >
            {(gripParams || []).map((param) => (
              <option key={param.id} value={param.id}>
                {param.name}
              </option>
            ))}
          </Select>
        );

      case "boolean":
        return (
          <Select
            value={params[field.name]}
            onChange={(e) => setParams({ ...params, [field.name]: e.target.value === "true" })}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Select>
        );

      case "number":
        return (
          <NumberInput
            value={params[field.name]}
            onChange={(_, value) => setParams({ ...params, [field.name]: value })}
          >
            <NumberInputField />
          </NumberInput>
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
                onChange={(e) => handleCommandSelect(e.target.value)}
              >
                {Object.keys(availableCommands).map((cmd) => (
                  <option key={cmd} value={cmd}>
                    {cmd}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedCommand &&
              availableCommands[selectedCommand as keyof typeof availableCommands].map((field) => (
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
