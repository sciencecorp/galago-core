import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    ButtonGroup,
    Heading,
    HStack,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    VStack,
    Box,
    FormControl,
    FormLabel,
    Input,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorModeValue,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    InputGroup,
    InputLeftElement,
    Text,
  } from "@chakra-ui/react";
  import { useState, useCallback } from "react";
  import { trpc } from "@/utils/trpc";
  import { ToolCommandInfo } from "@/types";
  import { ToolConfig } from "gen-interfaces/controller";
  import { useToast } from "@chakra-ui/react";
  import { AddIcon, Search2Icon } from "@chakra-ui/icons";
  
interface TeachPendantProps {
  toolId: string | undefined;
  config: ToolConfig;
}
  
interface TeachPoint {
  name: string;
  coordinate: string;
  type: "nest" | "location";
  locType: string;
  approachPath?: string[];
  safe_loc?: string;
}
  
export const TeachPendant: React.FC<TeachPendantProps> = ({ toolId, config }) => {
  const commandMutation = trpc.tool.runCommand.useMutation();
  const toast = useToast();
  const [isCommandInProgress, setIsCommandInProgress] = useState(false);
  const [jogAxis, setJogAxis] = useState("");
  const [jogDistance, setJogDistance] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [locations, setLocations] = useState<TeachPoint[]>([]);
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.900');
  const bgColorAlpha = useColorModeValue('gray.50', 'gray.900');
  const [activeTab, setActiveTab] = useState(0);
  const [currentTeachpoint, setCurrentTeachpoint] = useState("");
  const [currentType, setCurrentType] = useState<"nest" | "location">("location");
  const [currentCoordinate, setCurrentCoordinate] = useState("");
  const [currentApproachPath, setCurrentApproachPath] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "location" | "nest">("all");

  const getLocTypeDisplay = (locType: string) => {
    switch (locType) {
      case "j": return "Joint";
      case "c": return "Cartesian";
      default: return locType;
    }
  };

  const executeCommand = async (command: () => Promise<void>) => {
    if (isCommandInProgress) return;
    setIsCommandInProgress(true);
    try {
      await command();
    } catch (error) {
      console.error("Command execution failed:", error);
    } finally {
      setIsCommandInProgress(false);
    }
  };

  const handleJog = async () => {
    if (!jogAxis || jogDistance === 0) {
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
      toolId: config.type,
      toolType: config.type,
      command: "jog",
      params: {
        axis: jogAxis,
        distance: jogDistance,
      },
    };
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
  };

  const GetTeachPoints = useCallback(async () => {
    const toolCommand: ToolCommandInfo = {
      toolId: config.type,
      toolType: config.type,
      command: "get_teachpoints",
      params: {
      },
    };

    const response = await commandMutation.mutateAsync(toolCommand);
    const metadata = response?.meta_data;
    if (metadata === undefined) return [];

    const newLocations: TeachPoint[] = [];

    for (const resp in metadata) {
      if (resp === "nests") {
        const nests = metadata[resp];
        for (const nest in nests) {
          let location: TeachPoint = {
            name: nest,
            coordinate: nests[nest].loc.loc,
            type: "nest",
            locType: getLocTypeDisplay(nests[nest].loc.loc_type),
            approachPath: nests[nest].approach_path,
            safe_loc: nests[nest].safe_loc,
          };
          newLocations.push(location);
        }
      } else if (resp === "locations") {
        const locs = metadata[resp];
        for (const loc in locs) {
          let location: TeachPoint = {
            name: loc,
            coordinate: locs[loc].loc,
            type: "location",
            locType: getLocTypeDisplay(locs[loc].loc_type),
          };
          newLocations.push(location);
        }
      }
    }
    return newLocations;
  }, [config.name, config.type, commandMutation]);

  const CreateNewItemModal = () => {
    const [localLocationName, setLocalLocationName] = useState("");
    const [localNestName, setLocalNestName] = useState("");
    const [localOrientation, setLocalOrientation] = useState("");
    const [localSafeLoc, setLocalSafeLoc] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async (type: "location" | "nest") => {
      const name = type === "location" ? localLocationName : localNestName;
      if (!name) {
        toast({
          title: "Error",
          description: `${type} name is required`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsCreating(true);
      const createCommand: ToolCommandInfo = {
        toolId: config.type,
        toolType: config.type,
        command: `create_${type}`,
        params: type === "location" 
          ? { 
              location_name: name, 
              loc_type: "j",
            }
          : { 
              nest_name: name,
              loc_type: "j",
              orientation: localOrientation,
              safe_loc: localSafeLoc,
            },
      };

      try {
        await commandMutation.mutateAsync(createCommand);
        // After successful creation, refresh the teach points
        const updatedLocations = await GetTeachPoints();
        setLocations(updatedLocations);
        
        toast({
          title: "Success",
          description: `${type} created successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to create ${type}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsCreating(false);
      }
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>Create New Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>Location</Tab>
                <Tab>Nest</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <FormControl>
                    <FormLabel>Location Name</FormLabel>
                    <Input
                      value={localLocationName}
                      onChange={(e) => setLocalLocationName(e.target.value)}
                      placeholder="Enter location name"
                    />
                  </FormControl>
                </TabPanel>
                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Nest Name</FormLabel>
                      <Input
                        value={localNestName}
                        onChange={(e) => setLocalNestName(e.target.value)}
                        placeholder="Enter nest name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Orientation</FormLabel>
                      <Select
                        value={localOrientation}
                        onChange={(e) => setLocalOrientation(e.target.value)}
                      >
                        <option value="landscape">Landscape</option>
                        <option value="portrait">Portrait</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Safe Location</FormLabel>
                      <Select
                        value={localSafeLoc}
                        onChange={(e) => setLocalSafeLoc(e.target.value)}
                      >
                        {locations
                          .filter(loc => loc.type === "location")
                          .map(loc => (
                            <option key={loc.name} value={loc.name}>
                              {loc.name}
                            </option>
                          ))}
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              isLoading={isCreating}
              onClick={() => handleCreate(activeTab === 0 ? "location" : "nest")}
            >
              Create
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const filteredTeachPoints = locations.filter(
    (loc) =>
      (filterType === "all" || loc.type === filterType) &&
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      bg={bgColor}
      p={4}
      height="calc(100vh - 150px)"
      minHeight="800px"
      width="100%"
    >
      <VStack spacing={4} width="100%" height="100%">
        <HStack width="100%" justify="space-between">
          <Heading size="md">Teach Pendant</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
          >
            New Point
          </Button>
        </HStack>
        
        <Card width="100%" height="230px" bg={bgColor} borderColor={borderColor}>
          <CardHeader mb="-8px">
          </CardHeader>
          <CardBody>
            <HStack>
              <Select placeholder="Axis" onChange={(e) => setJogAxis(e.target.value)}>
                <option value="x">X</option>
                <option value="y">Y</option>
                <option value="z">Z</option>
                <option value="yaw">Yaw</option>
                <option value="pitch">Pitch</option>
                <option value="roll">Roll</option>
              </Select>
              <NumberInput
                clampValueOnBlur={false}
                onChange={(valueString) => setJogDistance(parseFloat(valueString))}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>
          </CardBody>
          <CardFooter>
            <Button onClick={handleJog} colorScheme="teal">
              Jog
            </Button>
          </CardFooter>
        </Card>

        <Card width="100%" bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <InputGroup size="md">
                <InputLeftElement pointerEvents="none">
                  <Search2Icon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search teach points"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg={useColorModeValue('white', 'gray.700')}
                />
              </InputGroup>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "all" | "location" | "nest")}
                bg={useColorModeValue('white', 'gray.700')}
              >
                <option value="all">All Points</option>
                <option value="location">Locations Only</option>
                <option value="nest">Nests Only</option>
              </Select>
            </VStack>
          </CardBody>
        </Card>

        <Card width="100%" flex="1" bg={bgColor} borderColor={bgColorAlpha}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Teach Points</Heading>
              <Text color="gray.500">
                {filteredTeachPoints.length} point{filteredTeachPoints.length !== 1 ? 's' : ''}
              </Text>
            </HStack>
          </CardHeader>
          <CardBody overflowY="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Location Type</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredTeachPoints.map((point, index) => (
                  <Tr 
                    key={index}
                    _hover={{ bg: bgColorAlpha }}
                  >
                    <Td>{point.name}</Td>
                    <Td>
                      <Badge colorScheme={point.type === "location" ? "blue" : "green"}>
                        {point.type}
                      </Badge>
                    </Td>
                    <Td>{point.locType}</Td>
                    <Td>
                      <ButtonGroup size="sm">
                        <Button
                          colorScheme="blue"
                          onClick={() => {
                            setCurrentTeachpoint(point.name);
                            setCurrentType(point.type);
                            setCurrentCoordinate(point.coordinate);
                            setCurrentApproachPath(point.approachPath || []);
                          }}>
                          Select
                        </Button>
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        <CreateNewItemModal />
      </VStack>
    </Box>
  );
};