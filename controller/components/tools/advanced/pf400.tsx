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
  Stack
} from "@chakra-ui/react";
import { useRouter } from "next/router";
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
            command: "release",
            params: {
                width: gripperWidth
            },
        } 
        await commandMutation.mutateAsync(openGripperCommand);
    });

    const CloseGripper = async () => {
        console.log("Closing gripper with width: " + gripperWidth);
        const closeGripperCommand : ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "grasp",
            params: {
                width: gripperWidth
            },
        } 
        await commandMutation.mutateAsync(closeGripperCommand);
    }

    const Jog = async () => {
        if (!jogAxis || jogDistance === 0) {
            console.log("Please select an axis and enter a distance");
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
        await commandMutation.mutateAsync(jogCommand);
    }

    const SetFree = async () =>{
        const freeCommand : ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "free",
            params: {
            },
        } 
        await commandMutation.mutateAsync(freeCommand);
    }

    const UnFree = async () =>{
        const unfreeCommand : ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "unfree",
            params: {
            },
        }
        await commandMutation.mutateAsync(unfreeCommand);
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

    
    const GetTeachPoints = () => executeCommand(async () => {
        const toolCommand: ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "get_teachpoints",
            params: {},
        };
        
        const response = await commandMutation.mutateAsync(toolCommand);
        const metadata = response?.meta_data;
        if(metadata === undefined) return;

        const newLocations: TeachPoint[] = [];

        for(const resp in metadata){
            if(resp === "nests"){
                const nests = metadata[resp];
                for(const nest in nests){
                    let location: TeachPoint = {
                        name: nest,
                        coordinate: nests[nest].loc.loc,
                        type: 'nest',
                        locType: nests[nest].loc.loc_type, // Keep the original value here
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
                        locType: locs[loc].loc_type // Keep the original value here
                    }
                    newLocations.push(location);
                }
            }
        }

        setLocations(newLocations);
    });

    useEffect(()=>{
        if (!config) return;
        GetTeachPoints();
    },[config])

    

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
            return;
        }
        const originalLocType = getOriginalLocType(currentLocType);
        console.log("Saving changes");
        console.log("Updated TeachPoint:", JSON.stringify({
            name: currentTeachpoint,
            coordinate: editedCoordinate,
            type: currentType,
            locType: originalLocType,
            approachPath: editedApproachPath,
            isEdited: true
        }, null, 2));

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

        console.log("Save Command:", JSON.stringify(saveCommand, null, 2));

        try {
            await commandMutation.mutateAsync(saveCommand);

            console.log("Teach point saving");
            setIsEditing(false);
            // Update the locations state with the new teach point
            setLocations(prevLocations => 
                prevLocations.map(loc => 
                    loc.name === currentTeachpoint ? {
                        name: currentTeachpoint,
                        coordinate: editedCoordinate,
                        type: currentType,
                        locType: originalLocType,
                        approachPath: editedApproachPath,
                        isEdited: true
                    } : loc
                )
            );
        } catch (error) {
            console.error("Failed to save teach point:", error);
        }
    };

    

    return (
      <VStack align="center" spacing={5} width="100%">
        <Heading size='lg'>PF400 Teach Pendant</Heading>
        <Box>
            <HStack>
                <ButtonGroup>
                    {/* <Button onClick={()=>{Initialize()}}>Initialize</Button> */}
                    <Button disabled={isCommandInProgress} onClick={() => executeCommand(Initialize)}>Initialize</Button>
                    <Button disabled={isCommandInProgress} onClick={GetTeachPoints}>Get Teach Points</Button>
                    <Button disabled={isCommandInProgress} onClick={SetFree}>Free</Button>
                    <Button disabled={isCommandInProgress} onClick={UnFree}>Unfree</Button>
                </ButtonGroup>
            </HStack>
        </Box>
        <HStack>
            <Card width='50%' height='230px'>
                <CardHeader mb='-8px'>
                    <Heading size='md'>Gripper Control</Heading>
                </CardHeader>
            <CardBody >
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
            <CardFooter >
            <ButtonGroup spacing='2'>
                <Button disabled={isCommandInProgress} onClick={OpenGripper}>Open</Button>
                <Button disabled={isCommandInProgress} onClick={CloseGripper}>Close</Button>
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
                <Button disabled={isCommandInProgress} onClick={Jog}>Jog</Button>
            </CardFooter>
            </Card>
        </HStack>
        <Card align='left' display='flex' width='100%'>
            <CardHeader>
                <Heading size='md'>Locations and Nests</Heading>
            </CardHeader>
            <CardBody width='100%'>
                <Box width='100%'>
                    <VStack align='left'>
                        <Text as='b'>Name:</Text>
                        <Select onChange={OnTeachPointChange} value={currentTeachpoint}>
                            {locations.map((teachpoint, i) => (
                                <option key={i.toString()}>{teachpoint.name}</option>
                            ))}
                        </Select>
                        <Text as='b'>Type:</Text>
                        <Select value={currentType} onChange={(e) => setCurrentType(e.target.value as 'nest' | 'location')} isDisabled={isEditing}>
                            <option value='nest'>Nest</option>
                            <option value='location'>Location</option>
                        </Select>
                        <Box width='100%'>
                            <Text as='b'>Coordinate:</Text>
                            <Input 
                                width='100%' 
                                value={isEditing ? editedCoordinate : currentCoordinate} 
                                onChange={handleCoordinateEdit}
                                readOnly={!isEditing}
                            />
                        </Box>
                        <Text as='b'>Location Type:</Text>
                        <Input width='100%' value={currentLocType} readOnly />
                        <Text as='b'>Approach Path:</Text>
                        <Textarea 
                            height='100px' 
                            value={isEditing ? editedApproachPath.join('\n') : currentApproachPath.join('\n')} 
                            onChange={handleApproachPathEdit}
                            readOnly={!isEditing}
                        />
                        <ButtonGroup spacing='2'>
                            {isEditing ? (
                                <>
                                    <Button onClick={saveChanges} colorScheme='green'>Save</Button>
                                    <Button onClick={cancelEditing}>Cancel</Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={startEditing} colorScheme='blue'>Edit</Button>
                                    <Button onClick={() => {/* Implement current position logic */}}>Use Current Position</Button>
                                </>
                            )}
                        </ButtonGroup>
                    </VStack>
                </Box>
            </CardBody>
            <Divider color='gray'/>
            <CardFooter>
                <ButtonGroup spacing='2'>
                    <Button variant='outline'>New</Button>
                    <Button colorScheme='blue' variant='outline'>Save</Button>
                </ButtonGroup>
            </CardFooter>
        </Card>
      </VStack>
    );
  }