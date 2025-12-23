import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  useDisclosure,
  SimpleGrid,
  VStack,
  HStack,
  Divider,
  Tooltip,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import { Nest, Plate, Reagent } from "@/types/api";
import NestModal from "../modals/NestModal";
import { trpc } from "@/utils/trpc";
import { Grid3x3, Package, FlaskConical, Building } from "lucide-react";
import { Icon } from "@/components/ui/Icons";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";
import { DeleteIcon, RepeatIcon } from "@chakra-ui/icons";

interface InventoryHotelCardProps {
  hotelId: number;
  nests: Nest[];
  plates: Plate[];
  onCreateNest: (
    hotelId: number,
    nestName: string,
    nestRow: number,
    nestColumn: number,
  ) => Promise<void>;
  onCreatePlate: (
    nestId: number,
    plateData: { name: string; barcode: string; plate_type: string },
  ) => void;
  onCreateReagent: (nestId: number, reagentData: Omit<Reagent, "id" | "well_id">) => void;
  onNestClick: (nest: Nest) => void;
  onDeleteNest: (nestId: number) => Promise<void>;
  onPlateClick?: (plate: Plate) => void;
  onDeleteHotel?: () => void;
  onCheckIn?: (nestId: number, triggerToolCommand?: boolean) => void;
}

export const InventoryHotelCard: React.FC<InventoryHotelCardProps> = ({
  hotelId,
  nests,
  plates,
  onCreateNest,
  onCreatePlate,
  onCreateReagent,
  onNestClick,
  onDeleteNest,
  onPlateClick,
  onDeleteHotel,
  onCheckIn,
}) => {
  const { cardBg, borderColor } = useCommonColors();
  const { secondary: iconColor } = useTextColors();
  const statBg = useColorModeValue("gray.50", "gray.800");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: hotel } = trpc.inventory.getHotelById.useQuery(hotelId);

  const hotelNests = nests.filter((nest) => nest.hotel_id === hotelId);
  const hotelPlates = plates.filter((plate) =>
    hotelNests.some((nest) => nest.id === plate.nest_id),
  );

  useEffect(() => {
    // This is to handle the case when the hotel has been deleted
    if (hotel === null) {
      onClose();
    }
  }, [hotel, onClose]);

  // Generate the combined nests - actually present plus placeholders for empty spaces
  const combinedNests: Nest[] = [...hotelNests];

  // Add missing nests if needed (this helps render the grid properly)
  for (let row = 0; row < (hotel?.rows || 0); row++) {
    for (let col = 0; col < (hotel?.columns || 0); col++) {
      // Check if this position already has a nest
      const existingNest = hotelNests.find((n) => n.row === row && n.column === col);
      if (!existingNest) {
        // Create a placeholder nest for this position
        const placeholderNest: Nest = {
          id: -1 * (row * 100 + col), // Negative ID to indicate it's a placeholder
          name: `${hotel?.name || "Hotel"} R${row + 1}C${col + 1}`,
          row: row,
          column: col,
          hotel_id: hotelId,
          tool_id: undefined,
          status: "empty",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          current_plate_id: null,
        };
        combinedNests.push(placeholderNest);
      }
    }
  }

  return (
    <>
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        borderRadius="lg"
        transition="all 0.2s"
        cursor="pointer"
        onClick={onOpen}
        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
        <CardHeader pb={3}>
          <VStack align="stretch" spacing={2}>
            <HStack spacing={3} justify="space-between">
              <HStack spacing={3}>
                <Icon as={Building} boxSize={6} color="orange.400" />
                <Box>
                  <Heading size="md">{hotel?.name}</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Static Storage
                  </Text>
                </Box>
              </HStack>

              {onDeleteHotel && (
                <IconButton
                  aria-label="Delete hotel"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteHotel) onDeleteHotel();
                  }}
                />
              )}
            </HStack>
          </VStack>
        </CardHeader>

        <Divider />

        <CardBody pt={4}>
          <VStack align="stretch" spacing={4}>
            <SimpleGrid columns={3} spacing={2}>
              <Tooltip label="Total Nests" placement="top">
                <Box p={2} bg={statBg} borderRadius="md" textAlign="center">
                  <Icon as={Grid3x3} color={iconColor} mb={1} />
                  <Text fontWeight="bold" fontSize="md">
                    {hotelNests.length}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Nests
                  </Text>
                </Box>
              </Tooltip>

              <Tooltip label="Total Plates" placement="top">
                <Box p={2} bg={statBg} borderRadius="md" textAlign="center">
                  <Icon as={Package} color={iconColor} mb={1} />
                  <Text fontWeight="bold" fontSize="md">
                    {hotelPlates.length}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Plates
                  </Text>
                </Box>
              </Tooltip>

              <Tooltip label="Total Reagents" placement="top">
                <Box p={2} bg={statBg} borderRadius="md" textAlign="center">
                  <Icon as={FlaskConical} color={iconColor} mb={1} />
                  <Text fontWeight="bold" fontSize="md">
                    0
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Reagents
                  </Text>
                </Box>
              </Tooltip>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      <NestModal
        isOpen={isOpen}
        onClose={onClose}
        toolName={hotel?.name || "Hotel"}
        nests={combinedNests}
        plates={plates}
        selectedNests={[]}
        isMultiSelect={true}
        onNestSelect={(nestIds) => {
          nestIds.forEach((id) => {
            const nest = nests.find((n) => n.id === id);
            if (nest) onNestClick(nest);
          });
        }}
        onCreateNest={(row, column) => onCreateNest(hotelId, hotel?.name || "Hotel", row, column)}
        onDeleteNest={onDeleteNest}
        onPlateClick={onPlateClick}
        onCheckIn={onCheckIn}
        containerType="hotel"
        containerId={hotelId}
      />
    </>
  );
};
