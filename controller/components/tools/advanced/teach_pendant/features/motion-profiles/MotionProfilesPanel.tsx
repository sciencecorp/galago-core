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
import { MotionProfile, MotionProfilesPanelProps } from "../../types/";
import { useState, useRef } from "react";
import { useOutsideClick } from "@chakra-ui/react";
import { usePagination } from "../../hooks/usePagination";
import { PaginationControls } from "../../shared/ui/PaginationControls";
import { EditableText } from "@/components/ui/Form";

export const MotionProfilesPanel: React.FC<MotionProfilesPanelProps> = ({
  profiles,
  onEdit,
  onDelete,
  onDeleteAll,
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
  const tableBgColor = useColorModeValue("white", "gray.800");
  const headerBgColor = useColorModeValue("gray.50", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const tableRef = useRef<HTMLDivElement>(null);

  const handleSaveValue = (profile: MotionProfile, field: keyof MotionProfile, value: any) => {
    const updatedProfile = { ...profile, [field]: value };
    onEdit(updatedProfile);
  };

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12} color={textColor}>
            Motion Profiles
          </Heading>
          <HStack>
            <Button
              leftIcon={<DeleteIcon />}
              size="sm"
              onClick={onDeleteAll}
              colorScheme="red"
              variant="outline">
              Delete All
            </Button>
            <Button leftIcon={<AddIcon />} size="sm" onClick={onAdd} colorScheme="blue">
              New Motion Profile
            </Button>
          </HStack>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          <Box
            ref={tableRef}
            height="100%"
            overflow="auto"
            borderWidth="1px"
            borderRadius="md"
            borderColor={borderColor}
            boxShadow={useColorModeValue(
              "0 1px 3px rgba(0, 0, 0, 0.1)",
              "0 1px 3px rgba(0, 0, 0, 0.3)",
            )}>
            <Table
              variant="simple"
              size="sm"
              bg={tableBgColor}
              css={{
                tr: {
                  borderColor: borderColor,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: hoverBgColor,
                  },
                },
                th: {
                  borderColor: borderColor,
                  color: textColor,
                },
                td: {
                  borderColor: borderColor,
                  color: textColor,
                },
              }}>
              <Thead position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th bg={headerBgColor} color={textColor}>
                    Default
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Name
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    ID
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Speed
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Speed2
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Accel
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Decel
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Accel Ramp
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Decel Ramp
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    In Range
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Straight
                  </Th>
                  <Th
                    width="120px"
                    minWidth="120px"
                    textAlign="right"
                    bg={headerBgColor}
                    color={textColor}>
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedItems.map((profile) => (
                  <Tr
                    key={profile.id || `new-${profile.name}`}
                    bg={profile.id === defaultProfileId ? bgColorAlpha : undefined}
                    _hover={{ bg: hoverBgColor }}>
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
                      <EditableText
                        defaultValue={profile.name}
                        onSubmit={(value) => {
                          value && handleSaveValue(profile, "name", value);
                        }}
                      />
                    </Td>
                    <Td>{profile.profile_id}</Td>
                    <Td>
                      <EditableText
                        defaultValue={(profile.speed ?? 0).toString()}
                        onSubmit={(value) => {
                          const numValue = Number(value);
                          !isNaN(numValue) && handleSaveValue(profile, "speed", numValue);
                        }}
                      />
                    </Td>
                    <Td>
                      <EditableText
                        defaultValue={(profile.speed2 ?? 0).toString()}
                        onSubmit={(value) => {
                          const numValue = Number(value);
                          !isNaN(numValue) && handleSaveValue(profile, "speed2", numValue);
                        }}
                      />
                    </Td>
                    <Td>
                      <EditableText
                        defaultValue={(profile.acceleration ?? 0).toString()}
                        onSubmit={(value) => {
                          const numValue = Number(value);
                          !isNaN(numValue) && handleSaveValue(profile, "acceleration", numValue);
                        }}
                      />
                    </Td>
                    <Td>
                      <EditableText
                        defaultValue={(profile.deceleration ?? 0).toString()}
                        onSubmit={(value) => {
                          const numValue = Number(value);
                          !isNaN(numValue) && handleSaveValue(profile, "deceleration", numValue);
                        }}
                      />
                    </Td>
                    <Td>
                      <EditableText
                        defaultValue={(profile.accel_ramp ?? 0).toString()}
                        onSubmit={(value) => {
                          const numValue = Number(value);
                          !isNaN(numValue) && handleSaveValue(profile, "accel_ramp", numValue);
                        }}
                      />
                    </Td>
                    <Td>
                      <EditableText
                        defaultValue={(profile.decel_ramp ?? 0).toString()}
                        onSubmit={(value) => {
                          const numValue = Number(value);
                          !isNaN(numValue) && handleSaveValue(profile, "decel_ramp", numValue);
                        }}
                      />
                    </Td>
                    <Td>
                      <EditableText
                        defaultValue={(profile.inrange ?? 0).toString()}
                        onSubmit={(value) => {
                          const numValue = Number(value);
                          !isNaN(numValue) && handleSaveValue(profile, "inrange", numValue);
                        }}
                      />
                    </Td>
                    <Td>
                      <Switch
                        isChecked={profile.straight === 1}
                        onChange={(e) =>
                          handleSaveValue(profile, "straight", e.target.checked ? 1 : 0)
                        }
                        size="sm"
                      />
                    </Td>
                    <Td textAlign="right">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Motion profile actions"
                          icon={<HamburgerIcon />}
                          variant="outline"
                          size="sm"
                          borderColor={borderColor}
                          minW="32px"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<DeleteIcon />}
                            onClick={() => onDelete(profile.id!)}
                            color="red.500">
                            Delete Profile
                          </MenuItem>
                          {profile.id && (
                            <MenuItem onClick={() => onRegister(profile)}>
                              Register with Robot
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
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
          totalItems={profiles.length}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </VStack>
    </Box>
  );
};
