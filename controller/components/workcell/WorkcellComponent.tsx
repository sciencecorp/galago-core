import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  useToast,
  Flex,
  Container,
  VStack,
  useColorModeValue,
  Icon,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Card,
  CardBody,
  HStack,
  Input,
} from "@chakra-ui/react";
import { PageHeader } from "../ui/PageHeader";
import { NewWorkcellModal } from "./NewWorkcellModal";
import { trpc } from "@/utils/trpc";
import { Workcell } from "@/types/api";
import { WorkcellCard } from "./WorkcellCard";
import { GiChaingun } from "react-icons/gi";
import { FaFileImport, FaFileExport } from "react-icons/fa";
import { useWorkcellImportExport } from "@/hooks/useWorkcellImportExport";

export const WorkcellComponent = () => {
  const toast = useToast();
  const { data: fetchedWorkcells, refetch } = trpc.workcell.getAll.useQuery();
  const [workcells, setWorkcells] = useState<Workcell[]>([]);
  const { data: selectedWorkcellName, refetch: refetchSelected } =
    trpc.workcell.getSelectedWorkcell.useQuery();

  const containerBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Use the custom hook for import/export
  const {
    fileInputRef,
    handleExportConfig,
    handleImportClick,
    handleFileChange,
    isImporting,
    isExporting,
  } = useWorkcellImportExport(workcells, selectedWorkcellName, refetch, refetchSelected);

  useEffect(() => {
    if (fetchedWorkcells) {
      setWorkcells(fetchedWorkcells);
    }
  }, [fetchedWorkcells]);

  const getActiveWorkcells = () => {
    return workcells.filter((w) => selectedWorkcellName && w.name === selectedWorkcellName).length;
  };

  // Create the Import button (regular size to match NewWorkcellModal button)
  const importButton = (
    <Button
      leftIcon={<FaFileImport />}
      colorScheme="blue"
      variant="outline"
      onClick={handleImportClick}
      isLoading={isImporting}
      isDisabled={isImporting}>
      {selectedWorkcellName ? "Import into Selected" : "Import New"}
    </Button>
  );

  // Create the Export button (regular size to match NewWorkcellModal button)
  const exportButton = (
    <Button
      leftIcon={<FaFileExport />}
      colorScheme="green"
      variant="outline"
      onClick={handleExportConfig}
      isDisabled={!selectedWorkcellName || isExporting}
      isLoading={isExporting}>
      Export
    </Button>
  );

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Workcells"
                subTitle="Manage and configure your workcells"
                titleIcon={<Icon as={GiChaingun} boxSize={8} color="teal.500" />}
                mainButton={importButton}
                secondaryButton={exportButton}
                tertiaryButton={<NewWorkcellModal />}
              />

              <Divider />

              <StatGroup>
                <Stat>
                  <StatLabel>Total Workcells</StatLabel>
                  <StatNumber>{workcells.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Active Workcell</StatLabel>
                  <StatNumber fontSize="lg">{selectedWorkcellName || "None"}</StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>

        {/* Hidden file input for import */}
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept=".json"
        />

        <Card bg={headerBg} shadow="md">
          <CardBody>
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
              spacing={6}
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
