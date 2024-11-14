import React from "react";
import { Progress } from "@chakra-ui/react";

type LoadingProgressProps = {
  isLoading: boolean;
};

const LoadingProgress: React.FC<LoadingProgressProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return <Progress hasStripe colorScheme="yellow" size="sm" isIndeterminate />;
};

export default LoadingProgress;