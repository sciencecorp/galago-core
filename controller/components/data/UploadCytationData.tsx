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
  AlertTitle,
  Heading,
  Center,
  HStack,
  Flex,
  Alert,
  AlertIcon,
  VStack,
  FormHelperText,
  Icon,
  AlertDescription,
  CloseButton,
  useToast
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { CloseIcon } from "@chakra-ui/icons";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { buildGoogleStructValue } from "utils/struct";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { helixClient } from "@/server/utils/HelixClient";
import { useFilePicker } from 'use-file-picker';
import { FiFile } from 'react-icons/fi'
import Fuse from 'fuse.js';
import { FaSadCry } from "react-icons/fa";
import { DateTime } from "luxon";

type DataType = "Cytation";

interface CancelablePromiseError {
  isCanceled?: boolean;
}

interface CancelablePromise {
  promise: Promise<any>;
  cancel: () => void;
}

const UploadCytationData: React.FC = ({}) => {
  const [cachedWellPlates, setCachedWellPlates] = useState<string[]>([]);
  const [filePickerTarget, setFilePickerTarget] = useState('');
  const [selectedCytationProtocol, setSelectedCytationProtocol] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { openFilePicker, filesContent, loading } = useFilePicker({
    accept: '.prt',
    multiple: false
  });
  const commandMutation = trpc.tool.runCommand.useMutation();

  const [wellPlateId, setWellPlateId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<(string[])>([]);
  const [showSuggestedResults, setShowSuggestedResults] = useState<boolean>(true);
  const [dataFolder, setDataFolder] = useState<string>("");
  const [wellPlateIsValid, setWellPlateIsValid] = useState<boolean>(false);
  const [folderPathIsValid, setFolderPathIsValid] = useState<boolean>(false);
  const [alertStatus, setAlertStatus] = useState<
    "error" | "info" | "warning" | "success" | "loading"
  >("success");
  const [alertDescription, setAlertDescription] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const toast = useToast();

  const getLastHelixWellPlates = async () => {
    console.log("Getting last 40 well plates from helix");
    const wellPlates =  await helixClient.getPaginatedWellPlates(40);
    if(wellPlates.length > 0 ){
      const wellPlatesIdArray = wellPlates.map(plate => String(plate.id));
      setCachedWellPlates(wellPlatesIdArray);
    }
  }

  const launchAlert = (
    status: "error" | "info" | "warning" | "success" | "loading",
    description: string
  ) => {
    toast({
      title: "Validation Error",
      description: description,
      status: status,
      duration: 3000,
      isClosable: true,
      position: "top"
    });
  };

  const validateWellPlate = async (): Promise<boolean> => {
    try {
      const wellPlate = await helixClient.getWellPlate(Number(wellPlateId));
      if (wellPlate.barcode) {
        setWellPlateIsValid(true);
        launchAlert('success',`Success validating well plate!`)
        return true;
      } else {
        setWellPlateIsValid(false);
        launchAlert("error",`Failed to validate well plate id ${wellPlateId}\n`);
        return false;
      }
    } catch {
      //console.log("Well plate is not valid");
      setWellPlateIsValid(false);
      launchAlert("error",`Failed to validate well plate id ${wellPlateId}\n`)
      return false;
    }
  };

  const validateDirectory = async () : Promise<boolean> => {
    if(!dataFolder) {
      return false;
    }
    try {
      const toolCommand: ToolCommandInfo = {
        toolId: "toolbox",
        toolType: "toolbox" as ToolType,
        command: "validate_folder",
        params: {
          folder_path:dataFolder
        },
    };
      const response = await commandMutation.mutateAsync(
        toolCommand
      );
      if(response?.meta_data && response?.meta_data.result == true){
        setFolderPathIsValid(true);
        launchAlert('success',`Success validating folder!`)
        return true;
      }
      else{
        setFolderPathIsValid(false);    
        launchAlert('error',`Failed to validate specified folder.`)
        return false;
      }
    } catch {
      setFolderPathIsValid(false);
      launchAlert('error',`Failed to validate specified folder.`)
      return false;
    }
  }

  useEffect(()=>{
    getLastHelixWellPlates();
  },[])

  
  useEffect(() => {
    if (filesContent.length > 0) {
        const filePath = filesContent[0].name; // This is the file name
        const lastModified = filesContent[0].lastModified; // This is the file full path
        //console.log("Last modified" + lastModified);
        if (filesContent[0].content) {
            // Update the appropriate state based on which button was clicked
            if (filePickerTarget === 'cytationProtocol') {
                setSelectedCytationProtocol(filePath);
            }
        }
    }
  }, [filesContent]);


  //Search for well plates with fuzzy logic
  const handleWellPlateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const wellPlateQuery: string = e.target.value;
    setWellPlateId(wellPlateQuery);
    if (wellPlateQuery && cachedWellPlates) {
        const fuse = new Fuse(cachedWellPlates, {includeScore:true});
        const results = fuse.search(wellPlateQuery).map(result => result.item);
        setSearchResults(results);
        setShowSuggestedResults(true);
    } 
    else {
        setSearchResults([]);
        setShowSuggestedResults(false);
    }
  };

  const uploadData = async (event: FormEvent) => {
    event.preventDefault();
    if (!wellPlateIsValid || !folderPathIsValid || !selectedCytationProtocol) {
      return;
    } 
    //Try to upload data 
    try {

      let now: string | null = DateTime.now()
              .setZone("US/Pacific")
              .toISO({ format: "basic", suppressMilliseconds: true });

      const object_data_record: Record<string, any> = {
          well_plate_id: wellPlateId,
          well_plate_barcode: '553626939747',
          cytation_protocol: selectedCytationProtocol,
          acquired_at: now,
      };
      const object_data: any = buildGoogleStructValue(object_data_record);

      const toolCommand: ToolCommandInfo = {
        toolId: "helix_tool_1",
        toolType: ToolType.helix_tool,
        command: "post_data_object_from_local_directory",
        params: {
          data_type: "Cytation",
          dirpath: dataFolder,
          val_only: false,
          object_data: object_data,
        },
    };

      console.log("Sending the following tool command " + JSON.stringify(toolCommand));
      const response = await commandMutation.mutateAsync(toolCommand)
      console.log("Reponse is" + JSON.stringify(response));

      if(response?.response === "INVALID_ARGUMENTS"){
        launchAlert('error',`Error= ${response?.error_message}`)
      }
      else{
        launchAlert("success","Uploading data to helix... A separate slack message will be sent when done.");
      }
    } 
    catch (e) {
      launchAlert('error',`Failed to upload folder. ${e}`)
    }


  };

  const validateInputs = async (event: FormEvent) => {
    event.preventDefault();
    // Validate the well plate
    await validateWellPlate();
    await validateDirectory();

  };

  const handleDataFolderChange = (dataFolder:string) => {
    
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab" || e.key === "Space") {
      setShowSuggestedResults(false);
    }
  };

  const resetComponent = async (event: FormEvent) => {
    event.preventDefault(); //Don't reload the page after form submision. 
    setWellPlateId("");
    setDataFolder("");
    setSelectedCytationProtocol("");
    setWellPlateIsValid(false);
    setFolderPathIsValid(false);
    setShowSuggestedResults(false);
  };

  const handleFormSubmission = (event: React.FormEvent) => {
    event.preventDefault(); // this will prevent the actual form submission
  };
  
  const handleFilePicker = (target: string) => {
    setFilePickerTarget(target);
    openFilePicker();
  }

  const handleSearchSuggestionClick = async (plateId:string) => {
    setWellPlateId(plateId);
    setShowSuggestedResults(false);
  }

  return (
    <Box mt={4} w="800px">
      <Center>
        <Heading as="h1" size="xl" mb={6}>
          Image Uploader 
        </Heading>
      </Center>
      <Flex direction={{ base: "column", md: "row" }} wrap="wrap">
      <VStack align="start" spacing={4} width='100%'>
              <FormControl>
              <FormLabel>Well Plate ID</FormLabel>
                <Input 
                  type="text" 
                  value = {wellPlateId}
                  onChange={handleWellPlateSearch}
                  onKeyDown={handleKeyDown}
                  borderColor={wellPlateIsValid? "blue" : "red"}
                  ></Input>
                      <Stack spacing={1}>
                        {showSuggestedResults && searchResults.map(result => (
                            <Box
                                key={result}
                                onClick={() => handleSearchSuggestionClick(result)}
                                p={3}
                                border="2px"
                                borderColor="gray.300"
                                borderRadius="md"
                                color = "blue.500"
                                _hover={{ bg: "gray.100", cursor: "pointer" }}>
                                <Text fontWeight="bold">{result}</Text>
                            </Box>
                        ))}
                    </Stack>
                <FormHelperText>Helix well plate id. Eg. 7280</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Image Folder to Upload.</FormLabel>
                <Input
                  type="text"
                  value = {dataFolder}
                  onChange={(e)=>setDataFolder(e.target.value)}
                  onKeyDown={handleKeyDown}
                  borderColor={folderPathIsValid ? "blue" : "red"}
                ></Input>
                <FormHelperText><Text as ='b'> Eg: C:\cytation_experiments\384well_confluence_sciclone_7279_</Text><Box><Text color='red'> Warning: All the contents of this folder will be uploaded. Make sure you select the right folder.</Text></Box></FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Cytation Protocol</FormLabel>
                <HStack>
                    <Box width='95%'>
                    <Input value={selectedCytationProtocol} readOnly />
                        </Box>
                    <Box border='1px solid gray' borderRadius='4px'>
                        <Button padding='0px' variant='ghost' bg='white' onClick={()=>{handleFilePicker('cytationProtocol')}}><Icon as ={FiFile} boxSize={6} padding='0px'/></Button>
                    </Box>
                </HStack>
                <FormHelperText>Select the cytation protocol (.prt) used to generate these files/images.</FormHelperText>
              </FormControl>

            </VStack>
      </Flex>
      <Box mt={4}>
        <form onSubmit={handleFormSubmission}>
          <Stack spacing={2} direction="row" align="center">
            <Button
              colorScheme="green"
              onClick={(e) => validateInputs(e)}
              isDisabled = {!wellPlateId || !dataFolder}
              type="submit">
              Validate
            </Button>
            <Button 
              colorScheme="blue" 
              isDisabled = {!(wellPlateIsValid && folderPathIsValid && selectedCytationProtocol)}
              onClick={(e) => uploadData(e)} 
              type="submit">
              Upload To Helix
            </Button>
            <Button colorScheme="red" onClick={(e) => resetComponent(e)} type="reset">
              Clear
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default UploadCytationData;
