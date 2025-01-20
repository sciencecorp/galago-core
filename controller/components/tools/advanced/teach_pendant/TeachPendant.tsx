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
import { jointsToCoordinate, coordinateToJoints } from "./components/utils/robotArmUtils";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "./components/types";

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
import { useTeachPendantSettings } from "./hooks/useTeachPendantSettings";
import { useCommandHandlers } from "./utils/commandHandlers";
import { ToolType } from "gen-interfaces/controller";
import { useSequenceHandler } from "./components/hooks/useSequenceHandler";

interface TeachPendantProps {
  toolId: string | undefined;
  config: Tool;
}

export const TeachPendant = ({ toolId, config }: TeachPendantProps) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const bgColorAlpha = useColorModeValue("blackAlpha.50", "whiteAlpha.50");
  const toast = useToast();

  // Hooks
  const {
    toolStatusQuery,
    motionProfilesQuery,
    gripParamsQuery,
    robotArmLocationsQuery,
    robotArmNestsQuery,
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
    openMotionProfileModal,
    openGripParamsModal,
    selectedMotionProfile,
    setSelectedMotionProfile,
    selectedGripParams,
    setSelectedGripParams,
    selectedTeachPoint,
    setSelectedTeachPoint,
    selectedSequence,
    setSelectedSequence,
    motionProfileModal,
    gripParamsModal,
    teachPointModal,
  } = useTeachPendantUI();

  const {
    teachPoints,
    setTeachPoints,
    motionProfiles,
    setMotionProfiles,
    gripParams,
    setGripParams,
    nests,
    setNests,
    updateTeachPoint,
    deleteTeachPoint,
    addMotionProfile,
    updateMotionProfile,
    deleteMotionProfile,
    addGripParams,
    updateGripParams,
    deleteGripParams,
  } = useTeachPendantData();

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
    selectedSequence: currentSequence,
  } = useSequenceHandler(config);

  const commandHandlers = useCommandHandlers(config);

  const handleJog = () => {
    commandHandlers.handleJog(robotArmCommandMutation, jogAxis, jogDistance);
  };

  const handleMoveCommand = commandHandlers.handleMoveCommand;

  const handleMove = (point: TeachPoint, action?: 'approach' | 'leave') => {
    // Check if in simulation mode
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
      handleMoveCommand(robotArmCommandMutation, point, defaultProfile, action);
    }
  };

  const handleTeach = async (point: TeachPoint) => {
    // Check if in simulation mode
    if (toolStatusQuery.data?.status === "SIMULATED") {
      toast({
        title: "Simulation Mode",
        description: "Teaching points is not available in simulation mode.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return; // Don't proceed with teach operation in simulation mode
    }

    try {
      // Get current joint position from robot
      console.log("Getting current joint position");
      const response = await robotArmCommandMutation.mutateAsync({
        toolId: config.name,
        toolType: config.type as ToolType,
        command: "get_current_location",
        params: {}
      });

      console.log("Current Location Response:", response);

      if (response?.meta_data?.location) {
        // Split the location string into coordinates, skipping the first value (0)
        const coordinates = response.meta_data.location.split(" ").slice(1);
        console.log("Coordinates:", coordinates);
        
        // Update the teach point with new coordinates
        await updateLocationMutation.mutateAsync({
          id: point.id,
          name: point.name,
          location_type: "j",
          j1: parseFloat(coordinates[0]),
          j2: parseFloat(coordinates[1]),
          j3: parseFloat(coordinates[2]),
          j4: parseFloat(coordinates[3]),
          j5: parseFloat(coordinates[4]),
          j6: parseFloat(coordinates[5]),
          tool_id: config.id
        });

        // Refetch locations to update UI
        robotArmLocationsQuery.refetch();
      } else {
        throw new Error("No location data received from robot");
      }
    } catch (error) {
      console.error('Failed to teach point:', error);
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
  const isConnected = toolStatusQuery.data?.status === "READY" || toolStatusQuery.data?.status === "SIMULATED";

  // Update local state when queries complete
  useEffect(() => {
    if (robotArmLocationsQuery.data) {
      const formattedLocations = robotArmLocationsQuery.data.map(loc => ({
        id: loc.id || 0,
        name: loc.name,
        coordinate: jointsToCoordinate({
          j1: loc.j1 || 0,
          j2: loc.j2 || 0,
          j3: loc.j3 || 0,
          j4: loc.j4 || 0,
          j5: loc.j5 || 0,
          j6: loc.j6 || 0,
        }),
        type: "location" as const,
        locType: "j" as const,
      }));
      setTeachPoints(formattedLocations);
    }
  }, [robotArmLocationsQuery.data, setTeachPoints]);

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

  useEffect(() => {
    if (robotArmNestsQuery.data) {
      const formattedNests = robotArmNestsQuery.data.map(nest => ({
        id: nest.id || 0,
        name: nest.name,
        coordinate: jointsToCoordinate({
          j1: nest.j1 || 0,
          j2: nest.j2 || 0,
          j3: nest.j3 || 0,
          j4: nest.j4 || 0,
          j5: nest.j5 || 0,
          j6: nest.j6 || 0,
        }),
        type: "nest" as const,
        locType: "j" as const,
        orientation: nest.orientation || "landscape",
        safe_loc: nest.safe_location_id,
      }));
      setNests(formattedNests);
    }
  }, [robotArmNestsQuery.data, setNests]);

  const [defaultProfileId, setDefaultProfileId] = useState<number | null>(null);
  const [defaultParamsId, setDefaultParamsId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter items based on active tab and search term
  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 0: // Teach Points
        return teachPoints.filter(point => 
          point.name.toLowerCase().includes(term)
        );
      case 1: // Motion Profiles
        return motionProfilesQuery.data?.filter(profile => 
          profile.name.toLowerCase().includes(term)
        ) || [];
      case 2: // Grip Parameters
        return gripParamsQuery.data?.filter(params => 
          params.name.toLowerCase().includes(term)
        ) || [];
      case 3: // Sequences
        return (sequences || [])
          .filter(sequence => 
            sequence && 
            sequence.commands && 
            Array.isArray(sequence.commands) &&
            (sequence.name.toLowerCase().includes(term) || 
            sequence.description?.toLowerCase().includes(term))
          );
      default:
        return [];
    }
  }, [activeTab, searchTerm, teachPoints, motionProfilesQuery.data, gripParamsQuery.data, sequences]);

  // Update toggleRow reference
  const toggleRow = toggleRowUI;

  return (
    <Card 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      bgColor={bgColor}
      borderColor={bgColorAlpha}
      width="1500px"
      minW="1200px"
      boxShadow={useColorModeValue('0 4px 12px rgba(0, 0, 0, 0.1)', '0 4px 12px rgba(0, 0, 0, 0.4)')}
    >
      <VStack p={4} spacing={4} align="stretch">
        {/* Main Content Area */}
        <HStack align="start" spacing={4}>
          {/* Left Side - Status Card and Control Panel */}
          <VStack width="280px" flexShrink={0} spacing={4} align="stretch" pl={0}>
            <Box ml={-4}>
              <ToolStatusCard toolId={config.name} />
            </Box>
            <ControlPanel
              onFree={() => commandHandlers.handleSimpleCommand(robotArmCommandMutation, "free")}
              onUnfree={() => commandHandlers.handleSimpleCommand(robotArmCommandMutation, "unfree")}
              onUnwind={() => commandHandlers.handleSimpleCommand(robotArmCommandMutation, "unwind")}
              onGripperOpen={() => {
                const selectedParams = gripParams.find(p => p.id === defaultParamsId);
                if (selectedParams) {
                  commandHandlers.handleGripperCommand(robotArmCommandMutation, "open", selectedParams);
                }
              }}
              onGripperClose={() => {
                const selectedParams = gripParams.find(p => p.id === defaultParamsId);
                if (selectedParams) {
                  commandHandlers.handleGripperCommand(robotArmCommandMutation, "close", selectedParams);
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
                onImport={async (data) => {
                  try {
                    // Import teach points if present
                    if (data.teachPoints?.length) {
                      for (const point of data.teachPoints) {
                        const { j1, j2, j3, j4, j5, j6 } = coordinateToJoints(point.coordinate);
                        await createLocationMutation.mutateAsync({
                          name: point.name,
                          location_type: "j",
                          j1, j2, j3, j4, j5, j6,
                          tool_id: config.id
                        });
                      }
                      await robotArmLocationsQuery.refetch();
                    }

                    // Import motion profiles if present
                    if (data.motionProfiles?.length) {
                      // First validate all motion profiles
                      const existingProfiles = motionProfilesQuery.data || [];
                      const invalidProfiles = data.motionProfiles.filter(
                        profile => profile.profile_id < 1 || profile.profile_id > 14
                      );
                      if (invalidProfiles.length > 0) {
                        toast({
                          title: "Error",
                          description: `Some motion profiles have invalid profile IDs. Profile IDs must be between 1 and 14. Invalid profiles: ${invalidProfiles.map(p => p.name).join(", ")}`,
                          status: "error",
                          duration: 5000,
                          isClosable: true,
                        });
                        return;
                      }

                      // Check for duplicates within imported profiles
                      const duplicateImportedIds = data.motionProfiles
                        .map(p => p.profile_id)
                        .filter((id, index, arr) => arr.indexOf(id) !== index);
                      if (duplicateImportedIds.length > 0) {
                        toast({
                          title: "Error",
                          description: `Found duplicate profile IDs in imported data: ${duplicateImportedIds.join(", ")}`,
                          status: "error",
                          duration: 5000,
                          isClosable: true,
                        });
                        return;
                      }

                      // Check for conflicts with existing profiles
                      const conflictingProfiles = data.motionProfiles.filter(
                        importedProfile => existingProfiles.some(
                          existingProfile => existingProfile.profile_id === importedProfile.profile_id
                        )
                      );
                      if (conflictingProfiles.length > 0) {
                        toast({
                          title: "Error",
                          description: `Some imported profiles have IDs that conflict with existing profiles: ${conflictingProfiles.map(p => `${p.name} (ID: ${p.profile_id})`).join(", ")}`,
                          status: "error",
                          duration: 5000,
                          isClosable: true,
                        });
                        return;
                      }

                      // If all validations pass, import the profiles
                      for (const profile of data.motionProfiles) {
                        await createMotionProfileMutation.mutateAsync({
                          ...profile,
                          tool_id: config.id
                        });
                      }
                      await motionProfilesQuery.refetch();
                    }

                    // Import grip parameters if present
                    if (data.gripParams?.length) {
                      for (const params of data.gripParams) {
                        await createGripParamsMutation.mutateAsync({
                          ...params,
                          tool_id: config.id
                        });
                      }
                      await gripParamsQuery.refetch();
                    }

                    // Import sequences if present
                    if (data.sequences?.length) {
                      for (const sequence of data.sequences) {
                        await handleCreateSequence(sequence);
                      }
                      await robotArmLocationsQuery.refetch();
                    }

                    toast({
                      title: "Success",
                      description: "Data imported successfully",
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                    });
                  } catch (error) {
                    console.error("Import error:", error);
                    toast({
                      title: "Error",
                      description: "Failed to import data",
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
              />
            </HStack>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Search2Icon color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            {/* Tabs Section */}
            <Tabs index={activeTab} onChange={setActiveTab}>
              <TabList>
                <Tab>Teach Points</Tab>
                <Tab>Motion Profiles</Tab>
                <Tab>Grip Parameters</Tab>
                <Tab>Sequences</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <TeachPointsPanel
                    teachPoints={filteredItems as TeachPoint[]}
                    motionProfiles={motionProfiles}
                    gripParams={gripParams}
                    sequences={sequences || []}
                    expandedRows={new Set(Object.keys(expandedRows).map(Number))}
                    toggleRow={toggleRow}
                    onImport={async () => {}}
                    onMove={handleMove}
                    onEdit={(point) => {
                      if (point.coordinate !== undefined) {
                        const newCoords = point.coordinate.split(" ").map(Number);
                        const oldPoint = robotArmLocationsQuery.data?.find(loc => loc.id === point.id);
                        
                        // Only update if point doesn't exist or coordinates have changed
                        const hasChanged = !oldPoint || 
                          Math.abs(newCoords[0] - (oldPoint.j1 ?? 0)) >= 0.001 ||
                          Math.abs(newCoords[1] - (oldPoint.j2 ?? 0)) >= 0.001 ||
                          Math.abs(newCoords[2] - (oldPoint.j3 ?? 0)) >= 0.001 ||
                          Math.abs(newCoords[3] - (oldPoint.j4 ?? 0)) >= 0.001 ||
                          Math.abs(newCoords[4] - (oldPoint.j5 ?? 0)) >= 0.001 ||
                          Math.abs(newCoords[5] - (oldPoint.j6 ?? 0)) >= 0.001;

                        if (hasChanged) {
                          const location = {
                            id: point.id,
                            name: point.name,
                            location_type: "j" as const,
                            j1: newCoords[0],
                            j2: newCoords[1],
                            j3: newCoords[2],
                            j4: newCoords[3],
                            j5: newCoords[4],
                            j6: newCoords[5],
                            tool_id: config.id,
                          };
                          updateLocationMutation.mutateAsync(location).then(() => {
                            robotArmLocationsQuery.refetch();
                          });
                        }
                      } else {
                        // Opening modal for name edit
                        openTeachPointModal(point);
                      }
                    }}
                    onDelete={async (point: TeachPoint) => {
                      await deleteLocationMutation.mutateAsync({ id: point.id });
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
                  />
                </TabPanel>
                <TabPanel>
                  <MotionProfilesPanel
                    profiles={filteredItems as MotionProfile[]}
                    onInlineEdit={async (profile) => {
                      await updateMotionProfileMutation.mutateAsync({
                        ...profile,
                        tool_id: config.id,
                      });
                    }}
                    onModalEdit={(profile) => {
                      setSelectedMotionProfile(profile);
                      motionProfileModal.onOpen();
                    }}
                    onDelete={async (id) => {
                      await deleteMotionProfileMutation.mutateAsync({ id });
                      motionProfilesQuery.refetch();
                    }}
                    onAdd={() => {
                      setSelectedMotionProfile(null);
                      motionProfileModal.onOpen();
                    }}
                    onRegister={(profile) => {
                      console.log("Registering motion profile with ID:", profile.profile_id);
                      commandHandlers.handleRegisterMotionProfile(robotArmCommandMutation, {
                        id: profile.profile_id,
                        speed: profile.speed,
                        speed2: profile.speed2,
                        acceleration: profile.acceleration,
                        deceleration: profile.deceleration,
                        accel_ramp: profile.accel_ramp,
                        decel_ramp: profile.decel_ramp,
                        inrange: profile.inrange,
                        straight: profile.straight
                      })
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
                      await deleteGripParamsMutation.mutateAsync({ id });
                      gripParamsQuery.refetch();
                    }}
                    onAdd={() => {
                      setSelectedGripParams(null);
                      gripParamsModal.onOpen();
                    }}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                    defaultParamsId={defaultParamsId}
                    onSetDefault={setDefaultParamsId}
                    onInlineEdit={async (params) => {
                      await updateGripParamsMutation.mutateAsync({
                        ...params,
                        tool_id: config.id,
                      });
                    }}
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
            console.error('Failed to save motion profile:', error);
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
            console.error('Failed to save grip parameters:', error);
          }
        }}
        toolId={config.id}
      />

      <TeachPointModal
        isOpen={teachPointModal.isOpen}
        onClose={teachPointModal.onClose}
        point={selectedTeachPoint || undefined}
        onSave={async (point: TeachPoint) => {
          console.log('Saving point with data:', point);
          
          // Parse coordinates from the string
          const coords = point.coordinate.split(" ").map(Number);
          
          const location: {
            name: string;
            location_type: "j";
            j1: number;
            j2: number;
            j3: number;
            j4: number;
            j5: number;
            j6: number;
            tool_id: number;
            id?: number;
          } = {
            name: point.name,
            location_type: "j",
            j1: coords[0],
            j2: coords[1],
            j3: coords[2],
            j4: coords[3],
            j5: coords[4],
            j6: coords[5],
            tool_id: config.id,
            ...(selectedTeachPoint?.id ? { id: selectedTeachPoint.id } : {})
          };
          
          console.log('Saving location:', location);
          
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
      />

      <SequenceModal
        isOpen={isSequenceModalOpen}
        onClose={onSequenceModalClose}
        sequence={currentSequence || undefined}
        onSave={async (sequence: Omit<Sequence, "id">) => {
          if (currentSequence) {
            await handleUpdateSequence({
              ...sequence,
              id: currentSequence.id
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
