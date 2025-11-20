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
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Portal,
} from "@chakra-ui/react";
import { RiAddFill, RiDeleteBin6Line, RiSaveLine } from "react-icons/ri";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  MdTextFields,
  MdNumbers,
  MdSubject,
  MdArrowDropDownCircle,
  MdRadioButtonChecked,
  MdCheckBox,
  MdCalendarToday,
  MdAccessTime,
  MdUploadFile,
  MdLabel,
} from "react-icons/md";
import { FaRegListAlt } from "react-icons/fa";
import { CloseIcon } from "@chakra-ui/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { trpc } from "@/utils/trpc";
import { successToast, errorToast } from "../ui/Toast";
import { IoSettingsSharp } from "react-icons/io5";
import { DeleteWithConfirmation } from "../ui/Delete";
import { FormField, Form, FIELD_TYPES, DEFAULT_EDITING_FIELD } from "@/types";
import { ColorPicker } from "./colorPicker";
import { FormFieldComponent } from "./formFieldComponent";
import { FieldTypeSelector } from "./fieldTypeSelector";
import { MdDownload } from "react-icons/md";
import { downloadFile } from "@/server/utils/api";
import { useCommonColors, useTextColors } from "../ui/Theme";

// Static form defaults - these should NOT change with dark mode
// Forms are "locked" to their designed appearance regardless of theme
const FORM_DEFAULTS = {
  backgroundColor: "white",
  fontColor: "gray.800",
  borderColor: "gray.200",
  placeholderColor: "gray.400",
  buttonColors: {
    primary: {
      bg: "teal.500",
      color: "white",
      hoverBg: "teal.600",
    },
    ghost: {
      color: "gray.800",
      hoverBg: "rgba(0, 0, 0, 0.05)",
    },
  },
} as const;

