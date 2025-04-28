import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spinner,
  Text,
  Flex,
  useDisclosure,
  SimpleGrid,
  VStack,
  HStack,
  Divider,
  Tooltip,
  useColorModeValue,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { Nest, Plate, Reagent, Hotel } from "@/types/api";
import NestModal from "../modals/NestModal";
import { trpc } from "@/utils/trpc";
import { BsGrid3X3, BsBoxSeam } from "react-icons/bs";
import { FaFlask, FaHotel } from "react-icons/fa";
import { BiBuilding } from "react-icons/bi";
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
}) => {
  const { cardBg, borderColor } = useCommonColors();
  const { secondary: iconColor } = useTextColors();
  const statBg = useColorModeValue("gray.50", "gray.800");

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Get hotel data directly from the API and type it correctly
  const { data, isLoading, refetch } = trpc.inventory.getHotelById.useQuery(hotelId, {
    enabled: hotelId > 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Cast data to Hotel type
  const hotel = data as Hotel | undefined;

  // Filter nests that belong to this hotel
  const hotelNests = nests.filter((nest) => {
    return nest.hotel_id === hotelId;
  });

  // Also try to get nests from the hotel data if available
  const nestedHotelNests = hotel?.nests || [];

  // Use either the filtered nests or the nested nests from the hotel data, whichever has more
  const combinedNests =
    hotelNests.length >= nestedHotelNests.length ? hotelNests : nestedHotelNests;

  const hotelPlates = plates.filter((plate) =>
    combinedNests.some((nest) => nest.id === plate.nest_id),
  );

  // Calculate actual dimensions from existing nests
  const actualRows =
    combinedNests.length > 0 ? Math.max(...combinedNests.map((n) => n.row)) + 1 : 0;
  const actualColumns =
    combinedNests.length > 0 ? Math.max(...combinedNests.map((n) => n.column)) + 1 : 0;

  // Use either the hotel dimensions or calculated dimensions, whichever is larger
  const displayRows = Math.max(hotel?.rows || 0, actualRows);
  const displayColumns = Math.max(hotel?.columns || 0, actualColumns);

  // Refetch data when modal opens
  const handleOpen = () => {
    refetch();
    onOpen();
  };

  // Refetch when modal is closed
  useEffect(() => {
    if (!isOpen && hotel) {
      refetch();
    }
  }, [isOpen, hotelId, refetch]);

  return (
    <>
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        borderRadius="lg"
        onClick={handleOpen}
        transition="all 0.2s"
        cursor="pointer"
        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
        <CardHeader pb={4}>
          <VStack align="stretch" spacing={2}>
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Box boxSize="50px" display="flex" alignItems="center" justifyContent="center">
                  {!isLoading ? (
                    <Icon as={BiBuilding} boxSize="30px" color="teal.500" />
                  ) : (
                    <Spinner size="md" />
                  )}
                </Box>
                <Box>
                  <Heading size="md">{hotel?.name || "Hotel"}</Heading>
                </Box>
              </HStack>
              <HStack>
                <IconButton
                  icon={<RepeatIcon />}
                  aria-label="Refresh Hotel"
                  variant="ghost"
                  colorScheme="blue"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    refetch();
                  }}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label="Delete Hotel"
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHotel?.();
                  }}
                />
              </HStack>
            </Flex>
          </VStack>
        </CardHeader>

        <Divider />

        <CardBody pt={4}>
          <VStack align="stretch" spacing={4}>
            <SimpleGrid columns={3} spacing={2}>
              <Tooltip label="Total Nests" placement="top">
                <Box p={2} bg={statBg} borderRadius="md" textAlign="center">
                  <Icon as={BsGrid3X3} color={iconColor} mb={1} />
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
                  <Icon as={BsBoxSeam} color={iconColor} mb={1} />
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
                  <Icon as={FaFlask} color={iconColor} mb={1} />
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
      />
    </>
  );
};
