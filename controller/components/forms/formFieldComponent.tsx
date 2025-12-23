import React, { useCallback } from "react";
import {
  Box,
  HStack,
  Text,
  Input,
  Textarea,
  Select,
  Checkbox,
  FormControl,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { Trash2, Copy, Settings } from "lucide-react";
import { Draggable } from "react-beautiful-dnd";
import { FormField } from "@/types";

// Static form field colors - locked appearance regardless of theme
const FIELD_STYLES = {
  borderColor: "gray.300",
  focusBorderColor: "blue.500",
  placeholderColor: "gray.400",
  editButton: {
    color: "blue.500",
    hoverBg: "blue.50",
  },
  deleteButton: {
    color: "red.500",
    hoverBg: "red.50",
  },
  checkbox: {
    checkedBg: "blue.500",
    checkedBorder: "blue.500",
  },
  // Force light color scheme for native inputs (date picker, etc.)
  inputColorScheme: "light",
} as const;

interface FormFieldComponentProps {
  field: FormField;
  index: number;
  fontColor: string | null;
  defaultFontColor: string;
  isSaving: boolean;
  editField: (index: number) => void;
  deleteField: (index: number) => void;
  duplicateField: (index: number) => void;
}

const FormFieldComponentBase: React.FC<FormFieldComponentProps> = ({
  field,
  index,
  fontColor,
  defaultFontColor,
  isSaving,
  editField,
  deleteField,
  duplicateField,
}) => {
  const fieldId = field.label || "field" + "_" + index;

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      editField(index);
    },
    [index, editField],
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      deleteField(index);
    },
    [index, deleteField],
  );

  const handleDuplicateClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      duplicateField(index);
    },
    [index, duplicateField],
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
            borderColor: FIELD_STYLES.borderColor,
          }}>
          <HStack>
            {/* Action Buttons */}
            <IconButton
              aria-label="Edit field"
              icon={<Settings size={14} />}
              size="xs"
              variant="ghost"
              position="absolute"
              top={2}
              right={14}
              onClick={handleEditClick}
              opacity={0}
              _groupHover={{ opacity: 1 }}
              zIndex={2}
              color={FIELD_STYLES.editButton.color}
              _hover={{ bg: FIELD_STYLES.editButton.hoverBg }}
            />
            <IconButton
              aria-label="Duplicate field"
              icon={<Copy size={14} />}
              size="xs"
              variant="ghost"
              position="absolute"
              top={2}
              right={8}
              onClick={handleDuplicateClick}
              opacity={0}
              _groupHover={{ opacity: 1 }}
              zIndex={2}
              color="green.500"
              _hover={{ bg: "green.50" }}
            />
            <IconButton
              aria-label="Delete field"
              icon={<Trash2 size={14} />}
              size="xs"
              variant="ghost"
              position="absolute"
              top={2}
              right={2}
              onClick={handleDeleteClick}
              opacity={0}
              _groupHover={{ opacity: 1 }}
              zIndex={2}
              color={FIELD_STYLES.deleteButton.color}
              _hover={{ bg: FIELD_STYLES.deleteButton.hoverBg }}
            />
          </HStack>

          <FormControl>
            {field.type === "label" ? (
              <Text color={fontColor || defaultFontColor} fontSize="md" py={2}>
                {field.label}
              </Text>
            ) : (
              <>
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
                    borderColor={FIELD_STYLES.borderColor}
                    focusBorderColor={FIELD_STYLES.focusBorderColor}
                    _placeholder={{ color: FIELD_STYLES.placeholderColor }}
                    sx={{ colorScheme: FIELD_STYLES.inputColorScheme }}
                  />
                )}

                {field.type === "select" && (
                  <Select
                    placeholder={field.placeholder || "Select option"}
                    cursor="pointer"
                    color={fontColor || defaultFontColor}
                    bg="transparent"
                    borderColor={FIELD_STYLES.borderColor}
                    focusBorderColor={FIELD_STYLES.focusBorderColor}
                    _placeholder={{ color: FIELD_STYLES.placeholderColor }}
                    sx={{ colorScheme: FIELD_STYLES.inputColorScheme }}>
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
                          <Radio
                            key={idx}
                            value={option.value}
                            borderColor="gray.400"
                            sx={{
                              ".chakra-radio__control": {
                                borderColor: "gray.400",
                                borderWidth: "2px",
                              },
                              ".chakra-radio__control[data-checked]": {
                                bg: FIELD_STYLES.checkbox.checkedBg,
                                borderColor: FIELD_STYLES.checkbox.checkedBorder,
                              },
                            }}>
                            <Text color={fontColor || defaultFontColor}>{option.label}</Text>
                          </Radio>
                        ))}
                      </Stack>
                    </RadioGroup>
                  </Box>
                )}

                {field.type === "checkbox" && (
                  <Box cursor="pointer" p={2} borderRadius="md" display="inline-block">
                    <Checkbox
                      borderColor="gray.400"
                      sx={{
                        ".chakra-checkbox__control": {
                          borderColor: "gray.400",
                          borderWidth: "2px",
                        },
                        ".chakra-checkbox__control[data-checked]": {
                          bg: FIELD_STYLES.checkbox.checkedBg,
                          borderColor: FIELD_STYLES.checkbox.checkedBorder,
                        },
                      }}>
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
                    borderColor={FIELD_STYLES.borderColor}
                    focusBorderColor={FIELD_STYLES.focusBorderColor}
                    _placeholder={{ color: FIELD_STYLES.placeholderColor }}
                    sx={{ colorScheme: FIELD_STYLES.inputColorScheme }}
                  />
                )}
              </>
            )}
          </FormControl>
        </Box>
      )}
    </Draggable>
  );
};

export const FormFieldComponent = React.memo(FormFieldComponentBase);
