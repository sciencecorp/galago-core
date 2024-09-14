
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


interface PF400Props  {
    toolId: string | undefined,
    config: ToolConfig
}

interface TeachPoint {
    name:string,
    coordinate:string
}

export const PF400: React.FC<PF400Props> = ({toolId, config}) => {
    const commandMutation = trpc.tool.runCommand.useMutation();
    const [locations, setLocations] = useState<TeachPoint[]>([]);
    const [currentTeachpoint, setCurrentTeachpoint] = useState("");
    const [currentCoordinate, setCurrentCoordinate] = useState("");
    const [configString, setConfigString] = useState(JSON.stringify(config, null, 2));
    //const toolType = config.type;
    const [gripperWidth, setGripperWidth] = useState(0);
    const [jogAxis, setJogAxis] = useState("");
    const [jogDistance, setJogDistance] = useState(0);

    const configureMutation = trpc.tool.configure.useMutation();
    

    const Jog = async () =>{
        const jogCommand : ToolCommandInfo = {
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

    const OnTeachPointChange = (e:any)=>{
       // console.log("tv is "+JSON.stringify(e.target.value));
        setCurrentTeachpoint(e.target.value);
       // console.log("Target value is"+ e.target.value);
        let coordinate = locations.find(loc=>loc.name === e.target.value);
        if(coordinate){
         //  console.log("Current teachpoint is"+JSON.stringify(coordinate.coordinate.loc))
            setCurrentCoordinate(coordinate.coordinate)
        }
    }

    const GetTeachPoints = async () =>{
        const toolCommand: ToolCommandInfo = {
            toolId: config.id,
            toolType: config.type,
            command: "get_teachpoints",
            params: {},
        };
        
        const response = await commandMutation.mutateAsync(toolCommand);
        const metadata = response?.meta_data;
        if(metadata === undefined) return;
        for(const resp in metadata){
            if(resp == "nests"){
                const nests = metadata[resp];
                for(const nest in nests){
                    let location : TeachPoint = {
                        name:nest,
                        coordinate:nests[nest].loc.loc
                    }

                    setLocations((locations)=> [location, ...locations]);
                }
            }
        }
    }

    useEffect(()=>{
        if (!config) return;
        GetTeachPoints();
    },[config])

    const homeCommand : ToolCommandInfo = {
        toolId: config.id,
        toolType: config.type,
        command: "home",
        params: {
        },
    }

    return (
      <VStack align="center" spacing={5} width="100%">
        <Heading size='lg'>PF400 Teach Pendant</Heading>
        <Box>
            <HStack>
                <ButtonGroup>
                    <Button>Home</Button>
                    <Button onClick={()=>{SetFree()}}>Free</Button>
                    <Button onClick = {()=>{UnFree()}}>Unfree</Button>
                </ButtonGroup>
            </HStack>
        </Box>
        <HStack>
            <Card width='50%' height='230px'>
                <CardHeader mb='-8px'>
                    <Heading size='md'>Gripper Control</Heading>
                </CardHeader>
            <CardBody >
                <NumberInput defaultValue={120} min={10} max={130} clampValueOnBlur={false}>
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
                </NumberInput>
            </CardBody>
            <CardFooter >
            <ButtonGroup spacing='2'>
                <Button>Open</Button>
                <Button>Close</Button>
            </ButtonGroup>
            </CardFooter>
            </Card>
            <Card width='50%' height='230px'>
                <CardHeader mb='-8px'>
                    <Heading size='md'>Jog Control</Heading>
                </CardHeader>
            <CardBody>
                <HStack>
                <Select placeholder='Axis'>
                    <option value='option1'>X</option>
                    <option value='option2'>Y</option>
                    <option value='option3'>Z</option>
                    <option value='option4'>Yaw</option>
                    <option value='option5'>Pitch</option>
                    <option value='option5'>Roll</option>
                </Select>
            <NumberInput defaultValue={2} min={0} max={50} clampValueOnBlur={false}>
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
                </NumberInput>
                </HStack>
            </CardBody>
            <CardFooter>
                <Button>Jog</Button>
            </CardFooter>
            </Card>
        </HStack>
        <Card align='left' display='flex' width='100%'>
            <CardHeader>
                <Heading size='md'>Locations</Heading>
            </CardHeader>
            <CardBody width='100%'>
                <Box width='100%'>
                    <VStack align='left'>
                        <Text as ='b'>Name:</Text>
                        <Select  onChange={OnTeachPointChange}>
                            {locations.map((teachpoint, i)=> {
                                return <option key = {i.toString()}>{teachpoint.name}</option>
                            })}
                        </Select>
                        <Text as ='b'>Type:</Text>
                        <Select>
                            <option value='option1'>Nest</option>
                            <option value='option2'>Location</option>
                        </Select>
                        <Box width='100%'>
                            <Text as ='b'>Coordinate:</Text>
                            <Input width='100%' value = {currentCoordinate}/>
                        </Box>
                        <Text as ='b'>Approach Path:</Text>
                            <Textarea height='100px' placeholder=''/>
                        <ButtonGroup spacing='2'>
                            <Button colorScheme='green' variant='outline'>Add Approach</Button>
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button variant='outline'>Go To</Button>
                            <Button colorScheme='blue' variant='outline'>Teach Here</Button>
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
  