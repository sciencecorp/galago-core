import React, { useState, useEffect, useMemo } from "react";
import {
  VStack,
  Box,
  Button,
  HStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  InputGroup,
  InputLeftElement,
  Text,
  Select,
  Card,
  CardBody,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Variable } from "@/types/api";
import { VariableModal } from "./VariableModal";
import { DeleteWithConfirmation } from "@/components/ui/Delete";
import { renderDatetime } from "@/components/ui/Time";
import { EditableText } from "../ui/Form";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon, SearchIcon, VariableIcon } from "../ui/Icons";
import { VscSymbolString } from "react-icons/vsc";
import { MdOutlineNumbers } from "react-icons/md";
import { VscSymbolBoolean } from "react-icons/vsc";
import { palette, semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

export const Variables: React.FC = () => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const toast = useToast();

  const headerBg = useColorModeValue(semantic.background.card.light, semantic.background.card.dark);
  const tableBgColor = useColorModeValue(
    semantic.background.card.light,
    semantic.background.card.dark,
  );
  const hoverBgColor = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );

  const { data: fetchedVariables, refetch } = trpc.variable.getAll.useQuery();
  const deleteVariable = trpc.variable.delete.useMutation();
  const editVariable = trpc.variable.edit.useMutation();

  useEffect(() => {
    if (fetchedVariables) {
      setVariables(fetchedVariables);
    }
  }, [fetchedVariables]);

  const handleDelete = async (variable: Variable) => {
    try {
      if (variable.id === undefined) {
        return;
      }
      await deleteVariable.mutateAsync(variable.id);
      refetch();
      toast({
        title: "Variable deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting variable",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Calculate statistics
  const totalVariables = variables?.length || 0;
  const typeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    variables?.forEach((variable) => {
      stats[variable.type] = (stats[variable.type] || 0) + 1;
    });
    return stats;
  }, [variables]);

  // Filter variables based on search and type
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
        return <VscSymbolString />;
      case "number":
        return <MdOutlineNumbers />;
      case "boolean":
        return <VscSymbolBoolean />;
      default:
        return null;
    }
  };

  const handleVariableUpdate = async (editedVariable: Variable) => {
    try {
      await editVariable.mutateAsync(editedVariable);
      refetch();
      toast({
        title: "Variable updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating variable",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="100%">
      <VStack spacing={tokens.spacing.md} align="stretch">
        <Card bg={headerBg} shadow={tokens.shadows.md}>
          <CardBody>
            <VStack spacing={tokens.spacing.md} align="stretch">
              <PageHeader
                title="Variables"
                subTitle="Manage system-wide variables and configurations"
                titleIcon={
                  <Icon as={VariableIcon} boxSize={8} color={semantic.text.accent.light} />
                }
                mainButton={<VariableModal />}
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

              <HStack spacing={tokens.spacing.md}>
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={SearchIcon} color={textSecondary} />
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

        <Card bg={headerBg} shadow={tokens.shadows.md}>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>Type</Th>
                    <Th>Name</Th>
                    <Th>Value</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredVariables?.map((variable) => (
                    <Tr key={variable.id} _hover={{ bg: hoverBgColor }}>
                      <Td>
                        <HStack spacing={tokens.spacing.xs}>
                          {renderTypeIcon(variable.type)}
                          <Text>{variable.type}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <EditableText
                          defaultValue={variable.name}
                          onSubmit={(value) => {
                            if (value && value !== variable.name) {
                              handleVariableUpdate({ ...variable, name: value });
                            }
                          }}
                        />
                      </Td>
                      <Td>
                        <EditableText
                          defaultValue={variable.value}
                          onSubmit={(value) => {
                            if (value !== undefined && value !== variable.value) {
                              handleVariableUpdate({ ...variable, value: value || "" });
                            }
                          }}
                        />
                      </Td>
                      <Td>{renderDatetime(String(variable.created_at))}</Td>
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
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
