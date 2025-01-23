import { useState } from "react";

export interface PaginationConfig {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
}

export const usePagination = <T extends { id?: number }>(
  items: T[],
  defaultItemsPerPage: number = 10,
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Sort items by ID in descending order (newest first)
  const sortedItems = [...items].sort((a, b) => {
    const idA = a.id ?? 0;
    const idB = b.id ?? 0;
    return idB - idA;
  });

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    paginatedItems,
    onPageChange,
    onItemsPerPageChange,
  };
};
