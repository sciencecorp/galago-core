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
  useToast,
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
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Labware as LabwareResponse } from "@/types/api";
import { LabwareModal } from "./LabwareModal";
import { DeleteWithConfirmation } from "../ui/Delete";
import { renderDatetime } from "../ui/Time";
import { EditableText } from "../ui/Form";
import { WellPlateIcon } from "../ui/Icons";
import { SearchIcon } from "@chakra-ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { BsGrid3X3 } from "react-icons/bs";

export const Labware: React.FC = () => {
  const [labware, setLabware] = useState<LabwareResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  const headerBg = useColorModeValue("white", "gray.700");
  const containerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableBgColor = useColorModeValue("white", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.600");

  const { data: fetchedLabware, refetch } = trpc.labware.getAll.useQuery();
  const editLabware = trpc.labware.edit.useMutation();
  const deleteLabware = trpc.labware.delete.useMutation();

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
      toast({
        title: "Labware deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting labware",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredLabware = labware?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleLabwareUpdate = async (editedLabware: LabwareResponse) => {
    try {
      await editLabware.mutateAsync(editedLabware);
      refetch();
      toast({
        title: "Labware updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating labware",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Calculate stats
  const totalLabware = labware.length;
  const hasLidCount = labware.filter(item => item.has_lid).length;
  const avgRows = Math.round(labware.reduce((sum, item) => sum + item.number_of_rows, 0) / (labware.length || 1));

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Labware"
                subTitle="Manage and configure your labware definitions"
                titleIcon={<Icon as={BsGrid3X3} boxSize={8} color="teal.500" />}
                mainButton={<LabwareModal />}
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
                    bg={tableBgColor}
                  />
                </InputGroup>

                <Select
                  placeholder="Filter by Size"
                  maxW="200px"
                  bg={tableBgColor}
                  onChange={(e) => {
                    const [rows, cols] = e.target.value.split('x').map(Number);
                    setLabware(fetchedLabware?.filter(item => 
                      !e.target.value || (item.number_of_rows === rows && item.number_of_columns === cols)
                    ) as LabwareResponse[]);
                  }}
                >
                  <option value="2x3">6-well</option>
                  <option value="3x4">12-well</option>
                  <option value="4x6">24-well</option>
                  <option value="8x12">96-well</option>
                  <option value="16x24">384-well</option>
                </Select>

                <Select
                  placeholder="Filter by Lid"
                  maxW="200px"
                  bg={tableBgColor}
                  onChange={(e) => {
                    const hasLid = e.target.value === "" ? null : e.target.value === "true";
                    setLabware(fetchedLabware?.filter(item => 
                      hasLid === null || item.has_lid === hasLid
                    ) as LabwareResponse[]);
                  }}
                >
                  <option value="true">With Lid</option>
                  <option value="false">Without Lid</option>
                </Select>

                <Spacer />
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box overflowX="auto">
                <Table variant="simple">
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
                      <Th>Lid Z</Th>
                      <Th>Lid Off</Th>
                      <Th>Stack H</Th>
                      <Th>Lid</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredLabware?.map((item) => (
                      <Tr key={item.id} _hover={{ bg: hoverBgColor }}>
                        <Td width="50px">
                          <WellPlateIcon rows={item.number_of_rows} columns={item.number_of_columns} />
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
                                (await handleLabwareUpdate({ ...item, number_of_columns: numValue }));
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
                              !isNaN(numValue) && (await handleLabwareUpdate({ ...item, width: numValue }));
                            }}
                            defaultValue={item.width.toString()}
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
                                (await handleLabwareUpdate({ ...item, plate_lid_offset: numValue }));
                            }}
                            defaultValue={item.plate_lid_offset.toString()}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, lid_offset: numValue }));
                            }}
                            defaultValue={item.lid_offset.toString()}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={async (value) => {
                              const numValue = Number(value);
                              !isNaN(numValue) &&
                                (await handleLabwareUpdate({ ...item, stack_height: numValue }));
                            }}
                            defaultValue={item.stack_height.toString()}
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
                          <DeleteWithConfirmation onDelete={() => handleDelete(item)} label="labware" />
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
