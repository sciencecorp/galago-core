import React, { useState, useRef, useEffect } from "react";
import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { GripVertical } from "lucide-react";

interface ConsoleProps {
  consoleText: string;
  runError?: boolean;
  consoleHeaderBg?: string;
  consoleBg?: string;
  borderColor?: string;
}

export const Console: React.FC<ConsoleProps> = ({
  consoleText,
  runError,
  consoleHeaderBg = "gray.200",
  consoleBg = "white",
  borderColor = "gray.300",
}) => {
  const [consoleHeight, setConsoleHeight] = useState("20vh");
  const [isMinimized, setIsMinimized] = useState(false);

  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const currentHeightRef = useRef("20vh");

  // Refs
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<HTMLDivElement | null>(null);

  // Update the ref when the state changes
  useEffect(() => {
    currentHeightRef.current = consoleHeight;
  }, [consoleHeight]);

  // Handle drag to resize with optimized event handling
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();

    // Use refs instead of state for drag tracking
    isDraggingRef.current = true;
    startYRef.current = e.clientY;

    // Add listeners directly to avoid re-renders
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
  };

  const handleDragMove = (e: any) => {
    if (!isDraggingRef.current) return;

    // Use requestAnimationFrame for smooth performance
    requestAnimationFrame(() => {
      const deltaY = startYRef.current - e.clientY;

      const consoleEl = consoleRef.current;
      if (!consoleEl) return;

      const currentHeightPx = consoleEl.getBoundingClientRect().height;
      const newHeightPx = currentHeightPx + deltaY;

      const minHeight = 30; // Minimum height (px)
      const maxHeight = window.innerHeight * 0.8; // Maximum height (80% of viewport)

      if (newHeightPx > minHeight && newHeightPx < maxHeight) {
        consoleEl.style.height = `${newHeightPx}px`;
        startYRef.current = e.clientY;
      }
    });
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    // Clean up event listeners
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);

    // After dragging is complete, update the state with actual pixel height
    if (consoleRef.current) {
      const finalHeight = `${consoleRef.current.getBoundingClientRect().height}px`;
      setConsoleHeight(finalHeight);
    }
  };

  return (
    <Box
      ref={consoleRef}
      width="100%"
      height={consoleHeight}
      bg={consoleBg}
      overflowX="auto"
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      overflow="hidden"
      position="relative">
      <Flex
        ref={dragHandleRef}
        width="100%"
        cursor="ns-resize"
        height="8px"
        position="absolute"
        top="0"
        left="0"
        zIndex="10"
        onMouseDown={handleDragStart}
        _hover={{ bg: "gray.400", opacity: 0.7 }}
        _active={{ bg: "blue.400", opacity: 0.7 }}
      />

      <Flex
        width="100%"
        bg={consoleHeaderBg}
        p={1}
        borderBottomWidth="1px"
        borderColor={borderColor}
        justify="space-between"
        align="center"
        onMouseDown={(e) => {
          handleDragStart(e);
        }}
        cursor="ns-resize">
        <Flex align="center">
          <Icon as={GripVertical} size={14} mr={2} />
          <Text userSelect="none">Output Console</Text>
        </Flex>
      </Flex>
      <Box
        width="100%"
        height={isMinimized ? "0" : "calc(100% - 34px)"}
        p={2}
        overflowY="auto"
        overflowX="auto"
        display={isMinimized ? "none" : "block"}>
        <Box
          maxWidth="100%"
          fontFamily="monospace"
          fontSize="sm"
          sx={{
            "& pre": {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              backgroundColor: "transparent",
              padding: 0,
              margin: 0,
            },
          }}>
          <pre
            style={{
              color: runError ? "red" : "inherit",
            }}>
            {consoleText}
          </pre>
        </Box>
      </Box>
    </Box>
  );
};
