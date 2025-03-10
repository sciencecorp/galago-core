import CommandButton from "./commandButton";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import {
  Select,
  Button,
  FormControl,
  FormLabel,
  Box,
  Grid,
  VStack,
  Input,
  NumberInput,
  NumberInputField,
  Heading,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";
import Head from "next/head";
import { TeachPendant } from "@/components/tools/advanced/teach_pendant/TeachPendant";
// Assuming you're using TypeScript, you could define a type for the status object
type CommandStatus = {
  [commandName: string]: "idle" | "success" | "error";
};

// Inside your component

type AtomicFormValues = string | number | boolean | string[];
type FormValues = Record<string, AtomicFormValues | Record<string, AtomicFormValues>>;

type FieldType = "text" | "number" | "text_array" | "boolean" | Field[];

export interface Field {
  name: string;
  type: "text" | "number" | "text_array" | "boolean";
  defaultValue?: any;
}

export interface Command {
  [command: string]: Field[];
}

export type CommandFields = {
  [tool: string]: Command;
};

const move: Field[] = [
  { name: "name", type: "text" },
  { name: "motion_profile_id", type: "number", defaultValue: 2 },
];
const grasp_plate: Field[] = [
  { name: "width", type: "number", defaultValue: 122 },
  { name: "speed", type: "number", defaultValue: 10 },
  { name: "force", type: "number", defaultValue: 20 },
];
const release_plate: Field[] = [
  { name: "width", type: "number", defaultValue: 130 },
  { name: "speed", type: "number", defaultValue: 10 },
];

export const commandFields: CommandFields = {
  toolbox: {
    run_python_script: [
      {
        name: "script_content",
        type: "text",
      },
      {
        name: "blocking",
        type: "boolean",
      },
    ],
    send_slack_alert: [
      {
        name: "workcell",
        type: "text",
      },
      {
        name: "tool",
        type: "text",
      },
      {
        name: "protocol",
        type: "text",
      },
      {
        name: "error_message",
        type: "text",
      },
    ],

    timer: [
      {
        name: "time_seconds",
        type: "number",
      },
      {
        name: "message",
        type: "text",
      },
    ],
    user_message: [
      {
        name: "title",
        type: "text",
      },
      {
        name: "message",
        type: "text",
      },
      {
        name: "message_type",
        type: "text",
      },
    ],
    show_image: [
      {
        name: "file",
        type: "text",
      },
      {
        name: "title",
        type: "text",
      },
      {
        name: "width",
        type: "number",
      },
      {
        name: "height",
        type: "number",
      },
    ],
    slack_message: [
      {
        name: "message",
        type: "text",
      },
    ],
    log_media_exchange: [
      {
        name: "source_barcode",
        type: "text",
      },
      {
        name: "destination_name",
        type: "text",
      },
      {
        name: "destination_barcode",
        type: "text",
      },
      {
        name: "source_wells",
        type: "text",
      },
      {
        name: "destination_wells",
        type: "text",
      },
      {
        name: "percent_exchange",
        type: "number",
      },
      {
        name: "new_tips",
        type: "boolean",
      },
    ],
  },
  plateloc: {
    seal: [],
    set_temperature: [{ name: "temperature", type: "text" }],
    set_seal_time: [{ name: "sealTime", type: "text" }],
    get_actual_temperature: [],
    stage_in: [],
    stage_out: [],
    show_diagnostics: [],
  },
  bravo: {
    run_protocol: [{ name: "protocol_file", type: "text" }],
    run_runset: [{ name: "runset_file", type: "text" }],
  },
  hamilton: {
    run_protocol: [{ name: "protocol", type: "text" }],
    load_protocol: [{ name: "runset_file", type: "text" }],
  },
  vcode: {
    home: [],
    print_and_apply: [
      { name: "format_name", type: "text", defaultValue: "1" },
      { name: "side", type: "text", defaultValue: "west" },
      { name: "drop_stage", type: "boolean", defaultValue: true },
      { name: "field_0", type: "text", defaultValue: "Well Plate ID/Name" },
      { name: "field_1", type: "text", defaultValue: "" },
      { name: "field_2", type: "text", defaultValue: "" },
      { name: "field_3", type: "text", defaultValue: "" },
      { name: "field_4", type: "text", defaultValue: "" },
      { name: "field_5", type: "text", defaultValue: "" },
    ],

    print: [
      { name: "format_name", type: "text" },
      { name: "field_0", type: "text" },
      { name: "field_1", type: "text" },
      { name: "field_2", type: "text" },
      { name: "field_3", type: "text" },
      { name: "field_4", type: "text" },
      { name: "field_5", type: "text" },
    ],

    show_diagnostics: [],
    rotate_180: [],
    rotate_stage: [{ name: "angle", type: "number" }],
  },
  xpeel: {
    peel: [],
    check_status: [],
    reset: [],
    restart: [],
    get_remaining_tape: [],
  },
  hig_centrifuge: {
    home: [],
    close_shield: [],
    open_shield: [{ name: "bucket_id", type: "number" }],
    spin: [
      { name: "speed", type: "number" },
      { name: "acceleration", type: "number" },
      { name: "decceleration", type: "number" },
      { name: "duration", type: "number" },
    ],
  },
  bioshake: {
    grip: [],
    ungrip: [],
    home: [],
    reset: [],
    start_shake: [
      { name: "speed", type: "number" },
      { name: "duration", type: "number" },
    ],
    stop_shake: [],
    wait_for_shake_to_finish: [{ name: "timeout", type: "number" }],
  },
  cytation: {
    open_carrier: [],
    close_carrier: [],
    start_read: [
      { name: "protocol_file", type: "text", defaultValue: "C://protocols" },
      { name: "experiment_name", type: "text", defaultValue: "C://experiments" },
      { name: "well_addresses", type: "text_array", defaultValue: ["A1", "B2"] },
    ],
  },
  dataman70: {
    reset: [],
    assert_barcode: [{ name: "barcode", type: "text" }],
  },
  alps3000: {
    seal_plate: [],
  },
  liconic: {
    fetch_plate: [
      { name: "cassette", type: "number" },
      { name: "level", type: "number" },
    ],
    store_plate: [
      { name: "cassette", type: "number" },
      { name: "level", type: "number" },
    ],
    reset: [],
    raw_command: [{ name: "cmd", type: "text" }],
  },
  opentrons2: {
    run_program: [
      { name: "program_name", type: "text" },
      { name: "params", type: "text" },
    ],
    sleep: [{ name: "seconds", type: "number" }],
    pause: [],
    resume: [],
    cancel: [],
    toggle_light: [],
  },
  pf400: {
    run_sequence: [{ name: "sequence_name", type: "text" }, { name: "labware", type: "text" }],
    move: [
      { name: "name", type: "text" },
      { name: "motion_profile_id", type: "number", defaultValue: 1 },
      { name: "z_offset", type: "number", defaultValue: 0 },
    ],
    grasp_plate: [
      { name: "width", type: "number", defaultValue: 122 },
      { name: "speed", type: "number", defaultValue: 10 },
      { name: "force", type: "number", defaultValue: 20 },
    ],
    release_plate: [
      { name: "width", type: "number", defaultValue: 130 },
      { name: "speed", type: "number", defaultValue: 10 },
    ],
    retrieve_plate: [
      { name: "labware", type: "text" },
      { name: "location", type: "text" },
      { name: "z_offset", type: "number", defaultValue: 0 },
      { name: "motion_profile_id", type: "number", defaultValue: 1 },
    ],
    dropoff_plate: [
      { name: "labware", type: "text" },
      { name: "location", type: "text" },
      { name: "motion_profile_id", type: "number", defaultValue: 1 },
      { name: "z_offset", type: "number", defaultValue: 0 },
    ],
    engage: [],
    release: [],
    retract: [],
  },
};

const ToolCommands = (commands: CommandFields) => {
  return (
    <VStack align="stretch" spacing={4}>
      <Heading size="md">Commands</Heading>
      <HStack spacing={4}>
        {Object.keys(commands).map((command) => (
          <Button key={command}>{command}</Button>
        ))}
      </HStack>
    </VStack>
  );
};

export default function Page() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);

  const infoQuery = trpc.tool.info.useQuery({ toolId: id || "" });
  const toolQuery = trpc.tool.get.useQuery(id || "");
  const config = infoQuery.data;
  const [commandExecutionStatus, setCommandExecutionStatus] = useState<CommandStatus>({});
  const [selectedCommand, setSelectedCommand] = useState<string | undefined>();
  const [formValues, setFormValues] = useState<FormValues>({});

  const doesCommandHaveParameters = (commandName: string) => {
    if (!config) return false;
    const fields = commandFields[config?.type][commandName];
    return fields && fields.length > 0;
  };
  const commandOptions = config ? commandFields[config.type] : {};

  const toast = useToast();
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
        setCommandExecutionStatus((prevStatus) => ({
          ...prevStatus,
          [selectedCommand]: "success",
        }));
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
        setCommandExecutionStatus((prevStatus) => ({ ...prevStatus, [selectedCommand]: "error" }));
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

  const executeCommand = (commandName: string, params: FormValues) => {
    if (!config) return;
    toast({
      title: `Executing ${commandName}..`,
      description: `Please wait.`,
      status: "loading",
      duration: null,
      isClosable: false,
      position: "top", // or "bottom"
    });

    setCommandExecutionStatus((prevStatus) => ({ ...prevStatus, [commandName]: "idle" }));

    const toolCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type,
      command: commandName,
      params: params,
    };

    commandMutation.mutate(toolCommand, {
      onSuccess: () => {
        toast.closeAll();
        toast({
          title: `Command ${commandName} completed!`,
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
        setCommandExecutionStatus((prevStatus) => ({ ...prevStatus, [commandName]: "success" }));
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
        setCommandExecutionStatus((prevStatus) => ({ ...prevStatus, [commandName]: "error" }));
      },
    });
  };

  const handleSelectCommand = (commandName: string) => {
    // Check if the command has parameters
    if (doesCommandHaveParameters(commandName)) {
      // If it has parameters, set up for additional input
      setSelectedCommand(commandName);
    } else {
      // If it doesn't have parameters, execute it immediately
      executeCommand(commandName, {});
    }
  };
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
            <VStack spacing={4} align="stretch" flex={1}>
              <ToolStatusCard toolId={id || ""} />
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
            </VStack>
          )}

          {/* Right Side */}
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
                  config: config.config || { simulated: false },
                }}
              />
            </Box>
          )}
        </HStack>
      </Box>
    </>
  );
}