interface FormBuilderProps {
  forms: Form[];
  onSelectForm?: (form: Form) => void;
  onCancel?: () => void;
  onUpdate?: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  forms,
  onCancel,
  onUpdate,
  onSelectForm,
}) => {
  const colors = useCommonColors();
  const textColors = useTextColors();

  // Use static form defaults (for the UI chrome around the form)
  const cardBorderColor = colors.borderColor;
  const headerTextColor = textColors.primary;

  // Dark mode compatible menu colors
  const menuBg = useColorModeValue("white", "gray.700");
  const menuBorderColor = useColorModeValue("gray.200", "gray.600");

  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formName, setFormName] = useState("");
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [fontColor, setFontColor] = useState<string | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const [editingField, setEditingField] = useState<FormField>(
    DEFAULT_EDITING_FIELD,
  );
  const drawerFooterBg = colors.sectionBg;

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

  const addField = (fieldType: FormField["type"] = "text") => {
    const newField: FormField = {
      type: fieldType,
      label:
        fieldType === "label" ? "Static text" : `Field ${fields.length + 1}`,
      required: false,
      placeholder: fieldType === "label" ? null : "Enter text...",
      options: ["select", "radio"].includes(fieldType) ? [] : null,
      default_value: null,
      mapped_variable: null,
    };

    setFields((currentFields) => [...currentFields, newField]);

    // Auto-open the drawer to edit the new field
    setEditingField(newField);
    setSelectedFieldIndex(fields.length); // The index of the new field
    onOpen();
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

  const duplicateField = useCallback((index: number) => {
    setFields((currentFields) => {
      const fieldToDuplicate = currentFields[index];
      const duplicatedField = {
        ...fieldToDuplicate,
        label: `${fieldToDuplicate.label} (Copy)`,
      };
      // Insert the duplicated field right after the original
      const newFields = [...currentFields];
      newFields.splice(index + 1, 0, duplicatedField);
      return newFields;
    });
    successToast("Success", "Field duplicated successfully");
  }, []);

  const saveField = () => {
    if (selectedFieldIndex !== null && selectedFieldIndex >= 0) {
      setFields((currentFields) => {
        const newFields = [...currentFields];
        newFields[selectedFieldIndex] = { ...editingField };
        return newFields;
      });
      successToast("Success", "Field saved successfully");
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
      errorToast("Error", `Failed to save form. ${error}`);
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

  const onExportForm = async () => {
    if (!selectedForm) {
      errorToast("Error", "Please select a form to export");
      return;
    }
    await downloadFile(`/forms/${selectedForm.id}/export`);
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
    <VStack spacing={4} align="center">
      <HStack
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        w="810px"
      >
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
                onSelectForm?.(form);
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
            width="300px"
          >
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
            flex={1}
          >
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
          bg={backgroundColor || FORM_DEFAULTS.backgroundColor}
          color={fontColor || FORM_DEFAULTS.fontColor}
          w="810px"
          h="auto"
          shadow="lg"
          borderRadius="lg"
          display="flex"
          transition="all 0.3s ease"
          borderColor={cardBorderColor}
          borderWidth="1px"
        >
          <CardBody display="flex" flexDirection="column" position="relative">
            <HStack spacing={2} mb={4}>
              <VStack flex={1} spacing={1} textAlign="center">
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color={fontColor || FORM_DEFAULTS.fontColor}
                >
                  {formName.trim() || "Untitled Form"}
                </Text>
              </VStack>

              <Tooltip label="Download Form" openDelay={1000} hasArrow>
                <IconButton
                  aria-label="Download Form"
                  icon={<MdDownload />}
                  variant="outline"
                  onClick={onExportForm}
                  size="sm"
                  borderColor={FORM_DEFAULTS.placeholderColor}
                  color={fontColor || FORM_DEFAULTS.fontColor}
                  _hover={{ bg: FORM_DEFAULTS.buttonColors.ghost.hoverBg }}
                />
              </Tooltip>
              <IconButton
                aria-label="Form settings"
                icon={<IoSettingsSharp />}
                size="sm"
                variant="ghost"
                onClick={onSettingsOpen}
                color={fontColor || FORM_DEFAULTS.fontColor}
                _hover={{
                  bg: FORM_DEFAULTS.buttonColors.ghost.hoverBg,
                }}
              />
              {/* <CloseIcon fontSize="xs" cursor="pointer" color={"gray.500"} onClick={onCancel} /> */}
            </HStack>

            <Box overflowY="auto" maxH="700px" flex={1}>
              <VStack spacing={4} align="stretch">
                <Box p={2}>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="form-fields">
                      {(provided) => (
                        <VStack
                          spacing={0}
                          align="stretch"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          role="group"
                        >
                          {fields.map((field, index) => (
                            <FormFieldComponent
                              key={field.label + "_" + index}
                              field={field}
                              index={index}
                              fontColor={fontColor}
                              defaultFontColor={FORM_DEFAULTS.fontColor}
                              isSaving={isSaving}
                              editField={editField}
                              deleteField={deleteField}
                              duplicateField={duplicateField}
                            />
                          ))}
                          {provided.placeholder}

                          {/* Empty state when no fields */}
                          {fields.length === 0 && (
                            <VStack spacing={3} py={8} opacity={0.7}>
                              <Icon
                                as={RiAddFill}
                                boxSize={12}
                                color="gray.400"
                              />
                              <Text
                                fontSize="lg"
                                fontWeight="medium"
                                color={fontColor || FORM_DEFAULTS.fontColor}
                              >
                                No fields yet
                              </Text>
                              <Text
                                fontSize="sm"
                                color="gray.500"
                                textAlign="center"
                                px={4}
                              >
                                Click the button below to add your first field
                              </Text>
                            </VStack>
                          )}

                          {/* Add Field Menu */}
                          <Menu placement="left-end">
                            <MenuButton
                              as={Button}
                              leftIcon={<RiAddFill />}
                              variant="outline"
                              size="lg"
                              py={8}
                              isDisabled={isSaving}
                              mt={4}
                              borderStyle="dashed"
                              borderWidth="2px"
                              borderColor={FORM_DEFAULTS.borderColor}
                              color={fontColor || FORM_DEFAULTS.fontColor}
                              bg="transparent"
                              _hover={{
                                bg: FORM_DEFAULTS.buttonColors.ghost.hoverBg,
                              }}
                              _active={{
                                bg: FORM_DEFAULTS.buttonColors.ghost.hoverBg,
                              }}
                            >
                              Add Field
                            </MenuButton>
                            <Portal>
                              <MenuList
                                maxH="400px"
                                overflowY="auto"
                                bg={menuBg}
                                borderColor={menuBorderColor}
                              >
                                <MenuItem
                                  icon={<MdTextFields size={20} />}
                                  onClick={() => addField("text")}
                                >
                                  Text Input
                                </MenuItem>
                                <MenuItem
                                  icon={<MdNumbers size={20} />}
                                  onClick={() => addField("number")}
                                >
                                  Number
                                </MenuItem>
                                <MenuItem
                                  icon={<MdSubject size={20} />}
                                  onClick={() => addField("textarea")}
                                >
                                  Textarea
                                </MenuItem>
                                <MenuItem
                                  icon={<MdArrowDropDownCircle size={20} />}
                                  onClick={() => addField("select")}
                                >
                                  Dropdown
                                </MenuItem>
                                <MenuItem
                                  icon={<MdRadioButtonChecked size={20} />}
                                  onClick={() => addField("radio")}
                                >
                                  Radio Buttons
                                </MenuItem>
                                <MenuItem
                                  icon={<MdCheckBox size={20} />}
                                  onClick={() => addField("checkbox")}
                                >
                                  Checkbox
                                </MenuItem>
                                <MenuItem
                                  icon={<MdCalendarToday size={20} />}
                                  onClick={() => addField("date")}
                                >
                                  Date
                                </MenuItem>
                                <MenuItem
                                  icon={<MdAccessTime size={20} />}
                                  onClick={() => addField("time")}
                                >
                                  Time
                                </MenuItem>
                                <MenuItem
                                  icon={<MdUploadFile size={20} />}
                                  onClick={() => addField("file")}
                                >
                                  File Upload
                                </MenuItem>
                                <MenuItem
                                  icon={<MdLabel size={20} />}
                                  onClick={() => addField("label")}
                                >
                                  Static Text
                                </MenuItem>
                              </MenuList>
                            </Portal>
                          </Menu>
                        </VStack>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Box>

                <CardFooter>
                  <ButtonGroup spacing={3} justifyContent="center" width="100%">
                    <Button
                      minW="120px"
                      variant="ghost"
                      color={
                        fontColor || FORM_DEFAULTS.buttonColors.ghost.color
                      }
                      _hover={{ bg: FORM_DEFAULTS.buttonColors.ghost.hoverBg }}
                    >
                      Cancel
                    </Button>
                    <Button
                      minW="120px"
                      mr={3}
                      bg={FORM_DEFAULTS.buttonColors.primary.bg}
                      color={FORM_DEFAULTS.buttonColors.primary.color}
                      _hover={{
                        bg: FORM_DEFAULTS.buttonColors.primary.hoverBg,
                      }}
                    >
                      Submit
                    </Button>
                  </ButtonGroup>
                </CardFooter>
              </VStack>
            </Box>

            {/* Form Settings Drawer */}
            <Drawer
              isOpen={isSettingsOpen}
              placement="right"
              onClose={onSettingsClose}
              size="md"
            >
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader color={headerTextColor}>
                  Form Settings
                </DrawerHeader>

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
                    borderColor={"gray.300"}
                  >
                    Close
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Field Editor Drawer */}
            <Drawer
              isOpen={isOpen}
              placement="right"
              onClose={onClose}
              size="md"
            >
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader color={headerTextColor}>
                  {selectedFieldIndex === -1 ? "Add Field" : "Edit Field"}
                </DrawerHeader>

                <DrawerBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel mb={3}>Field Type</FormLabel>
                      <FieldTypeSelector
                        selectedType={editingField.type}
                        onSelect={(newType) => {
                          setEditingField((current) => ({
                            ...current,
                            type: newType,
                            options: ["select", "radio"].includes(newType)
                              ? current.options
                              : null,
                          }));
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>
                        {editingField.type === "label"
                          ? "Text Content"
                          : "Label"}
                      </FormLabel>
                      <Input
                        value={editingField.label}
                        onChange={(e) =>
                          setEditingField((current) => ({
                            ...current,
                            label: e.target.value,
                          }))
                        }
                        placeholder={
                          editingField.type === "label"
                            ? "Static text to display"
                            : "Field Label"
                        }
                      />
                    </FormControl>

                    {editingField.type !== "label" && (
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
                    )}

                    {editingField.type !== "label" && (
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0">Required Field</FormLabel>
                        <Switch
                          isChecked={editingField.required}
                          onChange={(e) =>
                            setEditingField((current) => ({
                              ...current,
                              required: e.target.checked,
                            }))
                          }
                          colorScheme="blue"
                        />
                      </FormControl>
                    )}

                    {["select", "radio"].includes(editingField.type) && (
                      <FormControl>
                        <FormLabel>Options</FormLabel>
                        <VStack spacing={2} align="stretch">
                          {editingField.options?.map((option, index) => (
                            <HStack key={index}>
                              <Input
                                value={option.value}
                                onChange={(e) =>
                                  updateOption(index, "value", e.target.value)
                                }
                                placeholder="Value"
                                size="sm"
                              />
                              <Input
                                value={option.label}
                                onChange={(e) =>
                                  updateOption(index, "label", e.target.value)
                                }
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
                            colorScheme="blue"
                          >
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
                          }
                        >
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
                  <Button
                    colorScheme="teal"
                    onClick={saveField}
                    isDisabled={!editingField.label}
                  >
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
          bg={colors.sectionBg}
          borderColor={colors.borderColor}
          borderWidth="1px"
        >
          <CardBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <VStack spacing={4}>
              <Box p={4} borderRadius="full" bg={colors.alternateBg}>
                <FaRegListAlt size={48} color={textColors.secondary} />
              </Box>
              <VStack spacing={2}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={textColors.primary}
                >
                  No Form Selected
                </Text>
                <Text
                  fontSize="md"
                  color={textColors.secondary}
                  textAlign="center"
                >
                  Select a form from the dropdown above to start editing
                </Text>
                <Text
                  fontSize="sm"
                  color={textColors.secondary}
                  textAlign="center"
                  opacity={0.8}
                >
                  or create a new form using the &quot;New Form&quot; button
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};
