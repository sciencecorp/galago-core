import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  useColorModeValue,
  Center,
  Spinner,
  Icon,
  Card,
  CardBody,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Editable, 
  EditableInput,
  EditablePreview,
  Button,
  ButtonGroup,
  Spacer,
  FormControl,
  FormLabel,
  Input,
  Select,
  Badge,
  SimpleGrid,
  Textarea
} from "@chakra-ui/react";
import { FormsList } from './formsList';
import { trpc } from '@/utils/trpc';
import { MdFormatListBulleted } from "react-icons/md";
import { PageHeader } from '../ui/PageHeader';
import { Form } from '@/types/form';
import { CloseIcon } from "../ui/Icons";
import { EditableText } from "../ui/Form";
import { LuFileText } from "react-icons/lu";
import { EmptyState } from "../ui/EmptyState";

// Define field types based on your requirements
enum FieldType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  FILE = "file",
}

interface FormField {
  id: string;
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  variable_name?: string;
}

export const Forms = () => {
  const { data: fetchedForms, isLoading, refetch } = trpc.form.getAll.useQuery();
  const { data: fetchedVariables } = trpc.variable.getAll.useQuery();
  const editForm = trpc.form.edit.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  const addForm = trpc.form.add.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const headerBg = useColorModeValue("white", "gray.700");
  const [selectedFormName, setSelectedFormName] = useState<string | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const cardWidth = "600px";

  useEffect(() => {
    if (fetchedForms) {
      setForms(fetchedForms);
    }
  }, [fetchedForms]);

  useEffect(() => {
    // Reset form values when form changes
    if (selectedForm) {
      const initialValues: Record<string, any> = {};
      selectedForm.fields?.forEach((field: FormField) => {
        // Set default values based on field type
        switch (field.type) {
          case FieldType.BOOLEAN:
            initialValues[field.id] = false;
            break;
          case FieldType.NUMBER:
            initialValues[field.id] = 0;
            break;
          case FieldType.STRING:
          case FieldType.FILE:
          default:
            initialValues[field.id] = "";
            break;
        }
        
        // If field is linked to a variable, use the variable's value
        if (field.variable_name && fetchedVariables) {
          const variable = fetchedVariables.find(v => v.name === field.variable_name);
          if (variable) {
            initialValues[field.id] = variable.value;
          }
        }
      });
      setFormValues(initialValues);
    }
  }, [selectedForm, fetchedVariables]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getVariableForField = (field: FormField) => {
    if (!field.variable_name || !fetchedVariables) return null;
    return fetchedVariables.find(v => v.name === field.variable_name);
  };

  const renderFormField = (field: FormField) => {
    const variable = getVariableForField(field);
    const fieldValue = formValues[field.id] || "";
    const displayLabel = field.label || capitalizeFirst(field.name.replaceAll("_", " "));

    return (
      <FormControl key={field.id} isRequired={field.required}>
        <FormLabel>
          {displayLabel}
          {field.variable_name && (
            <Badge colorScheme="green" ml={2} size="sm">
              {field.variable_name}
            </Badge>
          )}
        </FormLabel>
        
        {field.type === FieldType.FILE ? (
          <Input
            type="file"
            pt={1}
            placeholder={field.placeholder || "Choose a file"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleFieldChange(field.id, file);
            }}
          />
        ) : field.type === FieldType.BOOLEAN ? (
          <Select
            value={fieldValue.toString()}
            onChange={(e) => handleFieldChange(field.id, e.target.value === "true")}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </Select>
        ) : field.type === FieldType.NUMBER ? (
          <Input
            type="number"
            value={fieldValue}
            placeholder={field.placeholder || "Enter a number"}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
          />
        ) : field.type === FieldType.STRING ? (
          field.placeholder && field.placeholder.includes('\n') ? (
            <Textarea
              value={fieldValue}
              placeholder={field.placeholder || "Enter text"}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              rows={4}
            />
          ) : (
            <Input
              value={fieldValue}
              placeholder={field.placeholder || "Enter text"}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          )
        ) : (
          <Input
            value={fieldValue}
            placeholder={field.placeholder || "Enter value"}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        )}
      </FormControl>
    );
  };

  const handleFormSubmit = () => {
    console.log("Form submitted with values:", formValues);
    // Add your form submission logic here
  };

  const handleFormCancel = () => {
    setSelectedForm(null);
    setSelectedFormName(null);
    setFormValues({});
  };
  
  if (isLoading) {
    return <Center><Spinner/></Center>;
  }
  
  return (
    <Box width="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md" borderRadius="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Forms"
                subTitle="Create and manage your forms"
                titleIcon={<Icon as={MdFormatListBulleted} boxSize={8} color="teal.500" />}
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Forms</StatLabel>
                  <StatNumber>{forms.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Active Fields</StatLabel>
                  <StatNumber>{selectedForm?.fields?.length || 0}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Selected Form</StatLabel>
                  <StatNumber fontSize="lg">{selectedForm?.name || "None"}</StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>
        
        <HStack align="stretch" spacing={4}>
          <Box>
            <FormsList
              forms={forms || []}
              onSelectForm={(form) => {
                setSelectedForm(form);
                setSelectedFormName(form.name);
              }}
            />
          </Box>

          <Box flex="1" display="flex" alignItems="center" justifyContent="center">
            {!selectedForm ? (
                <EmptyState
                  title="No Form Selected"
                  description="Please select a form from the list to view or edit."
                />
            ) : (
            <Card
              bg={headerBg}
              w={cardWidth}
              h="auto"
              shadow="lg"
              borderRadius="lg"
              display="flex"
            >
              {selectedForm && (
                <CardBody display="flex" flexDirection="column" position="relative">
                  <HStack spacing={2} mb={4}>
                    <Editable
                        defaultValue={selectedForm.name}
                        fontSize="xl"
                        fontWeight="bold"
                        onSubmit={(value)=> editForm.mutate({ id: selectedForm.id, data: { name: value }})}
                        submitOnBlur={true}
                        flex={1}>
                    <HStack spacing={2}>
                        <EditablePreview
                        py={1}
                        px={2}
                        _hover={ {
                                bg: useColorModeValue("gray.50", "gray.700"),
                                borderRadius: "md",
                        }}
                        />
                        <EditableInput py={1} px={2} />
                    </HStack>
                    </Editable>
                    <CloseIcon 
                        fontSize="xs"
                        cursor="pointer"
                        color="gray.300"
                        onClick={handleFormCancel}
                    />
                  </HStack>
                  
                  {/* Form Fields - Main content area */}
                  <Box flex="1" overflowY="auto" pr={2}>
                    {selectedForm.fields && selectedForm.fields.length > 0 ? (
                      <VStack spacing={4} align="stretch">
                        {selectedForm.fields.map((field: FormField) => renderFormField(field))}
                      </VStack>
                    ) : (
                      <Center h="200px">
                        <EmptyState
                          title="No Fields Defined"
                          description="This form doesn't have any fields yet."
                        />
                      </Center>
                    )}
                  </Box>
                  
                  {/* Buttons positioned at bottom */}
                  <HStack justify="flex-end" mt={4} pt={4} borderTop="1px" borderColor="gray.200">
                    <ButtonGroup>
                        <Button
                          colorScheme="gray"
                          onClick={handleFormCancel}
                        >
                          Cancel
                        </Button>
                        <Button
                          colorScheme="teal"
                          variant="solid"
                          onClick={handleFormSubmit}
                          isDisabled={!selectedForm.fields || selectedForm.fields.length === 0}
                        >
                          Submit
                        </Button>
                    </ButtonGroup>
                  </HStack>
                </CardBody>
              )}
            </Card>
            )}
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
};