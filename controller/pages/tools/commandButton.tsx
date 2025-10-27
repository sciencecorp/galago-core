// CommandButton.tsx

import React from "react";
import { Button } from "@chakra-ui/react";

interface CommandButtonProps {
  commandName: string;
  onSelectCommand: (commandName: string) => void; // Define the type of the onSelectCommand function
  status: "idle" | "success" | "error"; // Define the type of the status variable
}

// CommandButton.tsx

const CommandButton: React.FC<CommandButtonProps> = ({
  commandName,
  onSelectCommand,
  status = "idle",
}) => {
  // const colorScheme = status === 'success' ? 'green' : status === 'error' ? 'red' : 'gray';

  return (
    <Button
      onClick={() => onSelectCommand(commandName)}
      m={2}
      // colorScheme={colorScheme}
    >
      {commandName}
    </Button>
  );
};

export default CommandButton;
