import { HStack, Button, Text, Select, Box } from "@chakra-ui/react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
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

      <HStack spacing={2}>
        <Button size="sm" onClick={() => onPageChange(1)} isDisabled={currentPage === 1}>
          First
        </Button>
        <Button
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}>
          Previous
        </Button>

        <Box px={2}>
          <Text fontSize="sm">
            Page {currentPage} of {totalPages}
          </Text>
        </Box>

        <Button
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}>
          Next
        </Button>
        <Button
          size="sm"
          onClick={() => onPageChange(totalPages)}
          isDisabled={currentPage === totalPages}>
          Last
        </Button>
      </HStack>
    </HStack>
  );
};
