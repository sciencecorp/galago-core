import React, { useState, useEffect } from "react";
import {
  VStack,
  Box,
  Button,
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
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  Select,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { trpc } from "@/utils/trpc";
import { Variable } from "@/types/api";
import { VariableModal } from "./VariableModal";
import { DeleteWithConfirmation } from "@/components/ui/Delete";
import { renderDatetime } from "@/components/ui/Time";
import { EditableText } from "../ui/Form";
import { VscSymbolString } from "react-icons/vsc";
import { MdOutlineNumbers } from "react-icons/md";
import { VscSymbolBoolean } from "react-icons/vsc";

export const Variables: React.FC = () => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const toast = useToast();

  const { data: fetchedVariables, refetch } = trpc.variable.getAll.useQuery();
  const editVariable = trpc.variable.edit.useMutation();
  const deleteVariable = trpc.variable.delete.useMutation();

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

  const filteredVariables = variables?.filter(
    (variable) =>
      variable.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (typeFilter === "" || variable.type === typeFilter),
  );

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "string":
        return <VscSymbolString />;
      case "number":
        return <MdOutlineNumbers />;
      case "boolean":
        return (
          <Box>
            <VscSymbolBoolean />
            <Text>{type}</Text>
          </Box>
        );
      default:
        return type;
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
    <Box flex={1}>
      <VStack align="stretch" spacing={6} width="100%">
        <HStack mt={2} mb={2} justify="space-between" width="100%">
          <Heading size="lg">Variables</Heading>
          <VariableModal />
        </HStack>
        <HStack spacing={4} width="100%">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search variables"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Select
            placeholder="Filter by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="array">Array</option>
            <option value="object">Object</option>
          </Select>
        </HStack>
        <Table variant="simple" width="100%">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Value</Th>
              <Th>Created On</Th>
              <Th>Updated On</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredVariables.map((variable) => (
              <Tr key={variable.id}>
                <Td>
                  <EditableText
                    onSubmit={async (value) => {
                      value && (await handleVariableUpdate({ ...variable, name: value }));
                    }}
                    defaultValue={variable.name}
                  />
                </Td>
                <Td>{variable.type}</Td>
                <Td>
                  <EditableText
                    onSubmit={async (value) => {
                      value && (await handleVariableUpdate({ ...variable, value: value }));
                    }}
                    defaultValue={variable.value}
                  />
                </Td>
                <Td>{renderDatetime(String(variable.created_at))}</Td>
                <Td>{renderDatetime(String(variable.updated_at))}</Td>
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
      </VStack>
    </Box>
  );
};
