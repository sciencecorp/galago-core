import { trpc } from "@/utils/trpc";
import React, { useEffect, memo } from "react";
import { Box, IconButton, Image, Center } from "@chakra-ui/react";
import { PiToolbox } from "react-icons/pi";
import { FaRegFileCode } from "react-icons/fa6";
import { RunCommand } from "@/types";
import { TbMessageReport } from "react-icons/tb";
import { MdOutlinePauseCircleOutline } from "react-icons/md";
import { MdAlarm } from "react-icons/md";
import { FaRegStickyNote } from "react-icons/fa";
import { GoStop } from "react-icons/go";

interface CommandImageProps {
  config: any;
  command: RunCommand;
  onCommandClick: (command: RunCommand) => void;
}

const CommandImage: React.FC<CommandImageProps> = (props) => {
  const { config, command, onCommandClick } = props;

  const ToolBoxCommandIconMap = (commandName: string) => {
    const commandIconMap = {
      run_python_script: <FaRegFileCode style={{ width: "100%", height: "50px" }} />,
      show_message: <TbMessageReport style={{ width: "100%", height: "50px" }} />,
      pause: <MdOutlinePauseCircleOutline style={{ width: "100%", height: "50px" }} />,
      timer: <MdAlarm style={{ width: "100%", height: "50px" }} />,
      note: <FaRegStickyNote style={{ width: "100%", height: "50px" }} />,
      stop_run: <GoStop style={{ width: "100%", height: "50px", color: "red" }} />,
    } as Record<string, JSX.Element>;
    return commandIconMap[commandName] || <PiToolbox style={{ width: "100%", height: "65px" }} />;
  };

  const renderToolImage = (config: any) => {
    if (!config) return;
    if (!config.image_url) {
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
            src={config.image_url}
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

export default memo(CommandImage);
