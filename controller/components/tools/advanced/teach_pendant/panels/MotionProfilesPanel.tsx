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
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, StarIcon } from "@chakra-ui/icons";
import { MotionProfile } from "../types";

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
          <Box height="100%" overflow="auto" borderWidth="1px" borderRadius="md">
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
                  <Tr key={profile.id} bg={profile.id === defaultProfileId ? bgColorAlpha : undefined}>
                    <Td>
                      <Switch
                        isChecked={profile.id === defaultProfileId}
                        onChange={() => onSetDefault(profile.id === defaultProfileId ? null : profile.id)}
                      />
                    </Td>
                    <Td>{profile.name}</Td>
                    <Td>{profile.profile_id}</Td>
                    <Td>{profile.speed}%</Td>
                    <Td>{profile.speed2}%</Td>
                    <Td>{profile.acceleration}%</Td>
                    <Td>{profile.deceleration}%</Td>
                    <Td textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <Tooltip label="Edit profile">
                          <IconButton
                            aria-label="Edit profile"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => onEdit(profile)}
                          />
                        </Tooltip>
                        <Tooltip label="Register with robot">
                          <IconButton
                            aria-label="Register profile"
                            icon={<StarIcon />}
                            size="sm"
                            onClick={() => onRegister(profile)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete profile">
                          <IconButton
                            aria-label="Delete profile"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => onDelete(profile.id)}
                          />
                        </Tooltip>
                      </HStack>
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