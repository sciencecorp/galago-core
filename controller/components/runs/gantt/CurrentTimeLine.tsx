import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { palette, semantic } from "../../../themes/colors";

interface CurrentTimeLineProps {
  position: number;
}

export const CurrentTimeLine: React.FC<CurrentTimeLineProps> = ({ position }) => {
  const circleBg = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.secondary.dark,
  );

  return (
    <Box
      position="absolute"
      left={`${position}%`}
      top="0"
      bottom="0"
      width="2px"
      bg={palette.red[500]}
      opacity={0.8}
      zIndex={4}
      pointerEvents="none"
      transition="left 0.1s linear"
      mt="10px"
      _before={{
        content: '""',
        position: "absolute",
        top: "-8px",
        left: "-5px",
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: palette.red[500],
        boxShadow: `0 0 0 2px ${circleBg}`,
        transition: "left 0.1s linear",
        zIndex: 10,
      }}
    />
  );
};
