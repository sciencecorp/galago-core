import React, { useState, useEffect } from "react";
import {
  VStack,
  Box,
  HStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Icon,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Select,
  Spacer,
  Button,
  Tooltip,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { LabwareModal } from "./LabwareModal";
import { DeleteWithConfirmation } from "../ui/Delete";
import { EditableText } from "../ui/Form";
import { WellPlateIcon } from "../ui/Icons";
import { SearchIcon } from "@chakra-ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { Layers, Upload, Download } from "lucide-react";
import { successToast, errorToast } from "@/components/ui/Toast";
import { useLabwareIO } from "@/hooks/useLabwareIO";
import { useCommonColors } from "@/components/ui/Theme";
import { Labware } from "@/types";

export const LabwareComponent: React.FC = () => {
  const [labware, setLabware] = useState<Labware[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabwareId, setSelectedLabwareId] = useState<number | null>(null);
  const colors = useCommonColors();

  const { data: fetchedLabware, refetch } = trpc.labware.getAll.useQuery();
  const editLabware = trpc.labware.edit.useMutation();
  const deleteLabware = trpc.labware.delete.useMutation();
  const exportAllLabware = trpc.labware.exportAllConfig.useMutation();

  const { data: selectedWorkcell, refetch: refetchWorkcell } =
    trpc.workcell.getSelectedWorkcell.useQuery();

  const {
    fileInputRef,
    handleExportConfig,
    handleImportClick,
    handleFileChange,
    isImporting,
    isExporting,
  } = useLabwareIO(labware, refetch);

  useEffect(() => {
    if (fetchedLabware) {
      setLabware(fetchedLabware);
    }
  }, [fetchedLabware]);

  const handleDelete = async (labware: Labware) => {
    try {
      if (labware.id === undefined) {
        return;
      }
      await deleteLabware.mutateAsync(labware.id);
      refetch();
      successToast("Success", "Labware deleted successfully");
    } catch (error) {
      errorToast(
        "Error deleting labware",
        error instanceof Error ? error.message : "An error occurred",
      );
    }
  };

  const filteredLabware = labware?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleLabwareUpdate = async (editedLabware: Labware) => {
    try {
      await editLabware.mutateAsync(editedLabware);
      refetch();
    } catch (error) {
      errorToast(
        "Error updating labware",
        error instanceof Error ? error.message : "An error occurred",
      );
    }
  };

  const onExportConfig = async () => {
    if (!selectedLabwareId) {
      try {
        const allLabware = await exportAllLabware.mutateAsync();
        if (allLabware) {
          const dataStr = JSON.stringify(allLabware, null, 2);
          const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

          const exportFileDefaultName = `all-labware-${new Date().toISOString().split("T")[0]}.json`;
          const linkElement = document.createElement("a");
          linkElement.setAttribute("href", dataUri);
          linkElement.setAttribute("download", exportFileDefaultName);
          linkElement.click();

          successToast("Export Successful", "All labware configurations exported");
        }
      } catch (error) {
        errorToast(
          "Export Failed",
          error instanceof Error ? error.message : "Failed to export all labware",
        );
      }
      return;
    }

    const result = await handleExportConfig(selectedLabwareId);
    if (result.success) {
      successToast("Export Successful", result.message);
    } else {
      errorToast("Export Failed", result.message);
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

  const handleRowClick = (labware: Labware) => {
    if (selectedLabwareId === labware.id) {
      setSelectedLabwareId(null);
    } else {
      setSelectedLabwareId(labware.id || null);
    }
  };

  const totalLabware = labware.length;
  const hasLidCount = labware.filter((item) => item.hasLid).length;
  const avgRows = Math.round(
    labware.reduce((sum, item) => sum + item.numberOfRows, 0) / (labware.length || 1),
  );

  const importButton = (
    <Tooltip
      label={!selectedWorkcell ? "Create or Select a Workcell to import labware" : ""}
      placement="top"
      hasArrow>
      <Button
        size="sm"
        isDisabled={!selectedWorkcell}
        leftIcon={<Upload size={14} />}
        colorScheme="blue"
        variant="outline"
        onClick={handleImportClick}
        isLoading={isImporting}>
        Import
      </Button>
    </Tooltip>
  );

  // Create the Export button (regular size to match LabwareModal button)
  const exportButton = (
    <Tooltip
      label={!selectedWorkcell ? "Create or Select a Workcell to export labware" : ""}
      placement="top"
      hasArrow>
      <Button
        size="sm"
        isDisabled={!selectedWorkcell}
        leftIcon={<Download size={14} />}
        colorScheme="green"
        variant="outline"
        onClick={onExportConfig}
        isLoading={isExporting}>
        {selectedLabwareId ? "Export Selected" : "Export All"}
      </Button>
    </Tooltip>
  );

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={colors.headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Labware"
                subTitle="Manage and configure your labware definitions"
                titleIcon={<Icon as={Layers} boxSize={8} color="teal.500" />}
                // mainButton={importButton}
                // secondaryButton={exportButton}
                tertiaryButton={<LabwareModal isDisabled={!selectedWorkcell} />}
              />

              {/* Hidden file input for import */}
              <Input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                style={{ display: "none" }}
                accept=".json"
              />

              <Divider />

              <StatGroup>
                <Stat>
                  <StatLabel>Total Labware</StatLabel>
                  <StatNumber>{totalLabware}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>With Lids</StatLabel>
                  <StatNumber>{hasLidCount}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Avg. Rows</StatLabel>
                  <StatNumber>{avgRows}</StatNumber>
                </Stat>
                {selectedLabwareId && (
                  <Stat>
                    <StatLabel>Selected</StatLabel>
                    <StatNumber fontSize="lg">
                      {labware.find((item) => item.id === selectedLabwareId)?.name || "None"}
                    </StatNumber>
                  </Stat>
                )}
              </StatGroup>

              <Divider />

              <HStack spacing={4} width="100%">
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search labware..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={colors.inputBg}
                  />
                </InputGroup>

                <Select
                  placeholder="Filter by Size"
                  maxW="200px"
                  bg={colors.inputBg}
                  onChange={(e) => {
                    const [rows, cols] = e.target.value.split("x").map(Number);
                    setLabware(
                      fetchedLabware?.filter(
                        (item) =>
                          !e.target.value ||
                          (item.numberOfRows === rows && item.numberOfColumns === cols),
                      ) as Labware[],
                    );
                  }}>
                  <option value="2x3">6-well</option>
                  <option value="3x4">12-well</option>
                  <option value="4x6">24-well</option>
                  <option value="8x12">96-well</option>
                  <option value="16x24">384-well</option>
                </Select>

                <Select
                  placeholder="Filter by Lid"
                  maxW="200px"
                  bg={colors.inputBg}
                  onChange={(e) => {
                    const hasLid = e.target.value === "" ? null : e.target.value === "true";
                    setLabware(
                      fetchedLabware?.filter((item) => hasLid === null || item.hasLid === hasLid) ??
                        [],
                    );
                  }}>
                  <option value="true">With Lid</option>
                  <option value="false">Without Lid</option>
                </Select>

                <Spacer />
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={colors.headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th></Th>
                      <Th>Name</Th>
                      <Th>Desription</Th>
                      <Th>Rows</Th>
                      <Th>Cols</Th>
                      <Th>Z-Off</Th>
                      <Th>W</Th>
                      <Th>H</Th>
                      <Th>Lid On Offset</Th>
                      <Th>Lid Nest Offset</Th>
                      <Th>Stack H</Th>
                      <Th>Lid</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredLabware?.map((item) => (
                      <Tr
                        key={item.id}
                        _hover={{ bg: colors.hoverBg }}
                        onClick={() => handleRowClick(item)}
                        cursor="pointer"
                        bg={selectedLabwareId === item.id ? colors.selectedBg : undefined}>
                        <Td width="50px">
                          <WellPlateIcon rows={item.numberOfRows} columns={item.numberOfColumns} />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              value && (await handleLabwareUpdate({ ...item, name: value }));
                            }}
                            defaultValue={item.name}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              value && (await handleLabwareUpdate({ ...item, description: value }));
                            }}
                            defaultValue={item.description}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, numberOfRows: numValue }));
                            }}
                            defaultValue={item.numberOfRows.toString()}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({
                                  ...item,
                                  numberOfColumns: numValue,
                                }));
                            }}
                            defaultValue={item.numberOfColumns.toString()}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, zOffset: numValue }));
                            }}
                            defaultValue={item.zOffset.toString()}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, width: numValue }));
                            }}
                            defaultValue={item.width ? item.width.toString() : ""}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, height: numValue }));
                            }}
                            defaultValue={item?.height?.toString() || ""}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({
                                  ...item,
                                  plateLidOffset: numValue,
                                }));
                            }}
                            defaultValue={item?.plateLidOffset?.toString() || ""}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, lidOffset: numValue }));
                            }}
                            defaultValue={item?.lidOffset?.toString() || ""}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, stackHeight: numValue }));
                            }}
                            defaultValue={item?.stackHeight?.toString() || ""}
                          />
                        </Td>
                        <Td>
                          <Switch
                            isChecked={item?.hasLid || false}
                            onChange={async (e) => {
                              await handleLabwareUpdate({ ...item, hasLid: e.target.checked });
                            }}
                          />
                        </Td>
                        <Td>
                          <DeleteWithConfirmation
                            onDelete={() => handleDelete(item)}
                            label="labware"
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
