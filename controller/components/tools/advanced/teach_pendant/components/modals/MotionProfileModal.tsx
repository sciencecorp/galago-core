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
  Switch,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { MotionProfile } from "@/components/tools/advanced/teach_pendant/components/types";

interface MotionProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: MotionProfile;
  onSave?: (profile: Omit<MotionProfile, "id">) => void;
  toolId: number;
  existingProfiles?: MotionProfile[];
}

export const MotionProfileModal: React.FC<MotionProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  toolId,
  existingProfiles = [],
}) => {
  const [name, setName] = useState("");
  const [profileId, setProfileId] = useState(1);
  const [speed, setSpeed] = useState(50);
  const [speed2, setSpeed2] = useState(50);
  const [acceleration, setAcceleration] = useState(50);
  const [deceleration, setDeceleration] = useState(50);
  const [accelRamp, setAccelRamp] = useState(0);
  const [decelRamp, setDecelRamp] = useState(0);
  const [inrange, setInrange] = useState(0);
  const [straight, setStraight] = useState(0);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && !profile) {
      setName("");
      setProfileId(2);
      setSpeed(60);
      setSpeed2(60);
      setAcceleration(60);
      setDeceleration(60);
      setAccelRamp(0.1);
      setDecelRamp(0.1);
      setInrange(0);
      setStraight(0);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name);
      setProfileId(profile.profile_id);
      setSpeed(profile.speed);
      setSpeed2(profile.speed2);
      setAcceleration(profile.acceleration);
      setDeceleration(profile.deceleration);
      setAccelRamp(profile.accel_ramp);
      setDecelRamp(profile.decel_ramp);
      setInrange(profile.inrange);
      setStraight(profile.straight);
    }
  }, [isOpen, profile]);

  const handleSave = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push("Name is required");
    }

    if (profileId < 1 || profileId > 14) {
      errors.push("Profile ID must be between 1 and 14");
    }

    const duplicateProfile = existingProfiles.find(
      (p) => p.profile_id === profileId && (!profile || p.id !== profile.id),
    );
    if (duplicateProfile) {
      errors.push(
        `Profile ID ${profileId} is already in use by profile "${duplicateProfile.name}"`,
      );
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Errors",
        description: errors.join("\n"),
        status: "error",
        duration: 5000,
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
        accel_ramp: accelRamp,
        decel_ramp: decelRamp,
        inrange,
        straight,
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
              <FormLabel>Profile ID (1-14)</FormLabel>
              <NumberInput
                value={profileId}
                onChange={(_, value) => setProfileId(value)}
                min={1}
                max={14}>
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
            <FormControl>
              <FormLabel>Accel Ramp (%)</FormLabel>
              <NumberInput value={accelRamp} onChange={(_, value) => setAccelRamp(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Decel Ramp (%)</FormLabel>
              <NumberInput value={decelRamp} onChange={(_, value) => setDecelRamp(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Inrange</FormLabel>
              <NumberInput value={inrange} onChange={(_, value) => setInrange(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Straight</FormLabel>
              <Switch value={straight} onChange={(e) => setStraight(e.target.checked ? 1 : 0)} />
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
