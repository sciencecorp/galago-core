import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import {
  Box,
  VStack,
  Flex,
  useColorModeValue,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  Icon,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  Input,
  Spacer,
} from "@chakra-ui/react";
import { NewToolModal } from "./NewToolModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchIcon, ToolsIcon } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

interface ToolStatusCardsProps {
  showAsGrid?: boolean;
}

export const ToolStatusCardsComponent: React.FC<ToolStatusCardsProps> = (props) => {
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery();
  const [toolIds, setToolIds] = useState<string[]>([]);
  const { data: selectedWorkcellData, refetch: refetchWorkcell } =
    trpc.workcell.getSelectedWorkcell.useQuery();
  const [selectedWorkcell, setSelectedWorkcell] = useState<string | null>(null);

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
    if (fetchedIds) {
      setToolIds(fetchedIds);
    }
  }, [fetchedIds]);

  useEffect(() => {
    if (selectedWorkcellData) {
      setSelectedWorkcell(selectedWorkcellData);
    }
  }, [selectedWorkcellData]);

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
                titleIcon={<Icon as={ToolsIcon} boxSize={8} color={accentColor} />}
                title="Tools"
                subTitle="Manage and monitor your connected tools"
                mainButton={
                  <NewToolModal isDisabled={selectedWorkcell === "" || selectedWorkcell === null} />
                }
              />
              <Divider borderColor={borderColor} />
              <StatGroup>
                <Stat>
                  <StatLabel color={textSecondary}>Total Tools</StatLabel>
                  <StatNumber color={textColor}>{toolIds.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color={textSecondary}>Selected Workcell</StatLabel>
                  <StatNumber fontSize={tokens.typography.fontSizes.lg} color={textColor}>
                    {selectedWorkcell || "None"}
                  </StatNumber>
                </Stat>
              </StatGroup>
              <Divider borderColor={borderColor} />
              <HStack spacing={tokens.spacing.md} width="100%">
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={SearchIcon} color={textSecondary} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search tools..."
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      setToolIds(
                        fetchedIds?.filter((id) => id.toLowerCase().includes(searchTerm)) || [],
                      );
                    }}
                    bg={headerBg}
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </InputGroup>
                <Spacer />
              </HStack>
            </VStack>
          </CardBody>
        </Card>
        <Card
          bg={headerBg}
          shadow={tokens.shadows.md}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}>
          <CardBody>
            <Flex
              wrap="wrap"
              justify="space-evenly"
              mt={tokens.spacing.md}
              align="stretch"
              gap={tokens.spacing.md}>
              {toolIds.map((toolId, index) => (
                <ToolStatusCard key={`${toolId}-${index}`} toolId={toolId} />
              ))}
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
