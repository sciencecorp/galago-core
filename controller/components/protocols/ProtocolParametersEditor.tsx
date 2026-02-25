import { useMemo } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  Switch,
  Tag,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon, ChevronDownIcon, ChevronUpIcon, DeleteIcon, WarningIcon } from "@chakra-ui/icons";
import type { ProtocolParameter, ProtocolParameterType } from "@/protocols/params";

const PARAM_TYPES: { value: ProtocolParameterType; label: string }[] = [
  { value: "string", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "select", label: "Select" },
];

function emptyParameter(): ProtocolParameter {
  return { name: "", label: "", type: "string", required: false };
}

/**
 * Scan all command params for {{varName}} and ${varName} references.
 * Returns the set of variable names referenced across all commands.
 */
function extractVariableReferences(commands: any[]): Set<string> {
  const refs = new Set<string>();
  const wholeBracePattern = /^\{\{(.+)\}\}$/;
  const inlinePattern = /\$\{([^{}]+)\}/g;

  for (const cmd of commands) {
    const params = cmd.commandInfo?.params ?? cmd.params ?? {};
    for (const key in params) {
      const val = params[key];
      if (val == null) continue;
      const str = String(val);

      const wholeMatch = wholeBracePattern.exec(str);
      if (wholeMatch) {
        refs.add(wholeMatch[1]);
      }

      let inlineMatch;
      while ((inlineMatch = inlinePattern.exec(str)) !== null) {
        refs.add(inlineMatch[1]);
      }
    }

    const skipVar = cmd.commandInfo?.advancedParameters?.skipExecutionVariable?.variable;
    if (skipVar) refs.add(skipVar);
  }
  return refs;
}

interface ProtocolParametersEditorProps {
  parameters: ProtocolParameter[];
  onChange: (parameters: ProtocolParameter[]) => void;
  isEditing: boolean;
  commands?: any[];
}

