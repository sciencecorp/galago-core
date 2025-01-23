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
  Input,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, HamburgerIcon, CheckIcon } from "@chakra-ui/icons";
import { MotionProfile, MotionProfilesPanelProps } from "../types";
import { useState, useRef } from "react";
import { useOutsideClick } from "@chakra-ui/react";
import { usePagination } from "../../hooks/usePagination";
import { PaginationControls } from "../common/PaginationControls";

interface EditableProfile {
  id: number;
  name: string;
  speed: number;
  speed2: number;
  acceleration: number;
  deceleration: number;
  accel_ramp: number;
  decel_ramp: number;
  inrange: number;
  straight: number;
}

export const MotionProfilesPanel: React.FC<MotionProfilesPanelProps> = ({
  profiles,
  onEdit,
  onDelete,
  onAdd,
  onRegister,
  bgColor,
  bgColorAlpha,
  defaultProfileId,
  onSetDefault,
}) => {
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    onPageChange,
    onItemsPerPageChange,
  } = usePagination(profiles);

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

  const handleValueChange = (field: keyof EditableProfile, value: number | string) => {
    if (editingProfile) {
      setEditingProfile({
        ...editingProfile,
        [field]: field === "name" ? value : isNaN(value as number) ? 0 : value,
      });
    }
  };

  const handleSaveProfile = (profile: MotionProfile) => {
    if (editingProfile) {
      const updatedProfile = {
        ...profile,
        name: editingProfile.name,
        speed: editingProfile.speed,
        speed2: editingProfile.speed2,
        acceleration: editingProfile.acceleration,
        deceleration: editingProfile.deceleration,
        accel_ramp: editingProfile.accel_ramp,
        decel_ramp: editingProfile.decel_ramp,
        inrange: editingProfile.inrange,
        straight: editingProfile.straight,
      };
      onEdit(updatedProfile);
      setEditingProfile(null);
    }
  };

  const startEditing = (profile: MotionProfile) => {
    setEditingProfile({
      id: profile.id!,
      name: profile.name,
      speed: profile.speed,
      speed2: profile.speed2,
      acceleration: profile.acceleration,
      deceleration: profile.deceleration,
      accel_ramp: profile.accel_ramp,
      decel_ramp: profile.decel_ramp,
      inrange: profile.inrange,
      straight: profile.straight,
    });
  };

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12}>
            Motion Profiles
          </Heading>
          <Button leftIcon={<AddIcon />} size="sm" onClick={onAdd}>
            New Motion Profile
          </Button>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          <Box ref={tableRef} height="100%" overflow="auto" borderWidth="1px" borderRadius="md">
            <Table
              variant="simple"
              size="sm"
              css={{
                tr: {
                  borderColor: borderColor,
                },
                th: {
                  borderColor: borderColor,
                },
                td: {
                  borderColor: borderColor,
                },
              }}>
              <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
                <Tr>
                  <Th>Default</Th>
                  <Th>Name</Th>
                  <Th>ID</Th>
                  <Th>Speed</Th>
                  <Th>Speed2</Th>
                  <Th>Accel</Th>
                  <Th>Decel</Th>
                  <Th>A Ramp</Th>
                  <Th>D Ramp</Th>
                  <Th>InRange</Th>
                  <Th>Str</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedItems.map((profile) => (
                  <Tr
                    key={profile.id || `new-${profile.name}`}
                    bg={profile.id === defaultProfileId ? bgColorAlpha : undefined}>
                    <Td>
                      <Switch
                        isChecked={profile.id === defaultProfileId}
                        onChange={() =>
                          onSetDefault(profile.id === defaultProfileId ? null : profile.id)
                        }
                        isDisabled={!profile.id}
                      />
                    </Td>
                    <Td>
                      {editingProfile?.id === profile.id ? (
                        <Input
                          value={editingProfile.name}
                          onChange={(e) => handleValueChange("name", e.target.value)}
                          size="xs"
                          width="120px"
                        />
                      ) : (
                        profile.name
                      )}
                    </Td>
                    <Td>{profile.profile_id}</Td>
                    {editingProfile?.id === profile.id ? (
                      <>
                        <Td>
                          <NumberInput
                            value={editingProfile.speed}
                            onChange={(_, value) => handleValueChange("speed", value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={100}>
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingProfile.speed2}
                            onChange={(_, value) => handleValueChange("speed2", value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={100}>
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingProfile.acceleration}
                            onChange={(_, value) => handleValueChange("acceleration", value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={100}>
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingProfile.deceleration}
                            onChange={(_, value) => handleValueChange("deceleration", value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={100}>
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingProfile.accel_ramp}
                            onChange={(_, value) => handleValueChange("accel_ramp", value)}
                            step={0.1}
                            precision={1}
                            size="xs"
                            min={0}
                            max={100}>
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingProfile.decel_ramp}
                            onChange={(_, value) => handleValueChange("decel_ramp", value)}
                            step={0.1}
                            precision={1}
                            size="xs"
                            min={0}
                            max={100}>
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingProfile.inrange}
                            onChange={(_, value) => handleValueChange("inrange", value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}>
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <Switch
                            isChecked={editingProfile.straight === 1}
                            onChange={(e) =>
                              handleValueChange("straight", e.target.checked ? 1 : 0)
                            }
                            size="sm"
                          />
                        </Td>
                      </>
                    ) : (
                      <>
                        <Td>{profile.speed}%</Td>
                        <Td>{profile.speed2}%</Td>
                        <Td>{profile.acceleration}%</Td>
                        <Td>{profile.deceleration}%</Td>
                        <Td>{profile.accel_ramp}%</Td>
                        <Td>{profile.decel_ramp}%</Td>
                        <Td>{profile.inrange}</Td>
                        <Td>{profile.straight ? "Yes" : "No"}</Td>
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
                            <MenuItem icon={<EditIcon />} onClick={() => startEditing(profile)}>
                              Edit Profile
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem
                              icon={<DeleteIcon />}
                              onClick={() => onDelete(profile.id!)}
                              color="red.500">
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
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </VStack>
    </Box>
  );
};
