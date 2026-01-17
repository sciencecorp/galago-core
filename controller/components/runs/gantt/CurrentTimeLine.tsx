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
      mt="6px"
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
      _after={{
        content: '"NOW"',
        position: "absolute",
        top: "-14px",
        left: "8px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: useColorModeValue("red.600", "red.200"),
        backgroundColor: useColorModeValue("whiteAlpha.900", "blackAlpha.500"),
        paddingX: "6px",
        paddingY: "2px",
        borderRadius: "full",
        borderWidth: "1px",
        borderColor: useColorModeValue("red.200", "red.700"),
        backdropFilter: "blur(6px)",
        whiteSpace: "nowrap",
      }}
    />
  );
};
