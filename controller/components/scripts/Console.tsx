import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  IconButton,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import { MdDragIndicator, MdExpandLess, MdExpandMore, MdMaximize, MdMinimize } from "react-icons/md";

export const Console = ({ 
  consoleText, 
  runError, 
  consoleHeaderBg, 
  consoleBg, 
  borderColor 
}) => {
  // State for console dimensions
  const [consoleHeight, setConsoleHeight] = useState("20vh");
  const [prevHeight, setPrevHeight] = useState("20vh");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Use refs for performance-critical values instead of state
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const currentHeightRef = useRef("20vh");
  
  // Refs
  const consoleRef = useRef(null);
  const dragHandleRef = useRef(null);
  
  // Update the ref when the state changes
  useEffect(() => {
    currentHeightRef.current = consoleHeight;
  }, [consoleHeight]);
  
  // Handle drag to resize with optimized event handling
  const handleDragStart = (e) => {
    e.preventDefault();
    
    // Use refs instead of state for drag tracking
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    
    // Add listeners directly to avoid re-renders
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };
  
  const handleDragMove = (e) => {
    if (!isDraggingRef.current) return;
    
    // Use requestAnimationFrame for smooth performance
    requestAnimationFrame(() => {
      const deltaY = startYRef.current - e.clientY;
      
      // Get current height in pixels
      const consoleEl = consoleRef.current;
      if (!consoleEl) return;
      
      const currentHeightPx = consoleEl.getBoundingClientRect().height;
      const newHeightPx = currentHeightPx + deltaY;
      
      // Prevent console from getting too small or too large
      const minHeight = 30; // Minimum height (px)
      const maxHeight = window.innerHeight * 0.8; // Maximum height (80% of viewport)
      
      if (newHeightPx > minHeight && newHeightPx < maxHeight) {
        // Update the height directly for immediate visual feedback
        consoleEl.style.height = `${newHeightPx}px`;
        
        // Update our reference to start Y for the next frame
        startYRef.current = e.clientY;
      }
    });
  };
  
  const handleDragEnd = () => {
    isDraggingRef.current = false;
    // Clean up event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    
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
      position="relative"
    >
      {/* Drag handle - improved visibility and size for easier grabbing */}
      <Flex 
        ref={dragHandleRef}
        width="100%" 
        cursor="ns-resize"
        height="8px"  // Increased from 5px
        position="absolute"
        top="0"
        left="0"
        zIndex="10"
        onMouseDown={handleDragStart}
        _hover={{ bg: "gray.400", opacity: 0.7 }}  // More visible hover state
        _active={{ bg: "blue.400", opacity: 0.7 }} // Visual feedback during drag
      />
      
      {/* Console header - made draggable too */}
      <Flex 
        width="100%" 
        bg={consoleHeaderBg} 
        p={1}
        borderBottomWidth="1px"
        borderColor={borderColor}
        justify="space-between"
        align="center"
        onMouseDown={(e) => {
          // Only handle drag if not clicking the buttons
          if (e.target.closest('button')) return;
          handleDragStart(e);
        }}
        cursor="ns-resize"
      >
        <Flex align="center">
          <Icon as={MdDragIndicator} mr={2} />
          <Text userSelect="none">Output Console</Text> {/* Prevent text selection during drag */}
        </Flex>
      </Flex>
      <Box 
        width="100%" 
        height={isMinimized ? "0" : "calc(100% - 34px)"} 
        p={2} 
        overflowY="auto"
        overflowX="auto" // Add horizontal scrolling
        display={isMinimized ? "none" : "block"}
      >
        <Box
          maxWidth="100%"
          fontFamily="monospace"
          fontSize="sm"
          sx={{
            // Add custom styling for code/console output
            "& pre": {
              whiteSpace: "pre-wrap",       // Wrap text by default
              wordBreak: "break-word",      // Break words that are too long
              overflowWrap: "break-word",   // Ensure long words don't overflow
              backgroundColor: "transparent",
              padding: 0,
              margin: 0
            }
          }}
        >
          <pre
            style={{
              color: runError ? "red" : "inherit"
            }}
          >
            {consoleText}
          </pre>
        </Box>
      </Box>
    </Box>
  );
};