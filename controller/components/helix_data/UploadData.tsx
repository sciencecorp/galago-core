import React, { useCallback, useState, FormEvent, useEffect, useRef } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  UnorderedList,
  ListItem,
  RadioGroup,
  Stack,
  Radio,
  IconButton,
  NumberInput,
  NumberInputField,
  Heading,
  Center,
  HStack,
  Flex,
  Textarea,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { CloseIcon } from "@chakra-ui/icons";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { buildGoogleStructValue } from "utils/struct";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { helixClient } from "@/server/utils/HelixClient";

type DataType = "pERG" | "ECoG";

interface DataTypeField {
  name: string;
  type: string;
  link_type?: string;
  editable?: boolean;
  default_value?: string;
}

interface CancelablePromiseError {
  isCanceled?: boolean;
}

interface CancelablePromise {
  promise: Promise<any>;
  cancel: () => void;
}

type IsValidType = {
  [key: string]: boolean;
};

function createField(field: Partial<DataTypeField>): DataTypeField {
  return {
    name: "",
    type: "",
    editable: true,
    ...field,
  };
}

const dataTypeFieldCollection: Record<string, DataTypeField[]> = {
  "pERG": [
    createField({ name: "study_id", type: "text", default_value: "SR2301", editable: false }),
    createField({ name: "acquisition_time", type: "text", editable: true }),
    createField({ name: "animal_name", type: "link", link_type: "animals", editable: true }),
    createField({ name: "stats", type: "json", default_value: "{}", editable: true }),
  ],
  "ECoG": [
    createField({ name: "ecog_array", type: "text", editable: true, default_value: "hd_array" }),
    createField({ name: "acq_board", type: "text", editable: true, default_value: "intan" }),
    createField({ name: "animal_name", type: "link", link_type: "animals", editable: true }),
  ],
};

