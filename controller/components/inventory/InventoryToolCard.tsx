import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spinner,
  Text,
  Flex,
  Image,
  useDisclosure,
  IconButton,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Divider,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { Nest, Plate, Reagent } from "@/types/api";
import NestModal from "./NestModal";
import { trpc } from "@/utils/trpc";
import { Icon as UIIcon, InventoryIcons, SectionIcons, ToolIcons } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

interface InventoryToolCardProps {
  toolId: number;
  nests: Nest[];
  plates: Plate[];
  onCreateNest: (
    toolId: number,
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
}

export const InventoryToolCard: React.FC<InventoryToolCardProps> = ({
  toolId,
  nests,
  plates,
  onCreateNest,
  onCreatePlate,
  onCreateReagent,
  onNestClick,
  onDeleteNest,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardBg = useColorModeValue(
    semantic.background.card.light,
    semantic.background.primary.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.primary.light,
    semantic.border.primary.dark,
  );
  const iconColor = useColorModeValue(semantic.text.secondary.light, semantic.text.secondary.dark);
  const statBg = useColorModeValue(
    semantic.background.secondary.light,
    semantic.background.secondary.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const shadowColor = useColorModeValue(
    `${semantic.border.primary.light}40`,
    `${semantic.border.primary.dark}40`,
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const workcells = trpc.workcell.getAll.useQuery();
  const SelectedWorkcellName = trpc.workcell.getSelectedWorkcell.useQuery();
  const selectedWorkcell = workcells.data?.find(
    (workcell) => workcell.name === SelectedWorkcellName.data,
  );
  const workcellTools = selectedWorkcell?.tools;
  const toolData = workcellTools?.find((tool) => tool.id === toolId);
  const { name } = toolData || {};

  const toolNests = nests.filter((nest) => nest.name?.toString() === name?.toString());
  const toolPlates = plates.filter((plate) => toolNests.some((nest) => nest.id === plate.nest_id));

  // Get reagent count for this tool's plates
  const { data: plateReagents = [] } = trpc.inventory.getReagents.useQuery<Reagent[]>(
    toolPlates[0]?.id || 0,
    {
      enabled: toolPlates.length > 0,
    },
  );

  // Count reagents
  const reagentCount = (plateReagents as Reagent[]).length || 0;

  const renderToolImage = (config: any) => {
    if (!config?.image_url) {
      return <Box></Box>;
    } else if (config.name === "Tool Box") {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <UIIcon as={ToolIcons.Toolbox} boxSize="100px" color={accentColor} />
        </Box>
      );
    } else {
      return (
        <Image
          src={`/tool_icons/${config.type}.png`}
          alt={name}
          objectFit="contain"
          height="80px"
          width="80px"
          opacity={0.9}
        />
      );
    }
  };

  return (
    <>
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth={tokens.borders.widths.thin}
        height="280px"
        width="280px"
        borderRadius={tokens.borders.radii.lg}
        onClick={onOpen}
        transition="all 0.2s"
        cursor="pointer"
        _hover={{
          transform: "translateY(-5px)",
          boxShadow: `0 6px 12px ${shadowColor}`,
        }}
        boxShadow={`0 4px 8px ${shadowColor}`}>
        <CardHeader pb={tokens.spacing.md}>
          <VStack align="stretch" spacing={tokens.spacing.sm}>
            <Flex justify="space-between" align="center">
              <HStack spacing={tokens.spacing.sm}>
                <Box boxSize="50px" display="flex" alignItems="center" justifyContent="center">
                  {toolData ? renderToolImage(toolData) : <Spinner size="md" color={accentColor} />}
                </Box>
                <Box>
                  <Heading size="md" color={textColor}>
                    {name}
                  </Heading>
                  <Text fontSize={tokens.typography.fontSizes.sm} color={textSecondary}>
                    Inventory
                  </Text>
                </Box>
              </HStack>
            </Flex>
          </VStack>
        </CardHeader>

        <Divider borderColor={borderColor} />

        <CardBody pt={tokens.spacing.md}>
          <VStack align="stretch" spacing={tokens.spacing.md}>
            <SimpleGrid columns={3} spacing={tokens.spacing.sm}>
              <Tooltip label="Total Nests" placement="top">
                <Box
                  p={tokens.spacing.sm}
                  bg={statBg}
                  borderRadius={tokens.borders.radii.md}
                  textAlign="center">
                  <UIIcon as={InventoryIcons.Grid} color={iconColor} mb={1} />
                  <Text
                    fontWeight="bold"
                    fontSize={tokens.typography.fontSizes.md}
                    color={textColor}>
                    {toolNests.length}
                  </Text>
                  <Text fontSize={tokens.typography.fontSizes.xs} color={textSecondary}>
                    Nests
                  </Text>
                </Box>
              </Tooltip>

              <Tooltip label="Total Plates" placement="top">
                <Box
                  p={tokens.spacing.sm}
                  bg={statBg}
                  borderRadius={tokens.borders.radii.md}
                  textAlign="center">
                  <UIIcon as={SectionIcons.Inventory} color={iconColor} mb={1} />
                  <Text
                    fontWeight="bold"
                    fontSize={tokens.typography.fontSizes.md}
                    color={textColor}>
                    {toolPlates.length}
                  </Text>
                  <Text fontSize={tokens.typography.fontSizes.xs} color={textSecondary}>
                    Plates
                  </Text>
                </Box>
              </Tooltip>

              <Tooltip label="Total Reagents" placement="top">
                <Box
                  p={tokens.spacing.sm}
                  bg={statBg}
                  borderRadius={tokens.borders.radii.md}
                  textAlign="center">
                  <UIIcon as={InventoryIcons.Flask} color={iconColor} mb={1} />
                  <Text
                    fontWeight="bold"
                    fontSize={tokens.typography.fontSizes.md}
                    color={textColor}>
                    {reagentCount}
                  </Text>
                  <Text fontSize={tokens.typography.fontSizes.xs} color={textSecondary}>
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
        toolName={name || ""}
        nests={toolNests}
        plates={plates}
        onCreatePlate={(nestId, plateData) =>
          onCreatePlate(nestId, {
            ...plateData,
            plate_type: plateData.plateType,
          })
        }
        onDeleteNest={onDeleteNest}
        onCreateReagent={onCreateReagent}
        onNestClick={onNestClick}
        onCreateNest={(row, column) => onCreateNest(toolId, `${name}`, row, column)}
      />
    </>
  );
};
