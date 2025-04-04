import { createStandaloneToast } from "@chakra-ui/react";
import React from "react";

const { ToastContainer, toast } = createStandaloneToast({});

export const CustomToaster = () => <ToastContainer />;

export const toastIsActive = (id: string) => toast.isActive(id);

export const successToast = (title: string, description: string) => {
  toast({
    title,
    description,
    status: "success",
    duration: 3000,
    variant: "left-accent",
    position: "bottom-right",
    isClosable: true,
  });
};

export const warningToast = (title: string, description: string) => {
  toast({
    title,
    description,
    status: "warning",
    duration: 3000,
    variant: "left-accent",
    position: "bottom-right",
    isClosable: true,
  });
};

export const errorToast = (title: string, description: string) => {
  toast({
    title,
    description,
    status: "error",
    duration: 10000,
    variant: "left-accent",
    position: "bottom-right",
    isClosable: true,
  });
};

/**
 * Utility for batch operations that consolidates multiple operations into a single toast
 * @param operation The operation name (e.g., "delete", "create")
 * @param itemType The type of items being operated on (e.g., "teach points", "sequences")
 * @param count The number of items processed
 * @param successCount The number of successful operations
 * @param errorCount The number of failed operations
 */
export const batchOperationToast = (
  operation: string,
  itemType: string,
  count: number,
  successCount: number,
  errorCount: number = 0,
) => {
  if (successCount === count) {
    // All operations successful
    successToast(
      `Batch ${operation} completed`,
      `Successfully ${operation}d ${successCount} ${itemType}`,
    );
  } else if (errorCount > 0) {
    // Some operations failed
    warningToast(
      `Batch ${operation} completed with errors`,
      `${successCount} of ${count} ${itemType} ${operation}d successfully, ${errorCount} failed`,
    );
  } else {
    // No operations performed
    warningToast(`No ${itemType} ${operation}d`, `No ${itemType} were available to ${operation}`);
  }
};
