import React, { useState, useEffect } from "react";
import {
  VStack,
  Box,
  HStack,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  InputRightElement,
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
  Text,
  Select,
  Spacer,
  Button,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Labware as LabwareResponse } from "@/types/api";
import { LabwareModal } from "./LabwareModal";
import { DeleteWithConfirmation } from "../ui/Delete";
import { EditableText } from "../ui/Form";
import { WellPlateIcon } from "../ui/Icons";
import { SearchIcon } from "@chakra-ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { HiOutlineRectangleStack } from "react-icons/hi2";
import { FaFileImport, FaFileExport } from "react-icons/fa";
import { successToast, errorToast, warningToast } from "@/components/ui/Toast";
import { useLabwareIO } from "@/hooks/useLabwareIO";
import { useCommonColors } from "@/components/ui/Theme";

export const Labware: React.FC = () => {
  const [labware, setLabware] = useState<LabwareResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabwareId, setSelectedLabwareId] = useState<number | null>(null);
  const colors = useCommonColors();

  const { data: fetchedLabware, refetch } = trpc.labware.getAll.useQuery();
  const editLabware = trpc.labware.edit.useMutation();
  const deleteLabware = trpc.labware.delete.useMutation();
  const exportAllLabware = trpc.labware.exportAllConfig.useMutation();

  // Use the custom hook for import/export
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
      setLabware(fetchedLabware as unknown as LabwareResponse[]);
    }
  }, [fetchedLabware]);

  const handleDelete = async (labware: LabwareResponse) => {
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

  const filteredLabware = labware?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleLabwareUpdate = async (editedLabware: LabwareResponse) => {
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

  // Wrapped handlers to add toast notifications for import/export
  const onExportConfig = async () => {
    if (!selectedLabwareId) {
      // Export all labware when no specific labware is selected
      try {
        const allLabware = await exportAllLabware.mutateAsync();
        if (allLabware) {
          // Create a download with a filename that indicates this is all labware
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

  // Handle row click to select labware
  const handleRowClick = (labware: LabwareResponse) => {
    if (selectedLabwareId === labware.id) {
      setSelectedLabwareId(null);
    } else {
      setSelectedLabwareId(labware.id || null);
    }
  };

  // Calculate stats
  const totalLabware = labware.length;
  const hasLidCount = labware.filter((item) => item.has_lid).length;
  const avgRows = Math.round(
    labware.reduce((sum, item) => sum + item.number_of_rows, 0) / (labware.length || 1),
  );

  // Create the Import button (regular size to match LabwareModal button)
  const importButton = (
    <Button
      leftIcon={<FaFileImport />}
      colorScheme="blue"
      variant="outline"
      onClick={handleImportClick}
      isLoading={isImporting}
      isDisabled={isImporting}>
      Import
    </Button>
  );

  // Create the Export button (regular size to match LabwareModal button)
  const exportButton = (
    <Button
      leftIcon={<FaFileExport />}
      colorScheme="green"
      variant="outline"
      onClick={onExportConfig}
      isDisabled={isExporting}
      isLoading={isExporting}>
      {selectedLabwareId ? "Export Selected" : "Export All"}
    </Button>
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
                titleIcon={<Icon as={HiOutlineRectangleStack} boxSize={8} color="teal.500" />}
                mainButton={importButton}
                secondaryButton={exportButton}
                tertiaryButton={<LabwareModal />}
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
                          (item.number_of_rows === rows && item.number_of_columns === cols),
                      ) as LabwareResponse[],
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
                      fetchedLabware?.filter(
                        (item) => hasLid === null || item.has_lid === hasLid,
                      ) as LabwareResponse[],
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
                <Table
                  variant="simple"
                  sx={{
                    th: {
                      borderColor: colors.borderColor,
                    },
                    td: {
                      borderColor: colors.borderColor,
                    },
                  }}>
                  <Thead>
                    <Tr>
                      <Th></Th>
                      <Th>Name</Th>
                      <Th>Desc</Th>
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
                          <WellPlateIcon
                            rows={item.number_of_rows}
                            columns={item.number_of_columns}
                          />
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
                                (await handleLabwareUpdate({ ...item, number_of_rows: numValue }));
                            }}
                            defaultValue={item.number_of_rows.toString()}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({
                                  ...item,
                                  number_of_columns: numValue,
                                }));
                            }}
                            defaultValue={item.number_of_columns.toString()}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, z_offset: numValue }));
                            }}
                            defaultValue={item.z_offset.toString()}
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
                            defaultValue={item.height.toString()}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({
                                  ...item,
                                  plate_lid_offset: numValue,
                                }));
                            }}
                            defaultValue={
                              item.plate_lid_offset ? item.plate_lid_offset.toString() : ""
                            }
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, lid_offset: numValue }));
                            }}
                            defaultValue={item.lid_offset ? item.lid_offset.toString() : ""}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, stack_height: numValue }));
                            }}
                            defaultValue={item.stack_height ? item.stack_height.toString() : ""}
                          />
                        </Td>
                        <Td>
                          <Switch
                            isChecked={item.has_lid}
                            onChange={async (e) => {
                              await handleLabwareUpdate({ ...item, has_lid: e.target.checked });
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
