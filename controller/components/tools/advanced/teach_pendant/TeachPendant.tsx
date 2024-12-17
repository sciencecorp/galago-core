import {
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
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { Tool } from "@/types/api";
import { useToast } from "@chakra-ui/react";
import {
  Search2Icon,
} from "@chakra-ui/icons";
import { RobotArmLocation, RobotArmNest, RobotArmSequence } from "@/server/routers/robot-arm";
import { useSequenceHandler } from "./SequenceHandler";
import { ToolType } from "gen-interfaces/controller";
import { TeachPendantActions } from "./TeachPendantActions";
import {
  TeachPendantProps,
  TeachPoint,
  MotionProfile,
  GripParams,
  Sequence,
  MoveModalProps,
  SearchableItem,
  ItemType
} from "./types";
import { TeachPointsPanel } from "./panels/TeachPointsPanel";
import { MotionProfilesPanel } from "./panels/MotionProfilesPanel";
import { GripParametersPanel } from "./panels/GripParametersPanel";
import { SequencesPanel } from "./panels/SequencesPanel";
import { ControlPanel } from "./panels/ControlPanel";
import { DataPanel } from "./panels/DataPanel";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { SequenceModal } from "./modals/SequenceModal";

export const TeachPendant: React.FC<TeachPendantProps> = ({ toolId, config }) => {
  const commandMutation = trpc.tool.runCommand.useMutation();
  const toast = useToast();
  const [isCommandInProgress, setIsCommandInProgress] = useState(false);
  const [jogAxis, setJogAxis] = useState("");
  const [jogDistance, setJogDistance] = useState(0);
  const {
    isOpen: isTeachPointModalOpen,
    onOpen: onTeachPointModalOpen,
    onClose: onTeachPointModalClose
  } = useDisclosure();
  const {
    isOpen: isMotionProfileModalOpen,
    onOpen: onMotionProfileModalOpen,
    onClose: onMotionProfileModalClose
  } = useDisclosure();
  const {
    isOpen: isGripParamsModalOpen,
    onOpen: onGripParamsModalOpen,
    onClose: onGripParamsModalClose
  } = useDisclosure();
  const {
    isOpen: isMoveModalOpen,
    onOpen: onMoveModalOpen,
    onClose: onMoveModalClose
  } = useDisclosure();
  const [locations, setLocations] = useState<TeachPoint[]>([]);
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.900");
  const bgColorAlpha = useColorModeValue("gray.50", "gray.900");
  const [activeTab, setActiveTab] = useState(0);
  const [currentTeachpoint, setCurrentTeachpoint] = useState("");
  const [currentType, setCurrentType] = useState<"nest" | "location">("location");
  const [currentCoordinate, setCurrentCoordinate] = useState("");
  const [currentApproachPath, setCurrentApproachPath] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedMotionProfile, setSelectedMotionProfile] = useState<MotionProfile | null>(null);
  const [selectedGripParams, setSelectedGripParams] = useState<GripParams | null>(null);
  const [selectedMotionProfileId, setSelectedMotionProfileId] = useState<number>(1);
  const [commands, setCommands] = useState<any[]>([]);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [globalFilterType, setGlobalFilterType] = useState<ItemType | "all">("all");
  const [selectedGripParamsId, setSelectedGripParamsId] = useState<number | null>(null);
  const [manualWidth, setManualWidth] = useState<number>(122);
  const [manualSpeed, setManualSpeed] = useState<number>(10);
  const [manualForce, setManualForce] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ItemType | "all">("all");
  const [jogEnabled, setJogEnabled] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<TeachPoint | null>(null);
  const toolStatusQuery = trpc.tool.status.useQuery(
    { toolId: toolId || '' },
    { enabled: !!toolId }
  );
  const {
    sequences,
    handleCreateSequence,
    handleUpdateSequence,
    handleDeleteSequence,
    handleRunSequence,
    handleEditSequence,
    handleNewSequence,
    isOpen: isSequenceModalOpen,
    onClose: onSequenceModalClose,
    selectedSequence,
  } = useSequenceHandler(config);

  const waypoints = trpc.robotArm.waypoints.getAll.useQuery(
    { toolId: config.id },
    { enabled: !!config.id && config.id !== 0 },
  );


  function jointsToCoordinate(joints: {
    j1?: number;
    j2?: number;
    j3?: number;
    j4?: number;
    j5?: number;
    j6?: number;
  }): string {
    return [joints.j1, joints.j2, joints.j3, joints.j4, joints.j5, joints.j6]
      .map((j) => j ?? 0)
      .join(" ");
  }

  function coordinateToJoints(coordinate: string): {
    j1?: number;
    j2?: number;
    j3?: number;
    j4?: number;
    j5?: number;
    j6?: number;
  } {
    const [j0, j1, j2, j3, j4, j5, j6] = coordinate.split(" ").map(Number);
    return {
      j1: j1, // 334.654
      j2: j2, // 0.837
      j3: j3, // 178.988
      j4: j4, // -187.834
      j5: j5, // 72.78
      j6: j6, // 168.109
    };
  }

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
      toolId: config.name,
      toolType: config.type as ToolType,
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

  const robotArmSequencesQuery = trpc.robotArm.sequence.getAll.useQuery(
    { toolId: config.id },
    { enabled: !!config.id && config.id !== 0 },
  );

  const robotArmLocationsQuery = trpc.robotArm.location.getAll.useQuery<RobotArmLocation[]>(
    { toolId: config.id },
    { enabled: !!config.id && config.id !== 0 },
  );

  const robotArmNestsQuery = trpc.robotArm.nest.getAll.useQuery(
    { toolId: config.id },
    { enabled: !!config.id && config.id !== 0 },
  );

  const createLocationMutation = trpc.robotArm.location.create.useMutation({
    onSuccess: () => {
      robotArmLocationsQuery.refetch();
      onTeachPointModalClose();
    },
  });

  const createNestMutation = trpc.robotArm.nest.create.useMutation({
    onSuccess: () => {
      robotArmNestsQuery.refetch();
      onTeachPointModalClose();
    },
  });

  useEffect(() => {
    const formattedLocations: TeachPoint[] = (robotArmLocationsQuery.data || [])
      .filter((loc) => loc.id !== undefined)
      .map((loc) => ({
        id: loc.id as number,
        name: loc.name,
        coordinate: jointsToCoordinate({
          j1: loc.j1,
          j2: loc.j2,
          j3: loc.j3,
          j4: loc.j4,
          j5: loc.j5,
          j6: loc.j6,
        }),
        type: "location" as const,
        locType: "j",
      }));

    const formattedNests: TeachPoint[] = (robotArmNestsQuery.data || [])
      .filter((nest) => nest.id !== undefined)
      .map((nest) => ({
        id: nest.id as number,
        name: nest.name,
        coordinate: jointsToCoordinate({
          j1: nest.j1,
          j2: nest.j2,
          j3: nest.j3,
          j4: nest.j4,
          j5: nest.j5,
          j6: nest.j6,
        }),
        type: "nest" as const,
        locType: "j",
        orientation: nest.orientation,
        safe_loc: nest.safe_location_id,
      }));

    setLocations([...formattedLocations, ...formattedNests]);
  }, [robotArmLocationsQuery.data, robotArmNestsQuery.data]);

  const getCurrentPosition = async (): Promise<string | null> => {
    if (toolStatusQuery.data?.status === "SIMULATED") {
      console.log("Simulated mode");
      // Default values for simulated mode
      return "0 0 0 0 0 0";
    }

    const toolCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type as ToolType,
      command: "get_current_location",
      params: {},
    };

    try {
      const response = await commandMutation.mutateAsync(toolCommand);
      if (response && response.meta_data) {
        return response.meta_data.location;
      }
      return null;
    } catch (error) {
      console.error("Error getting current position:", error);
      toast({
        title: "Error",
        description: "Failed to get current position",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return null;
    }
  };

  interface CreateNewItemModalProps {
    isOpen: boolean;
    onClose: () => void;
  }

  const CreateNewItemModal: React.FC<CreateNewItemModalProps> = ({ isOpen, onClose }) => {
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
      if (!localTeachpoint || !config.name) return;

      try {
        const currentPosition = await getCurrentPosition();
        if (!currentPosition) {
          toast({
            title: "Error",
            description: "Failed to get current position from robot",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        const joints = coordinateToJoints(currentPosition);

        if (localType === "location") {
          await createLocationMutation.mutateAsync({
            name: localTeachpoint,
            location_type: "j",
            ...joints,
            tool_id: config.id,
          });
        } else {
          await createNestMutation.mutateAsync({
            name: localTeachpoint,
            orientation: "landscape",
            safe_location_id: localSafeLoc || 1,
            ...joints,
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
                  onChange={(e) => setLocalType(e.target.value as "nest" | "location")}>
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
                    onChange={(e) => setLocalSafeLoc(parseInt(e.target.value))}>
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
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

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
      onEditModalClose();
    },
  });

  const updateNestMutation = trpc.robotArm.nest.update.useMutation({
    onSuccess: () => {
      robotArmNestsQuery.refetch();
      onEditModalClose();
    },
  });

  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose
  } = useDisclosure();

  const [editingPoint, setEditingPoint] = useState<TeachPoint | null>(null);

  const handleDelete = async (point: TeachPoint) => {
    try {
      if (point.type === "location") {
        await deleteLocationMutation.mutateAsync({
          id: point.id,
        });
      } else {
        // For nests, we need to handle the potential delay
        try {
          await deleteNestMutation.mutateAsync({
            id: point.id,
          });
        } catch (error) {
          // Check if the deletion actually succeeded despite the error
          await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay
          const updatedData = await robotArmNestsQuery.refetch();
          const stillExists = updatedData.data?.some((nest) => nest.id === point.id);

          if (stillExists) {
            // If the nest still exists, then it was a real error
            throw error;
          }
          // If we get here, the deletion succeeded despite the error
        }
      }

      toast({
        title: "Success",
        description: `${point.type} deleted successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: `Failed to delete ${point.type}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditGripParams = (params: GripParams) => {
    setSelectedGripParams(params);
    onGripParamsModalOpen();
  };

  const handleUpdateGripParams = async (params: GripParams) => {
    try {
      await updateGripParamsMutation.mutateAsync({
        id: params.id,
        name: params.name,
        width: params.width,
        speed: params.speed,
        force: params.force,
        tool_id: config.id,
      });

      gripParamsQuery.refetch();
      toast({
        title: "Success",
        description: "Grip parameters updated successfully",
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

  const handleDeleteGripParams = async (id: number) => {
    try {
      await deleteGripParamsMutation.mutateAsync({ id });
      gripParamsQuery.refetch();
      toast({
        title: "Success",
        description: "Grip parameters deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete grip parameters",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (point: TeachPoint) => {
    setEditingPoint(point);
    onEditModalOpen();
  };

  const handleMoveCommand = async (point: TeachPoint, profile: MotionProfile) => {
    console.log(`point:`, point);
    const command: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type as ToolType,
      command: "move",
      params: {
        waypoint: point.coordinate,
        motion_profile_id: profile.profile_id,
      },
    };

    try {
      await commandMutation.mutateAsync(command);
      toast({
        title: "Move Successful",
        description: `Moved to ${point.name} with profile ${profile.name}`,
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

  interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
  }

  const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose }) => {
    const [localName, setLocalName] = useState(editingPoint?.name || "");
    const [localCoordinate, setLocalCoordinate] = useState(editingPoint?.coordinate || "");
    const [localSafeLoc, setLocalSafeLoc] = useState<number | undefined>(editingPoint?.safe_loc);

    useEffect(() => {
      if (editingPoint) {
        setLocalName(editingPoint.name);
        setLocalCoordinate(editingPoint.coordinate);
        setLocalSafeLoc(editingPoint.safe_loc);
      }
    }, [editingPoint]);

    const handleSave = async () => {
      if (!editingPoint || !config.name) return;

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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit {editingPoint?.type}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input value={localName} onChange={(e) => setLocalName(e.target.value)} />
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
                    onChange={(e) => setLocalSafeLoc(parseInt(e.target.value))}>
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
            <Button onClick={onClose}>Cancel</Button>
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

  const motionProfilesQuery = trpc.robotArm.motionProfile.getAll.useQuery(
    { toolId: config.id },
    { enabled: !!config.name && config.name !== "" },
  );

  const gripParamsQuery = trpc.robotArm.gripParams.getAll.useQuery(
    { toolId: config.id },
    { enabled: !!config.name && config.name !== "" },
  );
 

  const createSequenceMutation = trpc.robotArm.sequence.create.useMutation();
  const updateSequenceMutation = trpc.robotArm.sequence.update.useMutation();
  const deleteSequenceMutation = trpc.robotArm.sequence.delete.useMutation();

  const createMotionProfileMutation = trpc.robotArm.motionProfile.create.useMutation();
  const updateMotionProfileMutation = trpc.robotArm.motionProfile.update.useMutation();
  const deleteMotionProfileMutation = trpc.robotArm.motionProfile.delete.useMutation();

  const createGripParamsMutation = trpc.robotArm.gripParams.create.useMutation();
  const updateGripParamsMutation = trpc.robotArm.gripParams.update.useMutation();
  const deleteGripParamsMutation = trpc.robotArm.gripParams.delete.useMutation();

  const handleCreateMotionProfile = async (profileData: Omit<MotionProfile, "id">) => {
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
      onMotionProfileModalClose();
      motionProfilesQuery.refetch();
      toast({
        title: "Success",
        description: "Motion profile created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating motion profile:", error);
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
      onMotionProfileModalClose();
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
      toolType: config.type as ToolType,
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

  const handleCreateGripParams = async (paramsData: Omit<GripParams, "id">) => {
    try {
      await createGripParamsMutation.mutateAsync({
        name: paramsData.name,
        width: paramsData.width,
        speed: paramsData.speed,
        force: paramsData.force,
        tool_id: config.id,
      });
      onGripParamsModalClose();
      gripParamsQuery.refetch();
      toast({
        title: "Success",
        description: "Grip parameters created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating grip parameters:", error);
      toast({
        title: "Error",
        description: "Failed to create grip parameters",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditMotionProfile = (profile: MotionProfile) => {
    setSelectedMotionProfile(profile);
    onMotionProfileModalOpen();
  };

  const handleDeleteMotionProfile = async (id: number) => {
    try {
      await deleteMotionProfileMutation.mutateAsync({ id });
      motionProfilesQuery.refetch();
      toast({
        title: "Success",
        description: "Motion profile deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete motion profile",
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
        tool_id: 0,
      },
    );

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (profile) {
        await handleUpdateMotionProfile({ ...formData, id: profile.id } as MotionProfile);
      } else {
        const profileData = {
          name: formData.name || "",
          profile_id: formData.profile_id || 0,
          speed: formData.speed || 0,
          speed2: formData.speed2 || 0,
          acceleration: formData.acceleration || 0,
          deceleration: formData.deceleration || 0,
          accel_ramp: formData.accel_ramp || 0,
          decel_ramp: formData.decel_ramp || 0,
          inrange: formData.inrange || 0,
          straight: formData.straight || 0,
          tool_id: formData.tool_id || 0,
        };
        await handleCreateMotionProfile(profileData);
      }
      onClose();
    };

    if (!profile) {
      console.log("Profile is null");
    }

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
                    min={0}>
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
                      max={100}>
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
                      max={100}>
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
                      max={100}>
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
                      max={100}>
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
                      step={0.1}>
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
                      step={0.1}>
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
                    step={0.1}>
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
                    onChange={(e) =>
                      setFormData({ ...formData, straight: parseInt(e.target.value) })
                    }>
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
        tool_id: 0,
      },
    );

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (params) {
        await handleUpdateGripParams({ ...formData, id: params.id } as GripParams);
      } else {
        const paramsData = {
          name: formData.name || "",
          width: formData.width || 0,
          speed: formData.speed || 0,
          force: formData.force || 0,
          tool_id: formData.tool_id || 0,
        };
        await handleCreateGripParams(paramsData);
      }
      onClose();
    };

    if (!params) {
      console.log("Params is null");
    }

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
                    min={0}>
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
                    max={100}>
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
                    max={100}>
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

  const MoveModal: React.FC<MoveModalProps> = ({ isOpen, onClose, point, onMove }) => {
    const [selectedProfile, setSelectedProfile] = useState<MotionProfile | null>(null);
    const motionProfilesQuery = trpc.robotArm.motionProfile.getAll.useQuery(
      { toolId: config.id },
      { enabled: !!config.id },
    );

    const handleMove = () => {
      if (!selectedProfile) return;
      onMove(point, selectedProfile);
      onClose();
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Motion Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Motion Profile</FormLabel>
              <Select
                value={selectedProfile?.id || ""}
                onChange={(e) => {
                  const profile = motionProfilesQuery.data?.find(
                    (p) => p.id === Number(e.target.value),
                  );
                  setSelectedProfile(profile || null);
                }}>
                <option value="">Select a profile</option>
                {motionProfilesQuery.data?.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} (Profile {profile.profile_id})
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleMove} isDisabled={!selectedProfile}>
              Move
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const filterItems = <T extends SearchableItem>(
    items: T[] | undefined,
    type: ItemType,
  ): T[] => {
    if (!items) return [];
    
    return items.filter((item) => {
      const matchesFilter = globalFilterType === "all" || globalFilterType === type;
      const matchesSearch = item.name.toLowerCase().includes(globalSearchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const handleGripperCommand = async (action: "open" | "close") => {
    if (isCommandInProgress) return;

    let params: Record<string, any>;
    console.log("Selected Grip Params ID", selectedGripParamsId);
    if (selectedGripParamsId) { 
      console.log("Selected Grip Params ID EXISTS", selectedGripParamsId);
      const selectedParams = gripParamsQuery.data?.find(p => p.id === selectedGripParamsId);
      console.log("Selected Grip Params", selectedParams);
      if (!selectedParams) {
        toast({
          title: "Error",
          description: "Selected grip parameters not found",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      params = {
        width: selectedParams.width,
        speed: selectedParams.speed,
        force: selectedParams.force,
      };
    } else {
      params = {
        width: manualWidth,
        speed: manualSpeed,
        force: manualForce,
      };
    }
    console.log("Params", params);
    console.log("Config ASDADADSADSDASD", config);  
    console.log("Action", action === "open" ? "open_gripper" : "close_gripper");
    console.log("Tool Type", config.type);

    const gripperCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type as ToolType,
      command: action === "open" ? "release_plate" : "grasp_plate",
      params: {
        width: Number(params.width),
        speed: Number(params.speed),
        force: Number(params.force),
      },
    };

    try {
      await commandMutation.mutateAsync(gripperCommand);
      toast({
        title: "Success",
        description: `Gripper ${action} command executed`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Error executing gripper ${action} command:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} gripper`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSimpleCommand = async (command: "free" | "unfree" | "unwind") => {
    if (isCommandInProgress) return;

    const simpleCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type as ToolType,
      command,
      params: {},
    };

    try {
      await commandMutation.mutateAsync(simpleCommand);
      toast({
        title: "Success",
        description: `${command} command executed successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Error executing ${command} command:`, error);
      toast({
        title: "Error",
        description: `Failed to execute ${command} command`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleImportTeachPendantData = async (data: {
    teachPoints: TeachPoint[];
    motionProfiles: MotionProfile[];
    gripParams: GripParams[];
    sequences: Sequence[];
  }) => {
    try {
      // Import teach points
      for (const point of data.teachPoints) {
        if (point.type === "location") {
          await createLocationMutation.mutateAsync({
            name: point.name,
            location_type: point.locType,
            ...coordinateToJoints(point.coordinate),
            tool_id: config.id,
          });
        } else {
          await createNestMutation.mutateAsync({
            name: point.name,
            orientation: point.orientation || "landscape",
            location_type: point.locType,
            ...coordinateToJoints(point.coordinate),
            safe_location_id: point.safe_loc || 1,
            tool_id: config.id,
          });
        }
      }

      // Import motion profiles
      for (const profile of data.motionProfiles) {
        await createMotionProfileMutation.mutateAsync({
          ...profile,
          tool_id: config.id,
        });
      }

      // Import grip parameters
      for (const params of data.gripParams) {
        await createGripParamsMutation.mutateAsync({
          ...params,
          tool_id: config.id,
        });
      }

      // Import sequences
      for (const sequence of data.sequences) {
        await createSequenceMutation.mutateAsync({
          ...sequence,
          tool_id: config.id,
        });
      }

      // Refresh all queries
      await Promise.all([
        robotArmLocationsQuery.refetch(),
        robotArmNestsQuery.refetch(),
        motionProfilesQuery.refetch(),
        gripParamsQuery.refetch(),
        robotArmSequencesQuery.refetch(),
      ]);
    } catch (error) {
      throw new Error("Failed to import one or more items");
    }
  };

  const handleOpenTeachPointModal = () => {
    setCurrentTeachpoint("");
    setCurrentType("location");
    onTeachPointModalOpen();
  };

  const handleOpenMotionProfileModal = () => {
    setSelectedMotionProfile(null);
    onMotionProfileModalOpen();
  };

  const handleOpenGripParamsModal = () => {
    setSelectedGripParams(null);
    onGripParamsModalOpen();
  };

  const handleSequenceSave = (sequenceData: Omit<Sequence, "id">) => {
    if (selectedSequence) {
      handleUpdateSequence({
        ...sequenceData,
        id: selectedSequence.id,
      });
    } else {
      handleCreateSequence(sequenceData);
    }
  };

  return (
    <Box 
      p={4} 
      height="calc(100vh - 150px)" 
      maxHeight="1000px"
      minWidth="1400px"
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
    >
      <VStack spacing={4} height="100%">
        <HStack width="100%" align="start" spacing={4}>
          {/* Left Side - Control Panel */}
          <VStack spacing={0} width="300px">
            <ToolStatusCard toolId={config.name || ''} style={{ width: '100%' }} />
            <ControlPanel
              onFree={() => handleSimpleCommand("free")}
              onUnfree={() => handleSimpleCommand("unfree")}
              onUnwind={() => handleSimpleCommand("unwind")}
              onGripperOpen={() => handleGripperCommand("open")}
              onGripperClose={() => handleGripperCommand("close")}
              jogEnabled={jogEnabled}
              jogAxis={jogAxis}
              jogDistance={jogDistance}
              setJogAxis={setJogAxis}
              setJogDistance={setJogDistance}
              onJog={handleJog}
              setJogEnabled={setJogEnabled}
              toolState={toolStatusQuery.data?.status}
              gripParams={gripParamsQuery.data || []}
              selectedGripParamsId={selectedGripParamsId}
              onGripParamsChange={setSelectedGripParamsId}
            />
          </VStack>

          {/* Right Side - Data Management */}
          <VStack flex={1} spacing={4} height="100%" minHeight="700px">
            <HStack width="100%" justify="space-between" align="center">
              <VStack spacing={2} flex={1}>
                <HStack width="100%" spacing={4}>
                  <InputGroup size="md" flex={1}>
                    <InputLeftElement pointerEvents="none">
                      <Search2Icon color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search all items..."
                      value={globalSearchTerm}
                      onChange={(e) => setGlobalSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  <Select
                    width="200px"
                    value={globalFilterType}
                    onChange={(e) => setGlobalFilterType(e.target.value as ItemType | "all")}
                    placeholder="Filter by type"
                  >
                    <option value="all">All Types</option>
                    <option value="teachPoint">Teach Points</option>
                    <option value="motionProfile">Motion Profiles</option>
                    <option value="gripParams">Grip Parameters</option>
                    <option value="sequence">Sequences</option>
                  </Select>
                </HStack>
              </VStack>
              <TeachPendantActions
                teachPoints={locations}
                motionProfiles={motionProfilesQuery.data || []}
                gripParams={gripParamsQuery.data || []}
                sequences={sequences || []}
                onImport={handleImportTeachPendantData}
              />
            </HStack>

            <Tabs variant="enclosed" width="100%" height="calc(100% - 40px)" display="flex" flexDirection="column">
              <TabList>
                <Tab>Teach Points</Tab>
                <Tab>Motion Profiles</Tab>
                <Tab>Grip Parameters</Tab>
                <Tab>Sequences</Tab>
              </TabList>
              <TabPanels flex={1} overflow="auto">
                <TabPanel height="100%" padding={0}>
                  <TeachPointsPanel
                    teachPoints={locations}
                    motionProfiles={motionProfilesQuery.data || []}
                    gripParams={gripParamsQuery.data || []}
                    sequences={sequences || []}
                    expandedRows={expandedRows}
                    toggleRow={toggleRow}
                    onImport={handleImportTeachPendantData}
                    onMove={(point) => {
                      setSelectedPoint(point);
                      onMoveModalOpen();
                    }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAdd={handleOpenTeachPointModal}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                    searchTerm={globalSearchTerm}
                  />
                </TabPanel>

                <TabPanel height="100%" padding={0}>
                  <MotionProfilesPanel
                    profiles={motionProfilesQuery.data || []}
                    onEdit={(profile) => {
                      setSelectedMotionProfile(profile);
                      onMotionProfileModalOpen();
                    }}
                    onRegister={handleRegisterMotionProfile}
                    onDelete={handleDeleteMotionProfile}
                    onAdd={handleOpenMotionProfileModal}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                  />
                </TabPanel>

                <TabPanel height="100%" padding={0}>
                  <GripParametersPanel
                    params={gripParamsQuery.data || []}
                    onEdit={(params) => {
                      setSelectedGripParams(params);
                      onGripParamsModalOpen();
                    }}
                    onDelete={handleDeleteGripParams}
                    onAdd={handleOpenGripParamsModal}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                  />
                </TabPanel>

                <TabPanel height="100%" padding={0}>
                  <SequencesPanel
                    sequences={sequences || []}
                    onEdit={handleEditSequence}
                    onRun={handleRunSequence}
                    onDelete={handleDeleteSequence}
                    onCreateNew={handleNewSequence}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </HStack>

        <CreateNewItemModal isOpen={isTeachPointModalOpen} onClose={onTeachPointModalClose} />
        <EditModal isOpen={isEditModalOpen} onClose={onEditModalClose} />
        <MotionProfileModal
          isOpen={isMotionProfileModalOpen}
          onClose={() => {
            onMotionProfileModalClose();
            setSelectedMotionProfile(null);
          }}
          profile={selectedMotionProfile || undefined}
        />
        <GripParamsModal
          isOpen={isGripParamsModalOpen}
          onClose={() => {
            onGripParamsModalClose();
            setSelectedGripParams(null);
          }}
          params={selectedGripParams || undefined}
        />
        <MoveModal
          isOpen={isMoveModalOpen}
          onClose={() => {
            onMoveModalClose();
            setSelectedPoint(null);
          }}
          point={selectedPoint!}
          onMove={handleMoveCommand}
        />
        <SequenceModal
          config={config}
          isOpen={isSequenceModalOpen}
          onClose={onSequenceModalClose}
          sequence={selectedSequence || undefined}
          onSave={selectedSequence ? handleUpdateSequence : handleCreateSequence}
          teachPoints={locations}
          motionProfiles={motionProfilesQuery.data || []}
          gripParams={gripParamsQuery.data || []}
        />
      </VStack>
    </Box>
  );
};
