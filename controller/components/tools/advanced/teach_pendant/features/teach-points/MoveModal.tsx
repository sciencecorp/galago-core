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
  Select,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { TeachPoint, MotionProfile } from "../../types";

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  point: TeachPoint;
  onMove: (point: TeachPoint, profile: MotionProfile, action?: "approach" | "leave") => void;
  action?: "approach" | "leave";
  config: any;
}

export const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  onClose,
  point,
  onMove,
  action,
  config,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const handleMove = () => {
    if (!selectedProfileId) return;
    const profile = config.motionProfiles?.find((p: MotionProfile) => p.id === selectedProfileId);
    if (!profile) return;
    onMove(point, profile, action);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Move to {point.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Motion Profile</FormLabel>
              <Select
                value={selectedProfileId || ""}
                onChange={(e) => setSelectedProfileId(Number(e.target.value))}
                placeholder="Select motion profile">
                {config.motionProfiles?.map((profile: MotionProfile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleMove} isDisabled={!selectedProfileId}>
            Move
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
