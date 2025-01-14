import { trpc } from "@/utils/trpc";
import { useToast } from "@chakra-ui/react";
import { TeachPoint, MotionProfile, GripParams, Sequence } from "../components/types";

export const useTeachPendantQueries = (toolId: string | undefined, configId: number) => {
  const toast = useToast();

  // Queries
  const toolStatusQuery = trpc.tool.status.useQuery(
    { toolId: toolId || '' },
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
    { enabled: !!configId && configId !== 0 },
  );

  const robotArmLocationsQuery = trpc.robotArm.location.getAll.useQuery(
    { toolId: configId },
    { enabled: !!configId && configId !== 0 },
  );

  const robotArmNestsQuery = trpc.robotArm.nest.getAll.useQuery(
    { toolId: configId },
    { enabled: !!configId && configId !== 0 },
  );

  const waypointsQuery = trpc.robotArm.waypoints.getAll.useQuery(
    { toolId: configId },
    { enabled: !!configId && configId !== 0 },
  );

  // Mutations
  const createMotionProfileMutation = trpc.robotArm.motionProfile.create.useMutation({
    onSuccess: () => {
      motionProfilesQuery.refetch();
      toast({
        title: "Success",
        description: "Motion profile created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateMotionProfileMutation = trpc.robotArm.motionProfile.update.useMutation({
    onSuccess: () => {
      motionProfilesQuery.refetch();
      toast({
        title: "Success",
        description: "Motion profile updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteMotionProfileMutation = trpc.robotArm.motionProfile.delete.useMutation({
    onSuccess: () => {
      motionProfilesQuery.refetch();
      toast({
        title: "Success",
        description: "Motion profile deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const createGripParamsMutation = trpc.robotArm.gripParams.create.useMutation({
    onSuccess: () => {
      gripParamsQuery.refetch();
      toast({
        title: "Success",
        description: "Grip parameters created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateGripParamsMutation = trpc.robotArm.gripParams.update.useMutation({
    onSuccess: () => {
      gripParamsQuery.refetch();
      toast({
        title: "Success",
        description: "Grip parameters updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteGripParamsMutation = trpc.robotArm.gripParams.delete.useMutation({
    onSuccess: () => {
      gripParamsQuery.refetch();
      toast({
        title: "Success",
        description: "Grip parameters deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const createLocationMutation = trpc.robotArm.location.create.useMutation({
    onSuccess: () => {
      robotArmLocationsQuery.refetch();
      toast({
        title: "Success",
        description: "Location created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateLocationMutation = trpc.robotArm.location.update.useMutation({
    onSuccess: () => {
      robotArmLocationsQuery.refetch();
      toast({
        title: "Success",
        description: "Location updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteLocationMutation = trpc.robotArm.location.delete.useMutation({
    onSuccess: () => {
      robotArmLocationsQuery.refetch();
      toast({
        title: "Success",
        description: "Location deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const createNestMutation = trpc.robotArm.nest.create.useMutation({
    onSuccess: () => {
      robotArmNestsQuery.refetch();
      toast({
        title: "Success",
        description: "Nest created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateNestMutation = trpc.robotArm.nest.update.useMutation({
    onSuccess: () => {
      robotArmNestsQuery.refetch();
      toast({
        title: "Success",
        description: "Nest updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteNestMutation = trpc.robotArm.nest.delete.useMutation({
    onSuccess: () => {
      robotArmNestsQuery.refetch();
      toast({
        title: "Success",
        description: "Nest deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const robotArmCreateSequenceMutation = trpc.robotArm.sequence.create.useMutation({
    onSuccess: () => {
      robotArmSequencesQuery.refetch();
      toast({
        title: "Success",
        description: "Sequence created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const robotArmUpdateSequenceMutation = trpc.robotArm.sequence.update.useMutation({
    onSuccess: () => {
      robotArmSequencesQuery.refetch();
      toast({
        title: "Success",
        description: "Sequence updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const robotArmDeleteSequenceMutation = trpc.robotArm.sequence.delete.useMutation({
    onSuccess: () => {
      robotArmSequencesQuery.refetch();
      toast({
        title: "Success",
        description: "Sequence deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Command mutation
  const robotArmCommandMutation = trpc.robotArm.command.useMutation();

  return {
    toolStatusQuery,
    motionProfilesQuery,
    gripParamsQuery,
    robotArmSequencesQuery,
    robotArmLocationsQuery,
    robotArmNestsQuery,
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
    createNestMutation,
    updateNestMutation,
    deleteNestMutation,
    robotArmCreateSequenceMutation,
    robotArmUpdateSequenceMutation,
    robotArmDeleteSequenceMutation,
    robotArmCommandMutation,
  };
}; 