import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  HStack,
  Select,
  ButtonGroup,
  Switch,
} from "@chakra-ui/react";
import { Tool } from "@/types";
import { Sequence, SequenceCommand, TeachPoint } from "../../types/";
import { trpc } from "@/utils/trpc";
import { errorToast } from "@/components/ui/Toast";
import { TemplateSelectionModal } from "./TemplateSelectionModal";

interface SequenceModalProps {
  config: Tool;
  isOpen: boolean;
  onClose: () => void;
  sequence?: Sequence;
  onSave: (sequence: Omit<Sequence, "id">) => void;
  teachPoints: TeachPoint[];
}

export const SequenceModal: React.FC<SequenceModalProps> = ({
  config,
  isOpen,
  onClose,
  sequence,
  onSave,
  teachPoints,
}) => {
  const [name, setName] = useState(sequence?.name ?? "");
  const [description, setDescription] = useState(sequence?.description ?? "");
  const [commands, setCommands] = useState<SequenceCommand[]>(sequence?.commands ?? []);
  const [labware, setLabware] = useState(sequence?.labware ?? "default");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const { data: labwareList } = trpc.labware.getAll.useQuery();
  const [createFromTemplate, setCreateFromTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(sequence?.name ?? "");
      setDescription(sequence?.description ?? "");
      setCommands(sequence?.commands ?? []);
      setLabware(sequence?.labware ?? "default");
      setIsTemplateModalOpen(false);
    }
  }, [isOpen, sequence]);

  const handleTemplateSelect = (templateCommands: SequenceCommand[]) => {
    setCommands(templateCommands);
  };

  const handleSave = () => {
    if (!name.trim()) {
      errorToast("Error", "Name is required");
      return;
    }
    const sequenceData = {
      name,
      description,
      commands,
      toolId: config.id,
      labware,
    };

    onSave(sequenceData);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{sequence ? "Edit Sequence" : "New Sequence"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>

              <FormControl>
                <FormLabel>Labware</FormLabel>
                <Select
                  value={labware}
                  onChange={(e) => setLabware(e.target.value)}
                  placeholder="Select labware">
                  <option value="default">Default</option>
                  {labwareList
                    ?.filter((item) => item.name.toLowerCase() !== "default")
                    .map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                </Select>
                <Text fontSize="xs" color="gray" mt={1}>
                  Select the labware to use when running this sequence
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormControl>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Switch
                      isChecked={createFromTemplate}
                      onChange={(e) => {
                        setCreateFromTemplate(e.target.checked);
                      }}
                    />
                    <Text>Create From Template</Text>
                    <Text color="GrayText">(optional)</Text>
                  </HStack>
                </HStack>
                {createFromTemplate && (
                  <ButtonGroup size="sm" variant="outline">
                    <Button
                      colorScheme={selectedTemplate === "pick_plate" ? "blue" : "gray"}
                      onClick={() => {
                        setSelectedTemplate("pick_plate");
                        setIsTemplateModalOpen(true);
                      }}>
                      Pick Plate
                    </Button>
                    <Button
                      colorScheme={selectedTemplate === "place_plate" ? "blue" : "gray"}
                      onClick={() => {
                        setSelectedTemplate("place_plate");
                        setIsTemplateModalOpen(true);
                      }}>
                      Place Plate
                    </Button>
                    <Button
                      colorScheme={selectedTemplate === "pick_lid" ? "blue" : "gray"}
                      onClick={() => {
                        setSelectedTemplate("pick_lid");
                        setIsTemplateModalOpen(true);
                      }}>
                      Pick Lid
                    </Button>
                    <Button
                      colorScheme={selectedTemplate === "place_lid" ? "blue" : "gray"}
                      onClick={() => {
                        setSelectedTemplate("place_lid");
                        setIsTemplateModalOpen(true);
                      }}>
                      Place Lid
                    </Button>
                  </ButtonGroup>
                )}
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button isDisabled={name.trim() === ""} colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <TemplateSelectionModal
        selectedTemplate={
          selectedTemplate as "pick_plate" | "place_plate" | "pick_lid" | "place_lid"
        }
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onTemplateSelect={handleTemplateSelect}
        teachPoints={teachPoints}
      />
    </>
  );
};
