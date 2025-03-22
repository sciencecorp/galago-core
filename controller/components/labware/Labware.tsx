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
import { EditableText } from "../ui/Form";
import { Icon, WellPlateIcon, SearchIcon, RectangleStackIcon } from "../ui/Icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { palette, semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

export const Labware: React.FC = () => {
  const [labware, setLabware] = useState<LabwareResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  const headerBg = useColorModeValue(semantic.background.card.light, semantic.background.card.dark);
  const containerBg = useColorModeValue(
    semantic.background.card.light,
    semantic.background.card.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const tableBgColor = useColorModeValue(
    semantic.background.card.light,
    semantic.background.card.dark,
  );
  const hoverBgColor = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);

  const { data: fetchedLabware, refetch } = trpc.labware.getAll.useQuery();
  const deleteLabware = trpc.labware.delete.useMutation();
  const editLabware = trpc.labware.edit.useMutation();

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
  const hasLidCount = labware.filter((item) => item.has_lid).length;
  const avgRows = Math.round(
    labware.reduce((sum, item) => sum + item.number_of_rows, 0) / (labware.length || 1),
  );

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
                title="Labware"
                subTitle="Manage and configure your labware definitions"
                titleIcon={<Icon as={RectangleStackIcon} boxSize={8} color={accentColor} />}
                mainButton={<LabwareModal />}
              />

              <Divider borderColor={borderColor} />

              <StatGroup>
                <Stat>
                  <StatLabel color={textSecondary}>Total Labware</StatLabel>
                  <StatNumber color={textColor}>{totalLabware}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color={textSecondary}>With Lids</StatLabel>
                  <StatNumber color={textColor}>{hasLidCount}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color={textSecondary}>Avg. Rows</StatLabel>
                  <StatNumber color={textColor}>{avgRows}</StatNumber>
                </Stat>
              </StatGroup>

              <Divider borderColor={borderColor} />

              <HStack spacing={tokens.spacing.md}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={SearchIcon} color={textSecondary} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search labware..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={tableBgColor}
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
            <Box overflowX="auto">
              <Table
                variant="simple"
                size="md"
                sx={{
                  th: {
                    borderColor: borderColor,
                    color: textSecondary,
                    fontSize: tokens.typography.fontSizes.sm,
                  },
                  td: {
                    borderColor: borderColor,
                    color: textColor,
                    fontSize: tokens.typography.fontSizes.sm,
                  },
                }}>
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Rows</Th>
                    <Th>Columns</Th>
                    <Th>Has Lid</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {labware
                    .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item) => (
                      <Tr key={item.id} _hover={{ bg: hoverBgColor }}>
                        <Td>
                          <EditableText
                            defaultValue={item.name}
                            onSubmit={(value) => {
                              if (value && value !== item.name) {
                                handleLabwareUpdate({ ...item, name: value });
                              }
                            }}
                          />
                        </Td>
                        <Td>
                          <EditableText
                            defaultValue={item.description || ""}
                            onSubmit={(value) => {
                              handleLabwareUpdate({ ...item, description: value || "" });
                            }}
                          />
                        </Td>
                        <Td>{item.number_of_rows}</Td>
                        <Td>{item.number_of_columns}</Td>
                        <Td>
                          <Switch
                            isChecked={item.has_lid}
                            onChange={(e) => {
                              handleLabwareUpdate({
                                ...item,
                                has_lid: e.target.checked,
                              });
                            }}
                            colorScheme="teal"
                            sx={{
                              "& .chakra-switch__track[data-checked]": {
                                backgroundColor: accentColor,
                              },
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
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
