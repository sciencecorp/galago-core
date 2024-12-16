import { Card, CardHeader, CardBody, HStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
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
  return (
    <Card width="100%" flex="1" bg={bgColor} borderColor={bgColorAlpha}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Motion Profiles</Heading>
          <IconButton
            aria-label="Add motion profile"
            icon={<AddIcon />}
            onClick={onAdd}
            colorScheme="blue"
            variant="ghost"
            size="sm"
          />
        </HStack>
      </CardHeader>
      <CardBody overflowY="auto" maxHeight="calc(100vh - 700px)" minHeight="550px">
        <Table variant="simple">
          <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
            <Tr>
              <Th>Name</Th>
              <Th>Profile ID</Th>
              <Th>Speed</Th>
              <Th>Speed2</Th>
              <Th>Acceleration</Th>
              <Th>Deceleration</Th>
              <Th>Accel Ramp</Th>
              <Th>Decel Ramp</Th>
              <Th>In Range</Th>
              <Th>Straight</Th>
              <Th>Actions</Th>
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
      </CardBody>
    </Card>
  );
};