import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  useColorModeValue,
  Card,
  CardBody,
  ButtonGroup,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Form, FormField } from "@/types";
import { trpc } from "@/utils/trpc";
import { errorToast } from "../ui/Toast";

interface UserFormModalProps {
  isOpen: boolean;
  form: Form | null;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
}

interface FormFieldInputProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  fontColor?: string | null;
  defaultFontColor?: string;
}

const FormFieldInput: React.FC<FormFieldInputProps> = ({
  field,
  value,
  onChange,
  fontColor,
  defaultFontColor,
}) => {
  const inputBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        // Read the file as text
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result;
          // Save the file content to the variable
          onChange(content);
          
        };
        reader.readAsText(file);
      } catch (error) {
        console.error("Error reading file:", error);
      }
  };


  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "url":
        return (
          <Input
            type={field.type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            bg={inputBg}
            borderColor={borderColor}
            color={fontColor || defaultFontColor}
            isRequired={field.required}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            bg={inputBg}
            borderColor={borderColor}
            color={fontColor || defaultFontColor}
            isRequired={field.required}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            bg={inputBg}
            borderColor={borderColor}
            color={fontColor || defaultFontColor}
            isRequired={field.required}
            rows={4}
          />
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || "Select an option"}
            bg={inputBg}
            borderColor={borderColor}
            color={fontColor || defaultFontColor}
            isRequired={field.required}>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case "radio":
        return (
          <RadioGroup value={value || ""} onChange={onChange}>
            <VStack align="start" spacing={2}>
              {field.options?.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  colorScheme="teal"
                  color={fontColor || defaultFontColor}>
                  {option.label}
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        );

      case "checkbox":
        return (
          <Checkbox
            isChecked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            colorScheme="teal"
            color={fontColor || defaultFontColor}>
            {field.label}
          </Checkbox>
        );

      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            bg={inputBg}
            borderColor={borderColor}
            color={fontColor || defaultFontColor}
            isRequired={field.required}
          />
        );

      case "time":
        return (
          <Input
            type="time"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            bg={inputBg}
            borderColor={borderColor}
            color={fontColor || defaultFontColor}
            isRequired={field.required}
          />
        );

      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => handleFileChange(e)}
            bg={inputBg}
            borderColor={borderColor}
            color={fontColor || defaultFontColor}
            isRequired={field.required}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            bg={inputBg}
            borderColor={borderColor}
            color={fontColor || defaultFontColor}
            isRequired={field.required}
          />
        );
    }
  };

  // Don't render label for checkbox since it's already included in the checkbox component
  if (field.type === "checkbox") {
    return <>{renderField()}</>;
  }

  return (
    <FormControl isRequired={field.required}>
      <FormLabel color={fontColor || defaultFontColor} fontWeight="medium">
        <HStack spacing={1} alignItems="center">
          <Text>{field.label}</Text>
          {field.mapped_variable && (
            <Text
              as="span"
              fontSize="xs"
              color="blue.500"
              fontWeight="bold"
              ml={1}>
              (→ {field.mapped_variable})
            </Text>
          )}
        </HStack>
      </FormLabel>
      {renderField()}
    </FormControl>
  );
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  form,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add tRPC mutations for variable operations
  const editVariable = trpc.variable.edit.useMutation();
  const createVariable = trpc.variable.add.useMutation();
  const variablesQuery = trpc.variable.getAll.useQuery();

  const defaultBgColor = useColorModeValue("#ffffff", "#2d3748");
  const defaultFontColor = useColorModeValue("#1a202c", "#ffffff");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");

  const handleFieldChange = (fieldLabel: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldLabel]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldLabel]) {
      setErrors((prev) => ({
        ...prev,
        [fieldLabel]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form) return true;

    form.fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.label];
        if (!value || (typeof value === "string" && value.trim() === "")) {
          newErrors[field.label] = `${field.label} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // Update mapped variables before calling onSubmit
        await updateMappedVariables();
        
        onSubmit(formData);
        // Reset form data for next time
        setFormData({});
        setErrors({});
      } catch (error) {
        console.error("Error updating mapped variables:", error);
        errorToast(
          "Error updating variables",
          "Failed to update mapped variables. Please try again."
        );
      }
    }
  };

  // Function to update all mapped variables
  const updateMappedVariables = async () => {
    if (!form) return;

    // Get all fields with mapped variables
    const fieldsWithMappedVariables = form.fields.filter(
      field => field.mapped_variable && field.mapped_variable.trim() !== ""
    );

    if (fieldsWithMappedVariables.length === 0) {
      return; // No mapped variables to update
    }

    const updatePromises = fieldsWithMappedVariables.map(async (field) => {
      const variableName = field.mapped_variable!;
      const formValue = formData[field.label];
      
      // Skip if no value provided
      if (formValue === undefined || formValue === null) {
        return null;
      }

      // Find existing variable
      const existingVariable = variablesQuery.data?.find((v) => v.name === variableName);
      
      // Convert all values to strings as specified
      const stringValue = String(formValue);

      if (!existingVariable) {
        // Create new variable - always as string type
        return createVariable.mutateAsync({
          name: variableName,
          type: "string",
          value: stringValue,
        });
      } else {
        // Update existing variable
        return editVariable.mutateAsync({
          id: existingVariable.id,
          value: stringValue,
          name: existingVariable.name,
          type: existingVariable.type, // Keep existing type
        });
      }
    });

    // Wait for all variable updates to complete
    await Promise.all(updatePromises.filter(Boolean));
  };

  const handleCancel = () => {
    setFormData({});
    setErrors({});
    onCancel();
  };

  if (!form) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} closeOnOverlayClick={false} isCentered size="md">
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
        <ModalContent>
          <ModalBody>
            <Alert status="error">
              <AlertIcon />
              Form not found
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
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}} 
      closeOnOverlayClick={false} 
      isCentered 
      size="2xl"
      scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent
        maxH="90vh"
        bg={form.background_color || defaultBgColor}
        color={form.font_color || defaultFontColor}>
        <ModalHeader textAlign="center" borderBottom="1px" borderColor={cardBorderColor}>
          {form.name}
        </ModalHeader>
        
        <ModalBody py={6}>
          <Card
            bg="transparent"
            border="none"
            shadow="none">
            <CardBody p={0}>
              <VStack spacing={6} align="stretch">
                {form.description && (
                  <Text 
                    fontSize="md" 
                    color={form.font_color || defaultFontColor}
                    textAlign="center"
                    fontStyle="italic">
                    {form.description}
                  </Text>
                )}
                
                {form.fields.map((field, index) => (
                  <VStack key={index} align="stretch" spacing={1}>
                    <FormFieldInput
                      field={field}
                      value={formData[field.label]}
                      onChange={(value) => handleFieldChange(field.label, value)}
                      fontColor={form.font_color}
                      defaultFontColor={defaultFontColor}
                    />
                    {errors[field.label] && (
                      <Text color="red.500" fontSize="sm">
                        {errors[field.label]}
                      </Text>
                    )}
                  </VStack>
                ))}
                
                {form.fields.length === 0 && (
                  <Text 
                    textAlign="center" 
                    color="gray.500" 
                    fontStyle="italic">
                    This form has no fields configured.
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </ModalBody>
        
        <ModalFooter borderTop="1px" borderColor={cardBorderColor}>
          <ButtonGroup spacing={3} width="100%" justifyContent="center">
            <Button 
              variant="ghost"
              onClick={handleCancel}
              color={form.font_color || defaultFontColor}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSubmit}
              isLoading={editVariable.isLoading || createVariable.isLoading}
              isDisabled={editVariable.isLoading || createVariable.isLoading}
              minW="120px">
              Submit
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};