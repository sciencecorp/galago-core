import { trpc } from "@/utils/trpc";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "../types/";

export const useTeachPendantQueries = (
  toolId: string | undefined,
  configId: number
) => {
  // Queries
  const toolStatusQuery = trpc.tool.status.useQuery(
    { toolId: toolId || "" },
    { enabled: !!toolId }
  );

  const motionProfilesQuery = trpc.robotArm.motionProfile.getAll.useQuery(
    { toolId: configId },
    { enabled: !!configId && configId !== 0 }
  );

  const gripParamsQuery = trpc.robotArm.gripParams.getAll.useQuery(
    { toolId: configId },
    { enabled: !!configId && configId !== 0 }
  );

  const robotArmSequencesQuery = trpc.robotArm.sequence.getAll.useQuery(
    { toolId: configId },
    { enabled: !!configId && configId !== 0 }
  );

  const robotArmLocationsQuery = trpc.robotArm.location.getAll.useQuery(
    { toolId: configId },
    { enabled: !!configId && configId !== 0 }
  );

  const waypointsQuery = trpc.robotArm.waypoints.getAll.useQuery(
    { toolId: configId },
    { enabled: !!configId && configId !== 0 }
  );

  // Mutations
  const createMotionProfileMutation =
    trpc.robotArm.motionProfile.create.useMutation({
      onSuccess: () => {
        motionProfilesQuery.refetch();
      },
    });

  const updateMotionProfileMutation =
    trpc.robotArm.motionProfile.update.useMutation({
      onSuccess: () => {
        motionProfilesQuery.refetch();
      },
    });

  const deleteMotionProfileMutation =
    trpc.robotArm.motionProfile.delete.useMutation({
      onSuccess: () => {
        motionProfilesQuery.refetch();
      },
    });

  const createGripParamsMutation = trpc.robotArm.gripParams.create.useMutation({
    onSuccess: () => {
      gripParamsQuery.refetch();
    },
  });

  const updateGripParamsMutation = trpc.robotArm.gripParams.update.useMutation({
    onSuccess: () => {
      gripParamsQuery.refetch();
    },
  });

  const deleteGripParamsMutation = trpc.robotArm.gripParams.delete.useMutation({
    onSuccess: () => {
      gripParamsQuery.refetch();
    },
  });

  const createLocationMutation = trpc.robotArm.location.create.useMutation({
    onSuccess: () => {
      robotArmLocationsQuery.refetch();
    },
  });

  const updateLocationMutation = trpc.robotArm.location.update.useMutation({
    onSuccess: () => {
      robotArmLocationsQuery.refetch();
    },
  });

  const deleteLocationMutation = trpc.robotArm.location.delete.useMutation({
    onSuccess: () => {
      robotArmLocationsQuery.refetch();
    },
  });

  const robotArmCreateSequenceMutation =
    trpc.robotArm.sequence.create.useMutation({
      onSuccess: () => {
        robotArmSequencesQuery.refetch();
      },
    });

  const robotArmUpdateSequenceMutation =
    trpc.robotArm.sequence.update.useMutation({
      onSuccess: () => {
        robotArmSequencesQuery.refetch();
      },
    });

  const robotArmDeleteSequenceMutation =
    trpc.robotArm.sequence.delete.useMutation({
      onSuccess: () => {
        robotArmSequencesQuery.refetch();
      },
    });

  // Command mutation
  const robotArmCommandMutation = trpc.tool.runCommand.useMutation();

  return {
    toolStatusQuery,
    motionProfilesQuery,
    gripParamsQuery,
    robotArmSequencesQuery,
    robotArmLocationsQuery,
    waypointsQuery,
    createMotionProfileMutation,
    updateMotionProfileMutation,
    deleteMotionProfileMutation,
    createGripParamsMutation,
    updateGripParamsMutation,
    deleteGripParamsMutation,
    createLocationMutation,
    updateLocationMutation,
    deleteLocationMutation,
    robotArmCreateSequenceMutation,
    robotArmUpdateSequenceMutation,
    robotArmDeleteSequenceMutation,
    robotArmCommandMutation,
  };
};
