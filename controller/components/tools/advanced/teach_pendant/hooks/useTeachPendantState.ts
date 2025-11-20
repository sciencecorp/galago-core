import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { TeachPoint, MotionProfile, GripParams, ItemType } from "../types/";

export const useTeachPendantState = () => {
  // Modal states
  const {
    isOpen: isTeachPointModalOpen,
    onOpen: onTeachPointModalOpen,
    onClose: onTeachPointModalClose,
  } = useDisclosure();

  const {
    isOpen: isMotionProfileModalOpen,
    onOpen: onMotionProfileModalOpen,
    onClose: onMotionProfileModalClose,
  } = useDisclosure();

  const {
    isOpen: isGripParamsModalOpen,
    onOpen: onGripParamsModalOpen,
    onClose: onGripParamsModalClose,
  } = useDisclosure();

  const {
    isOpen: isMoveModalOpen,
    onOpen: onMoveModalOpen,
    onClose: onMoveModalClose,
  } = useDisclosure();

  // General states
  const [isCommandInProgress, setIsCommandInProgress] = useState(false);
  const [jogAxis, setJogAxis] = useState("");
  const [jogDistance, setJogDistance] = useState(0);
  const [jogEnabled, setJogEnabled] = useState(false);

  // Data states
  const [locations, setLocations] = useState<TeachPoint[]>([]);
  const [selectedMotionProfile, setSelectedMotionProfile] =
    useState<MotionProfile | null>(null);
  const [selectedGripParams, setSelectedGripParams] =
    useState<GripParams | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<TeachPoint | null>(null);
  const [editingPoint, setEditingPoint] = useState<TeachPoint | null>(null);
  const [selectedAction, setSelectedAction] = useState<
    "approach" | "leave" | undefined
  >();

  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [globalFilterType, setGlobalFilterType] = useState<ItemType | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ItemType | "all">("all");

  // Settings states
  const [selectedMotionProfileId, setSelectedMotionProfileId] =
    useState<number>(1);
  const [selectedGripParamsId, setSelectedGripParamsId] = useState<
    number | null
  >(null);
  const [defaultMotionProfileId, setDefaultMotionProfileId] = useState<
    number | null
  >(null);
  const [defaultGripParamsId, setDefaultGripParamsId] = useState<number | null>(
    null
  );

  // Manual control states
  const [manualWidth, setManualWidth] = useState<number>(122);
  const [manualSpeed, setManualSpeed] = useState<number>(10);
  const [manualForce, setManualForce] = useState<number>(20);

  // Teach point states
  const [currentTeachpoint, setCurrentTeachpoint] = useState("");
  const [currentType, setCurrentType] = useState<"nest" | "location">(
    "location"
  );
  const [currentCoordinate, setCurrentCoordinate] = useState("");
  const [currentApproachPath, setCurrentApproachPath] = useState<string[]>([]);

  // Modal handlers
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

  // Row expansion handler
  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  return {
    // Modal states
    isTeachPointModalOpen,
    onTeachPointModalOpen,
    onTeachPointModalClose,
    isMotionProfileModalOpen,
    onMotionProfileModalOpen,
    onMotionProfileModalClose,
    isGripParamsModalOpen,
    onGripParamsModalOpen,
    onGripParamsModalClose,
    isMoveModalOpen,
    onMoveModalOpen,
    onMoveModalClose,

    // General states
    isCommandInProgress,
    setIsCommandInProgress,
    jogAxis,
    setJogAxis,
    jogDistance,
    setJogDistance,
    jogEnabled,
    setJogEnabled,

    // Data states
    locations,
    setLocations,
    selectedMotionProfile,
    setSelectedMotionProfile,
    selectedGripParams,
    setSelectedGripParams,
    selectedPoint,
    setSelectedPoint,
    editingPoint,
    setEditingPoint,
    selectedAction,
    setSelectedAction,

    // UI states
    activeTab,
    setActiveTab,
    expandedRows,
    setExpandedRows,
    globalSearchTerm,
    setGlobalSearchTerm,
    globalFilterType,
    setGlobalFilterType,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,

    // Settings states
    selectedMotionProfileId,
    setSelectedMotionProfileId,
    selectedGripParamsId,
    setSelectedGripParamsId,
    defaultMotionProfileId,
    setDefaultMotionProfileId,
    defaultGripParamsId,
    setDefaultGripParamsId,

    // Manual control states
    manualWidth,
    setManualWidth,
    manualSpeed,
    setManualSpeed,
    manualForce,
    setManualForce,

    // Teach point states
    currentTeachpoint,
    setCurrentTeachpoint,
    currentType,
    setCurrentType,
    currentCoordinate,
    setCurrentCoordinate,
    currentApproachPath,
    setCurrentApproachPath,

    // Handlers
    handleOpenTeachPointModal,
    handleOpenMotionProfileModal,
    handleOpenGripParamsModal,
    toggleRow,
  };
};
