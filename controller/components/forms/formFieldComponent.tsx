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
  useColorModeValue,
} from "@chakra-ui/react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoSettingsSharp } from "react-icons/io5";
import { Draggable } from "react-beautiful-dnd";
import { FormField } from "@/types";

interface FormFieldComponentProps {
  field: FormField;
  index: number;
  fontColor: string | null;
  defaultFontColor: string;
  isSaving: boolean;
  editField: (index: number) => void;
  deleteField: (index: number) => void;
}

const FormFieldComponentBase: React.FC<FormFieldComponentProps> = ({
  field,
  index,
  fontColor,
  defaultFontColor,
  isSaving,
  editField,
  deleteField,
}) => {
  const fieldId = field.label || "field" + "_" + index;
  const fieldBorderColor = useColorModeValue("gray.200", "gray.600");
  const placeHolderColor = useColorModeValue("gray.400", "gray.500");

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
                // borderColor={useColorModeValue("gray.200", "gray.600")}
                _placeholder={{ color: placeHolderColor }}
              />
            )}

            {field.type === "select" && (
              <Select
                placeholder={field.placeholder || "Select option"}
                cursor="pointer"
                color={fontColor || defaultFontColor}
                bg="transparent"
                // borderColor={useColorModeValue("gray.200", "gray.600")}
                _placeholder={{ color: placeHolderColor }}>
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
                      <Radio key={idx} value={option.value} colorScheme="blue">
                        <Text color={fontColor || defaultFontColor}>{option.label}</Text>
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </Box>
            )}

            {field.type === "checkbox" && (
              <Box cursor="pointer" p={2} borderRadius="md" display="inline-block">
                <Checkbox colorScheme="blue">
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
                _placeholder={{ color: placeHolderColor }}
              />
            )}
          </FormControl>
        </Box>
      )}
    </Draggable>
  );
};

export const FormFieldComponent = React.memo(FormFieldComponentBase);
