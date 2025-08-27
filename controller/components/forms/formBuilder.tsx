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
  Switch,
  Card,
  CardBody,
  useColorModeValue,
  ButtonGroup,
  Spacer,
  CardFooter,
} from "@chakra-ui/react";
import { RiAddFill, RiDeleteBin6Line, RiSaveLine } from "react-icons/ri";
import { CloseIcon } from "@chakra-ui/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { trpc } from "@/utils/trpc";
import { successToast, errorToast } from "../ui/Toast";
import { IoSettingsSharp } from "react-icons/io5";
import { DeleteWithConfirmation } from "../ui/Delete";
import { FormField, Form, FIELD_TYPES, DEFAULT_EDITING_FIELD } from "@/types";
import { ColorPicker } from "./colorPicker";
import { FormFieldComponent } from "./formFieldComponent";

interface FormBuilderProps {
  forms: Form[];
  onCancel?: () => void;
  onUpdate?: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ forms, onCancel, onUpdate }) => {
  const defaultBgColor = useColorModeValue("#ffffff", "#2d3748");
  const defaultFontColor = useColorModeValue("#1a202c", "#ffffff");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const headerTextColor = useColorModeValue("gray.800", "gray.100");

  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formName, setFormName] = useState("");
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [fontColor, setFontColor] = useState<string | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [editingField, setEditingField] = useState<FormField>(DEFAULT_EDITING_FIELD);
  const drawerFooterBg = useColorModeValue("gray.50", "gray.700");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDisclosure();

  const updateForm = trpc.form.edit.useMutation();
  const deleteForm = trpc.form.delete.useMutation();
  const { data: variables } = trpc.variable.getAll.useQuery();

  // Update form data when a form is selected
  const updateFormData = (form: Form) => {
    setFormName(form.name || "");
    setBackgroundColor(form.background_color || null);
    setFontColor(form.font_color || null);

    // Update fields with proper IDs
    if (form.fields && form.fields.length > 0) {
      const fieldsWithIds = form.fields.map((field, index) => ({
        ...field,
        id: field.label + "_" + index,
      }));
      setFields(fieldsWithIds as FormField[]);
    } else {
      setFields([]);
    }

    setSelectedFieldIndex(null);
    setEditingField(DEFAULT_EDITING_FIELD);
  };

  const onDragEnd = (result: DropResult) => {
    if (isSaving) return;
    if (!result.destination) return;
    setFields((currentFields) => {
      const items = Array.from(currentFields);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination!.index, 0, reorderedItem);
      return items;
    });
  };

  const addField = () => {
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
  };

  const editField = useCallback(
    (index: number) => {
      setEditingField({ ...fields[index] });
      setSelectedFieldIndex(index);
      onOpen();
    },
    [fields, onOpen],
  );

  const deleteField = useCallback((index: number) => {
    setFields((currentFields) => currentFields.filter((_, i) => i !== index));
  }, []);

  const saveField = () => {
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
  };

  const saveForm = async () => {
    if (!formName.trim() || !selectedForm) {
      errorToast("Error", "Form name is required and a form must be selected");
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
        background_color: backgroundColor,
        font_color: fontColor,
        fields: cleanedFields,
      };

      await updateForm.mutateAsync({
        id: selectedForm.id,
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
  };

  const handleDeleteForm = async () => {
    if (!selectedForm) return;

    try {
      await deleteForm.mutateAsync(selectedForm.id);
      successToast("Success", "Form deleted successfully");
      // Clear the selected form after deletion
      setSelectedForm(null);
      setFormName("");
      setBackgroundColor(null);
      setFontColor(null);
      setFields([]);

      if (onUpdate) {
        onUpdate();
      }
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error("Failed to delete form:", error);
      errorToast("Error", "Failed to delete form");
    }
  };

  //Select/radio options
  const addOption = () => {
    const newOptions = editingField.options || [];
    const newOption = {
      value: `option_${newOptions.length + 1}`,
      label: `Option ${newOptions.length + 1}`,
    };
    setEditingField((current) => ({
      ...current,
      options: [...newOptions, newOption],
    }));
  };

  const removeOption = (index: number) => {
    setEditingField((current) => {
      const newOptions = current.options?.filter((_, i) => i !== index) || [];
      return {
        ...current,
        options: newOptions.length > 0 ? newOptions : null,
      };
    });
  };

  const updateOption = (index: number, key: string, value: any) => {
    setEditingField((current) => {
      const newOptions = [...(current.options || [])];
      newOptions[index] = { ...newOptions[index], [key]: value };
      return { ...current, options: newOptions };
    });
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack spacing={2} justifyContent="space-between" alignItems="center">
        <HStack>
          <Text whiteSpace="nowrap" fontWeight="bold" fontSize="lg">
            Select Form:
          </Text>
          <Select
            placeholder="Select a form"
            value={selectedForm?.name || ""}
            onChange={(e) => {
              const formName = e.target.value;
              const form = forms.find((f) => f.name === formName);
              if (form) {
                setSelectedForm(form);
                updateFormData(form);
              } else {
                setSelectedForm(null);
                setFields([]);
                setFormName("");
                setBackgroundColor(null);
                setFontColor(null);
              }
            }}
            width="300px">
            {forms.map((form) => (
              <option key={form.id} value={form.name}>
                {form.name}
              </option>
            ))}
          </Select>
        </HStack>

        <Spacer />
        <ButtonGroup spacing={2}>
          <Button
            leftIcon={<RiSaveLine />}
            colorScheme="teal"
            onClick={saveForm}
            isLoading={isSaving}
            loadingText="Saving..."
            isDisabled={!formName.trim() || !selectedForm}
            flex={1}>
            Save
          </Button>
          {selectedForm && (
            <DeleteWithConfirmation
              label={`${selectedForm.name}`}
              onDelete={handleDeleteForm}
              variant="button"
            />
          )}
        </ButtonGroup>
      </HStack>

      {selectedForm && (
        <Card
          bg={backgroundColor || defaultBgColor}
          color={fontColor || defaultFontColor}
          w="810px"
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
                  bg: "gray.500",
                }}
                color={"gray.500"}
              />
              <CloseIcon fontSize="xs" cursor="pointer" color={"gray.500"} onClick={onCancel} />
            </HStack>

            <Box overflowY="auto" maxH="700px" flex={1}>
              <VStack spacing={4} align="stretch">
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
                              fontColor={fontColor}
                              defaultFontColor={defaultFontColor}
                              isSaving={isSaving}
                              editField={editField}
                              deleteField={deleteField}
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
                            color={fontColor || defaultFontColor}>
                            Add Field
                          </Button>
                        </VStack>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Box>

                <CardFooter>
                  <ButtonGroup spacing={2} justifyContent="end" width="100%">
                    <Button variant="ghost">Cancel</Button>
                    <Button colorScheme="teal" mr={3}>
                      Submit
                    </Button>
                  </ButtonGroup>
                </CardFooter>
              </VStack>
            </Box>

            {/* Form Settings Drawer */}
            <Drawer isOpen={isSettingsOpen} placement="right" onClose={onSettingsClose} size="md">
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader color={headerTextColor}>Form Settings</DrawerHeader>

                <DrawerBody>
                  <VStack spacing={6} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Form Name</FormLabel>
                      <Input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Enter form name"
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

                <DrawerFooter bg={drawerFooterBg}>
                  <Button
                    variant="outline"
                    mr={3}
                    onClick={onSettingsClose}
                    borderColor={"gray.300"}>
                    Close
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Field Editor Drawer */}
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader color={headerTextColor}>
                  {selectedFieldIndex === -1 ? "Add Field" : "Edit Field"}
                </DrawerHeader>

                <DrawerBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Field Type</FormLabel>
                      <Select
                        value={editingField.type}
                        onChange={(e) => {
                          const newType = e.target.value as FormField["type"];
                          setEditingField((current) => ({
                            ...current,
                            type: newType,
                            options: ["select", "radio"].includes(newType) ? current.options : null,
                          }));
                        }}>
                        {FIELD_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Label</FormLabel>
                      <Input
                        value={editingField.label}
                        onChange={(e) =>
                          setEditingField((current) => ({ ...current, label: e.target.value }))
                        }
                        placeholder="Field Label"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Placeholder</FormLabel>
                      <Input
                        value={editingField.placeholder || ""}
                        onChange={(e) =>
                          setEditingField((current) => ({
                            ...current,
                            placeholder: e.target.value || null,
                          }))
                        }
                        placeholder="Placeholder text"
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Required Field</FormLabel>
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
                        <FormLabel>Options</FormLabel>
                        <VStack spacing={2} align="stretch">
                          {editingField.options?.map((option, index) => (
                            <HStack key={index}>
                              <Input
                                value={option.value}
                                onChange={(e) => updateOption(index, "value", e.target.value)}
                                placeholder="Value"
                                size="sm"
                              />
                              <Input
                                value={option.label}
                                onChange={(e) => updateOption(index, "label", e.target.value)}
                                placeholder="Label"
                                size="sm"
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
                        <FormLabel>Map to Variable</FormLabel>
                        <Select
                          value={editingField.mapped_variable || ""}
                          onChange={(e) =>
                            setEditingField((current) => ({
                              ...current,
                              mapped_variable: e.target.value || null,
                            }))
                          }>
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

                <DrawerFooter bg={drawerFooterBg}>
                  <Button variant="outline" mr={3} onClick={onClose}>
                    Cancel
                  </Button>
                  <Button colorScheme="teal" onClick={saveField} isDisabled={!editingField.label}>
                    Save
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </CardBody>
        </Card>
      )}

      {!selectedForm && (
        <Card
          w="810px"
          h="400px"
          shadow="lg"
          borderRadius="lg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderColor={cardBorderColor}
          borderWidth="1px">
          <Text fontSize="lg" color="gray.500">
            Please select a form to start editing
          </Text>
        </Card>
      )}
    </VStack>
  );
};
