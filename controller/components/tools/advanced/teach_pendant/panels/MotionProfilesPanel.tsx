import { Card, CardHeader, CardBody, HStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Menu, MenuButton, MenuList, MenuItem, IconButton, useColorModeValue, Box, VStack } from "@chakra-ui/react";
import { AddIcon, HamburgerIcon } from "@chakra-ui/icons";
import { MotionProfile } from "../types";

interface MotionProfilesPanelProps {
  profiles: MotionProfile[];
  onEdit: (profile: MotionProfile) => void;
  onRegister: (profile: MotionProfile) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  bgColor: string;
  bgColorAlpha: string;
}

export const MotionProfilesPanel: React.FC<MotionProfilesPanelProps> = ({
  profiles,
  onEdit,
  onRegister,
  onDelete,
  onAdd,
  bgColor,
  bgColorAlpha,
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12}>Motion Profiles</Heading>
          <IconButton
            aria-label="Add motion profile"
            icon={<AddIcon />}
            onClick={onAdd}
            colorScheme="blue"
            variant="ghost"
            size="sm"
          />
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
                  <Th title="Name">Name</Th>
                  <Th title="Profile ID">ID</Th>
                  <Th title="Speed">Spd</Th>
                  <Th title="Secondary Speed">Spd2</Th>
                  <Th title="Acceleration">Accel</Th>
                  <Th title="Deceleration">Decel</Th>
                  <Th title="Acceleration Ramp">A.Ramp</Th>
                  <Th title="Deceleration Ramp">D.Ramp</Th>
                  <Th title="In Range">Range</Th>
                  <Th title="Move in Straight Line">Str</Th>
                  <Th title="Available Actions">Acts</Th>
                </Tr>
              </Thead>
              <Tbody>
                {profiles.map((profile) => (
                  <Tr key={profile.id} _hover={{ bg: bgColorAlpha }}>
                    <Td>{profile.name}</Td>
                    <Td>{profile.profile_id}</Td>
                    <Td>{profile.speed}%</Td>
                    <Td>{profile.speed2}%</Td>
                    <Td>{profile.acceleration}%</Td>
                    <Td>{profile.deceleration}%</Td>
                    <Td>{profile.accel_ramp}s</Td>
                    <Td>{profile.decel_ramp}s</Td>
                    <Td>{profile.inrange}</Td>
                    <Td>{profile.straight ? "Yes" : "No"}</Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Actions"
                          icon={<HamburgerIcon />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem onClick={() => onEdit(profile)}>Edit</MenuItem>
                          <MenuItem onClick={() => onRegister(profile)}>Register</MenuItem>
                          <MenuItem color="red.500" onClick={() => onDelete(profile.id)}>Delete</MenuItem>
                        </MenuList>
                      </Menu>
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