const UploadData: React.FC = ({}) => {
  const [dataType, setDataType] = useState<DataType>("pERG");
  const [files, setFiles] = useState<File[]>([]);

  const [message, setMessage] = useState<string>("{}");
  const [messageColor, setMessageColor] = useState<string>("");

  const [postSuccess, setPostSuccess] = useState<boolean>(false);
  let valOnly: boolean = false;

  const initialFormInputs = dataTypeFieldCollection[dataType].reduce((acc, field) => {
    return { ...acc, [field.name]: field.default_value || "" };
  }, {});
  const [formInputs, setFormInputs] = useState<Record<string, string | number>>(initialFormInputs);

  const [formKey, setFormKey] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const [isValid, setIsValid] = useState<IsValidType>({});
  const [isLoading, setIsLoading] = useState(false);

  const commandMutation = trpc.tool.runCommand.useMutation();

  const isCancelablePromiseError = (error: any): error is CancelablePromiseError =>
  error && typeof error.isCanceled === 'boolean';
  
  const dummyCancelable: CancelablePromise = {
    promise: new Promise((resolve, reject) => {}),
    cancel: () => {},
  };
  
  const currentValidation = useRef<CancelablePromise>(dummyCancelable);

  const makeCancelable = (promise: Promise<any>) => {
    let hasCanceled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
      promise.then((val) => (hasCanceled ? reject({ isCanceled: true }) : resolve(val)));
      promise.catch((error) => (hasCanceled ? reject({ isCanceled: true }) : reject(error)));
    });

    return {
      promise: wrappedPromise,
      cancel() {
        hasCanceled = true;
      },
    };
  };

  useEffect(() => {
    async function validateInput() {
      // Cancel the previous validation if it's still in progress
      if (currentValidation.current) {
        currentValidation.current.cancel();
      }

      const validationPromises = dataTypeFieldCollection[dataType]
        .filter((field) => field.type === "link")
        .map((field) => {
          const promise = helixClient.checkNameMatches(`${formInputs[field.name]}`, field.link_type);
          const cancelablePromise = makeCancelable(promise);
          currentValidation.current = cancelablePromise;
          return cancelablePromise.promise.then((result) => ({ [field.name]: result }));
        });

      try {
        const results = await Promise.all(validationPromises);
        const newIsValid = results.reduce((acc, curr) => {
          return { ...acc, ...curr };
        }, {}) as IsValidType;

        setIsValid(newIsValid);
      } catch (error) {
        if (isCancelablePromiseError(error)) {
          // If error is due to cancelation, do nothing
          if (!error.isCanceled) {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    validateInput();
  }, [formInputs]);

  const handleSubmission = async (event: FormEvent, action: string) => {
    event.preventDefault();
    valOnly = action === "validate";

    const objectData = buildGoogleStructValue(formInputs);

    const filesForToolCommand = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
          // send data if we are submitting to helix/ceph or if it's a type we might
          // extract validation information from - will likely add .xml, .json, .yml
          if (!valOnly || file.name.endsWith(".csv") || file.name.endsWith(".pdf")) {
            const binaryStr = reader.result;
            const fileData = {
              // load data into Uint8Array
              data: new Uint8Array(binaryStr as ArrayBuffer),
              filename: file.name,
            };
            resolve(fileData);
          } else {
            const fileData = {
              // empty Array, don't need all the data for validation
              data: new Uint8Array(0),
              filename: file.name,
            };
            resolve(fileData);
          }
        };
        reader.readAsArrayBuffer(file);
      });
    });

    const filesResolved = await Promise.all(filesForToolCommand);

    const availableIDsQuery = trpc.tool.availableIDs.useQuery();
    const availableIDs = availableIDsQuery.data;
    const commandMutation = trpc.tool.runCommand.useMutation();
    const helixID: string | undefined = availableIDs?.filter((id) => id.includes("helix"))[0];
    if (!helixID) {
      return;
    }
    const toolCommand: ToolCommandInfo = {
      toolId: helixID,
      toolType: ToolType.helix_tool,
      command: "post_data_object",
      params: {
        data_type: dataType,
        files: filesResolved,
        val_only: valOnly,
        object_data: objectData,
      },
    };

    const response: ExecuteCommandReply | undefined = await commandMutation.mutateAsync(
      toolCommand
    );

    if (response && response.response === ResponseCode.SUCCESS) {

      setPostSuccess(true);
      setMessage(
          JSON.stringify(JSON.parse(response.error_message.replace(/'/g, '"')), undefined, 4)
      );
      const record_json = JSON.parse(response.error_message.replace(/'/g, '"'));
      setFormInputs((prevInputs) => {
        const newInputs = { ...prevInputs };
        dataTypeFieldCollection[dataType].forEach((field) => {
          newInputs[field.name] = record_json.object_data[field.name];
        });
        return newInputs;
      });
    

      if (valOnly) {
        setMessageColor("green");
      } else {
        setMessageColor("blue");
      }
    } else {
      if (response) {
        setMessage(response.error_message);
      }
      setPostSuccess(false);
      setMessageColor("red");
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((file, i) => i !== index));
  };

  const handleFormChange = (name: string, value: string | number) => {
    setFormInputs((prevInputs) => {
      const newInputs = { ...prevInputs, [name]: value };
      return newInputs;
    });
  };

  const resetComponent = async (event: FormEvent) => {
    event.preventDefault();
    _resetComponent();
  };

  const _resetComponent = () => {
    setPostSuccess(false);
    setMessage("");
    setFiles([]);
    setFormKey((prevKey) => prevKey + 1);

    const initialFormInputs = dataTypeFieldCollection[dataType].reduce((acc, field) => {
      return { ...acc, [field.name]: field.default_value || "" };
    }, {});

    setFormInputs(initialFormInputs);
  };

  //useEffect so that when dataType is updated, the form is reset
  useEffect(() => {
    _resetComponent();
  }, [dataType]);

  const handleFormSubmission = (event: React.FormEvent) => {
    event.preventDefault(); // this will prevent the actual form submission
  };
  

  return (
    <Box mt={4} w="800px">
      <Center>
        <Heading as="h1" size="2xl" mb={2}>
          Upload Data
        </Heading>
      </Center>
      <br />
      <Flex direction={{ base: "column", md: "row" }} wrap="wrap">
        <Box flexBasis={{ base: "100%", md: "50%" }} pr={4}>
          <Box mb={4}>
            <Heading size="lg" mb={2}>
              Data Object Type
            </Heading>
            <RadioGroup onChange={(nextValue) => setDataType(nextValue as DataType)} value={dataType}>
              <Stack direction="row">
                {Object.keys(dataTypeFieldCollection).map((keyName) => (
                  <Radio key={keyName} value={keyName}>
                    {keyName}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </Box>
          <Box>
            <Heading as="h4" size="lg" mb={2}>
              Object Data
            </Heading>
            {dataType && (
              <Stack spacing={2}>
                {dataTypeFieldCollection[dataType].map((field) => (
                  <FormControl key={field.name}>
                    <HStack>
                      <FormLabel>{field.name}</FormLabel>
                      {field.type === "text" && (
                        <Input
                          type="text"
                          isReadOnly={!field.editable}
                          onChange={(e) => handleFormChange(field.name, e.target.value)}
                          value={formInputs[field.name] || ""}
                        />
                      )}
                      {field.type === "number" && (
                        <NumberInput
                          isReadOnly={!field.editable}
                          onChange={(valueString, valueNumber) =>
                            handleFormChange(field.name, valueNumber)
                          }
                          value={formInputs[field.name] || ""}>
                          <NumberInputField />
                        </NumberInput>
                      )}
                      {field.type === "link" && (
                        <Box>
                          <HStack>
                            <Input
                              type="text"
                              isReadOnly={!field.editable}
                              onChange={(e) => handleFormChange(field.name, e.target.value)}
                              value={formInputs[field.name]}
                            />
                            {isValid[field.name] ? (
                              <Text color="green">✔</Text>
                            ) : (
                              <Text color="red">✖</Text>
                            )}
                          </HStack>
                        </Box>
                      )}
                      {field.type === "json" && (
                        <Accordion allowMultiple>
                          <AccordionItem>
                            <AccordionButton>
                              <Box as="span" flex="1" textAlign="left">
                                Expand
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                              <Code>
                                <pre>{JSON.stringify(formInputs[field.name] || {}, null, 2)}</pre>
                              </Code>
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </HStack>
                  </FormControl>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
        <Box flexBasis={{ base: "100%", md: "50%" }} pl={4} pb={4}>
          <Box mb={4}>
            <Heading as="h4" size="lg" mb={2}>
              Data Files
            </Heading>
            <Box {...getRootProps()} p={4} border="2px dashed gray" mt={2}>
              <input {...getInputProps()} />
              <Box>
                <Text>{"Drag 'n' drop some files here, or click to select files"}</Text>
              </Box>
              <UnorderedList mt={2}>
                {files.map((file, index) => (
                  <ListItem key={index}>
                    {file.name}
                    <IconButton
                      aria-label="Remove File"
                      size="xs"
                      icon={<CloseIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    />
                  </ListItem>
                ))}
              </UnorderedList>
            </Box>
          </Box>
          <Box>
            <Heading as="h4" size="lg" mb={2}>
              Response
            </Heading>
            <Textarea
              value={message}
              isReadOnly={true}
              color={messageColor}
              height="200px"></Textarea>
          </Box>
        </Box>
      </Flex>
      <Box mt={4}>
        <form onSubmit={handleFormSubmission}>
          <Stack spacing={4} direction="row" align="center" mt={4}>
            <Button
              colorScheme="green"
              onClick={(e) => handleSubmission(e, "validate")}
              type="submit">
              Validate/Extract
            </Button>
            <Button colorScheme="blue" onClick={(e) => handleSubmission(e, "submit")} type="submit">
              Commit to Helix/Ceph
            </Button>
            <Button colorScheme="red" onClick={(e) => resetComponent(e)} type="reset">
              Reset
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default UploadData;
