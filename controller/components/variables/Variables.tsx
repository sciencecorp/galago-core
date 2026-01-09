import React, { useState, useEffect, useMemo } from "react";
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
  InputGroup,
  InputLeftElement,
  Text,
  Select,
  Card,
  CardBody,
  Icon,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { trpc } from "@/utils/trpc";
import { VariableModal } from "./VariableModal";
import { DeleteWithConfirmation } from "@/components/ui/Delete";
import { renderDatetime } from "@/components/ui/Time";
import { EditableText } from "../ui/Form";
import { Type, Hash, ToggleLeft, Variable as TbVariable, Braces, Brackets } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { successToast, errorToast } from "../ui/Toast";
import { EmptyState } from "../ui/EmptyState";
import { truncateText } from "../utils";
import { Variable } from "@/types";

export const Variables: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const headerBg = useColorModeValue("white", "gray.700");
  const tableBgColor = useColorModeValue("white", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.600");

  const { data: variables, refetch } = trpc.variable.getAll.useQuery();
  const editVariable = trpc.variable.edit.useMutation();
  const deleteVariable = trpc.variable.delete.useMutation();
  const { data: selectedWorkcell, refetch: refetchWorkcell } =
    trpc.workcell.getSelectedWorkcell.useQuery();

  const handleDelete = async (variable: Variable) => {
    try {
      if (variable.id === undefined) {
        return;
      }
      await deleteVariable.mutateAsync(variable.id);
      refetch();
      successToast("Variable deleted successfully", "");
    } catch (error) {
      errorToast("Error deleting variable", `Please try again. ${error}`);
    }
  };

  const totalVariables = variables?.length;
  const typeStats = useMemo(() => {
    if (!variables) return {};
    const stats = variables.reduce(
      (acc, variable) => {
        acc[variable.type] = (acc[variable.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return stats;
  }, [variables]);
  const filteredVariables = useMemo(() => {
    return variables?.filter(
      (variable) =>
        variable.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (typeFilter === "" || variable.type === typeFilter),
    );
  }, [variables, searchQuery, typeFilter]);

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "string":
        return <Type size={16} />;
      case "number":
        return <Hash size={16} />;
      case "boolean":
        return <ToggleLeft size={16} />;
      case "array":
        return <Brackets size={16} />;
      case "json":
        return <Braces size={16} />;
      default:
        return null;
    }
  };

  const handleVariableUpdate = async (editedVariable: Variable) => {
    try {
      await editVariable.mutateAsync(editedVariable);
      refetch();
      successToast("Variable updated successfully", "");
    } catch (error) {
      errorToast("Error updating variable", `Please try again. ${error}`);
    }
  };

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Variables"
                subTitle="Manage system-wide variables and configurations"
                titleIcon={<Icon as={TbVariable} boxSize={8} color="teal.500" />}
                mainButton={<VariableModal isDisabled={!selectedWorkcell} />}
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Variables</StatLabel>
                  <StatNumber>{totalVariables}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>String Variables</StatLabel>
                  <StatNumber>{typeStats.string || 0}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Number Variables</StatLabel>
                  <StatNumber>{typeStats.number || 0}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Boolean Variables</StatLabel>
                  <StatNumber>{typeStats.boolean || 0}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Array Variables</StatLabel>
                  <StatNumber>{typeStats.array || 0}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Object Variables</StatLabel>
                  <StatNumber>{typeStats.object || 0}</StatNumber>
                </Stat>
              </StatGroup>

              <Divider />

              <HStack spacing={4}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search variables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={tableBgColor}
                  />
                </InputGroup>
                <Select
                  placeholder="All Types"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  maxW="200px"
                  bg={tableBgColor}>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="array">Array</option>
                  <option value="object">Object</option>
                </Select>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              {filteredVariables?.length === 0 ? (
                <>
                  <EmptyState
                    title="No Variables Found"
                    description="Create a new variable to get started."
                  />
                </>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Type</Th>
                        <Th>Value</Th>
                        <Th>Created On</Th>
                        <Th>Updated On</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredVariables?.map((variable) => (
                        <Tr key={variable.id} _hover={{ bg: hoverBgColor }}>
                          <Td>
                            <EditableText
                              onSubmit={async (value) => {
                                value && (await handleVariableUpdate({ ...variable, name: value }));
                              }}
                              defaultValue={variable.name}
                            />
                          </Td>
                          <Td>
                            <HStack>
                              {renderTypeIcon(variable.type)}
                              <Text>{variable.type}</Text>
                            </HStack>
                          </Td>
                          <Td maxWidth="300px">
                            <EditableText
                              onSubmit={async (value) => {
                                value &&
                                  (await handleVariableUpdate({ ...variable, value: value }));
                              }}
                              defaultValue={variable.value}
                              displayValue={truncateText(variable.value, 60)}
                            />
                          </Td>
                          <Td>{renderDatetime(String(variable.createdAt))}</Td>
                          <Td>{renderDatetime(String(variable.updatedAt))}</Td>
                          <Td>
                            <DeleteWithConfirmation
                              onDelete={() => handleDelete(variable)}
                              label="variable"
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
