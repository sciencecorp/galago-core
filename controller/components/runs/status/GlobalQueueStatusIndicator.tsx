import React from "react";
import { Box, HStack, Text, keyframes } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";

// Glowing animation for active state
const glowAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

export const GlobalQueueStatusIndicator: React.FC = () => {
  const stateQuery = trpc.commandQueue.state.useQuery(undefined, { refetchInterval: 1000 });
  const getError = trpc.commandQueue.getError.useQuery(undefined, { refetchInterval: 1000 });

  if (stateQuery.isLoading) return null;

  const isRunning = stateQuery.data === ToolStatus.BUSY;
  const isFailed = stateQuery.data === ToolStatus.FAILED;

  // Determine status - check error state OR failed status
  const getStatusConfig = () => {
    if (isFailed) {
      return {
        color: "#ef4444",
        icon: AlertTriangle,
        label: "Run Error",
        shouldGlow: false,
      };
    }
    if (isRunning) {
      return {
        color: "#22c55e",
        icon: null,
        label: "Protocol Running",
        shouldGlow: true,
      };
    }
    return {
      color: "#64748b",
      icon: null,
      label: "Idle",
      shouldGlow: false,
    };
  };

  const status = getStatusConfig();

  return (
    <Box
      position="fixed"
      top="20px"
      right="20px"
      zIndex={1000}
      bg="rgba(255, 255, 255, 0.9)"
      _dark={{ bg: "rgba(26, 32, 44, 0.9)" }}
      backdropFilter="blur(10px)"
      borderRadius="md"
      boxShadow="md"
      px={3}
      py={2}>
      <HStack spacing={2}>
        {isFailed ? (
          <AlertTriangle size={18} color={status.color} />
        ) : (
          <Box
            width="10px"
            height="10px"
            borderRadius="full"
            bg={status.color}
            animation={status.shouldGlow ? `${glowAnimation} 2s ease-in-out infinite` : undefined}
            boxShadow={status.shouldGlow ? `0 0 8px ${status.color}` : undefined}
          />
        )}
        <Text fontSize="sm" fontWeight="medium" color={status.color}>
          {status.label}
        </Text>
      </HStack>
    </Box>
  );
};
