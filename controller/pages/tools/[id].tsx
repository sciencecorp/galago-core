import CommandButton from "./commandButton";
import { ChangeEvent, useEffect, useState } from "react";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import {
  Select,
  Button,
  FormControl,
  FormLabel,
  Box,
  VStack,
  Input,
  NumberInput,
  NumberInputField,
  Heading,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";
import Head from "next/head";
import { TeachPendant } from "@/components/tools/advanced/teach_pendant/TeachPendant";
import { commandFields } from "@/components/tools/constants";

// Inside your component
type AtomicFormValues = string | number | boolean | string[];
type FormValues = Record<string, AtomicFormValues | Record<string, AtomicFormValues>>;

export default function Page() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const infoQuery = trpc.tool.info.useQuery({ toolId: id || "" });
  const toolQuery = trpc.tool.get.useQuery(id || "");
  const config = infoQuery.data;
  const [selectedCommand, setSelectedCommand] = useState<string | undefined>();
  const [formValues, setFormValues] = useState<FormValues>({});
  const toast = useToast();
  const toolCommandsDefined = Object.keys(commandFields).includes(String(config?.type));
  const commandOptions = config ? commandFields[config.type] : {};

  useEffect(() => {
    // Wait for the router to be ready and then extract the query parameter
    if (router.isReady) {
      const queryId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
      setId(queryId || null); // Ensure a null fallback if the ID is not available
    }
  }, [router.isReady, router.query.id]);

  useEffect(() => {
    if (config?.name) {
      document.title = `Tool: ${config.name}`;
    }
  }, [config?.name]);

  useEffect(() => {
    if (selectedCommand) {
      setFormValues((prevValues) => {
        const newValues = { ...prevValues };
        const fields = commandOptions[selectedCommand];

        fields.forEach((field) => {
          if (Array.isArray(field.type)) {
            const nestedFieldValues: Record<string, AtomicFormValues> = {};
            field.type.forEach((nestedField) => {
              nestedFieldValues[nestedField.name] =
                nestedField.defaultValue !== undefined ? nestedField.defaultValue : "";
            });
            newValues[field.name] = nestedFieldValues;
          }
          if (field.type === "text_array") {
            newValues[field.name] =
              field.defaultValue instanceof Array ? field.defaultValue.join(", ") : "";
          } else {
            newValues[field.name] = field.defaultValue !== undefined ? field.defaultValue : "";
          }
        });
        return newValues;
      });
    }
  }, [selectedCommand]);
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCommand(event.target.value);
    setFormValues({});
  };

  const handleSubmit = () => {
    if (!selectedCommand) return;
    if (!config) return;
    toast({
      title: `Executing ${selectedCommand}..`,
      description: `Please wait.`,
      status: "loading",
      duration: null,
      isClosable: false,
      position: "top", // or "bottom"
    });

    const toolCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type,
      command: selectedCommand,
      params: formValues,
    };
    commandMutation.mutate(toolCommand, {
      onSuccess: () => {
        toast.closeAll();
        toast({
          title: `Command ${selectedCommand} completed!`,
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
      },
      onError: (data) => {
        // Set the command status to 'error' on failure
        toast.closeAll(),
          toast({
            title: "Failed to execute command",
            description: `Error= ${data.message}`,
            status: "error",
            duration: 10000,
            isClosable: true,
            position: "top",
          });
      },
    });
  };

  const handleInputChange = (
    fieldName: string,
    fieldType: FieldType,
    value: string | number | boolean,
    parentField?: string,
  ) => {
    setFormValues((prevValues) => {
      const newValues = { ...prevValues };
      let updatedValue: AtomicFormValues = value;

      // If the field is of type 'text_array', split the string into an array.
      if (fieldType === "text_array" && typeof value === "string") {
        updatedValue = value.split(",").map((item) => item.trim());
      }

      if (parentField) {
        // If it's a nested field
        newValues[parentField] = {
          ...(newValues[parentField] as Record<string, any>),
          [fieldName]: updatedValue,
        };
      } else {
        // For top-level fields
        newValues[fieldName] = updatedValue;
      }
      return newValues;
    });
  };

  const commandMutation = trpc.tool.runCommand.useMutation();

  const renderFields = (fields: Field[], parentField?: string) => {
    return fields.map((field) => {
      if (Array.isArray(field.type)) {
        return (
          <Box key={field.name} border="1px" borderColor="gray.200" borderRadius="md" p={4} my={2}>
            <Heading size="sm" mb={2}>
              {field.name}
            </Heading>
            {renderFields(field.type, field.name)}
          </Box>
        );
      } else if (field.type === "text_array") {
        return (
          <FormControl key={field.name} my={2}>
            <FormLabel>{field.name}</FormLabel>
            <Input
              type="text"
              value={String(
                (parentField
                  ? (formValues[parentField] as Record<string, AtomicFormValues>)?.[field.name] ||
                    ""
                  : formValues[field.name]) || "",
              )}
              onChange={(e) =>
                handleInputChange(field.name, field.type, e.target.value, parentField)
              }
            />
          </FormControl>
        );
      } else {
        return (
          <FormControl key={field.name} my={2}>
            <FormLabel>{field.name}</FormLabel>
            {field.type == "boolean" ? (
              <Input
                type="boolean"
                value={String(
                  (parentField
                    ? (formValues[parentField] as Record<string, AtomicFormValues>)?.[field.name] ||
                      "false"
                    : formValues[field.name]) || "false",
                )}
                onChange={(e) =>
                  handleInputChange(field.name, field.type, e.target.value, parentField)
                }
              />
            ) : field.type === "text" ? (
              <Input
                type="string"
                value={String(
                  (parentField
                    ? (formValues[parentField] as Record<string, AtomicFormValues>)?.[field.name] ||
                      ""
                    : formValues[field.name]) || "",
                )}
                onChange={(e) =>
                  handleInputChange(field.name, field.type, e.target.value, parentField)
                }
              />
            ) : (
              <NumberInput
                value={Number(
                  (parentField
                    ? (formValues[parentField] as Record<string, AtomicFormValues>)?.[field.name] ||
                      0
                    : formValues[field.name]) || 0,
                )}
                onChange={(valueString, valueNumber) =>
                  handleInputChange(field.name, field.type, valueNumber, parentField)
                }>
                <NumberInputField />
              </NumberInput>
            )}
          </FormControl>
        );
      }
    });
  };

  return (
    <>
      <Head>
        <title>{config?.name ? `Tool: ${config.name}` : "Tool"}</title>
      </Head>
      <Box maxWidth="1800px" margin="auto">
        <HStack spacing={4} align="start" width="100%">
          {config?.type !== ToolType.pf400 && (
            <VStack spacing={4} width="100%">
              {!toolCommandsDefined && (
                <>
                  <Alert status="error" variant="left-accent" mb={2}>
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>Invalid Tool Type.</AlertDescription>
                      <AlertDescription>
                        This tool has not been defined. Contact administrator.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </>
              )}
              <ToolStatusCard toolId={id || ""} />
              {toolCommandsDefined && (
                <FormControl>
                  <VStack width="100%" spacing={1}>
                    <FormLabel>Select Command</FormLabel>
                    <Select placeholder="Select command" onChange={handleChange}>
                      {Object.keys(commandOptions).map((command) => (
                        <option key={command} value={command}>
                          {capitalizeFirst(command.replaceAll("_", " "))}
                        </option>
                      ))}
                    </Select>
                    {selectedCommand && (
                      <>
                        {renderFields(commandOptions[selectedCommand])}
                        <Button width="100%" onClick={handleSubmit} colorScheme="teal">
                          Send Command
                        </Button>
                      </>
                    )}
                  </VStack>
                </FormControl>
              )}
            </VStack>
          )}
          {config?.type === ToolType.pf400 && config && (
            <Box flex={1}>
              <TeachPendant
                toolId={id || ""}
                config={{
                  id: toolQuery.data?.id || 1,
                  type: config.type,
                  joints: 6,
                  workcell_id: 0,
                  status: "UNKNOWN",
                  last_updated: new Date(),
                  created_at: new Date(),
                  name: config.name,
                  ip: config.ip,
                  port: config.port,
                  description: config.description,
                  image_url: config.image_url,
                  config: {
                    simulated: false,
                    toolId: config.name,
                    ...config.config,
                  },
                }}
              />
            </Box>
          )}
        </HStack>
      </Box>
    </>
  );
}