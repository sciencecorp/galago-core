import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Select,
  Checkbox,
  FormControl,
  FormLabel,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  Badge,
  Switch,
  Spinner,
  Radio,
  RadioGroup,
  Stack,
  Card,
  CardBody,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  SimpleGrid,
  Tooltip,
} from "@chakra-ui/react";
import { RiAddFill, RiDeleteBin6Line, RiSaveLine, RiPaletteLine } from "react-icons/ri";
import { CloseIcon } from "@chakra-ui/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { trpc } from "@/utils/trpc";
import { successToast, errorToast } from "../ui/Toast";
import { IoSettingsSharp } from "react-icons/io5";
import { DeleteWithConfirmation } from "../ui/Delete";
import { FormField, Form, FIELD_TYPES, DEFAULT_EDITING_FIELD } from "@/types";
import { ColorPicker } from "./colorPicker";

interface FormBuilderProps {
  formId: number;
  initialData?: Form;
  onCancel?: () => void;
  onUpdate?: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  formId,
  initialData,
  onCancel,
  onUpdate,
}) => {
  const defaultBgColor = useColorModeValue("#ffffff", "#2d3748");
  const defaultFontColor = useColorModeValue("#1a202c", "#ffffff");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const headerTextColor = useColorModeValue("gray.800", "gray.100");
  const actionButtonsBg = useColorModeValue("white", "gray.700");

  const [formName, setFormName] = useState(initialData?.name || "");
  const [formDescription, setFormDescription] = useState(initialData?.description || "");
  const [backgroundColor, setBackgroundColor] = useState<string | null>(
    initialData?.background_color || null,
  );
  const [fontColor, setFontColor] = useState<string | null>(initialData?.font_color || null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [editingField, setEditingField] = useState<FormField>(DEFAULT_EDITING_FIELD);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDisclosure();

  const updateForm = trpc.form.edit.useMutation();
  const deleteForm = trpc.form.delete.useMutation();
  const { data: variables } = trpc.variable.getAll.useQuery();

  // Initialize all form data from initialData - use useCallback to prevent infinite loops
  const initializeFormData = useCallback(() => {
    if (initialData) {
      setFormName(initialData.name || "");
      setFormDescription(initialData.description || "");
      setBackgroundColor(initialData.background_color ? initialData.background_color : null);
      setFontColor(initialData.font_color ? initialData.font_color : null);

      // Update fields
      if (initialData.fields) {
        const fieldsWithIds = initialData.fields.map((field, index) => ({
          ...field,
          id: field.label + "_" + index,
        }));
        setFields(fieldsWithIds as FormField[]);
      } else {
        setFields([]);
      }
    }
  }, [initialData]);

  useEffect(() => {
    initializeFormData();
  }, [initializeFormData]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (isSaving) return;

      if (!result.destination) return;

      setFields((currentFields) => {
        const items = Array.from(currentFields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination!.index, 0, reorderedItem);
        return items;
      });
    },
    [isSaving],
  );

  const addField = useCallback(() => {
    const newField: FormField = {
      type: "text",
      label: `Field ${fields.length + 1}`,
      required: false,
      placeholder: "Enter text...",
      options: null,
      default_value: null,
      mapped_variable: null,
    };

    setFields((currentFields) => [...currentFields, newField]);
  }, [fields.length]);

  // Edit existing field - use useCallback
  const editField = useCallback(
    (index: number) => {
      setEditingField({ ...fields[index] });
      setSelectedFieldIndex(index);
      onOpen();
    },
    [fields, onOpen],
  );

  // Delete field - use useCallback
  const deleteField = useCallback((index: number) => {
    setFields((currentFields) => currentFields.filter((_, i) => i !== index));
  }, []);

  // Save field changes - use useCallback
  const saveField = useCallback(() => {
    if (selectedFieldIndex !== null && selectedFieldIndex >= 0) {
      setFields((currentFields) => {
        const newFields = [...currentFields];
        newFields[selectedFieldIndex] = { ...editingField };
        return newFields;
      });
      successToast("Success", "Field updated successfully");
    }

    onClose();
    setSelectedFieldIndex(null);
  }, [editingField, fields, selectedFieldIndex, onClose]);

  const saveForm = useCallback(async () => {
    if (!formName.trim()) {
      errorToast("Error", "Form name is required");
      return;
    }

    try {
      setIsSaving(true);
      const cleanedFields = fields.map((field) => ({
        ...field,
        id: undefined,
        options: field.options
          ? field.options.map((option) => ({
              value: option.value,
              label: option.label,
            }))
          : null,
      }));

      const formData = {
        name: formName,
        description: formDescription || null,
        background_color: backgroundColor,
        font_color: fontColor,
        fields: cleanedFields,
      };

      await updateForm.mutateAsync({
        id: formId,
        data: formData,
      });
      successToast("Success", "Form saved successfully");

      if (onUpdate) {
        onUpdate(); // Call the onUpdate callback if provided
      }
    } catch (error) {
      console.error("Failed to save form:", error);
      errorToast("Error", "Failed to save form");
    } finally {
      setIsSaving(false);
    }
  }, [formName, formId, fields, formDescription, backgroundColor, fontColor, updateForm, onUpdate]);

  // Delete entire form - use useCallback
  const handleDeleteForm = useCallback(async () => {
    try {
      await deleteForm.mutateAsync(formId);
      successToast("Success", "Form deleted successfully");
      if (onUpdate) {
        onUpdate(); // Call the onUpdate callback if provided
        onCancel && onCancel(); // Close the form builder
      }
    } catch (error) {
      console.error("Failed to delete form:", error);
      errorToast("Error", "Failed to delete form");
    }
  }, [formId, deleteForm]);

  // Add option for select/radio fields - use useCallback
  const addOption = useCallback(() => {
    const newOptions = editingField.options || [];
    const newOption = {
      value: `option_${newOptions.length + 1}`,
      label: `Option ${newOptions.length + 1}`,
      disabled: false,
      description: "",
    };
    setEditingField((current) => ({
      ...current,
      options: [...newOptions, newOption],
    }));
  }, [editingField.options]);

  // Remove option - use useCallback
  const removeOption = useCallback((index: number) => {
    setEditingField((current) => {
      const newOptions = current.options?.filter((_, i) => i !== index) || [];
      return {
        ...current,
        options: newOptions.length > 0 ? newOptions : null,
      };
    });
  }, []);

  // Update option - use useCallback
  const updateOption = useCallback((index: number, key: string, value: any) => {
    setEditingField((current) => {
      const newOptions = [...(current.options || [])];
      newOptions[index] = { ...newOptions[index], [key]: value };
      return { ...current, options: newOptions };
    });
  }, []);

  const FormFieldComponent = React.memo<{ field: FormField; index: number }>(({ field, index }) => {
    const fieldId = field.label || +"_" + index;
    const fieldBorderColor = useColorModeValue("gray.200", "gray.600");
    const fieldHoverBg = useColorModeValue("gray.50", "gray.600");

    const handleEditClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        editField(index);
      },
      [index],
    );

    const handleDeleteClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        deleteField(index);
      },
      [index],
    );

    return (
      <Draggable
        key={fieldId}
        draggableId={fieldId.toString()}
        index={index}
        isDragDisabled={isSaving}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            mb={6}
            p={2}
            border="2px solid transparent"
            borderRadius="md"
            transition="all 0.2s"
            position="relative"
            opacity={snapshot.isDragging ? 0.8 : 1}
            role="group"
            _hover={{
              bg: fieldHoverBg,
              borderColor: fieldBorderColor,
            }}>
            <HStack>
              <IconButton
                aria-label="Edit field"
                icon={<IoSettingsSharp />}
                size="xs"
                colorScheme="blue"
                variant="ghost"
                position="absolute"
                top={2}
                right={8}
                onClick={handleEditClick}
                opacity={0}
                _groupHover={{ opacity: 1 }}
                zIndex={2}
              />
              <IconButton
                aria-label="Delete field"
                icon={<RiDeleteBin6Line />}
                size="xs"
                colorScheme="red"
                variant="ghost"
                position="absolute"
                top={2}
                right={2}
                onClick={handleDeleteClick}
                opacity={0}
                _groupHover={{ opacity: 1 }}
                zIndex={2}
              />
            </HStack>

            <FormControl>
              <FormLabel color={fontColor || defaultFontColor}>
                {field.label}
                {field.required && (
                  <Text as="span" color="red.500" ml={1}>
                    *
                  </Text>
                )}
              </FormLabel>

              {field.type === "textarea" && (
                <Textarea
                  placeholder={field.placeholder || ""}
                  cursor="pointer"
                  color={fontColor || defaultFontColor}
                  bg="transparent"
                  borderColor={useColorModeValue("gray.200", "gray.600")}
                  _placeholder={{ color: useColorModeValue("gray.400", "gray.500") }}
                />
              )}

              {field.type === "select" && (
                <Select
                  placeholder={field.placeholder || "Select option"}
                  cursor="pointer"
                  color={fontColor || defaultFontColor}
                  bg="transparent"
                  borderColor={useColorModeValue("gray.200", "gray.600")}
                  _placeholder={{ color: useColorModeValue("gray.400", "gray.500") }}>
                  {field.options?.map((option, idx) => (
                    <option key={idx} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}

              {field.type === "radio" && (
                <Box cursor="pointer" p={2} borderRadius="md">
                  <RadioGroup>
                    <Stack>
                      {field.options?.map((option, idx) => (
                        <Radio key={idx} value={option.value} isDisabled colorScheme="blue">
                          <Text color={fontColor || defaultFontColor}>{option.label}</Text>
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                </Box>
              )}

              {field.type === "checkbox" && (
                <Box cursor="pointer" p={2} borderRadius="md" display="inline-block">
                  <Checkbox isDisabled colorScheme="blue">
                    <Text color={fontColor || defaultFontColor}>
                      {field.placeholder || "Checkbox option"}
                    </Text>
                  </Checkbox>
                </Box>
              )}

              {!["textarea", "select", "radio", "checkbox"].includes(field.type) && (
                <Input
                  pt={field.type === "file" ? 1 : 0}
                  type={field.type}
                  placeholder={field.placeholder || ""}
                  cursor="pointer"
                  color={fontColor || defaultFontColor}
                  bg="transparent"
                  borderColor={useColorModeValue("gray.200", "gray.600")}
                  _placeholder={{ color: useColorModeValue("gray.400", "gray.500") }}
                />
              )}
            </FormControl>
          </Box>
        )}
      </Draggable>
    );
  });

  FormFieldComponent.displayName = "FormFieldComponent";

  return (
    <Card
      bg={backgroundColor || defaultBgColor}
      color={fontColor || defaultFontColor}
      w="800px"
      h="auto"
      shadow="lg"
      borderRadius="lg"
      display="flex"
      transition="all 0.3s ease"
      borderColor={cardBorderColor}
      borderWidth="1px">
      <CardBody display="flex" flexDirection="column" position="relative">
        <HStack spacing={2} mb={4}>
          <VStack align="start" flex={1} spacing={1}>
            <Text fontSize="xl" fontWeight="bold" color={fontColor || defaultFontColor}>
              {formName.trim() || "Untitled Form"}
            </Text>
          </VStack>

          <IconButton
            aria-label="Form settings"
            icon={<IoSettingsSharp />}
            size="sm"
            variant="ghost"
            onClick={onSettingsOpen}
            _hover={{
              bg: useColorModeValue("gray.100", "gray.600"),
            }}
            color={fontColor || defaultFontColor}
          />
          <CloseIcon
            fontSize="xs"
            cursor="pointer"
            color={useColorModeValue("gray.400", "gray.500")}
            onClick={onCancel}
            _hover={{
              color: useColorModeValue("gray.600", "gray.300"),
            }}
          />
        </HStack>

        <Box overflowY="auto" maxH="700px" flex={1}>
          <VStack spacing={4} align="stretch">
            {/* Saving indicator */}
            {isSaving && (
              <Box
                mb={4}
                borderColor="blue.200"
                border="1px"
                borderRadius="md"
                p={4}
                bg={useColorModeValue("blue.50", "blue.900")}>
                <HStack>
                  <Spinner size="sm" color="blue.500" />
                  <Text color={useColorModeValue("blue.700", "blue.200")}>Saving changes...</Text>
                </HStack>
              </Box>
            )}

            {/* Form fields */}
            <Box p={2}>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="form-fields">
                  {(provided) => (
                    <VStack
                      spacing={0}
                      align="stretch"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      role="group">
                      {fields.map((field, index) => (
                        <FormFieldComponent
                          key={field.label + "_" + index}
                          field={field}
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                      <Button
                        leftIcon={<RiAddFill />}
                        onClick={addField}
                        variant="dashed"
                        size="lg"
                        py={8}
                        isDisabled={isSaving}
                        mt={4}
                        color={fontColor || defaultFontColor}
                        borderColor={useColorModeValue("gray.300", "gray.600")}
                        _hover={{
                          bg: useColorModeValue("gray.50", "gray.600"),
                          borderColor: useColorModeValue("gray.400", "gray.500"),
                        }}>
                        Add Field
                      </Button>
                    </VStack>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>
          </VStack>
        </Box>

        {/* Footer with action buttons */}
        <HStack
          spacing={2}
          mt={4}
          pt={4}
          borderTop="1px"
          borderColor={cardBorderColor}
          bg={actionButtonsBg}
          mx={-6}
          mb={-6}
          px={6}
          pb={6}
          borderBottomRadius="lg">
          <Button
            leftIcon={<RiSaveLine />}
            colorScheme="teal"
            onClick={saveForm}
            isLoading={isSaving}
            loadingText="Saving..."
            isDisabled={!formName.trim()}
            flex={1}>
            Save Form
          </Button>
          <DeleteWithConfirmation
            label="Delete Form"
            onDelete={handleDeleteForm}
            variant="button"
          />
        </HStack>

        {/* Form Settings Drawer */}
        <Drawer isOpen={isSettingsOpen} placement="right" onClose={onSettingsClose} size="md">
          <DrawerOverlay />
          <DrawerContent bg={useColorModeValue("white", "gray.800")}>
            <DrawerCloseButton color={useColorModeValue("gray.600", "gray.300")} />
            <DrawerHeader color={headerTextColor}>Form Settings</DrawerHeader>

            <DrawerBody>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel color={useColorModeValue("gray.700", "gray.200")}>Form Name</FormLabel>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter form name"
                    bg={useColorModeValue("white", "gray.700")}
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                    color={useColorModeValue("gray.800", "gray.100")}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={useColorModeValue("gray.700", "gray.200")}>
                    Description
                  </FormLabel>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Enter form description"
                    bg={useColorModeValue("white", "gray.700")}
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                    color={useColorModeValue("gray.800", "gray.100")}
                  />
                </FormControl>
                <ColorPicker
                  color={backgroundColor}
                  onChange={setBackgroundColor}
                  label="Background Color"
                />

                <ColorPicker
                  color={fontColor}
                  onChange={setFontColor}
                  label="Font Color"
                  isSimple={true}
                />
              </VStack>
            </DrawerBody>

            <DrawerFooter bg={useColorModeValue("gray.50", "gray.700")}>
              <Button
                variant="outline"
                mr={3}
                onClick={onSettingsClose}
                color={useColorModeValue("gray.600", "gray.300")}
                borderColor={useColorModeValue("gray.300", "gray.600")}>
                Close
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Field Editor Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
          <DrawerOverlay />
          <DrawerContent bg={useColorModeValue("white", "gray.800")}>
            <DrawerCloseButton color={useColorModeValue("gray.600", "gray.300")} />
            <DrawerHeader color={headerTextColor}>
              {selectedFieldIndex === -1 ? "Add Field" : "Edit Field"}
            </DrawerHeader>

            <DrawerBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel color={useColorModeValue("gray.700", "gray.200")}>
                    Field Type
                  </FormLabel>
                  <Select
                    value={editingField.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setEditingField((current) => ({
                        ...current,
                        type: newType,
                        options: ["select", "radio"].includes(newType) ? current.options : null,
                      }));
                    }}
                    bg={useColorModeValue("white", "gray.700")}
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                    color={useColorModeValue("gray.800", "gray.100")}>
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={useColorModeValue("gray.700", "gray.200")}>Label</FormLabel>
                  <Input
                    value={editingField.label}
                    onChange={(e) =>
                      setEditingField((current) => ({ ...current, label: e.target.value }))
                    }
                    placeholder="Field Label"
                    bg={useColorModeValue("white", "gray.700")}
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                    color={useColorModeValue("gray.800", "gray.100")}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={useColorModeValue("gray.700", "gray.200")}>
                    Placeholder
                  </FormLabel>
                  <Input
                    value={editingField.placeholder || ""}
                    onChange={(e) =>
                      setEditingField((current) => ({
                        ...current,
                        placeholder: e.target.value || null,
                      }))
                    }
                    placeholder="Placeholder text"
                    bg={useColorModeValue("white", "gray.700")}
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                    color={useColorModeValue("gray.800", "gray.100")}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0" color={useColorModeValue("gray.700", "gray.200")}>
                    Required Field
                  </FormLabel>
                  <Switch
                    isChecked={editingField.required}
                    onChange={(e) =>
                      setEditingField((current) => ({ ...current, required: e.target.checked }))
                    }
                    colorScheme="blue"
                  />
                </FormControl>

                {["select", "radio"].includes(editingField.type) && (
                  <FormControl>
                    <FormLabel color={useColorModeValue("gray.700", "gray.200")}>Options</FormLabel>
                    <VStack spacing={2} align="stretch">
                      {editingField.options?.map((option, index) => (
                        <HStack key={index}>
                          <Input
                            value={option.value}
                            onChange={(e) => updateOption(index, "value", e.target.value)}
                            placeholder="Value"
                            size="sm"
                            bg={useColorModeValue("white", "gray.700")}
                            borderColor={useColorModeValue("gray.200", "gray.600")}
                            color={useColorModeValue("gray.800", "gray.100")}
                          />
                          <Input
                            value={option.label}
                            onChange={(e) => updateOption(index, "label", e.target.value)}
                            placeholder="Label"
                            size="sm"
                            bg={useColorModeValue("white", "gray.700")}
                            borderColor={useColorModeValue("gray.200", "gray.600")}
                            color={useColorModeValue("gray.800", "gray.100")}
                          />

                          <IconButton
                            aria-label="Remove option"
                            icon={<RiDeleteBin6Line />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeOption(index)}
                          />
                        </HStack>
                      ))}
                      <Button
                        size="sm"
                        onClick={addOption}
                        leftIcon={<RiAddFill />}
                        colorScheme="blue">
                        Add Option
                      </Button>
                    </VStack>
                  </FormControl>
                )}

                {variables && variables.length > 0 && (
                  <FormControl>
                    <FormLabel color={useColorModeValue("gray.700", "gray.200")}>
                      Map to Variable
                    </FormLabel>
                    <Select
                      value={editingField.mapped_variable || ""}
                      onChange={(e) =>
                        setEditingField((current) => ({
                          ...current,
                          mapped_variable: e.target.value || null,
                        }))
                      }
                      bg={useColorModeValue("white", "gray.700")}
                      borderColor={useColorModeValue("gray.200", "gray.600")}
                      color={useColorModeValue("gray.800", "gray.100")}>
                      <option value="">No mapping</option>
                      {variables.map((variable: any) => (
                        <option key={variable.id} value={variable.name}>
                          {variable.name} ({variable.type})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </VStack>
            </DrawerBody>

            <DrawerFooter bg={useColorModeValue("gray.50", "gray.700")}>
              <Button
                variant="outline"
                mr={3}
                onClick={onClose}
                color={useColorModeValue("gray.600", "gray.300")}
                borderColor={useColorModeValue("gray.300", "gray.600")}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={saveField} isDisabled={!editingField.label}>
                Save
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardBody>
    </Card>
  );
};
