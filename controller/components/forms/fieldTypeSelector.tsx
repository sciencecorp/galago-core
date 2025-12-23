import React from "react";
import { Box, SimpleGrid, Text, VStack, Icon } from "@chakra-ui/react";
import {
  Type,
  Hash,
  AlignLeft,
  ChevronDown,
  Circle,
  CheckSquare,
  Calendar,
  Clock,
  Upload,
  Tag,
} from "lucide-react";
import { FormField } from "@/types";
import { useCommonColors } from "../ui/Theme";

interface FieldTypeSelectorProps {
  selectedType: FormField["type"];
  onSelect: (type: FormField["type"]) => void;
}

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Text Input", icon: Type, description: "Single line text" },
  { value: "number", label: "Number", icon: Hash, description: "Numeric input" },
  { value: "textarea", label: "Textarea", icon: AlignLeft, description: "Multi-line text" },
  {
    value: "select",
    label: "Dropdown",
    icon: ChevronDown,
    description: "Select one option",
  },
  { value: "radio", label: "Radio Buttons", icon: Circle, description: "Choose one" },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare, description: "Toggle option" },
  { value: "date", label: "Date", icon: Calendar, description: "Date picker" },
  { value: "time", label: "Time", icon: Clock, description: "Time picker" },
  { value: "file", label: "File Upload", icon: Upload, description: "Upload files" },
  { value: "label", label: "Static Text", icon: Tag, description: "Display only text" },
] as const;

export const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = ({ selectedType, onSelect }) => {
  const colors = useCommonColors();

  return (
    <SimpleGrid columns={3} spacing={3}>
      {FIELD_TYPE_OPTIONS.map((fieldType) => {
        const isSelected = selectedType === fieldType.value;
        return (
          <Box
            key={fieldType.value}
            as="button"
            type="button"
            onClick={() => onSelect(fieldType.value as FormField["type"])}
            p={3}
            borderWidth="2px"
            borderRadius="md"
            borderColor={isSelected ? "teal.500" : colors.borderColor}
            bg={isSelected ? "teal.50" : colors.sectionBg}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: isSelected ? "teal.600" : "gray.400",
              bg: isSelected ? "teal.100" : colors.alternateBg,
              transform: "translateY(-2px)",
              shadow: "md",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            position="relative"
            role="group">
            <VStack spacing={1} align="center">
              <Icon
                as={fieldType.icon}
                boxSize={6}
                color={isSelected ? "teal.600" : "gray.600"}
                transition="color 0.2s"
                _groupHover={{
                  color: isSelected ? "teal.700" : "gray.700",
                }}
              />
              <Text
                fontSize="sm"
                fontWeight={isSelected ? "bold" : "medium"}
                color={isSelected ? "teal.700" : "gray.700"}
                textAlign="center"
                noOfLines={1}>
                {fieldType.label}
              </Text>
              <Text
                fontSize="xs"
                color={isSelected ? "teal.600" : "gray.500"}
                textAlign="center"
                noOfLines={1}>
                {fieldType.description}
              </Text>
            </VStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};
