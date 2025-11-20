import { createStandaloneToast, Button, Box, HStack } from "@chakra-ui/react";
import React from "react";

const { ToastContainer, toast } = createStandaloneToast({});

export const CustomToaster = () => <ToastContainer />;

export const toastIsActive = (id: string) => toast.isActive(id);

/**
 * Default toast options
 */
const defaultToastOptions = {
  duration: 3000,
  variant: "left-accent",
  position: "bottom-right" as const,
  isClosable: true,
};

/**
 * Customize default toast options
 * @param options Options to override defaults
 */
export const setDefaultToastOptions = (
  options: Partial<typeof defaultToastOptions>
) => {
  Object.assign(defaultToastOptions, options);
};

/**
 * Create a toast with a custom position
 * @param position The position for the toast
 * @param title The toast title
 * @param description The toast description
 * @param status Toast status
 * @returns The toast ID
 */
export const positionedToast = (
  position:
    | "top"
    | "top-right"
    | "top-left"
    | "bottom"
    | "bottom-right"
    | "bottom-left",
  title: string,
  description: string,
  status: "info" | "warning" | "success" | "error" = "info"
) => {
  return toast({
    title,
    description,
    status,
    duration: defaultToastOptions.duration,
    variant: defaultToastOptions.variant,
    position,
    isClosable: defaultToastOptions.isClosable,
  });
};

/**
 * Creates a loading toast that can be updated based on promise resolution
 * @param loadingTitle The title to show during loading
 * @param loadingDescription The description to show during loading
 * @param promise The promise to track
 * @param options Success and error messages to show when the promise resolves or rejects
 * @returns The toast ID that can be used to update or close the toast
 */
export const loadingToast = <T,>(
  loadingTitle: string,
  loadingDescription: string,
  promise: Promise<T>,
  options: {
    successTitle?: string;
    successDescription?: (result: T) => string;
    errorTitle?: string;
    errorDescription?: (error: any) => string;
  } = {}
) => {
  const toastId = toast({
    title: loadingTitle,
    description: loadingDescription,
    status: "loading",
    duration: null, // Don't auto-close while loading
    variant: "left-accent",
    position: "bottom-right",
    isClosable: true,
  });

  promise
    .then((result) => {
      if (toast.isActive(toastId)) {
        toast.update(toastId, {
          title: options.successTitle || "Success",
          description: options.successDescription
            ? options.successDescription(result)
            : "Operation completed successfully",
          status: "success",
          duration: 3000,
        });
      }
      return result;
    })
    .catch((error) => {
      if (toast.isActive(toastId)) {
        toast.update(toastId, {
          title: options.errorTitle || "Error",
          description: options.errorDescription
            ? options.errorDescription(error)
            : `Operation failed: ${error.message || "Unknown error"}`,
          status: "error",
          duration: 10000,
        });
      }
      throw error;
    });

  return toastId;
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
  errorCount: number = 0
) => {
  if (successCount === count) {
    // All operations successful
    successToast(
      `Batch ${operation} completed`,
      `Successfully ${operation}d ${successCount} ${itemType}`
    );
  } else if (errorCount > 0) {
    // Some operations failed
    warningToast(
      `Batch ${operation} completed with errors`,
      `${successCount} of ${count} ${itemType} ${operation}d successfully, ${errorCount} failed`
    );
  } else {
    // No operations performed
    warningToast(
      `No ${itemType} ${operation}d`,
      `No ${itemType} were available to ${operation}`
    );
  }
};

/**
 * Creates a loading toast for batch operations and updates it when the promise resolves
 * @param operation The operation name (e.g., "delete", "create")
 * @param itemType The type of items being operated on (e.g., "teach points", "sequences")
 * @param totalCount The total number of items to process
 * @param batchPromise Promise that resolves with the results of the batch operation
 * @returns The toast ID
 */
export const batchOperationLoadingToast = <
  T extends { successCount: number; errorCount: number },
>(
  operation: string,
  itemType: string,
  totalCount: number,
  batchPromise: Promise<T>
) => {
  return loadingToast(
    `Processing ${itemType}...`,
    `${operation} ${totalCount} ${itemType}`,
    batchPromise,
    {
      successTitle: `Batch ${operation} completed`,
      successDescription: (result) =>
        `Successfully ${operation}d ${result.successCount} ${itemType}`,
      errorTitle: `Batch ${operation} failed`,
      errorDescription: (error) =>
        `Failed to ${operation} ${itemType}: ${error.message || "Unknown error"}`,
    }
  );
};

