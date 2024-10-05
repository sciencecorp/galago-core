import { ChangeEvent, FormEvent, JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, useEffect, useState } from "react";
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
  Flex,
  HStack,
  Card,
  CardHeader,
  CardBody,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  CardFooter,
  ButtonGroup,
  Text,
  Textarea,
  Divider,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { AddIcon } from "@chakra-ui/icons";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { ToolConfig } from 'gen-interfaces/controller';
import { ToolType } from "gen-interfaces/controller";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { delay } from "framer-motion";


interface PF400Props  {
    toolId: string | undefined,
    config: ToolConfig
}

interface TeachPoint {
    name: string;
    coordinate: string;
    type: 'nest' | 'location';
    locType: string;
    approachPath?: string[];
    isEdited?: boolean;
}

export const PF400: React.FC<PF400Props> = ({toolId, config}) => {
    const commandMutation = trpc.tool.runCommand.useMutation();
    const toast = useToast(); // Initialize toast
    const [locations, setLocations] = useState<TeachPoint[]>([]);
    const [currentTeachpoint, setCurrentTeachpoint] = useState("");
    const [currentCoordinate, setCurrentCoordinate] = useState("");
    const [currentApproachPath, setCurrentApproachPath] = useState<string[]>([]);
    const [currentType, setCurrentType] = useState<'nest' | 'location'>('nest');
    const [configString, setConfigString] = useState(JSON.stringify(config, null, 2));
    //const toolType = config.type;
    const [gripperWidth, setGripperWidth] = useState(120); // Set initial value to 120
    const [jogAxis, setJogAxis] = useState("");
    const [jogDistance, setJogDistance] = useState(0);
    const [currentLocType, setCurrentLocType] = useState(""); // Add this line
    const [isEditing, setIsEditing] = useState(false);
    const [editedCoordinate, setEditedCoordinate] = useState("");
    const [editedApproachPath, setEditedApproachPath] = useState<string[]>([]);
    const configureMutation = trpc.tool.configure.useMutation();
    
    const [isCommandInProgress, setIsCommandInProgress] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertStatus, setAlertStatus] = useState<"success" | "error">("success");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nestName, setNestName] = useState("");
    const [locType, setLocType] = useState("");

    const [safeLoc, setSafeLoc] = useState("");
    const [orientation, setOrientation] = useState("");

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isSaving, setIsSaving] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const executeCommand = async (command: () => Promise<void>) => {
        if (isCommandInProgress) return;
        setIsCommandInProgress(true);
        try {
            await command();
        } catch (error) {
            console.error('Command execution failed:', error);
        } finally {
            setIsCommandInProgress(false);
        }
    };

    // Update existing command functions to use executeCommand
    const Initialize = () => executeCommand(async () => {
        const initializeCommand : ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "initialize",
            params: {},
        } 
        await commandMutation.mutateAsync(initializeCommand);
    });

    const OpenGripper = () => executeCommand(async () => {
        console.log("Opening gripper with width: " + gripperWidth);
        console.log("Tool State", ResponseCode)
        console.log("Tool ID", config.id)
        console.log("Tool Type", config.type)

        const openGripperCommand : ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "release_plate",
            params: {
                width: gripperWidth,
                speed: 10
            },
        } 
        await commandMutation.mutateAsync(openGripperCommand);
    });

    const CloseGripper = async () => {
        console.log("Closing gripper with width: " + gripperWidth);
        const closeGripperCommand : ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "grasp_plate",
            params: {
                width: gripperWidth,
                speed: 10,
                force: 20
            },
        } 
        try {
            await commandMutation.mutateAsync(closeGripperCommand);
            toast({
                title: "Gripper Closed",
                description: `Gripper closed with width: ${gripperWidth}`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error closing gripper:", error);
            toast({
                title: "Error",
                description: "Failed to close gripper",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    const Jog = async () => {
        if (!jogAxis || jogDistance === 0) {
            console.log("Please select an axis and enter a distance");
            toast({
                title: "Jog Error",
                description: "Please select an axis and enter a distance",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        const jogCommand: ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "jog",
            params: {
                axis: jogAxis,
                distance: jogDistance
            },
        } 
        try {
            await commandMutation.mutateAsync(jogCommand);
            toast({
                title: "Jog Successful",
                description: `Jogged ${jogAxis} axis by ${jogDistance}`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error jogging:", error);
            toast({
                title: "Jog Error",
                description: "Failed to jog",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    const SetFree = async () =>{
        const freeCommand : ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "free",
            params: {
            },
        } 
        try {
            await commandMutation.mutateAsync(freeCommand);
            toast({
                title: "Set Free",
                description: "Robot set to free mode",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error setting free:", error);
            toast({
                title: "Error",
                description: "Failed to set free mode",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    const UnFree = async () =>{
        const unfreeCommand : ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "unfree",
            params: {
            },
        }
        try {
            await commandMutation.mutateAsync(unfreeCommand);
            toast({
                title: "Unfree",
                description: "Robot unfree mode set",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error setting unfree:", error);
            toast({
                title: "Error",
                description: "Failed to set unfree mode",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    const homeCommand = () => executeCommand(async () => {
        const homeCommand: ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "home",
            params: {
            },
        }
        await commandMutation.mutateAsync(homeCommand);
    });

    const getOriginalLocType = (displayLocType: string): string => {
        switch (displayLocType.toLowerCase()) {
            case 'joint':
                return 'j';
            case 'cartesian':
                return 'c';
            default:
                return displayLocType; // Return the original value if it's neither 'Joint' nor 'Cartesian'
        }
    };

    const getLocTypeDisplay = (locType: string): string => {
        switch (locType.toLowerCase()) {
            case 'j':
                return 'Joint';
            case 'c':
                return 'Cartesian';
            default:
                return locType; // Return the original value if it's neither 'j' nor 'c'
        }
    };

    const OnTeachPointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        setCurrentTeachpoint(selectedName);
        const selectedPoint = locations.find(loc => loc.name === selectedName);
        if(selectedPoint){
            setCurrentCoordinate(selectedPoint.coordinate);
            setCurrentType(selectedPoint.type);
            setCurrentLocType(getLocTypeDisplay(selectedPoint.locType)); // Use the new function here
            setCurrentApproachPath(selectedPoint.approachPath || []);
        }
    }

    
    const GetTeachPoints = async () => {
        const toolCommand: ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "get_teachpoints",
            params: {},
        };
        
        const response = await commandMutation.mutateAsync(toolCommand);
        const metadata = response?.meta_data;
        if(metadata === undefined) return [];

        const newLocations: TeachPoint[] = [];

        for(const resp in metadata){
            if(resp === "nests"){
                const nests = metadata[resp];
                for(const nest in nests){
                    let location: TeachPoint = {
                        name: nest,
                        coordinate: nests[nest].loc.loc,
                        type: 'nest',
                        locType: getLocTypeDisplay(nests[nest].loc.loc_type),
                        approachPath: nests[nest].approach_path
                    }
                    newLocations.push(location);
                }
            } else if(resp === "locations"){
                const locs = metadata[resp];
                for(const loc in locs){
                    let location: TeachPoint = {
                        name: loc,
                        coordinate: locs[loc].loc,
                        type: 'location',
                        locType: getLocTypeDisplay(locs[loc].loc_type)
                    }
                    newLocations.push(location);
                }
            }
        }

        return newLocations;
    };

    useEffect(() => {
        if (!config) return;
        const fetchTeachPoints = async () => {
            const newLocations = await GetTeachPoints();
            setLocations(newLocations);
        };
        fetchTeachPoints();
    }, [config, refreshTrigger]);

    const getCurrentPositionToPath = async () => {
        const toolCommand: ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "get_current_location",
            params: {},
        };
        try {
            const response = await commandMutation.mutateAsync(toolCommand);
            console.log("Current position:", response);
            if (response && response.meta_data && response.meta_data) {
                console.log("meta data", response.meta_data)
                const currentPosition = "1234567890" //response.meta_data;
                setEditedApproachPath(prevPath => [...prevPath, currentPosition]);
                toast({
                    title: "Position Added",
                    description: "Current position added to approach path",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                console.error("Unexpected response format:", response);
                toast({
                    title: "Error",
                    description: "Failed to get current position",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error getting current position:", error);
            toast({
                title: "Error",
                description: "Failed to get current position",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const addToPath = async () => {
        const addToPathCommand: ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "add_to_path",
            params: {
                nest_name: currentTeachpoint
            },
        };

        try {
            await commandMutation.mutateAsync(addToPathCommand);
            const updatedLocations = await GetTeachPoints();
            setLocations(updatedLocations);
            toast({
                title: "Position Added",
                description: `Current position added to ${currentTeachpoint} path.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setRefreshTrigger(prev => prev + 1);
            
        } catch (error) {
            console.error("Error adding to path:", error);
            toast({
                title: "Error",
                description: "Failed to add to path.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };
    
    

    const handleCoordinateEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedCoordinate(e.target.value);
    };

    const handleApproachPathEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedApproachPath(e.target.value.split('\n'));
    };

    const startEditing = () => {
        setIsEditing(true);
        setEditedCoordinate(currentCoordinate);
        setEditedApproachPath(currentApproachPath);
    };

    const cancelEditing = () => {
        setIsEditing(false); 
    };

    const saveChanges = async () => {
        if (!currentTeachpoint || !editedCoordinate || !currentType || !currentLocType) {
            console.error("One or more required fields are undefined:", {
                currentTeachpoint,
                editedCoordinate,
                currentType,
                currentLocType
            });
            toast({
                title: "Error",
                description: "One or more required fields are missing.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSaving(true);
        const originalLocType = getOriginalLocType(currentLocType);

        const saveCommand: ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "saveTeachpoints",
            params: {
                teachpoints: [{
                    name: currentTeachpoint,
                    coordinate: editedCoordinate,
                    type: currentType,
                    loc_type: originalLocType,
                    approach_path: editedApproachPath,
                    is_edited: true
                }]
            },
        };

        try {
            await commandMutation.mutateAsync(saveCommand);
            
            // Immediate state update
            setLocations(prevLocations => 
                prevLocations.map(loc => 
                    loc.name === currentTeachpoint ? {
                        ...loc,
                        coordinate: editedCoordinate,
                        locType: originalLocType,
                        approachPath: editedApproachPath,
                        isEdited: true
                    } : loc
                )
            );

            // Fetch updated locations from the server
            const updatedLocations = await GetTeachPoints();
            setLocations(updatedLocations);

            // Update current values
            setCurrentCoordinate(editedCoordinate);
            setCurrentLocType(getLocTypeDisplay(originalLocType));
            setCurrentApproachPath(editedApproachPath);

            setIsEditing(false);
            toast({
                title: "Teach Point Saved",
                description: "Teach point saved successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Failed to save teach point:", error);
            toast({
                title: "Error",
                description: "Failed to save teach point.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const CreateNestModal = ({ isOpen, onOpen, onClose }: { isOpen: boolean, onOpen: () => void, onClose: () => void }) => {
        const handleCreateNest = async () => {
            // Validation: Check if any required fields are empty
            if (!nestName || !locType || !orientation || !safeLoc) {
                toast({
                    title: "Error",
                    description: "All fields are required to create a nest.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return; // Prevent further execution if validation fails
            }

            const createNestCommand: ToolCommandInfo = {
                toolId: config.id,
                toolType: config.type,
                command: "create_nest",
                params: {
                    nest_name: nestName,
                    loc_type: locType,
                    orientation: orientation,
                    safe_loc: safeLoc
                },
            };

            try {
                await commandMutation.mutateAsync(createNestCommand);
                toast({
                    title: "Nest Created",
                    description: `Nest ${nestName} created successfully.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                // Only close the modal if the nest creation is successful
                const updatedLocations = await GetTeachPoints();
                setLocations(updatedLocations);
                onClose(); 
            } catch (error) {
                console.error("Error creating nest:", error);
                toast({
                    title: "Error",
                    description: "Failed to create nest.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        };

        return (
            <>
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create a New Nest</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <FormControl>
                                <FormLabel>Nest Name</FormLabel>
                                <Input
                                    value={nestName}
                                    onChange={(e) => setNestName(e.target.value)} // Ensure this is correctly updating state
                                    placeholder="Enter nest name"
                                />
                            </FormControl>
                            <FormControl mt={4}>
                                <FormLabel>Location Type</FormLabel>
                                <Select
                                    value={locType}
                                    onChange={(e) => setLocType(e.target.value)}
                                    placeholder="Select location type"
                                    isRequired
                                >
                                    <option value="j">Joint</option>
                                    <option value="c">Cartesian</option>
                                </Select>
                            </FormControl>
                            <FormControl mt={4}>
                                <FormLabel>Orientation</FormLabel>
                                <Select
                                    value={orientation}
                                    onChange={(e) => setOrientation(e.target.value)}
                                    placeholder="Select orientation"
                                    isRequired
                                >
                                    <option value="landscape">Landscape</option>
                                    <option value="portrait">Portrait</option>
                                </Select>
                            </FormControl>
                            <FormControl mt={4}>
                                <FormLabel>Safe Location</FormLabel>
                                <Select
                                    value={safeLoc}
                                    onChange={(e) => setSafeLoc(e.target.value)}
                                    placeholder="Select safe location"
                                    isRequired
                                >
                                    {locations
                                        .filter(location => location.type === 'location')
                                        .map((location) => (
                                            <option key={location.name} value={location.name}>
                                                {location.name}
                                            </option>
                                        ))}
                                </Select>
                            </FormControl>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="blue" onClick={handleCreateNest}>
                                Create Nest
                            </Button>
                            <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </>
        );
    };

    // Update the onClick handlers for locations and nests to set the approach path
    const handleLocationClick = (location: TeachPoint) => {
        setCurrentTeachpoint(location.name);
        setCurrentCoordinate(location.coordinate);
        setCurrentLocType(getLocTypeDisplay(location.locType));
        setCurrentType(location.type);
        setCurrentApproachPath([]); // Clear approach path for locations
    };

    const handleNestClick = (nest: TeachPoint) => {
        setCurrentTeachpoint(nest.name);
        setCurrentCoordinate(nest.coordinate);
        setCurrentLocType(getLocTypeDisplay(nest.locType));
        setCurrentType(nest.type);
        setCurrentApproachPath(nest.approachPath || []); // Set approach path for nests
    };

    return (
      <VStack align="center" spacing={5} width="100%" pb='50px'>
        <Heading size='lg'>PF400 Teach Pendant</Heading>
        <Box>
            <HStack spacing={4} justify="space-between" width="100%">
                <ButtonGroup>
                    <Button 
                        disabled={isCommandInProgress} 
                        onClick={() => executeCommand(Initialize)} 
                        colorScheme="teal" 
                        variant="solid" 
                        borderRadius="md" 
                        _hover={{ bg: "teal.600" }}
                    >
                        Initialize
                    </Button>
                    <Button 
                        disabled={isCommandInProgress} 
                        onClick={GetTeachPoints} 
                        colorScheme="teal" 
                        variant="solid" 
                        borderRadius="md" 
                        _hover={{ bg: "teal.600" }}
                    >
                        Get Teach Points
                    </Button>
                    <Button 
                        disabled={isCommandInProgress} 
                        onClick={SetFree} 
                        colorScheme="teal" 
                        variant="solid" 
                        borderRadius="md" 
                        _hover={{ bg: "teal.600" }}
                    >
                        Free
                    </Button>
                    <Button 
                        disabled={isCommandInProgress} 
                        onClick={UnFree} 
                        colorScheme="teal" 
                        variant="solid" 
                        borderRadius="md" 
                        _hover={{ bg: "teal.600" }}
                    >
                        Unfree
                    </Button>
                </ButtonGroup>
            </HStack>
        </Box>
        <HStack spacing={4}>
            <Card width='50%' height='230px'>
                <CardHeader mb='-8px'>
                    <Heading size='md'>Gripper Control</Heading>
                </CardHeader>
                <CardBody>
                    <NumberInput 
                        value={gripperWidth} 
                        min={10} 
                        max={130} 
                        clampValueOnBlur={false}
                        onChange={(value) => setGripperWidth(Number(value))}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </CardBody>
                <CardFooter>
                    <ButtonGroup spacing='2'>
                        <Tooltip label="Open the gripper" aria-label="Open Gripper">
                            <Button 
                                disabled={isCommandInProgress} 
                                onClick={OpenGripper} 
                                colorScheme="teal"
                            >
                                Open
                            </Button>
                        </Tooltip>
                        <Tooltip label="Close the gripper" aria-label="Close Gripper">
                            <Button 
                                disabled={isCommandInProgress} 
                                onClick={CloseGripper} 
                                colorScheme="teal"
                            >
                                Close
                            </Button>
                        </Tooltip>
                    </ButtonGroup>
                </CardFooter>
            </Card>
            <Card width='50%' height='230px'>
                <CardHeader mb='-8px'>
                    <Heading size='md'>Jog Control</Heading>
                </CardHeader>
                <CardBody>
                    <HStack>
                        <Select placeholder='Axis' onChange={(e) => setJogAxis(e.target.value)}>
                            <option value='x'>X</option>
                            <option value='y'>Y</option>
                            <option value='z'>Z</option>
                            <option value='yaw'>Yaw</option>
                            <option value='pitch'>Pitch</option>
                            <option value='roll'>Roll</option>
                        </Select>
                        <NumberInput 
                            clampValueOnBlur={false}
                            onChange={(valueString) => setJogDistance(parseFloat(valueString))}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </HStack>
                </CardBody>
                <CardFooter>
                    <Button disabled={isCommandInProgress} onClick={Jog} colorScheme="teal">Jog</Button>
                </CardFooter>
            </Card>
        </HStack>

        {/* HStack for Locations/Nests and Details */}
        <HStack spacing={4} width="100%">
          {/* VStack for Locations and Nests */}
          <VStack spacing={4} width="50%">
            {/* Card for Locations */}
            <Card align='left' display='flex' width='50%' maxHeight='200px' ml='50%'>
              <CardHeader>
                <Heading size='md'>Locations</Heading>
              </CardHeader>
              <CardBody width='100%' overflowY='auto'>
                <VStack spacing={2} align='stretch'>
                  {locations.filter(loc => loc.type === 'location').map((location, i) => (
                    <Box 
                      key={i.toString()} 
                      p={2} 
                      borderWidth={1} 
                      borderRadius='md' 
                      _hover={{ bg: "gray.100", cursor: "pointer" }} 
                      onClick={() => handleLocationClick(location)}
                    >
                      {location.name}
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Card for Nests */}
            <Card align='left' display='flex' width='50%' maxHeight='200px' ml='50%'>
              <CardHeader>
                <HStack justify="space-between" width="100%">
                  <Heading size='md'>Nests</Heading>
                  <Tooltip label="Add new Nest">
                    <Button onClick={onOpen} colorScheme="blue" size="sm"><AddIcon /></Button>
                  </Tooltip>
                </HStack>
              </CardHeader>
              <CardBody width='100%' overflowY='auto'>
                <VStack spacing={2} align='stretch'>
                  {locations.filter(loc => loc.type === 'nest').map((nest, i) => (
                    <Box 
                      key={i.toString()} 
                      p={2} 
                      borderWidth={1} 
                      borderRadius='md' 
                      _hover={{ bg: "gray.100", cursor: "pointer" }} 
                      onClick={() => handleNestClick(nest)}
                    >
                      {nest.name}
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Details Section for Selected Location or Nest */}
          <Card align='left' display='flex' width='30%' ml='-0.5%' >
            <CardHeader>
              <Heading size='md'>Details</Heading>
            </CardHeader>
            <CardBody width='100%'>
              <Text as='b'>Name:</Text>
              <Input value={currentTeachpoint} readOnly />
              <Text as='b'>Coordinate:</Text>
              <Input 
                value={isEditing ? editedCoordinate : currentCoordinate} 
                onChange={handleCoordinateEdit}
                readOnly={!isEditing} // Editable when isEditing is true
                bg={isEditing ? "yellow.100" : "white"} // Highlight when editing
              />
              <Text as='b'>Location Type:</Text>
              <Input value={currentLocType} readOnly />
              {currentType === 'nest' && ( // Show approach path only for nests
                <>
                  <Text as='b'>Approach Path:</Text>
                  <Textarea // Change to Textarea for multi-line input
                    value={isEditing ? editedApproachPath.join('\n') : currentApproachPath.join('\n')} 
                    onChange={handleApproachPathEdit}
                    readOnly={!isEditing} // Editable when isEditing is true
                    bg={isEditing ? "yellow.100" : "white"} // Highlight when editing
                  />
                </>
              )}
              <ButtonGroup spacing='2'>
                {isEditing ? (
                  <>
                    <Button 
                        onClick={saveChanges} 
                        colorScheme='green' 
                        isLoading={isSaving}
                        loadingText="Saving"
                    >
                        Save
                    </Button>
                    <Button onClick={cancelEditing} isDisabled={isSaving}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Box mt={2}>
                      <Button onClick={startEditing} colorScheme='blue' mr={2}>Edit</Button>
                      
                      <Button onClick={addToPath} colorScheme='blue'>Add Current Position to Path</Button>
                    </Box>
                  </>
                )}
              </ButtonGroup>
            </CardBody>
          </Card>
        </HStack>

        <CreateNestModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
      </VStack>
    );
  }