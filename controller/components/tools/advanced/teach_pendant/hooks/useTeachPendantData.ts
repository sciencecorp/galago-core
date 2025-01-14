import { useState } from "react";
import { TeachPoint, MotionProfile, GripParams } from "../components/types";

export const useTeachPendantData = () => {
  // Data state
  const [teachPoints, setTeachPoints] = useState<TeachPoint[]>([]);
  const [motionProfiles, setMotionProfiles] = useState<MotionProfile[]>([]);
  const [gripParams, setGripParams] = useState<GripParams[]>([]);
  const [nests, setNests] = useState<TeachPoint[]>([]);

  // Data manipulation handlers
  const addTeachPoint = (point: TeachPoint) => {
    setTeachPoints((prev) => [...prev, point]);
  };

  const updateTeachPoint = (point: TeachPoint) => {
    setTeachPoints((prev) =>
      prev.map((p) => (p.id === point.id ? point : p))
    );
  };

  const deleteTeachPoint = (id: number) => {
    setTeachPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const addMotionProfile = (profile: MotionProfile) => {
    setMotionProfiles((prev) => [...prev, profile]);
  };

  const updateMotionProfile = (profile: MotionProfile) => {
    setMotionProfiles((prev) =>
      prev.map((p) => (p.profile_id === profile.profile_id ? profile : p))
    );
  };

  const deleteMotionProfile = (id: number) => {
    setMotionProfiles((prev) => prev.filter((p) => p.profile_id !== id));
  };

  const addGripParams = (params: GripParams) => {
    setGripParams((prev) => [...prev, params]);
  };

  const updateGripParams = (params: GripParams) => {
    setGripParams((prev) =>
      prev.map((p) => (p.id === params.id ? params : p))
    );
  };

  const deleteGripParams = (id: number) => {
    setGripParams((prev) => prev.filter((p) => p.id !== id));
  };

  const addNest = (nest: TeachPoint) => {
    setNests((prev) => [...prev, nest]);
  };

  const updateNest = (nest: TeachPoint) => {
    setNests((prev) =>
      prev.map((n) => (n.id === nest.id ? nest : n))
    );
  };

  const deleteNest = (id: number) => {
    setNests((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    // Data
    teachPoints,
    motionProfiles,
    gripParams,
    nests,

    // Data setters
    setTeachPoints,
    setMotionProfiles,
    setGripParams,
    setNests,

    // TeachPoint handlers
    addTeachPoint,
    updateTeachPoint,
    deleteTeachPoint,

    // MotionProfile handlers
    addMotionProfile,
    updateMotionProfile,
    deleteMotionProfile,

    // GripParams handlers
    addGripParams,
    updateGripParams,
    deleteGripParams,

    // Nest handlers
    addNest,
    updateNest,
    deleteNest,
  };
}; 