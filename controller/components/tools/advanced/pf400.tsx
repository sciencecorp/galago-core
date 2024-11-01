import {
  ChangeEvent,
  FormEvent,
  JSXElementConstructor,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
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
  InputGroup,
  InputLeftElement,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { AddIcon, Search2Icon, DeleteIcon } from "@chakra-ui/icons";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { ToolConfig } from "gen-interfaces/controller";
import { ToolType } from "gen-interfaces/controller";
import {
  ExecuteCommandReply,
  ResponseCode,
  ToolStatus,
} from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { delay } from "framer-motion";

interface PF400Props {
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
  isEdited?: boolean;
}

export const PF400: React.FC<PF400Props> = ({ toolId, config }) => {
  const commandMutation = trpc.tool.runCommand.useMutation();
  const toast = useToast(); // Initialize toast
  const [locations, setLocations] = useState<TeachPoint[]>([]);
  const [currentTeachpoint, setCurrentTeachpoint] = useState("");
  const [currentCoordinate, setCurrentCoordinate] = useState("");
  const [currentApproachPath, setCurrentApproachPath] = useState<string[]>([]);
  const [currentType, setCurrentType] = useState<"nest" | "location">("nest");
  //const toolType = config.type;
  const [gripperWidth, setGripperWidth] = useState(120); // Set initial value to 120
  const [jogAxis, setJogAxis] = useState("");
  const [jogDistance, setJogDistance] = useState(0);
  const [currentLocType, setCurrentLocType] = useState(""); // Add this line
  const [isEditing, setIsEditing] = useState(false);
  const [editedCoordinate, setEditedCoordinate] = useState("");
  const [editedApproachPath, setEditedApproachPath] = useState<string[]>([]);

  const [isCommandInProgress, setIsCommandInProgress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "location" | "nest">("all");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [currentSafeLoc, setCurrentSafeLoc] = useState("");
  const [editedSafeLoc, setEditedSafeLoc] = useState("");

  const handleCreateSuccess = useCallback(() => {
    onClose();
    setRefreshTrigger((prev) => prev + 1);
  }, [onClose]);

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

  const OpenGripper = () =>
    executeCommand(async () => {
      const openGripperCommand: ToolCommandInfo = {
        toolId: config.id,
        toolType: config.type,
        command: "release_plate",
        params: {
          width: gripperWidth,
          speed: 10,
        },
      };
      await commandMutation.mutateAsync(openGripperCommand);
    });

  const CloseGripper = async () => {
    const closeGripperCommand: ToolCommandInfo = {
      toolId: config.id,
      toolType: config.type,
      command: "grasp_plate",
      params: {
        width: gripperWidth,
        speed: 10,
        force: 20,
      },
    };
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
  };

  const Jog = async () => {
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
      toolId: config.id,
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

  const SetFree = async () => {
    const freeCommand: ToolCommandInfo = {
      toolId: config.id,
      toolType: config.type,
      command: "free",
      params: {},
    };
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
  };

  const UnFree = async () => {
    const unfreeCommand: ToolCommandInfo = {
      toolId: config.id,
      toolType: config.type,
      command: "unfree",
      params: {},
    };
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
  };

  const homeCommand = () =>
    executeCommand(async () => {
      const homeCommand: ToolCommandInfo = {
        toolId: config.id,
        toolType: config.type,
        command: "home",
        params: {},
      };
      await commandMutation.mutateAsync(homeCommand);
    });

  const getOriginalLocType = (displayLocType: string): string => {
    switch (displayLocType.toLowerCase()) {
      case "joint":
        return "j";
      case "cartesian":
        return "c";
      default:
        return displayLocType; // Return the original value if it's neither 'Joint' nor 'Cartesian'
    }
  };

  const getLocTypeDisplay = (locType: string): string => {
    switch (locType.toLowerCase()) {
      case "j":
        return "Joint";
      case "c":
        return "Cartesian";
      default:
        return locType; // Return the original value if it's neither 'j' nor 'c'
    }
  };

  const OnTeachPointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setCurrentTeachpoint(selectedName);
    const selectedPoint = locations.find((loc) => loc.name === selectedName);
    if (selectedPoint) {
      setCurrentCoordinate(selectedPoint.coordinate);
      setCurrentType(selectedPoint.type);
      setCurrentLocType(getLocTypeDisplay(selectedPoint.locType)); // Use the new function here
      setCurrentApproachPath(selectedPoint.approachPath || []);
    }
  };

  const GetTeachPoints = async () => {
    const toolCommand: ToolCommandInfo = {
      toolId: config.id,
      toolType: config.type,
      command: "get_teachpoints",
      params: {},
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
      if (response && response.meta_data && response.meta_data) {
        const currentPosition = "1234567890"; //response.meta_data;
        setEditedApproachPath((prevPath) => [...prevPath, currentPosition]);
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
        nest_name: currentTeachpoint,
      },
    };

    try {
      await commandMutation.mutateAsync(addToPathCommand);
      const updatedLocations = await GetTeachPoints();
      setLocations(updatedLocations);
      setCurrentApproachPath(
        updatedLocations.find((loc) => loc.name === currentTeachpoint)?.approachPath || [],
      );
      toast({
        title: "Position Added",
        description: `Current position added to ${currentTeachpoint} path.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setRefreshTrigger((prev) => prev + 1);
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

  const handleCoordinateEdit = (newCoordinate: string) => {
    setEditedCoordinate(newCoordinate);
  };

  const handleApproachPathEdit = (newApproachPath: string[]) => {
    setEditedApproachPath(newApproachPath);
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
        currentLocType,
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
        teachpoints: [
          {
            name: currentTeachpoint,
            coordinate: editedCoordinate,
            type: currentType,
            loc_type: originalLocType,
            approach_path: editedApproachPath,
            is_edited: true,
          },
        ],
      },
    };

    try {
      await commandMutation.mutateAsync(saveCommand);

      // Immediate state update
      setLocations((prevLocations) =>
        prevLocations.map((loc) =>
          loc.name === currentTeachpoint
            ? {
                ...loc,
                coordinate: editedCoordinate,
                locType: originalLocType,
                approachPath: editedApproachPath,
                isEdited: true,
              }
            : loc,
        ),
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

  const CreateNewItemModal = ({
    isOpen,
    onClose,
    onCreateSuccess,
    config,
    locations,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onCreateSuccess: () => void;
    config: ToolConfig;
    locations: TeachPoint[];
  }) => {
    const [localLocationName, setLocalLocationName] = useState("");
    const [localNestName, setLocalNestName] = useState("");
    const [localOrientation, setLocalOrientation] = useState("");
    const [localSafeLoc, setLocalSafeLoc] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const commandMutation = trpc.tool.runCommand.useMutation();

    const handleCreate = useCallback(async () => {
      if (activeTab === 0 && !localLocationName) {
        toast({
          title: "Error",
          description: "Location name is required.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (activeTab === 1 && (!localNestName || !localOrientation || !localSafeLoc)) {
        toast({
          title: "Error",
          description: "All fields are required to create a nest.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (activeTab === 1 && !localSafeLoc) {
        toast({
          title: "Error",
          description: "Safe location is required to create a nest.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setIsCreating(true);

      const createCommand: ToolCommandInfo = {
        toolId: config.id,
        toolType: config.type,
        command: activeTab === 0 ? "create_location" : "create_nest",
        params:
          activeTab === 0
            ? {
                location_name: localLocationName,
                loc_type: "j",
              }
            : {
                nest_name: localNestName,
                loc_type: "j",
                orientation: localOrientation,
                safe_loc: localSafeLoc,
              },
      };

      try {
        await commandMutation.mutateAsync(createCommand);
        toast({
          title: `${activeTab === 0 ? "Location" : "Nest"} Created`,
          description: `${activeTab === 0 ? localLocationName : localNestName} created successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onCreateSuccess();
      } catch (error) {
        console.error(`Error creating ${activeTab === 0 ? "location" : "nest"}:`, error);
        toast({
          title: "Error",
          description: `Failed to create ${activeTab === 0 ? "location" : "nest"}.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsCreating(false);
      }
    }, [
      activeTab,
      localLocationName,
      localNestName,
      localOrientation,
      localSafeLoc,
      config,
      commandMutation,
      onCreateSuccess,
    ]);

    return (
      <Modal isOpen={isOpen} onClose={onClose} motionPreset="none">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs onChange={(index) => setActiveTab(index)}>
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
                  <FormControl>
                    <FormLabel>Nest Name</FormLabel>
                    <Input
                      value={localNestName}
                      onChange={(e) => setLocalNestName(e.target.value)}
                      placeholder="Enter nest name"
                    />
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>Orientation</FormLabel>
                    <Select
                      value={localOrientation}
                      onChange={(e) => setLocalOrientation(e.target.value)}
                      placeholder="Select orientation">
                      <option value="landscape">Landscape</option>
                      <option value="portrait">Portrait</option>
                    </Select>
                  </FormControl>
                  <FormControl mt={4}>
                    <FormLabel>Safe Location</FormLabel>
                    <Select
                      value={localSafeLoc}
                      onChange={(e) => setLocalSafeLoc(e.target.value)}
                      placeholder="Select safe location">
                      {locations
                        .filter((location) => location.type === "location")
                        .map((location) => (
                          <option key={location.name} value={location.name}>
                            {location.name}
                          </option>
                        ))}
                    </Select>
                  </FormControl>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleCreate} isLoading={isCreating}>
              Create {activeTab === 0 ? "Location" : "Nest"}
            </Button>
            <Button variant="ghost" onClick={onClose} isDisabled={isCreating}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
    setCurrentSafeLoc(nest.safe_loc || "");
  };

  const handleSafeLocEdit = (newValue: string) => {
    setEditedSafeLoc(newValue);
  };

  const filteredTeachPoints = locations.filter(
    (loc) =>
      (filterType === "all" || loc.type === filterType) &&
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async () => {
    const deleteCommand: ToolCommandInfo = {
      toolId: config.id,
      toolType: config.type,
      command: currentType === "nest" ? "delete_nest" : "delete_location",
      params: {
        [currentType === "nest" ? "nest_name" : "location_name"]: currentTeachpoint,
      },
    };

    try {
      await commandMutation.mutateAsync(deleteCommand);
      toast({
        title: `${currentType.charAt(0).toUpperCase() + currentType.slice(1)} Deleted`,
        description: `${currentTeachpoint} has been deleted successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Refresh the teach points
      const updatedLocations = await GetTeachPoints();
      setLocations(updatedLocations);
      // Clear the current selection
      setCurrentTeachpoint("");
      setCurrentCoordinate("");
      setCurrentType("nest");
      setCurrentLocType("");
      setCurrentApproachPath([]);
    } catch (error) {
      console.error(`Error deleting ${currentType}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${currentType}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const moveTo = async () => {
    if (!currentTeachpoint) {
      toast({
        title: "Error",
        description: "No location selected",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const moveCommand: ToolCommandInfo = {
      toolId: config.id,
      toolType: config.type,
      command: "move",
      params: {
        waypoint: currentTeachpoint,
        motion_profile_id: 2,
      },
    };

    try {
      await commandMutation.mutateAsync(moveCommand);
      toast({
        title: "Move Successful",
        description: `Moved to ${currentTeachpoint}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error moving to location:", error);
      toast({
        title: "Move Error",
        description: "Failed to move to location",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const approach = async () => {
    if (!currentTeachpoint) {
      toast({
        title: "Error",
        description: "No nest selected",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const approachCommand: ToolCommandInfo = {
      toolId: config.id,
      toolType: config.type,
      command: "approach",
      params: {
        nest: currentTeachpoint,
      },
    };

    try {
      await commandMutation.mutateAsync(approachCommand);
      toast({
        title: "Approach Successful",
        description: `Approached ${currentTeachpoint}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error approaching nest:", error);
      toast({
        title: "Approach Error",
        description: "Failed to approach nest",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  interface DetailsCardProps {
    currentTeachpoint: string;
    currentCoordinate: string;
    currentType: string;
    currentApproachPath: string[];
    isEditing: boolean;
    editedCoordinate: string;
    editedApproachPath: string[];
    handleCoordinateEdit: (newValues: string) => void;
    handleApproachPathEdit: (newValues: string[]) => void;
    startEditing: () => void;
    cancelEditing: () => void;
    saveChanges: () => void;
    isSaving: boolean;
    addToPath: () => void;
    moveTo: () => void;
    approach: () => void;
    setIsDeleteDialogOpen: (isOpen: boolean) => void;
    currentSafeLoc: string;
    handleSafeLocEdit: (newValue: string) => void;
  }

  const DetailsCard: React.FC<DetailsCardProps> = ({
    currentTeachpoint,
    currentCoordinate,
    currentType,
    currentApproachPath,
    isEditing,
    editedCoordinate,
    editedApproachPath,
    handleCoordinateEdit,
    handleApproachPathEdit,
    startEditing,
    cancelEditing,
    saveChanges,
    isSaving,
    addToPath,
    moveTo,
    approach,
    setIsDeleteDialogOpen,
    currentSafeLoc,
    handleSafeLocEdit,
  }) => {
    const coordinateLabels = ["Z", "Shoulder", "Elbow", "Wrist", "Gripper", "Rail"];

    const parseCoordinate = (coord: string): number[] => {
      const values = coord.split(" ").map(Number);
      return values.length === 6 ? values : [0, 0, 0, 0, 0, 0];
    };
    console.log("editedCoordinate", editedCoordinate);
    console.log("currentCoordinate", currentCoordinate);
    const coordinateValues = isEditing
      ? parseCoordinate(editedCoordinate)
      : parseCoordinate(currentCoordinate);

    const handleCoordinateChange = (index: number, value: string) => {
      const newValues = [...coordinateValues];
      newValues[index] = Number(value);
      handleCoordinateEdit(newValues.join(" "));
    };

    const handleApproachPathChange = (stepIndex: number, valueIndex: number, value: string) => {
      const newApproachPath = [...(isEditing ? editedApproachPath : currentApproachPath)];
      const newValues = parseCoordinate(newApproachPath[stepIndex]);
      newValues[valueIndex] = Number(value);
      newApproachPath[stepIndex] = newValues.join(" ");
      handleApproachPathEdit(newApproachPath);
    };

    const deleteApproachPathStep = (stepIndex: number) => {
      if (isEditing) {
        const newApproachPath = [...editedApproachPath];
        newApproachPath.splice(stepIndex, 1);
        handleApproachPathEdit(newApproachPath);
      }
    };

    const leaveNest = async () => {
      if (!currentTeachpoint) {
        toast({
          title: "Error",
          description: "No nest selected",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const leaveCommand: ToolCommandInfo = {
        toolId: config.id,
        toolType: config.type,
        command: "leave",
        params: {
          nest: currentTeachpoint,
        },
      };

      try {
        await commandMutation.mutateAsync(leaveCommand);
        toast({
          title: "Leave Successful",
          description: `Left ${currentTeachpoint}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error leaving nest:", error);
        toast({
          title: "Leave Error",
          description: "Failed to leave nest",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    return (
      <Card align="left" width="50%" height="600px">
        <CardHeader>
          <HStack justify="space-between" width="100%">
            <Heading size="md">Details</Heading>
            <Tooltip label="Add new Item">
              <Button leftIcon={<AddIcon />} onClick={onOpen} colorScheme="blue" size="sm">
                New
              </Button>
            </Tooltip>
          </HStack>
        </CardHeader>
        <CardBody width="100%" overflowY="auto">
          <Text as="b">Name:</Text>
          <Input value={currentTeachpoint} readOnly mb={4} />
          <Text as="b">Coordinate:</Text>
          <Table variant="simple" size="sm" mb={4}>
            <Thead>
              <Tr>
                {coordinateLabels.map((label, index) => (
                  <Th key={index}>{label}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                {coordinateValues.map((value, index) => (
                  <Td key={index}>
                    <Input
                      value={value}
                      onChange={(e) => handleCoordinateChange(index, e.target.value)}
                      readOnly={!isEditing}
                      bg={isEditing ? "yellow.100" : "white"}
                      size="sm"
                      textAlign="center"
                    />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          </Table>
          {currentType === "nest" && (
            <>
              <Text as="b" mt={4}>
                Safe Location:
              </Text>
              <Input
                value={isEditing ? editedCoordinate : currentSafeLoc}
                onChange={(e) => handleSafeLocEdit(e.target.value)}
                readOnly={!isEditing}
                bg={isEditing ? "yellow.100" : "white"}
                mb={4}
              />
              {!isEditing && currentSafeLoc && (
                <Text fontSize="sm" color="gray.500" mb={4}>
                  Safe Location: {currentSafeLoc}
                </Text>
              )}
              <Text as="b">Approach Path:</Text>
              <Table variant="simple" size="sm" mb={4}>
                <Thead>
                  <Tr>
                    <Th>Step</Th>
                    {coordinateLabels.map((label, index) => (
                      <Th key={index}>{label}</Th>
                    ))}
                    {isEditing && <Th>Action</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {(isEditing ? editedApproachPath : currentApproachPath).map((path, stepIndex) => (
                    <Tr key={stepIndex}>
                      <Td>{stepIndex + 1}</Td>
                      {parseCoordinate(path).map((value, valueIndex) => (
                        <Td key={valueIndex}>
                          <Input
                            value={value}
                            onChange={(e) =>
                              handleApproachPathChange(stepIndex, valueIndex, e.target.value)
                            }
                            readOnly={!isEditing}
                            bg={isEditing ? "yellow.100" : "white"}
                            size="sm"
                            textAlign="center"
                          />
                        </Td>
                      ))}
                      {isEditing && (
                        <Td>
                          <Button
                            onClick={() => deleteApproachPathStep(stepIndex)}
                            size="sm"
                            colorScheme="red"
                            variant="ghost">
                            <DeleteIcon />
                          </Button>
                        </Td>
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </>
          )}
          <ButtonGroup spacing="2" mt={4}>
            {isEditing ? (
              <>
                <Button
                  onClick={saveChanges}
                  colorScheme="green"
                  isLoading={isSaving}
                  loadingText="Saving">
                  Save
                </Button>
                <Button onClick={cancelEditing} isDisabled={isSaving}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={startEditing} colorScheme="blue" mr={2}>
                  Edit
                </Button>
                {currentType === "nest" && (
                  <Button onClick={addToPath} colorScheme="blue">
                    Add Current Pos to Path
                  </Button>
                )}
                {currentType === "location" ? (
                  <Button onClick={moveTo} colorScheme="green">
                    Move
                  </Button>
                ) : (
                  <>
                    <Button onClick={approach} colorScheme="green">
                      Approach
                    </Button>
                    <Button onClick={leaveNest} colorScheme="orange">
                      Leave Nest
                    </Button>
                  </>
                )}
                <Button onClick={() => setIsDeleteDialogOpen(true)} colorScheme="red">
                  <DeleteIcon />
                </Button>
              </>
            )}
          </ButtonGroup>
        </CardBody>
      </Card>
    );
  };

  return (
    <VStack align="center" spacing={5} width="100%" pb="50px">
      <Heading size="lg">PF400 Teach Pendant</Heading>
      <Box>
        <HStack spacing={4} justify="space-between" width="100%">
          <ButtonGroup>
            <Button
              disabled={isCommandInProgress}
              onClick={SetFree}
              colorScheme="teal"
              variant="solid"
              borderRadius="md"
              _hover={{ bg: "teal.600" }}>
              Free
            </Button>
            <Button
              disabled={isCommandInProgress}
              onClick={UnFree}
              colorScheme="teal"
              variant="solid"
              borderRadius="md"
              _hover={{ bg: "teal.600" }}>
              Unfree
            </Button>
          </ButtonGroup>
        </HStack>
      </Box>
      <HStack spacing={4}>
        <Card width="30%" height="230px" ml="15%">
          <CardHeader mb="-8px">
            <Heading size="md">Gripper Control</Heading>
          </CardHeader>
          <CardBody>
            <NumberInput
              value={gripperWidth}
              min={10}
              max={130}
              clampValueOnBlur={false}
              onChange={(value) => setGripperWidth(Number(value))}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </CardBody>
          <CardFooter>
            <ButtonGroup spacing="2">
              <Tooltip label="Open the gripper" aria-label="Open Gripper">
                <Button disabled={isCommandInProgress} onClick={OpenGripper} colorScheme="teal">
                  Open
                </Button>
              </Tooltip>
              <Tooltip label="Close the gripper" aria-label="Close Gripper">
                <Button disabled={isCommandInProgress} onClick={CloseGripper} colorScheme="teal">
                  Close
                </Button>
              </Tooltip>
            </ButtonGroup>
          </CardFooter>
        </Card>
        <Card width="35%" height="230px">
          <CardHeader mb="-8px">
            <Heading size="md">Jog Control</Heading>
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
            <Button disabled={isCommandInProgress} onClick={Jog} colorScheme="teal">
              Jog
            </Button>
          </CardFooter>
        </Card>
      </HStack>

      {/* HStack for Locations/Nests and Details */}
      <HStack spacing={4} width="100%">
        {/* Combined Card for Locations and Nests */}
        <Card align="left" display="flex" width="50%" height="600px" ml="15%">
          <CardHeader>
            <HStack justify="space-between" width="100%">
              <Heading size="md">Teach Points</Heading>
            </HStack>
            <InputGroup size="md" mt={2}>
              <InputLeftElement pointerEvents="none">
                <Search2Icon color="gray.300" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Search teach points"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Select
              mt={2}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "location" | "nest")}>
              <option value="all">All</option>
              <option value="location">Locations</option>
              <option value="nest">Nests</option>
            </Select>
          </CardHeader>
          <CardBody width="100%" overflowY="auto" maxHeight="calc(600px - 170px)">
            <VStack spacing={2} align="stretch">
              {filteredTeachPoints.map((teachPoint, i) => (
                <Box
                  key={i.toString()}
                  p={2}
                  borderWidth={1}
                  borderRadius="md"
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onClick={() =>
                    teachPoint.type === "location"
                      ? handleLocationClick(teachPoint)
                      : handleNestClick(teachPoint)
                  }>
                  <HStack justify="space-between">
                    <Text>{teachPoint.name}</Text>
                    <Badge colorScheme={teachPoint.type === "location" ? "blue" : "green"}>
                      {teachPoint.type}
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Details Section for Selected Location or Nest */}
        <DetailsCard
          currentTeachpoint={currentTeachpoint}
          currentCoordinate={currentCoordinate}
          currentType={currentType}
          currentApproachPath={currentApproachPath}
          isEditing={isEditing}
          editedCoordinate={editedCoordinate}
          editedApproachPath={editedApproachPath}
          handleCoordinateEdit={handleCoordinateEdit}
          handleApproachPathEdit={handleApproachPathEdit}
          startEditing={startEditing}
          cancelEditing={cancelEditing}
          saveChanges={saveChanges}
          isSaving={isSaving}
          addToPath={addToPath}
          moveTo={moveTo}
          approach={approach}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          currentSafeLoc={currentSafeLoc}
          handleSafeLocEdit={handleSafeLocEdit}
        />
      </HStack>

      <CreateNewItemModal
        isOpen={isOpen}
        onClose={onClose}
        onCreateSuccess={handleCreateSuccess}
        config={config}
        locations={locations}
      />

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete {currentType}
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {currentTeachpoint}? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                <DeleteIcon />
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};
