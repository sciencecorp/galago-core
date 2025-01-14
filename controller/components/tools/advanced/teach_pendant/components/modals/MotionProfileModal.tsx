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
  NumberInput,
  NumberInputField,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { MotionProfile } from "@/components/tools/advanced/teach_pendant/components/types";

interface MotionProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: MotionProfile;
  onSave?: (profile: Omit<MotionProfile, "id">) => void;
  toolId: number;
}

export const MotionProfileModal: React.FC<MotionProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  toolId,
}) => {
  const [name, setName] = useState("");
  const [profileId, setProfileId] = useState(1);
  const [speed, setSpeed] = useState(50);
  const [speed2, setSpeed2] = useState(50);
  const [acceleration, setAcceleration] = useState(50);
  const [deceleration, setDeceleration] = useState(50);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      if (profile) {
        setName(profile.name);
        setProfileId(profile.profile_id);
        setSpeed(profile.speed);
        setSpeed2(profile.speed2);
        setAcceleration(profile.acceleration);
        setDeceleration(profile.deceleration);
      } else {
        setName("");
        setProfileId(1);
        setSpeed(50);
        setSpeed2(50);
        setAcceleration(50);
        setDeceleration(50);
      }
    }
  }, [isOpen, profile]);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (onSave) {
      onSave({
        name: name.trim(),
        profile_id: profileId,
        speed,
        speed2,
        acceleration,
        deceleration,
        tool_id: toolId,
        accel_ramp: 0,
        decel_ramp: 0,
        inrange: 0,
        straight: 0
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{profile ? "Edit" : "New"} Motion Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Profile ID</FormLabel>
              <NumberInput value={profileId} onChange={(_, value) => setProfileId(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Speed (%)</FormLabel>
              <NumberInput value={speed} onChange={(_, value) => setSpeed(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Speed 2 (%)</FormLabel>
              <NumberInput value={speed2} onChange={(_, value) => setSpeed2(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Acceleration (%)</FormLabel>
              <NumberInput value={acceleration} onChange={(_, value) => setAcceleration(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Deceleration (%)</FormLabel>
              <NumberInput value={deceleration} onChange={(_, value) => setDeceleration(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
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