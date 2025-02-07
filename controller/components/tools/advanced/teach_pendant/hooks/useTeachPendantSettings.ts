import { useState } from "react";

export const useTeachPendantSettings = () => {
  // Settings state
  const [autoRegisterMotionProfile, setAutoRegisterMotionProfile] = useState(true);
  const [confirmBeforeDelete, setConfirmBeforeDelete] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [defaultJogDistance, setDefaultJogDistance] = useState(10);
  const [defaultJogAxis, setDefaultJogAxis] = useState("x");
  const [defaultMotionSpeed, setDefaultMotionSpeed] = useState(50);
  const [defaultGripForce, setDefaultGripForce] = useState(50);

  // Settings handlers
  const toggleAutoRegisterMotionProfile = () => {
    setAutoRegisterMotionProfile((prev) => !prev);
  };

  const toggleConfirmBeforeDelete = () => {
    setConfirmBeforeDelete((prev) => !prev);
  };

  const toggleShowAdvancedOptions = () => {
    setShowAdvancedOptions((prev) => !prev);
  };

  const updateDefaultJogDistance = (distance: number) => {
    setDefaultJogDistance(distance);
  };

  const updateDefaultJogAxis = (axis: string) => {
    setDefaultJogAxis(axis);
  };

  const updateDefaultMotionSpeed = (speed: number) => {
    setDefaultMotionSpeed(speed);
  };

  const updateDefaultGripForce = (force: number) => {
    setDefaultGripForce(force);
  };

  return {
    // Settings
    autoRegisterMotionProfile,
    confirmBeforeDelete,
    showAdvancedOptions,
    defaultJogDistance,
    defaultJogAxis,
    defaultMotionSpeed,
    defaultGripForce,

    // Settings handlers
    toggleAutoRegisterMotionProfile,
    toggleConfirmBeforeDelete,
    toggleShowAdvancedOptions,
    updateDefaultJogDistance,
    updateDefaultJogAxis,
    updateDefaultMotionSpeed,
    updateDefaultGripForce,
  };
};
