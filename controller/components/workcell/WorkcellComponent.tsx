import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
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
import { useWorkcellIO } from "@/hooks/useWorkcellIO";
import { successToast, warningToast, errorToast } from "@/components/ui/Toast";

export const WorkcellComponent = () => {
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
  } = useWorkcellIO(workcells, selectedWorkcellName, refetch, refetchSelected);

  // Wrapped handlers to add toast notifications
  const onExportConfig = async () => {
    const result = await handleExportConfig();
    if (result.success) {
      successToast("Export Successful", result.message);
    } else {
      if (result.message.includes("Please select")) {
        warningToast("No Workcell Selected", result.message);
      } else {
        errorToast("Export Failed", result.message);
      }
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const result = await handleFileChange(event);
    if (result?.success) {
      successToast("Import Successful", result.message);
    } else if (result) {
      errorToast("Import Failed", result.message);
    }
  };

  useEffect(() => {
    if (fetchedWorkcells) {
      setWorkcells(fetchedWorkcells);
    }
  }, [fetchedWorkcells]);

  const getActiveWorkcells = () => {
    return workcells.filter(
      (w) => selectedWorkcellName && w.name === selectedWorkcellName,
    ).length;
  };

  // Create the Import button (regular size to match NewWorkcellModal button)
  const importButton = (
    <Button
      leftIcon={<FaFileImport />}
      colorScheme="blue"
      variant="outline"
      onClick={handleImportClick}
      isLoading={isImporting}
      isDisabled={isImporting}
    >
      Import
    </Button>
  );

  // Create the Export button (regular size to match NewWorkcellModal button)
  const exportButton = (
    <Button
      leftIcon={<FaFileExport />}
      colorScheme="green"
      variant="outline"
      onClick={onExportConfig}
      isDisabled={!selectedWorkcellName || isExporting}
      isLoading={isExporting}
    >
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
                titleIcon={
                  <Icon as={GiChaingun} boxSize={8} color="teal.500" />
                }
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
                  <StatNumber fontSize="lg">
                    {selectedWorkcellName || "None"}
                  </StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>

        {/* Hidden file input for import */}
        <Input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          style={{ display: "none" }}
          accept=".json"
        />

        <Card bg={headerBg} shadow="md">
          <CardBody>
            <SimpleGrid
              columns={{ base: 1, md: 1, lg: 2, xl: 3 }}
              spacing={10}
              w="100%"
              alignItems="stretch"
            >
              {workcells.map((workcell) => (
                <WorkcellCard
                  key={workcell.id}
                  onChange={refetch}
                  workcell={workcell}
                />
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
