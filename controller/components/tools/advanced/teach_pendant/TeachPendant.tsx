import React from "react";
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
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { Tool } from "@/types/api";
import { useEffect, useState, useMemo } from "react";
import { coordinateToJoints, validateJointCount } from "./shared/utils/robotArmUtils";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "./types";
import { z } from "zod";
import { ToolType } from "gen-interfaces/controller";
import { successToast, warningToast, errorToast } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { createBatchHandlerForIds } from "./shared/utils/batchUtils";

// Components
import { TeachPendantActions } from "./shared/ui/TeachPendantActions";
import { TeachPointsPanel } from "./features/teach-points/TeachPointsPanel";
import { MotionProfilesPanel } from "./features/motion-profiles/MotionProfilesPanel";
import { GripParametersPanel } from "./features/grip-parameters/GripParametersPanel";
import { SequencesPanel } from "./features/sequences/SequencesPanel";
import { ControlPanel } from "./shared/ui/ControlPanel";
import { MotionProfileModal } from "./features/motion-profiles/MotionProfileModal";
import { GripParamsModal } from "./features/grip-parameters/GripParamsModal";
import { SequenceModal } from "./features/sequences/SequenceModal";
import { TeachPointModal } from "./features/teach-points/TeachPointModal";

// Hooks
import { useTeachPendantQueries } from "./hooks/useTeachPendantQueries";
import { useTeachPendantUI } from "./hooks/useTeachPendantUI";
import { useTeachPendantData } from "./hooks/useTeachPendantData";
import { useCommandHandlers } from "./shared/utils/commandHandlers";
import { useSequenceHandler } from "./hooks/useSequenceHandler";

