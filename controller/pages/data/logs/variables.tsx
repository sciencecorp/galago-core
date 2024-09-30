import React, { useState, useEffect } from 'react';
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
  Select
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import DataSideBar from "@/components/data/DataSideBar";

interface Variable {
  id: string;
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
}

interface VariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  variable: Variable | null;
  onSave: (variable: Omit<Variable, 'id'>) => Promise<boolean>;
}

const VariableModal: React.FC<VariableModalProps> = ({ isOpen, onClose, variable, onSave }) => {
  const [name, setName] = useState(variable?.name || '');
  const [value, setValue] = useState(variable?.value || '');
  const [type, setType] = useState(variable?.type || 'string');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (variable) {
      setName(variable.name);
      setValue(variable.value);
      setType(variable.type);
    } else {
      setName('');
      setValue('');
      setType('string');
    }
  }, [variable]);

  const handleSave = async () => {
    setIsLoading(true);
    const success = await onSave({ name, value, type: type as Variable['type'] });
    setIsLoading(false);
    if (success) {
      onClose();
    } else {
      toast({
        title: "Error saving variable",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }; 

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{variable ? 'Edit Variable' : 'Create Variable'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Value</FormLabel>
              <Input value={value} onChange={(e) => setValue(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select value={type} onChange={(e) => setType(e.target.value as Variable['type'])}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave} isLoading={isLoading}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Variables: React.FC = () => {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [typeFilter, setTypeFilter] = useState<string>(''); // State for type filter
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchVariables();
  }, []);

  const fetchVariables = async () => {
    try {
      const response = await fetch('/api/variables');
      if (!response.ok) {
        throw new Error('Failed to fetch variables');
      }
      const data: Variable[] = await response.json();
      setVariables(data);
    } catch (error) {
      console.error('Error fetching variables:', error);
      toast({
        title: "Error fetching variables",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateOrUpdate = async (variable: Omit<Variable, 'id'>): Promise<boolean> => {
    try {
      const baseUrl = 'http://localhost:3000'; // Set your new base URL here
      const url = selectedVariable ? `/api/variables/${selectedVariable.id}` : `/api/variables`;
      const method = selectedVariable ? 'PUT' : 'POST';
      
      // For creation, ensure all values are strings
      const payload = selectedVariable ? variable : {
          "name": String(variable.name),
          "value": String(variable.value),
          "type": String(variable.type)
      };
      console.log("Url is ",url);
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json','Accept': 'application/json'},
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Failed to save variable');
      }
      await fetchVariables();
      toast({
        title: `Variable ${selectedVariable ? 'updated' : 'created'} successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      return true;
    } catch (error) {
      console.error('Error saving variable:', error);
      toast({
        title: "Error saving variable",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
  };

  const handleDelete = async (name: string) => {
    try {
      const response = await fetch(`/api/variables/${name}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete variable');
      }
      await fetchVariables();
      toast({
        title: "Variable deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting variable:', error);
      toast({
        title: "Error deleting variable",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredVariables = variables.filter(variable => 
    variable.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (typeFilter === '' || variable.type === typeFilter)
  );

  return (
    <HStack align="start" spacing={8}>
      <Box width="300px">
        <DataSideBar />
      </Box>
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
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </Select>
          </HStack>
          <Button leftIcon={<AddIcon />} colorScheme="green" onClick={() => { setSelectedVariable(null); onOpen(); }}>
            Create Variable
          </Button>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Value</Th>
                <Th>Type</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredVariables.map((variable) => (
                <Tr key={variable.id}>
                  <Td>{variable.name}</Td>
                  <Td>{variable.value}</Td>
                  <Td>{variable.type}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button size="sm" leftIcon={<EditIcon />} onClick={() => { setSelectedVariable(variable); onOpen(); }}>
                        Edit
                      </Button>
                      <Button size="sm" leftIcon={<DeleteIcon />} colorScheme="red" onClick={() => handleDelete(variable.name)}>
                        Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </VStack>
      </Box>
      <VariableModal
        isOpen={isOpen}
        onClose={onClose}
        variable={selectedVariable}
        onSave={handleCreateOrUpdate}
      />
    </HStack>
  );
};

export default Variables;
