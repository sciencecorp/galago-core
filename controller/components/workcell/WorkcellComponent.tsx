import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  useToast,
  Flex,
  Container,
  VStack,
  useColorModeValue,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { PageHeader } from "../ui/PageHeader";
import { NewWorkcellModal } from "./NewWorkcellModal";
import { trpc } from "@/utils/trpc";
import { Workcell } from "@/types/api";
import { WorkcellCard } from "./WorkcellCard";
import { Icon, SectionIcons } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

export const WorkcellComponent = () => {
  const toast = useToast();
  const { data: fetchedWorkcells, refetch } = trpc.workcell.getAll.useQuery();
  const [workcells, setWorkcells] = useState<Workcell[]>([]);
  const { data: selectedWorkcellId } = trpc.workcell.getSelectedWorkcell.useQuery();

  const containerBg = useColorModeValue(
    semantic.background.card.light,
    semantic.background.card.dark,
  );
  const headerBg = useColorModeValue(semantic.background.card.light, semantic.background.card.dark);
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);

  useEffect(() => {
    if (fetchedWorkcells) {
      setWorkcells(fetchedWorkcells);
    }
  }, [fetchedWorkcells]);

  const getActiveWorkcells = () => {
    return workcells.filter((w) => selectedWorkcellId && w.id.toString() === selectedWorkcellId)
      .length;
  };

  return (
    <Box maxW="100%">
      <VStack spacing={tokens.spacing.md} align="stretch">
        <Card
          bg={headerBg}
          shadow={tokens.shadows.md}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}>
          <CardBody>
            <VStack spacing={tokens.spacing.md} align="stretch">
              <PageHeader
                title="Workcells"
                subTitle="Manage and configure your workcells"
                mainButton={<NewWorkcellModal />}
                titleIcon={<Icon as={SectionIcons.Workcell} boxSize={8} color={accentColor} />}
              />

              <Divider borderColor={borderColor} />

              <StatGroup>
                <Stat>
                  <StatLabel color={textSecondary}>Total Workcells</StatLabel>
                  <StatNumber color={textColor}>{workcells.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color={textSecondary}>Active Workcell</StatLabel>
                  <StatNumber fontSize={tokens.typography.fontSizes.lg} color={textColor}>
                    {selectedWorkcellId || "None"}
                  </StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>

        <Card
          bg={headerBg}
          shadow={tokens.shadows.md}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}>
          <CardBody>
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
              spacing={tokens.spacing.lg}
              w="100%"
              alignItems="start">
              {workcells.map((workcell) => (
                <WorkcellCard key={workcell.id} onChange={refetch} workcell={workcell} />
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
