import {
  Tr,
  Td,
  IconButton,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Th,
} from "@chakra-ui/react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import { Tool } from "@/types/api";
import { TeachPoint } from "../../types";

interface TeachPointRowProps {
  point: TeachPoint;
  config: Tool;
  isExpanded: boolean;
  onToggle: () => void;
  onMove: (point: TeachPoint, action?: "approach" | "leave") => void;
  onEdit: (point: TeachPoint) => void;
  onDelete: (point: TeachPoint) => void;
  bgColorAlpha: string;
}

export const TeachPointRow: React.FC<TeachPointRowProps> = ({
  point,
  config,
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
          <Badge colorScheme={point.type === "location" ? "blue" : "green"}>
            {point.type}
          </Badge>
        </Td>
        <Td textAlign="right">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Actions"
              icon={<HamburgerIcon />}
              variant="ghost"
              size="sm"
            />
            <MenuList bg={bgColorAlpha}>
              <MenuItem onClick={() => onMove(point)}>Move To</MenuItem>
              <MenuItem onClick={() => onEdit(point)}>Edit</MenuItem>
              <MenuItem color="red.500" onClick={() => onDelete(point)}>
                Delete
              </MenuItem>
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
                  Coordinates (
                  {point.locType ? getLocTypeDisplay(point.locType) : "Unknown"}
                  )
                </Text>
                <Badge colorScheme="gray">
                  {point.locType ? point.locType.toUpperCase() : "N/A"}
                </Badge>
              </HStack>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    {Array.from(
                      {
                        length: parseInt(
                          (config.config as any)?.pf400?.joints || "5"
                        ),
                      },
                      (_, i) => (
                        <Th key={`j${i + 1}`}>J{i + 1}</Th>
                      )
                    )}
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    {point.coordinates ? (
                      point.coordinates
                        .split(" ")
                        .map((coord: string, i: number) => (
                          <Td key={i} fontFamily="mono">
                            {parseFloat(coord).toFixed(3)}
                          </Td>
                        ))
                    ) : (
                      <Td
                        colSpan={parseInt(
                          (config.config as any)?.pf400?.joints || "5"
                        )}
                      >
                        No coordinates available
                      </Td>
                    )}
                  </Tr>
                </Tbody>
              </Table>
            </VStack>
          </Td>
        </Tr>
      )}
    </>
  );
};
