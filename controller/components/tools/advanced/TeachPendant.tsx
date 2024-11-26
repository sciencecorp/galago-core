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
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
} from "@chakra-ui/react";
import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { ToolConfig } from "gen-interfaces/controller";
import { useToast } from "@chakra-ui/react";
import { AddIcon, Search2Icon, HamburgerIcon, ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { RobotArmLocation, RobotArmNest } from "@/server/routers/robot-arm";

interface TeachPendantProps {
  toolId: string | undefined;
  config: ToolConfig;
}
  
type TeachPoint = {
  id: number;
  name: string;
  coordinate: string;
  type: "nest" | "location";
  locType: "j";
  orientation?: "portrait" | "landscape";
  safe_loc?: number;
};
  
type MotionProfile = {
  id: number;
  name: string;
  profile_id: number;
  speed: number;
  speed2: number;
  acceleration: number;
  deceleration: number;
  accel_ramp: number;
  decel_ramp: number;
  inrange: number;
  straight: number;
};

type GripParams = {
  id: number;
  name: string;
  width: number;
  speed: number;
  force: number;
};
  
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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [isMotionProfileModalOpen, setIsMotionProfileModalOpen] = useState(false);
  const [isGripParamsModalOpen, setIsGripParamsModalOpen] = useState(false);
  const [selectedMotionProfile, setSelectedMotionProfile] = useState<MotionProfile | null>(null);
  const [selectedGripParams, setSelectedGripParams] = useState<GripParams | null>(null);

  const getLocTypeDisplay = (locType: string) => {
    switch (locType) {
      case "j": return "Joint";
    }
  };

  function jointsToCoordinate(joints: {
    j1?: number;
    j2?: number;
    j3?: number;
    j4?: number;
    j5?: number;
    j6?: number;
  }): string {
    return [joints.j1, joints.j2, joints.j3, joints.j4, joints.j5, joints.j6]
      .map(j => j ?? 0)
      .join(' ');
  }
  
  function coordinateToJoints(coordinate: string): {
    j1?: number;
    j2?: number;
    j3?: number;
    j4?: number;
    j5?: number;
    j6?: number;
  } {
    const [j1, j2, j3, j4, j5, j6] = coordinate.split(' ').map(Number);
    return { j1, j2, j3, j4, j5, j6 };
  }

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

  console.log("config", config);

  const robotArmLocationsQuery = trpc.robotArm.location.getAll.useQuery<RobotArmLocation[]>(
    { toolId: config.id },
    { enabled: !!config.id }
  );
  
  const robotArmNestsQuery = trpc.robotArm.nest.getAll.useQuery(
    { toolId: config.id },
    { enabled: !!config.id }
  );

  const createLocationMutation = trpc.robotArm.location.create.useMutation({
    onSuccess: () => {
      robotArmLocationsQuery.refetch();
      onClose();
    },
  });

  const createNestMutation = trpc.robotArm.nest.create.useMutation({
    onSuccess: () => {
      robotArmNestsQuery.refetch();
      onClose();
    }, 
  });

  useEffect(() => {
    console.log('Robot Locations:', robotArmLocationsQuery.data);
    console.log('Robot Nests:', robotArmNestsQuery.data);
    
    const formattedLocations: TeachPoint[] = (robotArmLocationsQuery.data || [])
      .filter(loc => loc.id !== undefined)
      .map(loc => ({
        id: loc.id as number,
        name: loc.name,
        coordinate: jointsToCoordinate({
          j1: loc.j1,
          j2: loc.j2,
          j3: loc.j3,
          j4: loc.j4,
          j5: loc.j5,
          j6: loc.j6
        }),
        type: "location" as const,
        locType: "j",
      }));

    const formattedNests: TeachPoint[] = (robotArmNestsQuery.data || [])
      .filter(nest => nest.id !== undefined)
      .map(nest => ({
        id: nest.id as number,
        name: nest.name,
        coordinate: jointsToCoordinate({
          j1: nest.j1,
          j2: nest.j2,
          j3: nest.j3,
          j4: nest.j4,
          j5: nest.j5,
          j6: nest.j6
        }),
        type: "nest" as const,
        locType: "j",
        orientation: nest.orientation,
        safe_loc: nest.safe_location_id,
      }));

    console.log('Formatted Locations:', formattedLocations);
    console.log('Formatted Nests:', formattedNests);
    
    setLocations([...formattedLocations, ...formattedNests]);
  }, [robotArmLocationsQuery.data, robotArmNestsQuery.data]);

  const handleSaveTeachPoint = async () => {
    if (!currentTeachpoint || !config.id) return;

    try {
      if (currentType === "location") {
        await createLocationMutation.mutateAsync({
          name: currentTeachpoint,
          location_type: "j",
          j1: parseFloat(currentCoordinate.split(" ")[0]),
          j2: parseFloat(currentCoordinate.split(" ")[1]),
          j3: parseFloat(currentCoordinate.split(" ")[2]),
          j4: parseFloat(currentCoordinate.split(" ")[3]),
          j5: parseFloat(currentCoordinate.split(" ")[4]),
          j6: parseFloat(currentCoordinate.split(" ")[5]),
          tool_id: config.id,
        });
      } else {
        await createNestMutation.mutateAsync({
          name: currentTeachpoint,
          orientation: "landscape", // Default value, could be made configurable
          safe_location_id: 1, // This should be selected from available locations
          j1: parseFloat(currentCoordinate.split(" ")[0]),
          j2: parseFloat(currentCoordinate.split(" ")[1]),
          j3: parseFloat(currentCoordinate.split(" ")[2]),
          j4: parseFloat(currentCoordinate.split(" ")[3]),
          j5: parseFloat(currentCoordinate.split(" ")[4]),
          j6: parseFloat(currentCoordinate.split(" ")[5]),
          location_type: "j",
          tool_id: config.id,
        });
      }

      toast({
        title: "Success",
        description: `${currentType} saved successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save ${currentType}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const CreateNewItemModal = () => {
    const [localTeachpoint, setLocalTeachpoint] = useState("");
    const [localType, setLocalType] = useState<"nest" | "location">("location");
    const [localSafeLoc, setLocalSafeLoc] = useState<number>();
  
    // Reset form when modal opens
    useEffect(() => {
      if (isOpen) {
        setLocalTeachpoint("");
        setLocalType("location");
        setLocalSafeLoc(undefined);
      }
    }, [isOpen]);
  
    const handleSave = async () => {
      if (!localTeachpoint || !config.id) return;
  
      try {
        if (localType === "location") {
          await createLocationMutation.mutateAsync({
            name: localTeachpoint,
            location_type: "j", // Default to joint coordinates
            j1: 0,
            j2: 0,
            j3: 0,
            j4: 0,
            j5: 0,
            j6: 0,
            tool_id: config.id,
          });
        } else {
          await createNestMutation.mutateAsync({
            name: localTeachpoint,
            orientation: "landscape",
            safe_location_id: localSafeLoc || 1,
            j1: 0,
            j2: 0,
            j3: 0,
            j4: 0,
            j5: 0,
            j6: 0,
            location_type: "j",
            tool_id: config.id,
          });
        }
  
        toast({
          title: "Success",
          description: `${localType} created successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to create ${localType}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Teach Point</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select
                  value={localType}
                  onChange={(e) => setLocalType(e.target.value as "nest" | "location")}
                >
                  <option value="location">Location</option>
                  <option value="nest">Nest</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={localTeachpoint}
                  onChange={(e) => setLocalTeachpoint(e.target.value)}
                />
              </FormControl>
              {localType === "nest" && (
                <FormControl>
                  <FormLabel>Safe Location</FormLabel>
                  <Select
                    value={localSafeLoc}
                    onChange={(e) => setLocalSafeLoc(parseInt(e.target.value))}
                  >
                    {locations
                      .filter(loc => loc.type === "location")
                      .map(loc => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                  </Select>
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
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

  const deleteLocationMutation = trpc.robotArm.location.delete.useMutation({
    onSuccess: () => {
      robotArmLocationsQuery.refetch();
      toast({
        title: "Location deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteNestMutation = trpc.robotArm.nest.delete.useMutation({
    onSuccess: () => {
      robotArmNestsQuery.refetch();
      toast({
        title: "Nest deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateLocationMutation = trpc.robotArm.location.update.useMutation({
    onSuccess: () => {
      robotArmLocationsQuery.refetch();
      setIsEditModalOpen(false);
    },
  });

  const updateNestMutation = trpc.robotArm.nest.update.useMutation({
    onSuccess: () => {
      robotArmNestsQuery.refetch();
      setIsEditModalOpen(false);
    },
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<TeachPoint | null>(null);

  const handleDelete = async (point: TeachPoint) => {
    try {
      if (point.type === "location") {
        console.log("Deleting location", point);
        await deleteLocationMutation.mutateAsync({ id: point.id });
      } else {
        await deleteNestMutation.mutateAsync({ id: point.id });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${point.type}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (point: TeachPoint) => {
    setEditingPoint(point);
    setIsEditModalOpen(true);
  };

  const handleSendCommand = async (point: TeachPoint) => {
    const command: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type,
      command: "move",
      params: {
        waypoint: point.coordinate,
        type: point.locType,
      },
    };

    try {
      await commandMutation.mutateAsync(command);
      toast({
        title: "Command Sent",
        description: `Moving to ${point.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Command Error",
        description: "Failed to send movement command",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const EditModal = () => {
    const [localName, setLocalName] = useState(editingPoint?.name || "");
    const [localCoordinate, setLocalCoordinate] = useState(editingPoint?.coordinate || "");
    const [localSafeLoc, setLocalSafeLoc] = useState<number | undefined>(
      editingPoint?.safe_loc
    );

    useEffect(() => {
      if (editingPoint) {
        setLocalName(editingPoint.name);
        setLocalCoordinate(editingPoint.coordinate);
        setLocalSafeLoc(editingPoint.safe_loc);
      }
    }, [editingPoint]);

    const handleSave = async () => {
      if (!editingPoint || !config.id) return;

      try {
        if (editingPoint.type === "location") {
          await updateLocationMutation.mutateAsync({
            id: editingPoint.id,
            name: localName,
            ...coordinateToJoints(localCoordinate),
            location_type: editingPoint.locType,
            tool_id: config.id,
          });
        } else {
          await updateNestMutation.mutateAsync({
            id: editingPoint.id,
            name: localName,
            j1: parseFloat(localCoordinate.split(" ")[0]),
            j2: parseFloat(localCoordinate.split(" ")[1]),
            j3: parseFloat(localCoordinate.split(" ")[2]),
            j4: parseFloat(localCoordinate.split(" ")[3]),
            j5: parseFloat(localCoordinate.split(" ")[4]),
            j6: parseFloat(localCoordinate.split(" ")[5]),
            location_type: editingPoint.locType,
            orientation: editingPoint.orientation || "landscape",
            safe_location_id: localSafeLoc || 1,
            tool_id: config.id,
          });
        }

        toast({
          title: "Success",
          description: `${editingPoint.type} updated successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to update ${editingPoint.type}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    return (
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit {editingPoint?.type}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Coordinate</FormLabel>
                <Input
                  value={localCoordinate}
                  onChange={(e) => setLocalCoordinate(e.target.value)}
                />
              </FormControl>
              {editingPoint?.type === "nest" && (
                <FormControl>
                  <FormLabel>Safe Location</FormLabel>
                  <Select
                    value={localSafeLoc}
                    onChange={(e) => setLocalSafeLoc(parseInt(e.target.value))}
                  >
                    {locations
                      .filter((loc) => loc.type === "location")
                      .map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                  </Select>
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Save
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  console.log("Coordinates", filteredTeachPoints)

  const motionProfilesQuery = trpc.robotArm.motionProfile.getAll.useQuery(
    { toolId: config.id },
    { enabled: !!config.id }
  );

  const gripParamsQuery = trpc.robotArm.gripParams.getAll.useQuery(
    { toolId: config.id },
    { enabled: !!config.id }
  );

  const createMotionProfileMutation = trpc.robotArm.motionProfile.create.useMutation();
  const updateMotionProfileMutation = trpc.robotArm.motionProfile.update.useMutation();
  const deleteMotionProfileMutation = trpc.robotArm.motionProfile.delete.useMutation();

  const createGripParamsMutation = trpc.robotArm.gripParams.create.useMutation();
  const updateGripParamsMutation = trpc.robotArm.gripParams.update.useMutation();
  const deleteGripParamsMutation = trpc.robotArm.gripParams.delete.useMutation();

  const handleCreateMotionProfile = async (profileData: Omit<MotionProfile, 'id'>) => {
    try {
      await createMotionProfileMutation.mutateAsync({
        name: profileData.name,
        profile_id: profileData.profile_id,
        tool_id: config.id,
        speed: profileData.speed,
        speed2: profileData.speed2,
        acceleration: profileData.acceleration,
        deceleration: profileData.deceleration,
        accel_ramp: profileData.accel_ramp,
        decel_ramp: profileData.decel_ramp,
        inrange: profileData.inrange,
        straight: profileData.straight,
      });
      setIsMotionProfileModalOpen(false);
      motionProfilesQuery.refetch();
      toast({
        title: "Success",
        description: "Motion profile created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating motion profile:', error);
      toast({
        title: "Error",
        description: "Failed to create motion profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateMotionProfile = async (profile: MotionProfile) => {
    try {
      await updateMotionProfileMutation.mutateAsync(profile);
      setIsMotionProfileModalOpen(false);
      setSelectedMotionProfile(null);
      motionProfilesQuery.refetch();
      toast({
        title: "Success",
        description: "Motion profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update motion profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRegisterMotionProfile = async (profile: MotionProfile) => {
    const registerCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type,
      command: "register_motion_profile",
      params: {
        id: profile.profile_id,
        speed: profile.speed,
        speed2: profile.speed2,
        accel: profile.acceleration,
        decel: profile.deceleration,
        accel_ramp: profile.accel_ramp,
        decel_ramp: profile.decel_ramp,
        inrange: profile.inrange,
        straight: profile.straight,
      },
    };

    try {
      await commandMutation.mutateAsync(registerCommand);
      toast({
        title: "Success",
        description: "Motion profile registered with robot",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register motion profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateGripParams = async (paramsData: Omit<GripParams, 'id'>) => {
    try {
      await createGripParamsMutation.mutateAsync({
        name: paramsData.name,
        width: paramsData.width,
        speed: paramsData.speed,
        force: paramsData.force,
        tool_id: config.id
      });
      setIsGripParamsModalOpen(false);
      gripParamsQuery.refetch();
      toast({
        title: "Success",
        description: "Grip parameters created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating grip parameters:', error);
      toast({
        title: "Error",
        description: "Failed to create grip parameters",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateGripParams = async (params: GripParams) => {
    try {
      await updateGripParamsMutation.mutateAsync({
        ...params,
        tool_id: config.id
      });
      setIsGripParamsModalOpen(false);
      setSelectedGripParams(null);
      gripParamsQuery.refetch();
      toast({
        title: "Success",
        description: "Grip parameters updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update grip parameters",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const MotionProfileModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    profile?: MotionProfile;
  }> = ({ isOpen, onClose, profile }) => {
    const [formData, setFormData] = useState<Partial<MotionProfile>>(
      profile || {
        name: "",
        profile_id: 0,
        speed: 50,
        speed2: 50,
        acceleration: 50,
        deceleration: 50,
        accel_ramp: 0.1,
        decel_ramp: 0.1,
        inrange: 0.1,
        straight: 0,
      }
    );

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (profile) {
        await handleUpdateMotionProfile({ ...formData, id: profile.id } as MotionProfile);
      } else {
        const profileData = {
          name: formData.name || '',
          profile_id: formData.profile_id || 0,
          speed: formData.speed || 0,
          speed2: formData.speed2 || 0,
          acceleration: formData.acceleration || 0,
          deceleration: formData.deceleration || 0,
          accel_ramp: formData.accel_ramp || 0,
          decel_ramp: formData.decel_ramp || 0,
          inrange: formData.inrange || 0,
          straight: formData.straight || 0
        };
        await handleCreateMotionProfile(profileData);
      }
      onClose();
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>{profile ? "Edit" : "Create"} Motion Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Profile ID</FormLabel>
                  <NumberInput
                    value={formData.profile_id}
                    onChange={(_, value) => setFormData({ ...formData, profile_id: value })}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <HStack width="100%" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Speed (%)</FormLabel>
                    <NumberInput
                      value={formData.speed}
                      onChange={(_, value) => setFormData({ ...formData, speed: value })}
                      min={0}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Speed2 (%)</FormLabel>
                    <NumberInput
                      value={formData.speed2}
                      onChange={(_, value) => setFormData({ ...formData, speed2: value })}
                      min={0}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack width="100%" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Acceleration (%)</FormLabel>
                    <NumberInput
                      value={formData.acceleration}
                      onChange={(_, value) => setFormData({ ...formData, acceleration: value })}
                      min={0}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Deceleration (%)</FormLabel>
                    <NumberInput
                      value={formData.deceleration}
                      onChange={(_, value) => setFormData({ ...formData, deceleration: value })}
                      min={0}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack width="100%" spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Accel Ramp (s)</FormLabel>
                    <NumberInput
                      value={formData.accel_ramp}
                      onChange={(_, value) => setFormData({ ...formData, accel_ramp: value })}
                      min={0}
                      step={0.1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Decel Ramp (s)</FormLabel>
                    <NumberInput
                      value={formData.decel_ramp}
                      onChange={(_, value) => setFormData({ ...formData, decel_ramp: value })}
                      min={0}
                      step={0.1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <FormControl isRequired>
                  <FormLabel>In Range</FormLabel>
                  <NumberInput
                    value={formData.inrange}
                    onChange={(_, value) => setFormData({ ...formData, inrange: value })}
                    min={0}
                    step={0.1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Straight</FormLabel>
                  <Select
                    value={formData.straight}
                    onChange={(e) => setFormData({ ...formData, straight: parseInt(e.target.value) })}
                  >
                    <option value={0}>Curved (0)</option>
                    <option value={-1}>Straight (-1)</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                {profile ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  };

  const GripParamsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    params?: GripParams;
  }> = ({ isOpen, onClose, params }) => {
    const [formData, setFormData] = useState<Partial<GripParams>>(
      params || {
        name: "",
        width: 122,
        speed: 10,
        force: 20,
      }
    );

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (params) {
        await handleUpdateGripParams({ ...formData, id: params.id } as GripParams);
      } else {
        const paramsData = {
          name: formData.name || '',
          width: formData.width || 0,
          speed: formData.speed || 0,
          force: formData.force || 0
        };
        await handleCreateGripParams(paramsData);
      }
      onClose();
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>{params ? "Edit" : "Create"} Grip Parameters</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Width</FormLabel>
                  <NumberInput
                    value={formData.width}
                    onChange={(_, value) => setFormData({ ...formData, width: value })}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Speed</FormLabel>
                  <NumberInput
                    value={formData.speed}
                    onChange={(_, value) => setFormData({ ...formData, speed: value })}
                    min={0}
                    max={100}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Force</FormLabel>
                  <NumberInput
                    value={formData.force}
                    onChange={(_, value) => setFormData({ ...formData, force: value })}
                    min={0}
                    max={100}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                {params ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      bg={bgColor}
      p={4}
      height="calc(100vh - 150px)"
      minHeight="800px"
      minWidth="700px"
      width="100%"
    >
      <VStack spacing={4} width="100%" height="100%">
        <HStack width="100%" justify="space-between">
          <Heading size="md">Teach Pendant</Heading>
        </HStack>
        
        <Card width="100%" height="100px" bg={bgColor} borderColor={borderColor}>
          <CardHeader pb={0}>
            <Heading size="sm">Jog Controls</Heading>
          </CardHeader>
          <CardBody pt={2}>
            <HStack spacing={4}>
              <Select 
                placeholder="Axis" 
                onChange={(e) => setJogAxis(e.target.value)}
                size="sm"
                width="120px"
              >
                <option value="x">X</option>
                <option value="y">Y</option>
                <option value="z">Z</option>
                <option value="yaw">Yaw</option>
                <option value="pitch">Pitch</option>
                <option value="roll">Roll</option>
              </Select>
              <NumberInput
                size="sm"
                width="120px"
                clampValueOnBlur={false}
                onChange={(valueString) => setJogDistance(parseFloat(valueString))}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Button onClick={handleJog} colorScheme="teal" size="sm">
                Jog
              </Button>
            </HStack>
          </CardBody>
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
        <Tabs variant="enclosed" width="100%">
          <TabList>
            <Tab>Teach Points</Tab>
            <Tab>Motion Profiles</Tab>
            <Tab>Grip Parameters</Tab>
          </TabList>

          <TabPanels>
            <TabPanel padding={0}>
              <Card width="100%" flex="1" bg={bgColor} borderColor={bgColorAlpha}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">Teach Points</Heading>
                    <HStack spacing={2}>
                      <Text color="gray.500">
                        {filteredTeachPoints.length} point{filteredTeachPoints.length !== 1 ? 's' : ''}
                      </Text>
                      <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm" onClick={onOpen} variant="ghost">
                      </Button>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody 
                  overflowY="auto" 
                  maxHeight="calc(100vh - 700px)"
                  minHeight="550px"
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      width: '6px',
                    },
                    padding: 0,
                  }}
                >
                  <Table variant="simple">
                    <Thead position="sticky" top={0} bg={bgColor} zIndex={1} css={{ transform: 'translateY(0)' }}>
                      <Tr>
                        <Th width="40px"></Th>
                        <Th>Name</Th>
                        <Th>Type</Th>
                        <Th textAlign="right">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredTeachPoints.map((point, index) => (
                        <>
                          <Tr 
                            key={`${index}-main`}
                            _hover={{ bg: bgColorAlpha }}
                          >
                            <Td padding="0" width="40px">
                              <IconButton
                                aria-label="Expand row"
                                icon={expandedRows.has(point.id) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                onClick={() => toggleRow(point.id)}
                                variant="ghost"
                                size="sm"
                              />
                            </Td>
                            <Td>{point.name}</Td>
                            <Td>
                              <Badge colorScheme={point.type === "location" ? "blue" : "green"}>
                                {point.type}
                              </Badge>
                            </Td>
                            <Td textAlign="right">
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Actions"
                                  icon={<HamburgerIcon />}
                                  variant="ghost"
                                  size="sm"
                                />
                                <MenuList>
                                  <MenuItem onClick={() => handleSendCommand(point)}>
                                    Move to
                                  </MenuItem>
                                  <MenuItem onClick={() => handleEdit(point)}>
                                    Edit
                                  </MenuItem>
                                  <MenuItem
                                    color="red.500"
                                    onClick={() => handleDelete(point)}
                                  >
                                    Delete
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </Td>
                          </Tr>
                          {expandedRows.has(point.id) && (
                            <Tr 
                              key={`${index}-expanded`}
                              bg={bgColorAlpha}
                            >
                              <Td colSpan={4}>
                                <VStack align="start" spacing={2} p={2}>
                                  <HStack width="100%" justify="space-between">
                                    <Text fontWeight="bold">
                                      Coordinates ({point.locType ? getLocTypeDisplay(point.locType) : 'Unknown'})
                                    </Text>
                                    <Badge colorScheme="gray">
                                      {point.locType ? point.locType.toUpperCase() : 'N/A'}
                                    </Badge>
                                  </HStack>
                                  <Text fontFamily="mono" fontSize="sm">
                                    {point.coordinate ? 
                                      point.coordinate.split(' ').map((coord, i) => (
                                        <span key={i}>
                                          {i > 0 && ' | '}
                                          {parseFloat(coord).toFixed(3)}
                                        </span>
                                      ))
                                      : 'No coordinates available'
                                    }
                                  </Text>
                                  {point.type === "nest" && (
                                    <>
                                      <Text fontWeight="bold" mt={2}>Additional Properties</Text>
                                      <HStack spacing={4}>
                                        {point.orientation && (
                                          <Badge colorScheme="purple">
                                            Orientation: {point.orientation}
                                          </Badge>
                                        )}
                                        {point.safe_loc && (
                                          <Badge colorScheme="orange">
                                            Safe Location Name: {point.safe_loc}
                                          </Badge>
                                        )}
                                      </HStack>
                                    </>
                                  )}
                                </VStack>
                              </Td>
                            </Tr>
                          )}
                        </>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel padding={0}>
              <Card width="100%" flex="1" bg={bgColor} borderColor={bgColorAlpha}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">Motion Profiles</Heading>
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => setIsMotionProfileModalOpen(true)}
                      variant="ghost"
                    />
                  </HStack>
                </CardHeader>
                <CardBody overflowY="auto" maxHeight="calc(100vh - 700px)" minHeight="550px">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Profile ID</Th>
                        <Th>Speed</Th>
                        <Th>Speed2</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {motionProfilesQuery.data?.map((profile) => (
                        <Tr key={profile.id}>
                          <Td>{profile.name}</Td>
                          <Td>{profile.profile_id}</Td>
                          <Td>{profile.speed}%</Td>
                          <Td>{profile.speed2}%</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="Actions"
                                icon={<HamburgerIcon />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem onClick={() => {/* TODO: Edit profile */}}>
                                  Edit
                                </MenuItem>
                                <MenuItem onClick={() => {/* TODO: Register profile */}}>
                                  Register
                                </MenuItem>
                                <MenuItem
                                  color="red.500"
                                  onClick={() => {/* TODO: Delete profile */}}
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>

            <TabPanel padding={0}>
              <Card width="100%" flex="1" bg={bgColor} borderColor={bgColorAlpha}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">Grip Parameters</Heading>
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => setIsGripParamsModalOpen(true)}
                      variant="ghost"
                    />
                  </HStack>
                </CardHeader>
                <CardBody overflowY="auto" maxHeight="calc(100vh - 700px)" minHeight="550px">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Width</Th>
                        <Th>Speed</Th>
                        <Th>Force</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {gripParamsQuery.data?.map((params) => (
                        <Tr key={params.id}>
                          <Td>{params.name}</Td>
                          <Td>{params.width}</Td>
                          <Td>{params.speed}</Td>
                          <Td>{params.force}</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="Actions"
                                icon={<HamburgerIcon />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem onClick={() => {/* TODO: Edit params */}}>
                                  Edit
                                </MenuItem>
                                <MenuItem
                                  color="red.500"
                                  onClick={() => {/* TODO: Delete params */}}
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <CreateNewItemModal />
        <EditModal />
        <MotionProfileModal
          isOpen={isMotionProfileModalOpen}
          onClose={() => {
            setIsMotionProfileModalOpen(false);
            setSelectedMotionProfile(null);
          }}
          profile={selectedMotionProfile}
        />
        <GripParamsModal
          isOpen={isGripParamsModalOpen}
          onClose={() => {
            setIsGripParamsModalOpen(false);
            setSelectedGripParams(null);
          }}
          params={selectedGripParams} 
        />
      </VStack>
    </Box>
  );
};