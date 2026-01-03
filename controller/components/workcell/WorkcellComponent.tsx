import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
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
  Input,
} from "@chakra-ui/react";
import { PageHeader } from "../ui/PageHeader";
import { NewWorkcellModal } from "./NewWorkcellModal";
import { trpc } from "@/utils/trpc";
import { WorkcellResponse } from "@/types";
import { WorkcellCard } from "./WorkcellCard";
import { Upload, Download } from "lucide-react";
import { useWorkcellIO } from "@/hooks/useWorkcellIO";
import { successToast, warningToast, errorToast } from "@/components/ui/Toast";
import { WorkcellIcon } from "@/components/ui/Icons";
import { EmptyState } from "../ui/EmptyState";

export const WorkcellComponent = () => {
  const { data: workcells, refetch } = trpc.workcell.getAll.useQuery();
  const { data: selectedWorkcellName, refetch: refetchSelected } =
    trpc.workcell.getSelectedWorkcell.useQuery();

  const headerBg = useColorModeValue("white", "gray.700");
  console.log("Workcells", workcells);
  const {
    fileInputRef,
    handleExportConfig,
    handleImportClick,
    handleFileChange,
    isImporting,
    isExporting,
  } = useWorkcellIO(
    workcells as WorkcellResponse[],
    selectedWorkcellName,
    refetch,
    refetchSelected,
  );

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

  const importButton = (
    <Button
      size="sm"
      leftIcon={<Upload size={16} />}
      colorScheme="blue"
      variant="outline"
      onClick={handleImportClick}
      isLoading={isImporting}
      isDisabled={isImporting}>
      Import
    </Button>
  );

  const exportButton = (
    <Button
      size="sm"
      leftIcon={<Download size={16} />}
      colorScheme="green"
      variant="outline"
      onClick={onExportConfig}
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
                titleIcon={<Icon as={WorkcellIcon} boxSize={8} color="teal.500" />}
                mainButton={importButton}
                secondaryButton={exportButton}
                tertiaryButton={<NewWorkcellModal />}
              />
              <Divider />

              <StatGroup>
                <Stat>
                  <StatLabel>Total Workcells</StatLabel>
                  <StatNumber>{workcells?.length}</StatNumber>
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
          onChange={onFileChange}
          style={{ display: "none" }}
          accept=".json"
        />

        <Card bg={headerBg} shadow="md">
          <CardBody>
            {!workcells ? (
              <EmptyState
                title="No Workcells"
                description="Create a new workcell to get started."
              />
            ) : (
              <SimpleGrid
                columns={{ base: 1, md: 1, lg: 2, xl: 3 }}
                spacing={10}
                w="100%"
                alignItems="stretch">
                {workcells.map((workcell) => (
                  <WorkcellCard
                    key={workcell.id}
                    onChange={refetch}
                    workcell={workcell as WorkcellResponse}
                  />
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
