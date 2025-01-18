import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  Switch,
  Tooltip,
  useColorModeValue,
  VStack,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, HamburgerIcon, CheckIcon } from "@chakra-ui/icons";
import { MotionProfile } from "../types/index";
import { useState, useRef } from "react";
import { useOutsideClick } from "@chakra-ui/react";

interface EditableProfile {
  id: number;
  speed: number;
  speed2: number;
  acceleration: number;
  deceleration: number;
}

interface MotionProfilesPanelProps {
  profiles: MotionProfile[];
  onEdit: (profile: MotionProfile) => void;
  onRegister: (profile: MotionProfile) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  bgColor: string;
  bgColorAlpha: string;
  defaultProfileId: number | null;
  onSetDefault: (id: number | null) => void;
}

export const MotionProfilesPanel: React.FC<MotionProfilesPanelProps> = ({
  profiles,
  onEdit,
  onRegister,
  onDelete,
  onAdd,
  bgColor,
  bgColorAlpha,
  defaultProfileId,
  onSetDefault,
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [editingProfile, setEditingProfile] = useState<EditableProfile | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: tableRef,
    handler: () => {
      if (editingProfile) {
        setEditingProfile(null);
      }
    },
  });

  const handleValueChange = (field: keyof EditableProfile, value: number) => {
    if (editingProfile) {
      setEditingProfile({
        ...editingProfile,
        [field]: isNaN(value) ? 0 : value,
      });
    }
  };

  const handleSaveProfile = (profile: MotionProfile) => {
    if (editingProfile) {
      const updatedProfile = {
        ...profile,
        speed: editingProfile.speed,
        speed2: editingProfile.speed2,
        acceleration: editingProfile.acceleration,
        deceleration: editingProfile.deceleration,
      };
      onEdit(updatedProfile);
      setEditingProfile(null);
    }
  };

  const startEditing = (profile: MotionProfile) => {
    setEditingProfile({
      id: profile.id!,
      speed: profile.speed,
      speed2: profile.speed2,
      acceleration: profile.acceleration,
      deceleration: profile.deceleration,
    });
  };

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12}>Motion Profiles</Heading>
          <Button leftIcon={<AddIcon />} size="sm" onClick={onAdd}>
            New Motion Profile
          </Button>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          <Box ref={tableRef} height="100%" overflow="auto" borderWidth="1px" borderRadius="md">
            <Table variant="simple" size="sm" css={{
              'tr': {
                borderColor: borderColor,
              },
              'th': {
                borderColor: borderColor,
              },
              'td': {
                borderColor: borderColor,
              }
            }}>
              <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
                <Tr>
                  <Th>Default</Th>
                  <Th>Name</Th>
                  <Th>Profile ID</Th>
                  <Th>Speed</Th>
                  <Th>Speed2</Th>
                  <Th>Acceleration</Th>
                  <Th>Deceleration</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {profiles.map((profile) => (
                  <Tr key={profile.id || profile.profile_id || `new-${profile.name}`} bg={profile.id === defaultProfileId ? bgColorAlpha : undefined}>
                    <Td>
                      <Switch
                        isChecked={profile.id === defaultProfileId}
                        onChange={() => onSetDefault(profile.id === defaultProfileId ? null : (profile.id || profile.profile_id))}
                        isDisabled={!profile.id && !profile.profile_id}
                      />
                    </Td>
                    <Td>{profile.name}</Td>
                    <Td>{profile.profile_id}</Td>
                    {editingProfile?.id === profile.id ? (
                      <>
                        <Td>
                          <NumberInput
                            value={editingProfile.speed}
                            onChange={(_, value) => handleValueChange('speed', value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={100}
                          >
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingProfile.speed2}
                            onChange={(_, value) => handleValueChange('speed2', value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={100}
                          >
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingProfile.acceleration}
                            onChange={(_, value) => handleValueChange('acceleration', value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={100}
                          >
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingProfile.deceleration}
                            onChange={(_, value) => handleValueChange('deceleration', value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={100}
                          >
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                      </>
                    ) : (
                      <>
                        <Td>{profile.speed}%</Td>
                        <Td>{profile.speed2}%</Td>
                        <Td>{profile.acceleration}%</Td>
                        <Td>{profile.deceleration}%</Td>
                      </>
                    )}
                    <Td textAlign="right">
                      {editingProfile?.id === profile.id ? (
                        <Tooltip label="Save profile">
                          <IconButton
                            aria-label="Save profile"
                            icon={<CheckIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleSaveProfile(profile)}
                          />
                        </Tooltip>
                      ) : (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Motion profile actions"
                            icon={<HamburgerIcon />}
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<EditIcon />}
                              onClick={() => startEditing(profile)}
                            >
                              Edit Profile
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem
                              icon={<DeleteIcon />}
                              onClick={() => onDelete(profile.id!)}
                              color="red.500"
                            >
                              Delete Profile
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};