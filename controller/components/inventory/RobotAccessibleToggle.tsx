import React from "react";
import { Switch, Tooltip, HStack, Text } from "@chakra-ui/react";

interface RobotAccessibleToggleProps {
  nestId: number;
  isAccessible: boolean;
  onToggle: (nestId: number, accessible: boolean) => Promise<void>;
  isDisabled?: boolean;
}

export const RobotAccessibleToggle: React.FC<RobotAccessibleToggleProps> = ({
  nestId,
  isAccessible,
  onToggle,
  isDisabled = false,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    try {
      await onToggle(nestId, e.target.checked);
    } catch (error) {
      console.error("Failed to toggle robot accessibility:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tooltip
      label={
        isAccessible
          ? "Robot can access this nest"
          : "Robot cannot access this nest"
      }
    >
      <HStack spacing={2}>
        <Switch
          colorScheme="teal"
          size="sm"
          isChecked={isAccessible}
          onChange={handleToggle}
          isDisabled={isDisabled || isLoading}
        />
        <Text fontSize="xs" color={isAccessible ? "teal.600" : "gray.500"}>
          {isAccessible ? "Accessible" : "Not accessible"}
        </Text>
      </HStack>
    </Tooltip>
  );
};