interface TeachPendantProps {
  tool: Tool;
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

export const TeachPendant = ({ tool }: TeachPendantProps) => {
  const bgColor = useColorModeValue("white", "gray.900");
  const bgColorAlpha = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tabBgColor = useColorModeValue("gray.50", "gray.800");
  const tabActiveBgColor = useColorModeValue("white", "gray.700");


  // console.log("TeachPendant rendered with toolId:", toolId, "and config:", config);
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
  } = useTeachPendantQueries(tool.name, tool.id);

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
  } = useTeachPendantUI(tool);

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
  } = useSequenceHandler(tool);

  const commandHandlers = useCommandHandlers(tool);

  const handleCloneSequence = (sequence: Sequence) => {
    const clonedSequence: Sequence = {
      ...sequence,
      name: `${sequence.name}`,
    };
    handleCreateSequence(clonedSequence);
  };

  const handleJog = () => {
    commandHandlers.handleJog(robotArmCommandMutation, jogAxis, jogDistance);
  };

  const handleMove = (point: TeachPoint) => {
    commandHandlers.handleMoveCommand(robotArmCommandMutation, point.name, "default");
  };

  const handleTeach = async (point: TeachPoint) => {
    if (toolStatusQuery.data?.status === "SIMULATED") {
      warningToast("Simulation Mode", "Teaching points is not available in simulation mode.");
      return;
    }

    try {
      const response = await robotArmCommandMutation.mutateAsync({
        toolId: tool.name,
        toolType: tool.type as ToolType,
        command: "get_current_location",
        params: {},
      });

      if (response?.meta_data?.location) {
        const coordinates = response.meta_data.location.split(" ").slice(1);
        const numJoints = (tool.config as any)?.pf400?.joints || 6;

        // Ensure we have enough coordinates (pad with zeros if needed)
        const paddedCoordinates = [...coordinates];
        while (paddedCoordinates.length < parseInt(numJoints.toString())) {
          paddedCoordinates.push("0");
        }

        // Limit coordinates to the configured number of joints
        const limitedCoordinates = paddedCoordinates.slice(0, parseInt(numJoints.toString()));

        if (!validateJointCount(response.meta_data.location, parseInt(numJoints.toString()))) {
          errorToast(
            "Joint Count Mismatch",
            `Robot returned ${coordinates.length} joints but at least ${numJoints} joints are required`,
          );
          return;
        }

        const locationUpdate: LocationUpdate = {
          id: point.id,
          name: point.name,
          location_type: "j",
          coordinates: limitedCoordinates.join(" "),
          tool_id: tool.id,
          orientation: point.orientation,
        };

        await updateLocationMutation.mutateAsync(locationUpdate);
        robotArmLocationsQuery.refetch();

        // Add success toast
        successToast("Point Updated", `Successfully taught new position to point "${point.name}"`);
      } else {
        throw new Error("No location data received from robot");
      }
    } catch (error) {
      console.error("Failed to teach point:", error);
      errorToast("Error", "Failed to teach point. Please try again.");
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
  }, [robotArmLocationsQuery.data, tool.config]);

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

  // Define single-item delete handlers to be used with batch utilities
  const deleteTeachPoint = async (id: number) => {
    await deleteLocationMutation.mutateAsync({
      id,
      tool_id: tool.id,
    });
  };

  const deleteMotionProfile = async (id: number) => {
    await deleteMotionProfileMutation.mutateAsync({
      id,
      tool_id: tool.id,
    });
  };

  const deleteGripParam = async (id: number) => {
    await deleteGripParamsMutation.mutateAsync({
      id,
      tool_id: tool.id,
    });
  };

  // Create batch handlers using our utility function
  const handleDeleteAllTeachPoints = async () => {
    const pointIds = teachPoints
      .map((point) => point.id)
      .filter((id): id is number => id !== undefined);
    const batchDeleteTeachPoints = createBatchHandlerForIds(
      deleteTeachPoint,
      "delete",
      "teach points",
    );

    await batchDeleteTeachPoints(pointIds);

    // Refetch to update UI
    robotArmLocationsQuery.refetch();
  };

  const handleDeleteAllMotionProfiles = async () => {
    const profileIds = (motionProfilesQuery.data?.map((profile) => profile.id) || []).filter(
      (id): id is number => id !== undefined,
    );

    const batchDeleteMotionProfiles = createBatchHandlerForIds(
      deleteMotionProfile,
      "delete",
      "motion profiles",
    );

    await batchDeleteMotionProfiles(profileIds);

    // Refetch to update UI
    motionProfilesQuery.refetch();
  };

  const handleDeleteAllGripParams = async () => {
    const paramIds = (gripParamsQuery.data?.map((param) => param.id) || []).filter(
      (id): id is number => id !== undefined,
    );

    const batchDeleteGripParams = createBatchHandlerForIds(
      deleteGripParam,
      "delete",
      "grip parameters",
    );

    await batchDeleteGripParams(paramIds);

    // Refetch to update UI
    gripParamsQuery.refetch();
  };

  const handleDeleteAllSequences = async () => {
    const sequenceIds = (sequences || [])
      .map((sequence) => sequence.id)
      .filter((id): id is number => id !== undefined);

    const batchDeleteSequences = createBatchHandlerForIds(
      (id) => handleDeleteSequence(id, true),
      "delete",
      "sequences",
    );

    await batchDeleteSequences(sequenceIds);
  };

  // State for confirmation modal
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [deleteHandler, setDeleteHandler] = useState<() => void>(() => {});

  // Function to show delete confirmation modal
  const showDeleteConfirm = (
    type: "teachPoints" | "motionProfiles" | "gripParams" | "sequences",
  ) => {
    let message = "";
    let count = 0;
    let handler: () => void;

    switch (type) {
      case "teachPoints":
        count = teachPoints.length;
        message = `Are you sure you want to delete all ${count} teach points? This action cannot be undone.`;
        handler = handleDeleteAllTeachPoints;
        break;
      case "motionProfiles":
        count = motionProfilesQuery.data?.length || 0;
        message = `Are you sure you want to delete all ${count} motion profiles? This action cannot be undone.`;
        handler = handleDeleteAllMotionProfiles;
        break;
      case "gripParams":
        count = gripParamsQuery.data?.length || 0;
        message = `Are you sure you want to delete all ${count} grip parameters? This action cannot be undone.`;
        handler = handleDeleteAllGripParams;
        break;
      case "sequences":
        count = (sequences || []).length;
        message = `Are you sure you want to delete all ${count} sequences? This action cannot be undone.`;
        handler = handleDeleteAllSequences;
        break;
    }

    if (count === 0) {
      warningToast("Nothing to delete", "There are no items to delete in this section.");
      return;
    }

    setConfirmMessage(message);
    setDeleteHandler(() => handler);
    setConfirmDeleteOpen(true);
  };

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
              <ToolStatusCard toolId={tool.name} />
            </Box>
            <ControlPanel
              onFree={() => commandHandlers.handleSimpleCommand(robotArmCommandMutation, "release")}
              onUnfree={() =>
                commandHandlers.handleSimpleCommand(robotArmCommandMutation, "engage")
              }
              onUnwind={() =>
                commandHandlers.handleSimpleCommand(robotArmCommandMutation, "unwind")
              }
              onGripperOpen={() => {
                const selectedParams = gripParams.find((p) => p.id === defaultParamsId);
                if (selectedParams) {
                  commandHandlers.handleGripperCommand(
                    robotArmCommandMutation,
                    "open",
                    selectedParams,
                    false,
                    gripParams,
                  );
                } else {
                  // Let server handle defaults
                  commandHandlers.handleGripperCommand(
                    robotArmCommandMutation,
                    "open",
                    {
                      id: 0,
                      name: "Default",
                      tool_id: tool.id,
                      width: 0, // Server will override with its defaults
                      speed: 0, // Server will override with its defaults
                      force: 0, // Server will override with its defaults
                    },
                    false,
                    gripParams,
                  );
                }
              }}
              onGripperClose={() => {
                const selectedParams = gripParams.find((p) => p.id === defaultParamsId);
                if (selectedParams) {
                  commandHandlers.handleGripperCommand(
                    robotArmCommandMutation,
                    "close",
                    selectedParams,
                    false,
                    gripParams,
                  );
                } else {
                  // Let server handle defaults
                  commandHandlers.handleGripperCommand(
                    robotArmCommandMutation,
                    "close",
                    {
                      id: 0,
                      name: "Default",
                      tool_id: tool.id,
                      width: 0, // Server will override with its defaults
                      speed: 0, // Server will override with its defaults
                      force: 0, // Server will override with its defaults
                    },
                    false,
                    gripParams,
                  );
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
                robotArmCommandMutation.variables?.command === "unwind" &&
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
                toolId={tool.id}
                onTeach={() => handleTeach(selectedTeachPoint!)}
                onMove={handleMove}
                onUnwind={() =>
                  commandHandlers.handleSimpleCommand(robotArmCommandMutation, "unwind")
                }
                onGripperOpen={() =>
                  commandHandlers.handleGripperCommand(
                    robotArmCommandMutation,
                    "open",
                    selectedGripParams!,
                    false,
                    gripParams,
                  )
                }
                onGripperClose={() =>
                  commandHandlers.handleGripperCommand(
                    robotArmCommandMutation,
                    "close",
                    selectedGripParams!,
                    false,
                    gripParams,
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
                  Grip Settings
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
                        tool_id: tool.id,
                        orientation: point.orientation,
                      };
                      updateLocationMutation.mutateAsync(location).then(() => {
                        robotArmLocationsQuery.refetch();
                      });
                    }}
                    onDelete={async (point: TeachPoint) => {
                      await deleteLocationMutation.mutateAsync({
                        id: point.id,
                        tool_id: tool.id,
                      });
                      robotArmLocationsQuery.refetch();
                    }}
                    onDeleteAll={() => showDeleteConfirm("teachPoints")}
                    onAdd={() => {
                      openTeachPointModal();
                    }}
                    onTeach={handleTeach}
                    isConnected={isConnected}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                    searchTerm={searchTerm}
                    config={tool}
                  />
                </TabPanel>
                <TabPanel>
                  <MotionProfilesPanel
                    profiles={filteredItems as MotionProfile[]}
                    onEdit={async (profile: MotionProfile) => {
                      if (profile.id) {
                        await updateMotionProfileMutation.mutateAsync({
                          ...profile,
                          tool_id: tool.id,
                        });
                      } else {
                        setSelectedMotionProfile(profile);
                        motionProfileModal.onOpen();
                      }
                    }}
                    onDelete={async (id: number) => {
                      await deleteMotionProfileMutation.mutateAsync({ id, tool_id: tool.id });
                      motionProfilesQuery.refetch();
                    }}
                    onDeleteAll={() => showDeleteConfirm("motionProfiles")}
                    onAdd={() => {
                      setSelectedMotionProfile(null);
                      motionProfileModal.onOpen();
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
                      await deleteGripParamsMutation.mutateAsync({ id, tool_id: tool.id });
                      gripParamsQuery.refetch();
                    }}
                    onDeleteAll={() => showDeleteConfirm("gripParams")}
                    onAdd={() => {
                      setSelectedGripParams(null);
                      gripParamsModal.onOpen();
                    }}
                    onInlineEdit={async (params: GripParams) => {
                      await updateGripParamsMutation.mutateAsync({
                        ...params,
                        tool_id: tool.id,
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
                    onDeleteAll={() => showDeleteConfirm("sequences")}
                    onCreateNew={handleNewSequence}
                    onUpdateSequence={handleUpdateSequence}
                    onCloneSequence={handleCloneSequence}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                    config={tool}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </HStack>
      </VStack>

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
                tool_id: tool.id,
              });
            } else {
              await createMotionProfileMutation.mutateAsync({
                ...profile,
                tool_id: tool.id,
              });
            }
            await motionProfilesQuery.refetch();
            motionProfileModal.onClose();
          } catch (error) {
            console.error("Failed to save motion profile:", error);
          }
        }}
        toolId={tool.id}
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
                tool_id: tool.id,
              });
            } else {
              await createGripParamsMutation.mutateAsync({
                ...params,
                tool_id: tool.id,
              });
            }
            await gripParamsQuery.refetch();
            gripParamsModal.onClose();
          } catch (error) {
            console.error("Failed to save grip parameters:", error);
          }
        }}
        toolId={tool.id}
      />

      <TeachPointModal
        isOpen={teachPointModal.isOpen}
        onClose={teachPointModal.onClose}
        point={selectedTeachPoint || undefined}
        onSave={async (point: TeachPoint) => {
          // Parse coordinates from the string
          const coords = point.coordinates.split(" ").map(Number);
          const numJoints = (tool.config as any)?.pf400?.joints || 6;

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
            tool_id: tool.id,
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
        toolId={tool.id}
        config={tool}
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
        config={tool}
        teachPoints={teachPoints}
      />

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onClick={deleteHandler}
        header="Delete Confirmation"
        colorScheme="red"
        confirmText="Delete">
        {confirmMessage}
      </ConfirmationModal>
    </Card>
  );
};
