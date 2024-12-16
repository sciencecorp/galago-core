import { Tr, Td, IconButton, Badge, Menu, MenuButton, MenuList, MenuItem, HStack, VStack, Text } from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon, HamburgerIcon } from "@chakra-ui/icons";
import { TeachPoint } from "../types";

interface TeachPointRowProps {
  point: TeachPoint;
  isExpanded: boolean;
  onToggle: () => void;
  onMove: (point: TeachPoint) => void;
  onEdit: (point: TeachPoint) => void;
  onDelete: (point: TeachPoint) => void;
  bgColorAlpha: string;
}

export const TeachPointRow: React.FC<TeachPointRowProps> = ({
  point,
  isExpanded,
  onToggle,
  onMove,
  onEdit,
  onDelete,
  bgColorAlpha,
}) => {
  const getLocTypeDisplay = (locType: string) => {
    switch (locType) {
      case "j":
        return "Joint";
      default:
        return locType.toUpperCase();
    }
  };

  return (
    <>
      <Tr _hover={{ bg: bgColorAlpha }}>
        <Td padding="0" width="40px">
          <IconButton
            aria-label="Expand row"
            icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={onToggle}
            variant="ghost"
            size="sm"
          />
        </Td>
        <Td>{point.name}</Td>
        <Td>
          <Badge colorScheme={point.type === "location" ? "blue" : "green"}>{point.type}</Badge>
        </Td>
        <Td textAlign="right">
          <Menu>
            <MenuButton as={IconButton} aria-label="Actions" icon={<HamburgerIcon />} variant="ghost" size="sm" />
            <MenuList>
              <MenuItem onClick={() => onMove(point)}>Move To</MenuItem>
              <MenuItem onClick={() => onEdit(point)}>Edit</MenuItem>
              <MenuItem color="red.500" onClick={() => onDelete(point)}>Delete</MenuItem>
            </MenuList>
          </Menu>
        </Td>
      </Tr>
      {isExpanded && (
        <Tr bg={bgColorAlpha}>
          <Td colSpan={4}>
            <VStack align="start" spacing={2} p={2}>
              <HStack width="100%" justify="space-between">
                <Text fontWeight="bold">
                  Coordinates ({point.locType ? getLocTypeDisplay(point.locType) : "Unknown"})
                </Text>
                <Badge colorScheme="gray">{point.locType ? point.locType.toUpperCase() : "N/A"}</Badge>
              </HStack>
              <Text fontFamily="mono" fontSize="sm">
                {point.coordinate
                  ? point.coordinate.split(" ").map((coord, i) => (
                      <span key={i}>
                        {i > 0 && " | "}
                        {parseFloat(coord).toFixed(3)}
                      </span>
                    ))
                  : "No coordinates available"}
              </Text>
              {point.type === "nest" && (
                <>
                  <Text fontWeight="bold" mt={2}>Additional Properties</Text>
                  <HStack spacing={4}>
                    {point.orientation && (
                      <Badge colorScheme="purple">Orientation: {point.orientation}</Badge>
                    )}
                    {point.safe_loc && (
                      <Badge colorScheme="orange">Safe Location Name: {point.safe_loc}</Badge>
                    )}
                  </HStack>
                </>
              )}
            </VStack>
          </Td>
        </Tr>
      )}
    </>
  );
};