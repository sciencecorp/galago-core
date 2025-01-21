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
import { jointsToCoordinate, coordinateToJoints, validateJointCount, JointConfig } from "./components/utils/robotArmUtils";
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
import { ToolConfig, ToolType } from "gen-interfaces/controller";
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
  } = useTeachPendantUI(config);

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
      const numJoints = (config.config as any)?.pf400?.joints || 6;
      const joints = point.joints || coordinateToJoints(point.coordinate, parseInt(numJoints.toString()));
      handleMoveCommand(robotArmCommandMutation, { ...point, joints }, defaultProfile, action);
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
        params: {}
      });

      if (response?.meta_data?.location) {
        const coordinates = response.meta_data.location.split(" ").slice(1);
        const numJoints = (config.config as any)?.pf400?.joints || 6; // Default to 6 if not specified
        console.log("numJoints", numJoints);
        if (!validateJointCount(response.meta_data.location, parseInt(numJoints.toString()))) {
          toast({
            title: "Joint Count Mismatch",
            description: `Robot returned ${coordinates.length} joints but tool is configured for ${numJoints} joints`,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          return;
        }
        const joints: JointConfig = {};
        for (let i = 0; i < parseInt(numJoints.toString()); i++) {
          joints[`j${i + 1}`] = parseFloat(coordinates[i]);
        }

        await updateLocationMutation.mutateAsync({
          id: point.id,
          name: point.name,
          location_type: "j",
          ...joints,
          tool_id: config.id
        });

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
      const numJoints = (config.config as any)?.pf400?.joints || 6;
      const formattedLocations = robotArmLocationsQuery.data.map(loc => {
        const joints: JointConfig = {};
        for (let i = 1; i <= parseInt(numJoints.toString()); i++) {
          const key = `j${i}`;
          joints[key] = (loc as any)[key] || 0;
        }
        
        return {
          id: loc.id || 0,
          name: loc.name,
          coordinate: jointsToCoordinate(joints, parseInt(numJoints.toString())),
          type: "location" as const,
          locType: "j" as const,
          joints
        };
      });
      setTeachPoints(formattedLocations);
    }
  }, [robotArmLocationsQuery.data, setTeachPoints, config]);

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
      const numJoints = (config.config as any)?.pf400?.joints || 6;
      const formattedNests = robotArmNestsQuery.data.map(nest => {
        const joints: JointConfig = {};
        for (let i = 1; i <= parseInt(numJoints.toString()); i++) {
          const key = `j${i}`;
          joints[key] = (nest as any)[key] || 0;
        }
        
        return {
          id: nest.id || 0,
          name: nest.name,
          coordinate: jointsToCoordinate(joints, parseInt(numJoints.toString())),
          type: "nest" as const,
          locType: "j" as const,
          joints
        };
      });
      setNests(formattedNests);
    }
  }, [robotArmNestsQuery.data, setNests, config]);

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
                    if (data.teachPoints?.length) {
                      // Check for duplicates
                      if (data.duplicates) {
                        const { identical, different } = data.duplicates;
                        
                        // Log identical duplicates that will be silently overwritten
                        if (identical.length > 0) {
                          console.log(`Silently overwriting ${identical.length} identical teach points`);
                        }

                        // If there are different duplicates, ask for confirmation
                        if (different.length > 0) {
                          const confirmOverwrite = window.confirm(
                            `${different.length} teach points with the same names but different coordinates were found:\n\n` +
                            different.map(point => point.name).join(", ") + "\n\n" +
                            "Do you want to overwrite these points?"
                          );

                          if (!confirmOverwrite) {
                            // Filter out the different duplicates from the import
                            data.teachPoints = data.teachPoints.filter(point => 
                              !different.some(d => d.name === point.name)
                            );
                          }
                        }
                      }

                      // Process the remaining teach points
                      const numJoints = (config.config as any)?.pf400?.joints || 6; // Default to 6 if not specified
                      const mismatchedPoints: string[] = [];
                      let successfulImports = 0;
                      
                      try {
                        for (const point of data.teachPoints) {
                          if (!validateJointCount(point.coordinate, parseInt(numJoints.toString()))) {
                            mismatchedPoints.push(point.name);
                            continue;
                          }

                          const joints = coordinateToJoints(point.coordinate, parseInt(numJoints.toString()));
                          const jointObj: { [key: string]: number } = {};
                          for (let i = 1; i <= parseInt(numJoints.toString()); i++) {
                            jointObj[`j${i}`] = joints[`j${i}`] || 0;
                          }

                          await createLocationMutation.mutateAsync({
                            name: point.name,
                            location_type: "j",
                            ...jointObj,
                            tool_id: config.id
                          });
                          console.log("Successfully imported point:", point.name);
                          successfulImports++;
                        }

                        console.log("Import summary:", {
                          totalPoints: data.teachPoints.length,
                          successfulImports,
                          mismatchedPoints
                        });

                        if (mismatchedPoints.length > 0) {
                          toast({
                            title: "Joint Count Mismatch",
                            description: `${mismatchedPoints.length} teach points have incorrect number of joints for this robot configuration:\n${mismatchedPoints.join(", ")}`,
                            status: "error", 
                            duration: 5000,
                            isClosable: true,
                          });
                        }

                        if (successfulImports > 0) {
                          toast({
                            title: "Import Successful",
                            description: `Successfully imported ${successfulImports} teach points`,
                            status: "success",
                            duration: 3000,
                            isClosable: true,
                          });
                        }

                        await robotArmLocationsQuery.refetch();
                      } catch (error) {
                        console.error("Failed to import teach points:", error);
                        toast({
                          title: "Error",
                          description: "Failed to import teach points",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                        });
                        return; // Exit early if teach points import fails
                      }
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
                        importedProfile => {
                          const existingProfile = existingProfiles.find(
                            ep => ep.profile_id === importedProfile.profile_id
                          );
                          if (!existingProfile) return false;
                          
                          // Check if profiles are identical (ignoring id and tool_id)
                          return (
                            existingProfile.name !== importedProfile.name ||
                            existingProfile.speed !== importedProfile.speed ||
                            existingProfile.speed2 !== importedProfile.speed2 ||
                            existingProfile.acceleration !== importedProfile.acceleration ||
                            existingProfile.deceleration !== importedProfile.deceleration ||
                            existingProfile.accel_ramp !== importedProfile.accel_ramp ||
                            existingProfile.decel_ramp !== importedProfile.decel_ramp ||
                            existingProfile.inrange !== importedProfile.inrange ||
                            existingProfile.straight !== importedProfile.straight
                          );
                        }
                      );

                      if (conflictingProfiles.length > 0) {
                        toast({
                          title: "Error",
                          description: `Some imported profiles have different values but same IDs as existing profiles: ${conflictingProfiles.map(p => `${p.name} (ID: ${p.profile_id})`).join(", ")}`,
                          status: "error",
                          duration: 5000,
                          isClosable: true,
                        });
                        return;
                      }

                      // If all validations pass, import only the non-duplicate profiles
                      for (const profile of data.motionProfiles) {
                        // Skip if an identical profile already exists
                        const existingProfile = existingProfiles.find(ep => ep.profile_id === profile.profile_id);
                        if (!existingProfile) {
                          await createMotionProfileMutation.mutateAsync({
                            ...profile,
                            tool_id: config.id
                          });
                        }
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
                    expandedRows={Object.fromEntries(Object.keys(expandedRows).map(key => [key, true]))}
                    toggleRow={toggleRow}
                    onImport={async () => {}}
                    onMove={handleMove}
                    onEdit={(point) => {
                      if (point.coordinate !== undefined) {
                        const newCoords = point.coordinate.split(" ").map(Number);
                        const oldPoint = robotArmLocationsQuery.data?.find(loc => loc.id === point.id);
                        const numJoints = (config.config as any)?.pf400?.joints || 6;
                        
                        // Only update if point doesn't exist or coordinates have changed
                        const hasChanged = !oldPoint || 
                          Array.from({ length: parseInt(numJoints.toString()) }).some((_, i) => {
                            const jointKey = `j${i + 1}` as keyof typeof oldPoint;
                            return Math.abs(newCoords[i] - ((oldPoint[jointKey] as number) ?? 0)) >= 0.001;
                          });

                        if (hasChanged) {
                          // Create base location object
                          const location = {
                            id: point.id,
                            name: point.name,
                            location_type: "j" as const,
                            tool_id: config.id,
                          };

                          // Dynamically add joint values
                          for (let i = 1; i <= parseInt(numJoints.toString()); i++) {
                            (location as any)[`j${i}`] = newCoords[i - 1];
                          }

                          updateLocationMutation.mutateAsync(location as any).then(() => {
                            robotArmLocationsQuery.refetch();
                          });
                        }
                      } else {
                        // Opening modal for name edit
                        openTeachPointModal(point);
                      }
                    }}
                    onDelete={async (point: TeachPoint) => {
                      await deleteLocationMutation.mutateAsync({ id: point.id, tool_id: config.id });
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
          const numJoints = (config.config as any)?.pf400?.joints || 6;
          
          // Create dynamic joint object
          const joints: { [key: string]: number } = {};
          for (let i = 1; i <= parseInt(numJoints.toString()); i++) {
            joints[`j${i}`] = coords[i - 1] || 0;
          }
          
          const location = {
            name: point.name,
            location_type: "j" as const,
            ...joints,
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
