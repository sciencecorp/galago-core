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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { trpc } from "@/utils/trpc";
import { Variable } from "./types";
import { VariableModal } from "./VariableModal";
import { DeleteWithConfirmation } from "../ui/Delete";
import { renderDatetime } from "@/components/ui/Time";
import { ToolType } from "gen-interfaces/controller";

export const Variables: React.FC = () => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [typeFilter, setTypeFilter] = useState<string>(""); // State for type filter
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const { data: fetchedVariables, refetch } = trpc.variable.getAll.useQuery();
  const addVariable = trpc.variable.add.useMutation();
  const editVariable = trpc.variable.edit.useMutation();
  const deleteVariable = trpc.variable.delete.useMutation();
  const getVariable = trpc.variable.get.useMutation();

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

  return (
    <HStack align="start" spacing={8}>
      <Box flex={1}>
        <VStack align="stretch" spacing={6}>
          <Heading size="lg">Variables</Heading>
          <HStack spacing={4}>
            <Input
              placeholder="Search variables"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Value</Th>
                <Th>Type</Th>
                <Th>Created On</Th>
                <Th>Updated On</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredVariables.map((variable) => (
                <Tr key={variable.id}>
                  <Td>{variable.name}</Td>
                  <Td>{variable.value}</Td>
                  <Td>{variable.type}</Td>
                  <Td>{renderDatetime(variable.created_at)}</Td>
                  <Td>{renderDatetime(variable.updated_at)}</Td>
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
      <VariableModal />
    </HStack>
  );
};
