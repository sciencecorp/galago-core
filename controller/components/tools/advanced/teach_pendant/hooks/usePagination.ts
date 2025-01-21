import { useState } from 'react';

export interface PaginationConfig {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
}

export const usePagination = <T>(items: T[], defaultItemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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