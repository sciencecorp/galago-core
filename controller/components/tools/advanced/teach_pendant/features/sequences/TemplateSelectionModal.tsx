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
  VStack,
  Divider,
} from "@chakra-ui/react";
import { TeachPoint } from "../../types/";
import { generateSequenceFromTemplate } from "./DefaultSequences";
import { SequenceCommand } from "../../types/";

interface TemplateModalProps {
  selectedTemplate: "pick_plate" | "place_plate" | "pick_lid" | "place_lid";
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (commands: SequenceCommand[]) => void;
  teachPoints: TeachPoint[];
}

export const TemplateSelectionModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onTemplateSelect,
  teachPoints,
  selectedTemplate,
}) => {
  const [safeLocation, setSafeLocation] = useState("");
  const [nestLocation, setNestLocation] = useState("");
  const [labware, setLabware] = useState("default");

  const handleSubmit = () => {
    if (!selectedTemplate || !safeLocation || !nestLocation) {
      return;
    }
    const commands = generateSequenceFromTemplate(
      selectedTemplate,
      safeLocation,
      nestLocation,
      labware
    );
    onTemplateSelect(commands);
    onClose();
  };

  const handleCancel = () => {
    setSafeLocation("");
    setNestLocation("");
    setLabware("default");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Fill Sequence Template</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            {selectedTemplate && (
              <>
                <Divider />
                <FormControl isRequired>
                  <FormLabel>Nest Location</FormLabel>
                  <Select
                    placeholder="Select nest location"
                    value={nestLocation}
                    onChange={(e) => setNestLocation(e.target.value)}
                  >
                    {teachPoints
                      .filter(
                        (p) =>
                          !p.name.includes("safe") && !p.name.includes("Safe")
                      )
                      .map((point) => (
                        <option key={point.id} value={point.name}>
                          {point.name}
                        </option>
                      ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Safe Location</FormLabel>
                  <Select
                    placeholder="Select safe location"
                    value={safeLocation}
                    onChange={(e) => setSafeLocation(e.target.value)}
                  >
                    {teachPoints
                      .filter(
                        (p) =>
                          p.name.includes("safe") || p.name.includes("Safe")
                      )
                      .map((point) => (
                        <option key={point.id} value={point.name}>
                          {point.name}
                        </option>
                      ))}
                  </Select>
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            isDisabled={!selectedTemplate || !safeLocation || !nestLocation}
            colorScheme="blue"
            onClick={handleSubmit}
          >
            Use Template
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
