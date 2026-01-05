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
import { Nest, Plate } from "@/types/api";
import NestModal from "../modals/NestModal";
import { trpc } from "@/utils/trpc";
import { Grid3x3, Package, FlaskConical, Building } from "lucide-react";
import { Icon } from "@/components/ui/Icons";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";
import { DeleteIcon } from "@chakra-ui/icons";
import { successToast, errorToast } from "@/components/ui/Toast";

interface InventoryHotelCardProps {
  hotelId: number;
  nests: Nest[];
  plates: Plate[];
  onDeleteHotel?: () => void;
}

export const InventoryHotelCard: React.FC<InventoryHotelCardProps> = ({
  hotelId,
  nests,
  plates,
  onDeleteHotel,
}) => {
  const { cardBg, borderColor } = useCommonColors();
  const { secondary: iconColor } = useTextColors();
  const statBg = useColorModeValue("gray.50", "gray.800");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: hotel } = trpc.inventory.getHotelById.useQuery(hotelId);

  // Mutation hooks
  const utils = trpc.useContext();
  const createNestMutation = trpc.inventory.createNest.useMutation({
    onSuccess: () => {
      utils.inventory.getNests.invalidate();
      successToast("Success", "Nest created successfully");
    },
    onError: (error) => {
      errorToast("Error", error.message || "Failed to create nest");
    },
  });

  const deleteNestMutation = trpc.inventory.deleteNest.useMutation({
    onSuccess: () => {
      utils.inventory.getNests.invalidate();
      successToast("Success", "Nest deleted successfully");
    },
    onError: (error) => {
      errorToast("Error", error.message || "Failed to delete nest");
    },
  });

  const createPlateMutation = trpc.inventory.createPlate.useMutation({
    onSuccess: () => {
      utils.inventory.getPlates.invalidate();
      utils.inventory.getNests.invalidate();
      successToast("Success", "Plate created successfully");
    },
    onError: (error) => {
      errorToast("Error", error.message || "Failed to create plate");
    },
  });

  const updatePlateMutation = trpc.inventory.updatePlate.useMutation({
    onSuccess: () => {
      utils.inventory.getPlates.invalidate();
      successToast("Success", "Plate updated successfully");
    },
    onError: (error) => {
      errorToast("Error", error.message || "Failed to update plate");
    },
  });

  const deletePlateMutation = trpc.inventory.deletePlate.useMutation({
    onSuccess: () => {
      utils.inventory.getPlates.invalidate();
      utils.inventory.getNests.invalidate();
      successToast("Success", "Plate deleted successfully");
    },
    onError: (error) => {
      errorToast("Error", error.message || "Failed to delete plate");
    },
  });

  const hotelNests = nests.filter((nest) => nest.hotel_id === hotelId);
  const hotelPlates = plates.filter((plate) => hotelNests.some((nest) => nest.id === plate.nestId));

  useEffect(() => {
    // This is to handle the case when the hotel has been deleted
    if (hotel === null) {
      onClose();
    }
  }, [hotel, onClose]);

  // Handler functions for modal
  const handleCreateNest = async (row: number, column: number) => {
    await createNestMutation.mutateAsync({
      name: `Nest ${row + 1}-${column + 1}`,
      row,
      column,
      toolId: null,
      hotelId,
      status: "empty",
    });
  };

  const handleDeleteNest = async (nestId: number) => {
    await deleteNestMutation.mutateAsync(nestId);
  };

  const handleCreatePlate = async (params: {
    barcode: string;
    name: string;
    plateType: string;
    nestId: number;
  }) => {
    await createPlateMutation.mutateAsync({
      barcode: params.barcode,
      name: params.name,
      plateType: params.plateType,
      nestId: params.nestId,
      status: "stored",
    });
  };

  const handleUpdatePlate = async (
    plateId: number,
    params: {
      barcode?: string;
      name?: string;
      plateType?: string;
    },
  ) => {
    await updatePlateMutation.mutateAsync({
      id: plateId,
      ...params,
    });
  };

  const handleDeletePlate = async (plateId: number) => {
    await deletePlateMutation.mutateAsync(plateId);
  };

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
        containerName={hotel?.name || "Hotel"}
        containerType="hotel"
        containerId={hotelId}
        nests={hotelNests}
        plates={hotelPlates}
        onCreateNest={handleCreateNest}
        onDeleteNest={handleDeleteNest}
        onCreatePlate={handleCreatePlate}
        onUpdatePlate={handleUpdatePlate}
        onDeletePlate={handleDeletePlate}
      />
    </>
  );
};
