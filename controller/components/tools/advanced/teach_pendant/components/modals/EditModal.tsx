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
  Select,
  useToast,
} from "@chakra-ui/react";
import { TeachPoint } from "../types";
import { Tool } from "@/types/api";
import { trpc } from "@/utils/trpc";
import { coordinateToJoints } from "../utils/robotArmUtils";
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPoint: TeachPoint | null;
  config: Tool;
  locations: TeachPoint[];
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  editingPoint,
  config,
  locations,
}) => {
  const [localName, setLocalName] = useState(editingPoint?.name || "");
  const [localCoordinate, setLocalCoordinate] = useState(editingPoint?.coordinate || "");
  const [localSafeLoc, setLocalSafeLoc] = useState<number | undefined>(editingPoint?.safe_loc);
  const toast = useToast();

  const updateLocationMutation = trpc.robotArm.location.update.useMutation();
  const updateNestMutation = trpc.robotArm.nest.update.useMutation();

  useEffect(() => {
    if (editingPoint) {
      setLocalName(editingPoint.name);
      setLocalCoordinate(editingPoint.coordinate);
      setLocalSafeLoc(editingPoint.safe_loc);
    }
  }, [editingPoint]);

  const handleSave = async () => {
    if (!editingPoint || !config.name) return;

    try {
      if (editingPoint.type === "location") {
        await updateLocationMutation.mutateAsync({
          id: editingPoint.id,
          name: localName,
          ...coordinateToJoints(localCoordinate),
          location_type: editingPoint.locType,
          tool_id: config.id,
        });
      } else {
        await updateNestMutation.mutateAsync({
          id: editingPoint.id,
          name: localName,
          j1: parseFloat(localCoordinate.split(" ")[0]),
          j2: parseFloat(localCoordinate.split(" ")[1]),
          j3: parseFloat(localCoordinate.split(" ")[2]),
          j4: parseFloat(localCoordinate.split(" ")[3]),
          j5: parseFloat(localCoordinate.split(" ")[4]),
          j6: parseFloat(localCoordinate.split(" ")[5]),
          location_type: editingPoint.locType,
          orientation: editingPoint.orientation || "landscape",
          safe_location_id: localSafeLoc || 1,
          tool_id: config.id,
        });
      }

      toast({
        title: "Success",
        description: `${editingPoint.type} updated successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${editingPoint.type}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit {editingPoint?.type}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input value={localName} onChange={(e) => setLocalName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Coordinate</FormLabel>
              <Input
                value={localCoordinate}
                onChange={(e) => setLocalCoordinate(e.target.value)}
              />
            </FormControl>
            {editingPoint?.type === "nest" && (
              <FormControl>
                <FormLabel>Safe Location</FormLabel>
                <Select
                  value={localSafeLoc}
                  onChange={(e) => setLocalSafeLoc(parseInt(e.target.value))}>
                  {locations
                    .filter((loc) => loc.type === "location")
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                </Select>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
