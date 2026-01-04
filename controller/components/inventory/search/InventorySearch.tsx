import React from "react";
import {
  InputGroup,
  Input,
  InputLeftElement,
  InputRightElement,
  Box,
  List,
  ListItem,
  Text,
  Tooltip,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { Plate, Reagent } from "@/types";
import { CloseIcon } from "@/components/ui/Icons";
import { useCommonColors } from "@/components/ui/Theme";

type InventorySearchProps = {
  search: string;
  searchResults: (Plate | Reagent)[];
  isDarkMode: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onPlateSelect: (plate: Plate) => void;
  onReagentSelect: (reagent: Reagent) => void;
};

const InventorySearch: React.FC<InventorySearchProps> = ({
  search,
  searchResults,
  isDarkMode,
  onSearchChange,
  onClearSearch,
  onPlateSelect,
  onReagentSelect,
}) => {
  const { cardBg, hoverBg, alternateBg } = useCommonColors();

  const isPlate = (element: Plate | Reagent): element is Plate => {
    return (element as Plate).plateType !== undefined;
  };

  const isReagent = (element: Plate | Reagent): element is Reagent => {
    return (element as Reagent).volume !== undefined;
  };

  const isNumber = (str: string): boolean => {
    return !Number.isNaN(Number(str));
  };

  return (
    <VStack spacing={2} align="stretch" width="100%">
      <HStack spacing={4} width="100%">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search Inventory"
            value={search}
            onChange={onSearchChange}
          />
          <InputRightElement>
            <CloseIcon cursor="pointer" color="gray.300" onClick={onClearSearch} />
          </InputRightElement>
        </InputGroup>
      </HStack>

      {searchResults.length > 0 && (
        <Box maxH="200px" overflowY="auto" width="100%">
          <List spacing={2}>
            {searchResults.map((result, index) => (
              <ListItem
                key={`${result.id}-${result.name}`}
                bg={
                  isDarkMode
                    ? index % 2 === 0
                      ? cardBg
                      : alternateBg
                    : index % 2 === 0
                      ? cardBg
                      : hoverBg
                }>
                {isPlate(result) && (
                  <Tooltip label="Click to find corresponding plate">
                    <Text onClick={() => onPlateSelect(result)} cursor="pointer">
                      Plate: {result.name} | {result.plateType} | {result.barcode} |{" "}
                      {result.nestId ? "Checked in" : "Not checked in"}
                    </Text>
                  </Tooltip>
                )}
                {isReagent(result) && (
                  <Tooltip label="Click to find corresponding plate">
                    <Text onClick={() => onReagentSelect(result)} cursor="pointer">
                      {isNumber(result.name)
                        ? `Culture: ${result.name} | creation: ${result.expirationDate} | `
                        : `Reagent: ${result.name} | ${result.volume} µL | expiry: ${result.expirationDate} | `}
                      inventory well ID {result.wellId}
                    </Text>
                  </Tooltip>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </VStack>
  );
};

export default InventorySearch;
