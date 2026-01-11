import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "../types/";
import { Tool } from "@/types";

export const useTeachPendantUI = (_config: Tool) => {
  // Modal states using useDisclosure
  const motionProfileModal = useDisclosure();
  const gripParamsModal = useDisclosure();
  const teachPointModal = useDisclosure();
  const nestModal = useDisclosure();
  const deleteConfirmModal = useDisclosure();
  const sequenceModal = useDisclosure();

  // Selected items
  const [selectedTeachPoint, setSelectedTeachPoint] = useState<TeachPoint | null>(null);
  const [selectedMotionProfile, setSelectedMotionProfile] = useState<MotionProfile | null>(null);
  const [selectedGripParams, setSelectedGripParams] = useState<GripParams | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});
  const [jogEnabled, setJogEnabled] = useState(false);
  const [jogAxis, setJogAxis] = useState<string>("1");
  const [jogDistance, setJogDistance] = useState(1);

  // Row expansion handler
  const toggleRow = (id: number) => {
    const newExpandedRows = { ...expandedRows };
    newExpandedRows[id] = !newExpandedRows[id];
    setExpandedRows(newExpandedRows);
  };

  // Modal open handlers with proper typing
  const openMotionProfileModal = (profile?: MotionProfile) => {
    setSelectedMotionProfile(profile || null);
    motionProfileModal.onOpen();
  };

  const openGripParamsModal = (params?: GripParams) => {
    setSelectedGripParams(params || null);
    gripParamsModal.onOpen();
  };

  const openTeachPointModal = (point?: TeachPoint) => {
    setSelectedTeachPoint(point || null);
    teachPointModal.onOpen();
  };

  const openDeleteConfirmModal = (point?: TeachPoint) => {
    setSelectedTeachPoint(point || null);
    deleteConfirmModal.onOpen();
  };

  const openSequenceModal = (sequence?: Sequence) => {
    setSelectedSequence(sequence || null);
    sequenceModal.onOpen();
  };

  return {
    // Modal states
    motionProfileModal,
    gripParamsModal,
    teachPointModal,
    nestModal,
    deleteConfirmModal,
    sequenceModal,

    // Selected items
    selectedTeachPoint,
    setSelectedTeachPoint,
    selectedMotionProfile,
    setSelectedMotionProfile,
    selectedGripParams,
    setSelectedGripParams,
    selectedSequence,
    setSelectedSequence,

    // UI state
    activeTab,
    setActiveTab,
    expandedRows,
    toggleRow,
    jogEnabled,
    setJogEnabled,
    jogAxis,
    setJogAxis,
    jogDistance,
    setJogDistance,

    // Handlers
    openMotionProfileModal,
    openGripParamsModal,
    openTeachPointModal,
    openDeleteConfirmModal,
    openSequenceModal,
  };
};
