import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  Radio,
  RadioGroup,
  Stack,
  useColorModeValue,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Box,
} from "@chakra-ui/react";
import { Form, FormField } from "@/types";

interface FormModalProps {
  isOpen: boolean;
  formName: string;
  onSubmit: (formData: Record<string, any>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  form?: Form | null;
  error?: string | null;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  formName,
  onSubmit,
  onCancel,
  isLoading = false,
  form,
  error,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form data with default values when form loads
  useEffect(() => {
    if (form?.fields) {
      const initialData: Record<string, any> = {};
      form.fields.forEach((field) => {
        if (field.default_value !== null && field.default_value !== undefined) {
          initialData[field.label] = field.default_value;
        } else if (field.type === 'switch') {
          initialData[field.label] = false;
        } else {
          initialData[field.label] = '';
        }
      });
      setFormData(initialData);
    }
  }, [form]);

  const handleInputChange = (fieldLabel: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[fieldLabel]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldLabel];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    if (!form?.fields) return true;
    
    const errors: Record<string, string> = {};
    
    form.fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.label];
        if (value === undefined || value === null || value === '') {
          errors[field.label] = `${field.label} is required`;
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const fieldValue = formData[field.label] || '';
    const hasError = !!validationErrors[field.label];

    switch (field.type) {
      case 'text':
        return (
          <FormControl key={field.label} isRequired={field.required} isInvalid={hasError}>
            <FormLabel>{field.label}</FormLabel>
            <Input
              value={fieldValue}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              bg={useColorModeValue("white", "gray.700")}
              borderColor={hasError ? "red.300" : borderColor}
            />
            {hasError && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {validationErrors[field.label]}
              </Text>
            )}
          </FormControl>
        );

      case 'textarea':
        return (
          <FormControl key={field.label} isRequired={field.required} isInvalid={hasError}>
            <FormLabel>{field.label}</FormLabel>
            <Textarea
              value={fieldValue}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              bg={useColorModeValue("white", "gray.700")}
              borderColor={hasError ? "red.300" : borderColor}
            />
            {hasError && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {validationErrors[field.label]}
              </Text>
            )}
          </FormControl>
        );

      case 'number':
        return (
          <FormControl key={field.label} isRequired={field.required} isInvalid={hasError}>
            <FormLabel>{field.label}</FormLabel>
            <Input
              type="number"
              value={fieldValue}
              onChange={(e) => handleInputChange(field.label, Number(e.target.value) || '')}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              bg={useColorModeValue("white", "gray.700")}
              borderColor={hasError ? "red.300" : borderColor}
            />
            {hasError && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {validationErrors[field.label]}
              </Text>
            )}
          </FormControl>
        );

      case 'select':
        return (
          <FormControl key={field.label} isRequired={field.required} isInvalid={hasError}>
            <FormLabel>{field.label}</FormLabel>
            <Select
              value={fieldValue}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
              placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
              bg={useColorModeValue("white", "gray.700")}
              borderColor={hasError ? "red.300" : borderColor}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {hasError && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {validationErrors[field.label]}
              </Text>
            )}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl key={field.label} isRequired={field.required} isInvalid={hasError}>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup
              value={fieldValue}
              onChange={(value) => handleInputChange(field.label, value)}
            >
              <Stack direction="column">
                {field.options?.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
            {hasError && (
              <Text fontSize="sm" color="red.500" mt={1}>
                {validationErrors[field.label]}
              </Text>
            )}
          </FormControl>
        );

      case 'switch':
        return (
          <FormControl key={field.label} display="flex" alignItems="center">
            <FormLabel mb="0" flex={1}>{field.label}</FormLabel>
            <Switch
              isChecked={!!fieldValue}
              onChange={(e) => handleInputChange(field.label, e.target.checked)}
              colorScheme="teal"
            />
          </FormControl>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} closeOnOverlayClick={false} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
        <ModalContent bg={bgColor} maxW="2xl">
          <ModalBody py={8}>
            <Center>
              <VStack spacing={4}>
                <Spinner size="lg" color="teal.500" />
                <Text>Loading form...</Text>
              </VStack>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} closeOnOverlayClick={false} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
        <ModalContent bg={bgColor} maxW="2xl">
          <ModalHeader>Error Loading Form</ModalHeader>
          <ModalBody>
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onCancel}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  if (!form) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} closeOnOverlayClick={false} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
        <ModalContent bg={bgColor} maxW="2xl">
          <ModalHeader>Form Not Found</ModalHeader>
          <ModalBody>
            <Alert status="warning">
              <AlertIcon />
              Form "{formName}" was not found.
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onCancel}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} closeOnOverlayClick={false} isCentered size="xl">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent 
        bg={form.background_color || bgColor} 
        color={form.font_color || useColorModeValue("gray.800", "white")}
        maxW="2xl"
      >
        <ModalHeader textAlign="center" fontSize="xl" fontWeight="bold">
          {form.name}
        </ModalHeader>
        
        {form.description && (
          <Box px={6}>
            <Text fontSize="sm" color="gray.600" textAlign="center" mb={4}>
              {form.description}
            </Text>
          </Box>
        )}

        <ModalBody maxH="60vh" overflowY="auto">
          <VStack spacing={6} align="stretch">
            {form.fields?.map((field) => renderField(field))}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3} justify="center" width="100%">
            <Button variant="ghost" onClick={onCancel} minW="100px">
              Cancel
            </Button>
            <Button 
              colorScheme="teal" 
              onClick={handleSubmit} 
              minW="100px"
              isDisabled={Object.keys(validationErrors).length > 0}
            >
              Submit
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};