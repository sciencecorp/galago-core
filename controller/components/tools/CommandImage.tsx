import { trpc } from "@/utils/trpc";
import React, { useEffect, memo } from "react";
import { Box, IconButton, Image, Center } from "@chakra-ui/react";
import {
  Wrench,
  FileCode,
  MessageSquare,
  PauseCircle,
  AlarmClock,
  StickyNote,
  StopCircle,
  Repeat,
  Variable,
  FormInput,
  Volume2,
  List,
} from "lucide-react";
import { RunCommand } from "@/types";

interface CommandImageProps {
  config: any;
  command: RunCommand;
  onCommandClick: (command: RunCommand) => void;
}

const CommandImage: React.FC<CommandImageProps> = (props) => {
  const { config, command, onCommandClick } = props;

  const ToolBoxCommandIconMap = (commandName: string) => {
    const commandIconMap = {
      run_script: <FileCode style={{ width: "100%", height: "50px" }} />,
      show_message: <MessageSquare style={{ width: "100%", height: "50px" }} />,
      pause: <PauseCircle style={{ width: "100%", height: "50px" }} />,
      timer: <AlarmClock style={{ width: "100%", height: "50px" }} />,
      note: <StickyNote style={{ width: "100%", height: "50px" }} />,
      stop_run: <StopCircle style={{ width: "100%", height: "50px", color: "red" }} />,
      goto: <Repeat style={{ width: "100%", height: "50px" }} />,
      variable_assignment: <Variable style={{ width: "100%", height: "50px" }} />,
      user_form: <List style={{ width: "100%", height: "50px" }} />,
      text_to_speech: <Volume2 style={{ width: "100%", height: "50px" }} />,
    } as Record<string, JSX.Element>;
    return commandIconMap[commandName] || <Wrench style={{ width: "100%", height: "65px" }} />;
  };

  const renderToolImage = (config: any) => {
    if (!config) return;
    if (!config.imageUrl) {
      return <Box></Box>;
    } else if (config.name == "Tool Box") {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" py={3}>
          <IconButton
            aria-label="Tool Box"
            icon={ToolBoxCommandIconMap(command.commandInfo.command)} // Ensure the icon fills the button
            variant="ghost"
            colorScheme="teal"
            isRound
            onClick={() => onCommandClick(command)}
          />
        </Box>
      );
    } else {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Image
            src={config.imageUrl}
            alt={config.name}
            objectFit="contain"
            height="65px"
            width="65px"
            transition="all 0.3s ease-in-out"
            cursor="pointer"
            onClick={() => onCommandClick(command)}
          />
        </Box>
      );
    }
  };

  return <>{renderToolImage(config)}</>;
};

export default CommandImage;