export default function ProtocolParametersEditor({
  parameters,
  onChange,
  isEditing,
  commands = [],
}: ProtocolParametersEditorProps) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: parameters.length > 0 });
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const panelBg = useColorModeValue("gray.50", "surface.panel");

  const referencedVars = useMemo(() => extractVariableReferences(commands), [commands]);
  const paramNames = useMemo(() => new Set(parameters.map((p) => p.name)), [parameters]);

  const unboundRefs = useMemo(() => {
    const unbound: string[] = [];
    for (const ref of referencedVars) {
      if (!paramNames.has(ref)) unbound.push(ref);
    }
    return unbound.sort();
  }, [referencedVars, paramNames]);

  const hasAnyUnreferenced = useMemo(() => {
    if (commands.length === 0) return false;
    return parameters.some((p) => p.name.length > 0 && !referencedVars.has(p.name));
  }, [parameters, referencedVars, commands]);

  const unreferencedNames = useMemo(
    () =>
      parameters
        .filter((p) => p.name.length > 0 && commands.length > 0 && !referencedVars.has(p.name))
        .map((p) => p.name),
    [parameters, referencedVars, commands],
  );

  const updateParam = (index: number, patch: Partial<ProtocolParameter>) => {
    const updated = parameters.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onChange(updated);
  };

  const addParam = () => {
    onChange([...parameters, emptyParameter()]);
  };

  const removeParam = (index: number) => {
    onChange(parameters.filter((_, i) => i !== index));
  };

  if (!isEditing && parameters.length === 0) return null;

  return (
    <Box
      borderWidth={hasAnyUnreferenced ? "2px" : "1px"}
      borderColor={hasAnyUnreferenced ? "orange.400" : borderColor}
      borderRadius="md"
      overflow="hidden">
      <Tooltip
        isDisabled={!hasAnyUnreferenced}
        label={`Parameter${unreferencedNames.length > 1 ? "s" : ""} not referenced by any command: ${unreferencedNames.join(", ")}`}
        hasArrow
        placement="top">
        <HStack
          px={4}
          py={2}
          cursor="pointer"
          onClick={onToggle}
          justify="space-between"
          bg={hasAnyUnreferenced ? "orange.50" : panelBg}
          _dark={hasAnyUnreferenced ? { bg: "rgba(251, 140, 0, 0.1)" } : undefined}>
          <HStack spacing={2}>
            {hasAnyUnreferenced && <WarningIcon color="orange.400" boxSize={4} />}
            <Text fontWeight="semibold">Run Parameters</Text>
            {parameters.length > 0 && (
              <Tag size="sm" colorScheme={hasAnyUnreferenced ? "orange" : "teal"}>
                {parameters.length}
              </Tag>
            )}
          </HStack>
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </HStack>
      </Tooltip>

      <Collapse in={isOpen} animateOpacity>
        <VStack align="stretch" spacing={3} p={4}>
          {parameters.length === 0 && !isEditing && (
            <Text color="gray.500" fontSize="sm">
              No parameters defined.
            </Text>
          )}

          {parameters.map((param, index) => {
            const isUnreferenced =
              param.name.length > 0 && commands.length > 0 && !referencedVars.has(param.name);
            return (
              <Box
                key={index}
                p={3}
                borderWidth="1px"
                borderColor={isUnreferenced ? "orange.300" : borderColor}
                borderRadius="md">
                <VStack align="stretch" spacing={2}>
                  <HStack spacing={2}>
                    <FormControl flex={1}>
                      <FormLabel fontSize="xs" mb={0}>
                        Variable Name
                        {isUnreferenced && (
                          <Tooltip
                            label={`No command references {{${param.name}}} or \${${param.name}}`}
                            hasArrow>
                            <WarningIcon color="orange.400" ml={1} boxSize={3} />
                          </Tooltip>
                        )}
                      </FormLabel>
                      <Input
                        size="sm"
                        placeholder="my_variable"
                        value={param.name}
                        isDisabled={!isEditing}
                        onChange={(e) => updateParam(index, { name: e.target.value })}
                      />
                    </FormControl>
                    <FormControl flex={1}>
                      <FormLabel fontSize="xs" mb={0}>
                        Display Label
                      </FormLabel>
                      <Input
                        size="sm"
                        placeholder="My Variable"
                        value={param.label}
                        isDisabled={!isEditing}
                        onChange={(e) => updateParam(index, { label: e.target.value })}
                      />
                    </FormControl>
                    <FormControl w="130px" flexShrink={0}>
                      <FormLabel fontSize="xs" mb={0}>
                        Type
                      </FormLabel>
                      <Select
                        size="sm"
                        value={param.type}
                        isDisabled={!isEditing}
                        onChange={(e) => {
                          const newType = e.target.value as ProtocolParameterType;
                          const patch: Partial<ProtocolParameter> = { type: newType };
                          if (newType !== "select") patch.options = undefined;
                          if (newType === "boolean") patch.defaultValue = "false";
                          onChange(
                            parameters.map((p, i) => (i === index ? { ...p, ...patch } : p)),
                          );
                        }}>
                        {PARAM_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    {isEditing && (
                      <IconButton
                        aria-label="Remove parameter"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        alignSelf="flex-end"
                        onClick={() => removeParam(index)}
                      />
                    )}
                  </HStack>

                  <HStack spacing={2}>
                    {param.type !== "boolean" && (
                      <FormControl flex={1}>
                        <FormLabel fontSize="xs" mb={0}>
                          Default Value
                        </FormLabel>
                        <Input
                          size="sm"
                          placeholder="Optional default"
                          value={param.defaultValue ?? ""}
                          isDisabled={!isEditing}
                          onChange={(e) => updateParam(index, { defaultValue: e.target.value })}
                        />
                      </FormControl>
                    )}
                    {param.type === "boolean" && (
                      <FormControl flex={1}>
                        <FormLabel fontSize="xs" mb={0}>
                          Default Value
                        </FormLabel>
                        <Select
                          size="sm"
                          value={param.defaultValue ?? "false"}
                          isDisabled={!isEditing}
                          onChange={(e) => updateParam(index, { defaultValue: e.target.value })}>
                          <option value="false">false</option>
                          <option value="true">true</option>
                        </Select>
                      </FormControl>
                    )}
                    {param.type === "select" && (
                      <FormControl flex={1}>
                        <FormLabel fontSize="xs" mb={0}>
                          Options (comma-separated)
                        </FormLabel>
                        <Input
                          size="sm"
                          placeholder="option1, option2, option3"
                          value={param.options?.join(", ") ?? ""}
                          isDisabled={!isEditing}
                          onChange={(e) =>
                            updateParam(index, {
                              options: e.target.value.split(",").map((s) => s.trim()),
                            })
                          }
                        />
                      </FormControl>
                    )}
                    <FormControl w="100px" flexShrink={0}>
                      <FormLabel fontSize="xs" mb={0}>
                        Required
                      </FormLabel>
                      <Switch
                        size="sm"
                        mt={1}
                        isChecked={param.required ?? false}
                        isDisabled={!isEditing}
                        onChange={(e) => updateParam(index, { required: e.target.checked })}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel fontSize="xs" mb={0}>
                      Description
                    </FormLabel>
                    <Input
                      size="sm"
                      placeholder="Optional help text"
                      value={param.description ?? ""}
                      isDisabled={!isEditing}
                      onChange={(e) => updateParam(index, { description: e.target.value })}
                    />
                  </FormControl>
                </VStack>
              </Box>
            );
          })}

          {isEditing && (
            <Button leftIcon={<AddIcon />} size="sm" variant="outline" onClick={addParam}>
              Add Parameter
            </Button>
          )}

          {isEditing && unboundRefs.length > 0 && (
            <Alert status="info" variant="left-accent" fontSize="sm" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="semibold" fontSize="xs">
                  Variables referenced in commands without a matching parameter:
                </Text>
                <Text fontSize="xs" mt={1}>
                  {unboundRefs.map((name) => `{{${name}}}`).join(", ")}
                </Text>
              </Box>
            </Alert>
          )}
        </VStack>
      </Collapse>
    </Box>
  );
}
