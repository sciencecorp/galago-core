import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "../components/types";

export const useTeachPendantUI = () => {
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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState(0);
  const [jogAxis, setJogAxis] = useState<string>("j1");
  const [jogDistance, setJogDistance] = useState<number>(1);
  const [jogEnabled, setJogEnabled] = useState<boolean>(false);

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
    expandedRows,
    activeTab,
    setActiveTab,
    jogAxis,
    setJogAxis,
    jogDistance,
    setJogDistance,
    jogEnabled,
    setJogEnabled,

    // Handlers
    toggleRow,
    openMotionProfileModal,
    openGripParamsModal,
    openTeachPointModal,
    openDeleteConfirmModal,
    openSequenceModal,
  };
}; 