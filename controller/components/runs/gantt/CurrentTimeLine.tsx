import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";

interface CurrentTimeLineProps {
  position: number;
}

export const CurrentTimeLine: React.FC<CurrentTimeLineProps> = ({ position }) => {
  const circleBg = useColorModeValue("white", "surface.section");
  const lineShadow = useColorModeValue(
    "0 0 0 1px rgba(255,255,255,0.35)",
    "0 0 0 1px rgba(0,0,0,0.35)",
  );

  return (
    <Box
      position="absolute"
      left={`${position}%`}
      top="0"
      bottom="0"
      width="2px"
      bg="red.400"
      opacity={0.9}
      boxShadow={lineShadow}
      zIndex={4}
      pointerEvents="none"
      transition="left 0.1s linear"
      _before={{
        content: '""',
        position: "absolute",
        top: "-8px",
        left: "-5px",
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: "red.400",
        boxShadow: `0 0 0 2px ${circleBg}`,
        transition: "left 0.1s linear",
        zIndex: 10,
      }}
    />
  );
};