/**
 * Creates a toast with a progress bar that can be updated
 * @param title The toast title
 * @param initialProgress Initial progress value (0-100)
 * @returns Object with methods to update or complete the progress toast
 */
export const progressToast = (title: string, initialProgress: number = 0) => {
  const toastId = toast({
    title,
    description: (
      <div>
        <div style={{ marginBottom: "8px" }}>{initialProgress}% complete</div>
        <progress value={initialProgress} max="100" style={{ width: "100%" }} />
      </div>
    ),
    status: "info",
    duration: null,
    variant: "left-accent",
    position: "bottom-right",
    isClosable: true,
  });

  return {
    updateProgress: (progress: number, description?: string) => {
      if (toast.isActive(toastId)) {
        toast.update(toastId, {
          description: (
            <div>
              <div style={{ marginBottom: "8px" }}>
                {description || `${progress}% complete`}
              </div>
              <progress value={progress} max="100" style={{ width: "100%" }} />
            </div>
          ),
        });
      }
    },
    complete: (
      successTitle: string = "Complete",
      successDescription: string = "Operation completed successfully"
    ) => {
      if (toast.isActive(toastId)) {
        toast.update(toastId, {
          title: successTitle,
          description: successDescription,
          status: "success",
          duration: 3000,
        });
      }
    },
    error: (
      errorTitle: string = "Error",
      errorDescription: string = "Operation failed"
    ) => {
      if (toast.isActive(toastId)) {
        toast.update(toastId, {
          title: errorTitle,
          description: errorDescription,
          status: "error",
          duration: 10000,
        });
      }
    },
    close: () => {
      if (toast.isActive(toastId)) {
        toast.close(toastId);
      }
    },
    id: toastId,
  };
};

/**
 * Creates a toast with action buttons
 * @param title The toast title
 * @param description The toast description
 * @param actions Array of action buttons to display
 * @param status Toast status
 * @returns The toast ID
 */
export const actionToast = (
  title: string,
  description: string,
  actions: Array<{
    label: string;
    onClick: () => void;
    colorScheme?: string;
    variant?: string;
  }>,
  status: "info" | "warning" | "success" | "error" = "info"
) => {
  const toastId = toast({
    title,
    description: (
      <Box>
        <div style={{ marginBottom: "12px" }}>{description}</div>
        <HStack spacing={2}>
          {actions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              colorScheme={action.colorScheme || "blue"}
              variant={action.variant || "solid"}
              onClick={() => {
                action.onClick();
                if (toast.isActive(toastId)) {
                  toast.close(toastId);
                }
              }}
            >
              {action.label}
            </Button>
          ))}
        </HStack>
      </Box>
    ),
    status,
    duration: null,
    variant: "left-accent",
    position: "bottom-right",
    isClosable: true,
  });

  return toastId;
};

// Update existing toast functions to use defaultToastOptions
export const successToast = (title: string, description: string) => {
  toast({
    title,
    description,
    status: "success",
    duration: defaultToastOptions.duration,
    variant: defaultToastOptions.variant,
    position: defaultToastOptions.position,
    isClosable: defaultToastOptions.isClosable,
  });
};

export const warningToast = (title: string, description: string) => {
  toast({
    title,
    description,
    status: "warning",
    duration: defaultToastOptions.duration,
    variant: defaultToastOptions.variant,
    position: defaultToastOptions.position,
    isClosable: defaultToastOptions.isClosable,
  });
};

export const errorToast = (title: string, description: string) => {
  toast({
    title,
    description,
    status: "error",
    duration: 10000, // Keep longer duration for errors
    variant: defaultToastOptions.variant,
    position: defaultToastOptions.position,
    isClosable: defaultToastOptions.isClosable,
  });
};

export const infoToast = (title: string, description: string) => {
  toast({
    title,
    description,
    status: "info",
    duration: defaultToastOptions.duration,
    variant: defaultToastOptions.variant,
    position: defaultToastOptions.position,
    isClosable: defaultToastOptions.isClosable,
  });
};
