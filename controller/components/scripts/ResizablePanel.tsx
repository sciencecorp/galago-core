import React, { useState, useRef, useEffect } from "react";
import { Box, Flex, Icon } from "@chakra-ui/react";
import { MdDragIndicator } from "react-icons/md";

interface ResizablePanelProps {
  initialWidth?: string;
  minWidth?: string;
  maxWidth?: string;
  borderColor?: string;
  children: React.ReactNode;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  initialWidth = "200px",
  minWidth = "150px",
  maxWidth = "50%",
  borderColor = "gray.300",
  children,
}) => {
  const [panelWidth, setPanelWidth] = useState(initialWidth);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const currentWidthRef = useRef(initialWidth);

  // Refs for the panel and drag handle
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragHandleRef = useRef<HTMLDivElement | null>(null);

  // Update the ref when the state changes
  useEffect(() => {
    currentWidthRef.current = panelWidth;
  }, [panelWidth]);

  // Handle drag to resize with optimized event handling
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();

    // Use refs instead of state for drag tracking
    isDraggingRef.current = true;
    startXRef.current = e.clientX;

    // Add listeners directly to avoid re-renders
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
  };

  const handleDragMove = (e: any) => {
    if (!isDraggingRef.current) return;

    // Use requestAnimationFrame for smooth performance
    requestAnimationFrame(() => {
      const deltaX = e.clientX - startXRef.current;

      const panelEl = panelRef.current;
      if (!panelEl) return;

      const currentWidthPx = panelEl.getBoundingClientRect().width;
      const newWidthPx = currentWidthPx + deltaX;

      const minWidthPx = parseInt(minWidth) || 150;
      const maxWidthPx = window.innerWidth * (parseInt(maxWidth) / 100 || 0.5);

      if (newWidthPx > minWidthPx && newWidthPx < maxWidthPx) {
        panelEl.style.width = `${newWidthPx}px`;
        startXRef.current = e.clientX;
      }
    });
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
    // Clean up event listeners
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);

    // After dragging is complete, update the state with actual pixel width
    if (panelRef.current) {
      const finalWidth = `${panelRef.current.getBoundingClientRect().width}px`;
      setPanelWidth(finalWidth);
    }
  };

  return (
    <Box ref={panelRef} width={panelWidth} position="relative" height="100%">
      {children}
      <Flex
        ref={dragHandleRef}
        width="8px"
        height="100%"
        cursor="ew-resize"
        position="absolute"
        top="0"
        right="-4px"
        zIndex="10"
        onMouseDown={handleDragStart}
        _hover={{ bg: "gray.400", opacity: 0.7 }}
        _active={{ bg: "blue.400", opacity: 0.7 }}
        justifyContent="center"
        alignItems="center"
      >
        <Box height="40%" width="2px" opacity={0.7} borderRadius="full" />
      </Flex>
    </Box>
  );
};
