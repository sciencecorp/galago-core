import {
  HStack,
  Box,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Input,
  Divider,
  Card,
  useToast,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { Tool } from "@/types/api";
import { useEffect, useState, useMemo } from "react";
import { coordinateToJoints, validateJointCount } from "./components/utils/robotArmUtils";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "./components/types";
import { z } from "zod";
import { ToolType } from "gen-interfaces/controller";

// Components
import { TeachPendantActions } from "./components/actions/TeachPendantActions";
import { TeachPointsPanel } from "./components/panels/TeachPointsPanel";
import { MotionProfilesPanel } from "./components/panels/MotionProfilesPanel";
import { GripParametersPanel } from "./components/panels/GripParametersPanel";
import { SequencesPanel } from "./components/panels/SequencesPanel";
import { ControlPanel } from "./components/panels/ControlPanel";
import { MotionProfileModal } from "./components/modals/MotionProfileModal";
import { GripParamsModal } from "./components/modals/GripParamsModal";
import { SequenceModal } from "./components/modals/SequenceModal";
import { TeachPointModal } from "./components/modals/TeachPointModal";

// Hooks
import { useTeachPendantQueries } from "./hooks/useTeachPendantQueries";
import { useTeachPendantUI } from "./hooks/useTeachPendantUI";
import { useTeachPendantData } from "./hooks/useTeachPendantData";
import { useCommandHandlers } from "./utils/commandHandlers";
import { useSequenceHandler } from "./components/hooks/useSequenceHandler";

interface TeachPendantProps {
  toolId: string | undefined;
  config: Tool;
}

// Define the location update type to match the API requirements
interface LocationUpdate {
  id?: number;
  name: string;
  location_type: "j" | "c";
  coordinates: string;
  tool_id: number;
  orientation: "landscape" | "portrait";
}

export const TeachPendant = ({ toolId, config }: TeachPendantProps) => {
  const bgColor = useColorModeValue("white", "gray.900");
  const bgColorAlpha = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tabBgColor = useColorModeValue("gray.50", "gray.800");
  const tabActiveBgColor = useColorModeValue("white", "gray.700");
  const toast = useToast();

  // Hooks
  const {
    toolStatusQuery,
    motionProfilesQuery,
    gripParamsQuery,
    robotArmLocationsQuery,
    createLocationMutation,
    updateLocationMutation,
    deleteLocationMutation,
    deleteGripParamsMutation,
    createMotionProfileMutation,
    updateMotionProfileMutation,
    createGripParamsMutation,
    updateGripParamsMutation,
    deleteMotionProfileMutation,
    robotArmCommandMutation,
  } = useTeachPendantQueries(toolId, config.id);

  const {
    activeTab,
    setActiveTab,
    expandedRows,
    toggleRow: toggleRowUI,
    jogEnabled,
    setJogEnabled,
    jogAxis,
    setJogAxis,
    jogDistance,
    setJogDistance,
    openTeachPointModal,
    selectedMotionProfile,
    setSelectedMotionProfile,
    selectedGripParams,
    setSelectedGripParams,
    selectedTeachPoint,
    motionProfileModal,
    gripParamsModal,
    teachPointModal,
  } = useTeachPendantUI(config);

  const {
    teachPoints,
    setTeachPoints,
    motionProfiles,
    setMotionProfiles,
    gripParams,
    setGripParams,
  } = useTeachPendantData();

  const {
    sequences,
    handleCreateSequence,
    handleUpdateSequence,
    handleDeleteSequence,
    handleRunSequence,
    handleNewSequence,
    isOpen: isSequenceModalOpen,
    onClose: onSequenceModalClose,
    selectedSequence: currentSequence,
    labwareList,
  } = useSequenceHandler(config);

  const commandHandlers = useCommandHandlers(config);

  const handleJog = () => {
    commandHandlers.handleJog(robotArmCommandMutation, jogAxis, jogDistance);
  };

  const handleMoveCommand = commandHandlers.handleMoveCommand;

  const handleMove = (point: TeachPoint) => {
    if (toolStatusQuery.data?.status === "SIMULATED") {
      toast({
        title: "Simulation Mode",
        description: "Robot movement is simulated. No actual movement will occur.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }

    const defaultProfile = motionProfiles[0];
    if (defaultProfile) {
      handleMoveCommand(robotArmCommandMutation, point.name, defaultProfile.profile_id);
    }
  };

  const handleTeach = async (point: TeachPoint) => {
    if (toolStatusQuery.data?.status === "SIMULATED") {
      toast({
        title: "Simulation Mode",
        description: "Teaching points is not available in simulation mode.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const response = await robotArmCommandMutation.mutateAsync({
        toolId: config.name,
        toolType: config.type as ToolType,
        command: "get_current_location",
        params: {},
      });

      if (response?.meta_data?.location) {
        const coordinates = response.meta_data.location.split(" ").slice(1);
        const numJoints = (config.config as any)?.pf400?.joints || 6;

        // Ensure we have enough coordinates (pad with zeros if needed)
        const paddedCoordinates = [...coordinates];
        while (paddedCoordinates.length < parseInt(numJoints.toString())) {
          paddedCoordinates.push("0");
        }

        // Limit coordinates to the configured number of joints
        const limitedCoordinates = paddedCoordinates.slice(0, parseInt(numJoints.toString()));

        if (!validateJointCount(response.meta_data.location, parseInt(numJoints.toString()))) {
          toast({
            title: "Joint Count Mismatch",
            description: `Robot returned ${coordinates.length} joints but at least ${numJoints} joints are required`,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          return;
        }

        const locationUpdate: LocationUpdate = {
          id: point.id,
          name: point.name,
          location_type: "j",
          coordinates: limitedCoordinates.join(" "),
          tool_id: config.id,
          orientation: point.orientation,
        };

        await updateLocationMutation.mutateAsync(locationUpdate);
        robotArmLocationsQuery.refetch();

        // Add success toast
        toast({
          title: "Point Updated",
          description: `Successfully taught new position to point "${point.name}"`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        throw new Error("No location data received from robot");
      }
    } catch (error) {
      console.error("Failed to teach point:", error);
      toast({
        title: "Error",
        description: "Failed to teach point. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // Check if robot is connected (READY or SIMULATED)
  const isConnected =
    toolStatusQuery.data?.status === "READY" || toolStatusQuery.data?.status === "SIMULATED";

  // Update local state when queries complete
  useEffect(() => {
    if (robotArmLocationsQuery.data) {
      const formattedLocations = robotArmLocationsQuery.data.map((loc) => ({
        id: loc.id || 0,
        name: loc.name,
        coordinates: loc.coordinates || "0 0 0 0 0 0",
        type: "location" as const,
        locType: "j" as const,
        orientation: loc.orientation || undefined,
      }));
      setTeachPoints(formattedLocations);
    }
  }, [robotArmLocationsQuery.data, config.config]);

  useEffect(() => {
    if (motionProfilesQuery.data) {
      setMotionProfiles(motionProfilesQuery.data);
    }
  }, [motionProfilesQuery.data, setMotionProfiles]);

  useEffect(() => {
    if (gripParamsQuery.data) {
      setGripParams(gripParamsQuery.data);
    }
  }, [gripParamsQuery.data, setGripParams]);

  const [defaultProfileId, setDefaultProfileId] = useState<number | null>(null);
  const [defaultParamsId, setDefaultParamsId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter items based on active tab and search term
  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 0: // Teach Points
        return teachPoints.filter((point) => point.name.toLowerCase().includes(term));
      case 1: // Motion Profiles
        return (
          motionProfilesQuery.data?.filter((profile) =>
            profile.name.toLowerCase().includes(term),
          ) || []
        );
      case 2: // Grip Parameters
        return (
          gripParamsQuery.data?.filter((params) => params.name.toLowerCase().includes(term)) || []
        );
      case 3: // Sequences
        return (sequences || []).filter(
          (sequence) =>
            sequence &&
            sequence.commands &&
            Array.isArray(sequence.commands) &&
            (sequence.name.toLowerCase().includes(term) ||
              sequence.description?.toLowerCase().includes(term)),
        );
      default:
        return [];
    }
  }, [
    activeTab,
    searchTerm,
    teachPoints,
    motionProfilesQuery.data,
    gripParamsQuery.data,
    sequences,
  ]);

  // Update toggleRow reference
  const toggleRow = toggleRowUI;

  const handleImport = async (data: any) => {
    if (data.teach_points) {
      await robotArmLocationsQuery.refetch();
    }
    if (data.sequences) {
      await robotArmLocationsQuery.refetch();
    }
    if (data.motion_profiles) {
      await motionProfilesQuery.refetch();
    }
    if (data.grip_params) {
      await gripParamsQuery.refetch();
    }
  };

  // Load default profile ID from localStorage
  useEffect(() => {
    const savedProfileId = localStorage.getItem("defaultProfileId");
    if (savedProfileId) {
      setDefaultProfileId(parseInt(savedProfileId));
    }
  }, []);

  // Save default profile ID to localStorage when it changes
  useEffect(() => {
    if (defaultProfileId !== null) {
      localStorage.setItem("defaultProfileId", defaultProfileId.toString());
    }
  }, [defaultProfileId]);

  return (
    <Card
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bgColor={bgColor}
      borderColor={borderColor}
      width="1500px"
      minW="1200px"
      boxShadow={useColorModeValue(
        "0 4px 12px rgba(0, 0, 0, 0.1)",
        "0 4px 16px rgba(0, 0, 0, 0.6)",
      )}>
      <VStack p={4} spacing={4} align="stretch">
        {/* Main Content Area */}
        <HStack align="start" spacing={4}>
          {/* Left Side - Status Card and Control Panel */}
          <VStack width="280px" flexShrink={0} spacing={4} align="stretch" pl={0}>
            <Box>
              <ToolStatusCard toolId={config.name} />
            </Box>
            <ControlPanel
              onFree={() => commandHandlers.handleSimpleCommand(robotArmCommandMutation, "release")}
              onUnfree={() =>
                commandHandlers.handleSimpleCommand(robotArmCommandMutation, "engage")
              }
              onUnwind={() =>
                commandHandlers.handleSimpleCommand(robotArmCommandMutation, "retract")
              }
              onGripperOpen={() => {
                const selectedParams = gripParams.find((p) => p.id === defaultParamsId);
                if (selectedParams) {
                  commandHandlers.handleGripperCommand(
                    robotArmCommandMutation,
                    "open",
                    selectedParams,
                  );
                } else {
                  // Let server handle defaults
                  commandHandlers.handleGripperCommand(robotArmCommandMutation, "open", {
                    id: 0,
                    name: "Default",
                    tool_id: config.id,
                    width: 0, // Server will override with its defaults
                    speed: 0, // Server will override with its defaults
                    force: 0, // Server will override with its defaults
                  });
                }
              }}
              onGripperClose={() => {
                const selectedParams = gripParams.find((p) => p.id === defaultParamsId);
                if (selectedParams) {
                  commandHandlers.handleGripperCommand(
                    robotArmCommandMutation,
                    "close",
                    selectedParams,
                  );
                } else {
                  // Let server handle defaults
                  commandHandlers.handleGripperCommand(robotArmCommandMutation, "close", {
                    id: 0,
                    name: "Default",
                    tool_id: config.id,
                    width: 0, // Server will override with its defaults
                    speed: 0, // Server will override with its defaults
                    force: 0, // Server will override with its defaults
                  });
                }
              }}
              jogEnabled={jogEnabled}
              jogAxis={jogAxis}
              jogDistance={jogDistance}
              setJogAxis={setJogAxis}
              setJogDistance={setJogDistance}
              onJog={handleJog}
              setJogEnabled={setJogEnabled}
              toolState={toolStatusQuery.data?.status}
              gripParams={gripParams}
              selectedGripParamsId={defaultParamsId}
              onGripParamsChange={setDefaultParamsId}
              isFreeLoading={
                robotArmCommandMutation.variables?.command === "release" &&
                robotArmCommandMutation.isLoading
              }
              isUnfreeLoading={
                robotArmCommandMutation.variables?.command === "engage" &&
                robotArmCommandMutation.isLoading
              }
              isUnwindLoading={
                robotArmCommandMutation.variables?.command === "retract" &&
                robotArmCommandMutation.isLoading
              }
              bgColor={bgColor}
              borderColor={borderColor}
            />
          </VStack>

          {/* Right Side - Main Content */}
          <VStack flex={1} align="stretch" spacing={4}>
            {/* Search and Import/Export Section */}
            <HStack justify="flex-end">
              <TeachPendantActions
                teachPoints={teachPoints}
                motionProfiles={motionProfiles}
                gripParams={gripParams}
                sequences={sequences || []}
                onImport={handleImport}
                toolId={config.id}
                onTeach={() => handleTeach(selectedTeachPoint!)}
                onMove={handleMove}
                onUnwind={() =>
                  commandHandlers.handleSimpleCommand(robotArmCommandMutation, "retract")
                }
                onGripperOpen={() =>
                  commandHandlers.handleGripperCommand(
                    robotArmCommandMutation,
                    "open",
                    selectedGripParams!,
                  )
                }
                onGripperClose={() =>
                  commandHandlers.handleGripperCommand(
                    robotArmCommandMutation,
                    "close",
                    selectedGripParams!,
                  )
                }
                jogEnabled={jogEnabled}
              />
            </HStack>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Search2Icon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={useColorModeValue("white", "gray.800")}
                borderColor={useColorModeValue("gray.200", "gray.600")}
              />
            </InputGroup>

            {/* Tabs Section */}
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="blue">
              <TabList>
                <Tab
                  _selected={{
                    color: useColorModeValue("blue.600", "blue.200"),
                    bg: tabActiveBgColor,
                    borderColor: borderColor,
                    borderBottomColor: tabActiveBgColor,
                  }}
                  bg={tabBgColor}
                  borderColor={borderColor}>
                  Teach Points
                </Tab>
                <Tab
                  _selected={{
                    color: useColorModeValue("blue.600", "blue.200"),
                    bg: tabActiveBgColor,
                    borderColor: borderColor,
                    borderBottomColor: tabActiveBgColor,
                  }}
                  bg={tabBgColor}
                  borderColor={borderColor}>
                  Motion Profiles
                </Tab>
                <Tab
                  _selected={{
                    color: useColorModeValue("blue.600", "blue.200"),
                    bg: tabActiveBgColor,
                    borderColor: borderColor,
                    borderBottomColor: tabActiveBgColor,
                  }}
                  bg={tabBgColor}
                  borderColor={borderColor}>
                  Grip Parameters
                </Tab>
                <Tab
                  _selected={{
                    color: useColorModeValue("blue.600", "blue.200"),
                    bg: tabActiveBgColor,
                    borderColor: borderColor,
                    borderBottomColor: tabActiveBgColor,
                  }}
                  bg={tabBgColor}
                  borderColor={borderColor}>
                  Sequences
                </Tab>
              </TabList>

              <TabPanels
                borderWidth="1px"
                borderTop="0"
                borderColor={borderColor}
                borderRadius="0 0 md md">
                <TabPanel>
                  <TeachPointsPanel
                    teachPoints={filteredItems as TeachPoint[]}
                    motionProfiles={motionProfiles}
                    gripParams={gripParams}
                    sequences={sequences || []}
                    expandedRows={Object.fromEntries(
                      Object.keys(expandedRows).map((key) => [key, true]),
                    )}
                    toggleRow={toggleRow}
                    onImport={async () => {}}
                    onMove={handleMove}
                    onEdit={(point) => {
                      const location = {
                        id: point.id,
                        name: point.name,
                        location_type: "j" as const,
                        coordinates: point.coordinates,
                        tool_id: config.id,
                        orientation: point.orientation,
                      };
                      updateLocationMutation.mutateAsync(location).then(() => {
                        robotArmLocationsQuery.refetch();
                      });
                    }}
                    onDelete={async (point: TeachPoint) => {
                      await deleteLocationMutation.mutateAsync({
                        id: point.id,
                        tool_id: config.id,
                      });
                      robotArmLocationsQuery.refetch();
                    }}
                    onAdd={() => {
                      openTeachPointModal();
                    }}
                    onTeach={handleTeach}
                    isConnected={isConnected}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                    searchTerm={searchTerm}
                    config={config}
                  />
                </TabPanel>
                <TabPanel>
                  <MotionProfilesPanel
                    profiles={filteredItems as MotionProfile[]}
                    onEdit={async (profile: MotionProfile) => {
                      if (profile.id) {
                        await updateMotionProfileMutation.mutateAsync({
                          ...profile,
                          tool_id: config.id,
                        });
                      } else {
                        setSelectedMotionProfile(profile);
                        motionProfileModal.onOpen();
                      }
                    }}
                    onDelete={async (id: number) => {
                      await deleteMotionProfileMutation.mutateAsync({ id, tool_id: config.id });
                      motionProfilesQuery.refetch();
                    }}
                    onAdd={() => {
                      setSelectedMotionProfile(null);
                      motionProfileModal.onOpen();
                    }}
                    onRegister={(profile: MotionProfile) => {
                      commandHandlers.handleRegisterMotionProfile(robotArmCommandMutation, {
                        id: profile.profile_id,
                        speed: profile.speed,
                        speed2: profile.speed2,
                        acceleration: profile.acceleration,
                        deceleration: profile.deceleration,
                        accel_ramp: profile.accel_ramp,
                        decel_ramp: profile.decel_ramp,
                        inrange: profile.inrange,
                        straight: profile.straight,
                      });
                    }}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                    defaultProfileId={defaultProfileId}
                    onSetDefault={(id: number | null) => setDefaultProfileId(id)}
                  />
                </TabPanel>
                <TabPanel>
                  <GripParametersPanel
                    params={filteredItems as GripParams[]}
                    onEdit={(params) => {
                      setSelectedGripParams(params);
                      gripParamsModal.onOpen();
                    }}
                    onDelete={async (id) => {
                      await deleteGripParamsMutation.mutateAsync({ id, tool_id: config.id });
                      gripParamsQuery.refetch();
                    }}
                    onAdd={() => {
                      setSelectedGripParams(null);
                      gripParamsModal.onOpen();
                    }}
                    onInlineEdit={async (params: GripParams) => {
                      await updateGripParamsMutation.mutateAsync({
                        ...params,
                        tool_id: config.id,
                      });
                      gripParamsQuery.refetch();
                    }}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                    defaultParamsId={defaultParamsId}
                    onSetDefault={setDefaultParamsId}
                  />
                </TabPanel>
                <TabPanel>
                  <SequencesPanel
                    sequences={sequences || []}
                    teachPoints={teachPoints}
                    motionProfiles={motionProfiles}
                    gripParams={gripParams}
                    onRun={handleRunSequence}
                    onDelete={handleDeleteSequence}
                    onCreateNew={handleNewSequence}
                    onUpdateSequence={handleUpdateSequence}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                    config={config}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </HStack>
      </VStack>

      {/* Modals */}
      <MotionProfileModal
        isOpen={motionProfileModal.isOpen}
        onClose={motionProfileModal.onClose}
        profile={selectedMotionProfile || undefined}
        onSave={async (profile) => {
          try {
            if (selectedMotionProfile?.id) {
              await updateMotionProfileMutation.mutateAsync({
                id: selectedMotionProfile.id,
                ...profile,
                tool_id: config.id,
              });
            } else {
              await createMotionProfileMutation.mutateAsync({
                ...profile,
                tool_id: config.id,
              });
            }
            await motionProfilesQuery.refetch();
            motionProfileModal.onClose();
          } catch (error) {
            console.error("Failed to save motion profile:", error);
          }
        }}
        toolId={config.id}
        existingProfiles={motionProfilesQuery.data || []}
      />

      <GripParamsModal
        isOpen={gripParamsModal.isOpen}
        onClose={gripParamsModal.onClose}
        params={selectedGripParams || undefined}
        onSave={async (params) => {
          try {
            if (selectedGripParams?.id) {
              await updateGripParamsMutation.mutateAsync({
                id: selectedGripParams.id,
                ...params,
                tool_id: config.id,
              });
            } else {
              await createGripParamsMutation.mutateAsync({
                ...params,
                tool_id: config.id,
              });
            }
            await gripParamsQuery.refetch();
            gripParamsModal.onClose();
          } catch (error) {
            console.error("Failed to save grip parameters:", error);
          }
        }}
        toolId={config.id}
      />

      <TeachPointModal
        isOpen={teachPointModal.isOpen}
        onClose={teachPointModal.onClose}
        point={selectedTeachPoint || undefined}
        onSave={async (point: TeachPoint) => {
          // Parse coordinates from the string
          const coords = point.coordinates.split(" ").map(Number);
          const numJoints = (config.config as any)?.pf400?.joints || 6;

          // Limit coordinates to the configured number of joints
          const limitedCoords = coords.slice(0, parseInt(numJoints.toString()));

          // Create dynamic joint object
          const joints: { [key: string]: number } = {};
          for (let i = 1; i <= parseInt(numJoints.toString()); i++) {
            joints[`j${i}`] = limitedCoords[i - 1] || 0;
          }

          const orientation = !point.orientation ? "landscape" : point.orientation;

          const location = {
            name: point.name,
            location_type: "j" as const,
            orientation: orientation,
            coordinates: limitedCoords.join(" "),
            tool_id: config.id,
            ...(selectedTeachPoint?.id ? { id: selectedTeachPoint.id } : {}),
          };

          if (selectedTeachPoint) {
            await updateLocationMutation.mutateAsync(location);
          } else {
            await createLocationMutation.mutateAsync(location);
          }

          // Refetch to update the UI
          await robotArmLocationsQuery.refetch();
          teachPointModal.onClose();
        }}
        toolId={config.id}
        config={config}
      />

      <SequenceModal
        isOpen={isSequenceModalOpen}
        onClose={onSequenceModalClose}
        sequence={currentSequence || undefined}
        onSave={async (sequence: Omit<Sequence, "id">) => {
          if (currentSequence) {
            await handleUpdateSequence({
              ...sequence,
              id: currentSequence.id,
            });
          } else {
            await handleCreateSequence(sequence);
          }
          onSequenceModalClose();
        }}
        config={config}
        teachPoints={teachPoints}
        motionProfiles={motionProfiles}
        gripParams={gripParams}
      />
    </Card>
  );
};
