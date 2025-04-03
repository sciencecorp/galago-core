import { batchOperationToast } from "@/components/ui/Toast";

/**
 * Creates a batch operation handler that processes multiple items and provides consolidated error handling and feedback
 *
 * @param singleItemHandler Function that processes a single item
 * @param operationName The name of the operation (e.g., "delete", "update")
 * @param itemTypeName The name of the item type (e.g., "teach points", "sequences")
 * @returns A function that handles batch operations with consolidated error handling and toast feedback
 */
export const createBatchHandler = <T, R>(
  singleItemHandler: (item: T) => Promise<R>,
  operationName: string,
  itemTypeName: string,
) => {
  return async (items: T[]): Promise<{ successCount: number; errorCount: number }> => {
    if (items.length === 0) {
      batchOperationToast(operationName, itemTypeName, 0, 0);
      return { successCount: 0, errorCount: 0 };
    }

    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        await singleItemHandler(item);
        successCount++;
      } catch (error) {
        console.error(`Failed to ${operationName} ${itemTypeName}:`, error);
        errorCount++;
      }
    }

    batchOperationToast(operationName, itemTypeName, items.length, successCount, errorCount);
    return { successCount, errorCount };
  };
};

/**
 * Creates a batch operation handler for items with IDs
 *
 * @param singleItemHandler Function that processes a single item ID
 * @param operationName The name of the operation (e.g., "delete", "update")
 * @param itemTypeName The name of the item type (e.g., "teach points", "sequences")
 * @returns A function that handles batch operations with consolidated error handling and toast feedback
 */
export const createBatchIdHandler = <T extends { id: number | undefined }, R>(
  singleItemHandler: (id: number) => Promise<R>,
  operationName: string,
  itemTypeName: string,
) => {
  return async (items: T[]): Promise<{ successCount: number; errorCount: number }> => {
    // Filter out items without IDs and extract IDs
    const ids = items.map((item) => item.id).filter((id): id is number => id !== undefined);

    if (ids.length === 0) {
      batchOperationToast(operationName, itemTypeName, 0, 0);
      return { successCount: 0, errorCount: 0 };
    }

    let successCount = 0;
    let errorCount = 0;

    for (const id of ids) {
      try {
        await singleItemHandler(id);
        successCount++;
      } catch (error) {
        console.error(`Failed to ${operationName} ${itemTypeName} with ID ${id}:`, error);
        errorCount++;
      }
    }

    batchOperationToast(operationName, itemTypeName, ids.length, successCount, errorCount);
    return { successCount, errorCount };
  };
};

/**
 * Variation of createBatchHandler that works with ID-based operations when only the IDs are available
 */
export const createBatchHandlerForIds = <R>(
  singleIdHandler: (id: number) => Promise<R>,
  operationName: string,
  itemTypeName: string,
) => {
  return async (ids: number[]): Promise<{ successCount: number; errorCount: number }> => {
    if (ids.length === 0) {
      batchOperationToast(operationName, itemTypeName, 0, 0);
      return { successCount: 0, errorCount: 0 };
    }

    let successCount = 0;
    let errorCount = 0;

    for (const id of ids) {
      try {
        await singleIdHandler(id);
        successCount++;
      } catch (error) {
        console.error(`Failed to ${operationName} ${itemTypeName} with ID ${id}:`, error);
        errorCount++;
      }
    }

    batchOperationToast(operationName, itemTypeName, ids.length, successCount, errorCount);
    return { successCount, errorCount };
  };
};
