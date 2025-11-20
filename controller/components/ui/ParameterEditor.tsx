import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Tag,
  FormControl,
  NumberInput,
  NumberInputField,
  Switch,
  Input,
} from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useState } from "react";

interface ParameterEditorProps {
  params: Record<string, any>;
  isEditing: boolean;
  onParamChange?: (newParams: Record<string, any>) => void;
}

export const ParameterEditor: React.FC<ParameterEditorProps> = ({
  params,
  isEditing,
  onParamChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleParamChange = (key: string, value: any) => {
    if (onParamChange) {
      onParamChange({
        ...params,
        [key]: value,
      });
    }
  };

  return (
    <VStack align="stretch" spacing={1}>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        height="24px"
        py={0}
        maxW="150px"
      >
        Parameters
      </Button>

      {isExpanded && (
        <VStack align="stretch" spacing={1} maxW="180px" pr={2}>
          {Object.entries(params).map(([key, value]) => (
            <FormControl key={key} size="sm">
              <HStack mb={0}>
                <Tag size="sm" variant="subtle" colorScheme="gray">
                  {key}
                </Tag>
              </HStack>
              {isEditing ? (
                <Box mt={1}>
                  {typeof value === "number" ? (
                    <NumberInput
                      size="sm"
                      value={value}
                      onChange={(_, val) => handleParamChange(key, val)}
                    >
                      <NumberInputField />
                    </NumberInput>
                  ) : typeof value === "boolean" ? (
                    <Switch
                      size="sm"
                      isChecked={value}
                      onChange={(e) => handleParamChange(key, e.target.checked)}
                    />
                  ) : (
                    <Input
                      size="sm"
                      value={value}
                      onChange={(e) => handleParamChange(key, e.target.value)}
                    />
                  )}
                </Box>
              ) : (
                <Text fontSize="xs" color="gray.600" pl={2}>
                  {value?.toString()}
                </Text>
              )}
            </FormControl>
          ))}
        </VStack>
      )}
    </VStack>
  );
};
