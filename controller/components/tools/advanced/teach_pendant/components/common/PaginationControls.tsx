import { HStack, Button, Text, Select, Box, IconButton } from "@chakra-ui/react";
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowUpSLine,
} from "react-icons/ri";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalPages);
  const total = totalPages;

  return (
    <HStack spacing={4} justify="space-between" w="100%" py={4}>
      <HStack spacing={2}>
        <Text fontSize="sm">Items per page:</Text>
        <Select
          size="sm"
          width="70px"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </Select>
      </HStack>

      <Text fontSize="xs" fontWeight={500} color="gray.600" flexShrink={0} mt={0} px={0}>
        {start}-{end} of {totalItems}
      </Text>

      <HStack spacing={2}>
        <IconButton
          icon={<RiArrowLeftSLine />}
          size="sm"
          aria-label="Previous Page"
          isDisabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        <Text fontSize="sm">Page</Text>
        <Select
          value={currentPage}
          size="sm"
          onChange={(e) => onPageChange(Number(e.target.value))}>
          {[...Array(totalPages).keys()].map((n) => (
            <option key={n} value={n + 1}>
              {n + 1}
            </option>
          ))}
        </Select>
        <IconButton
          icon={<RiArrowRightSLine />}
          size="sm"
          aria-label="Next Page"
          isDisabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </HStack>
    </HStack>
  );
};
