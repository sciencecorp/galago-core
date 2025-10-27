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
import { TiArrowRepeat } from "react-icons/ti";
import { TbVariable } from "react-icons/tb";
import { SiReacthookform } from "react-icons/si";
import { PiUserSoundBold } from "react-icons/pi";

interface CommandImageProps {
  config: any;
  command: any;
  onCommandClick: (command: any) => void;
}

const CommandImage: React.FC<CommandImageProps> = (props) => {
  const { config, command, onCommandClick } = props;

  const ToolBoxCommandIconMap = (commandName: string) => {
    const commandIconMap = {
      run_script: <FaRegFileCode style={{ width: "100%", height: "50px" }} />,
      show_message: <TbMessageReport style={{ width: "100%", height: "50px" }} />,
      pause: <MdOutlinePauseCircleOutline style={{ width: "100%", height: "50px" }} />,
      timer: <MdAlarm style={{ width: "100%", height: "50px" }} />,
      note: <FaRegStickyNote style={{ width: "100%", height: "50px" }} />,
      stop_run: <GoStop style={{ width: "100%", height: "50px", color: "red" }} />,
      goto: <TiArrowRepeat style={{ width: "100%", height: "70px" }} />,
      variable_assignment: <TbVariable style={{ width: "100%", height: "50px" }} />,
      user_form: <SiReacthookform style={{ width: "100%", height: "50px", strokeWidth: 1 }} />,
      text_to_speech: <PiUserSoundBold style={{ width: "100%", height: "50px" }} />,
    } as Record<string, JSX.Element>;
    return commandIconMap[commandName] || <PiToolbox style={{ width: "100%", height: "55px" }} />;
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
            icon={ToolBoxCommandIconMap(command.command)} // Ensure the icon fills the button
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
            height="55px"
            width="55px"
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
