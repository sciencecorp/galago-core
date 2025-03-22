import React from "react";
import {
  FormControl,
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
  useColorModeValue,
} from "@chakra-ui/react";
import { Plate, Reagent } from "@/types/api";
import { Icon, SearchIcon, CloseIcon } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

type InventorySearchProps = {
  search: string;
  searchResults: (Plate | Reagent)[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onPlateSelect: (plate: Plate) => void;
  onReagentSelect: (reagent: Reagent) => void;
};

const InventorySearch: React.FC<InventorySearchProps> = ({
  search,
  searchResults,
  onSearchChange,
  onClearSearch,
  onPlateSelect,
  onReagentSelect,
}) => {
  const isPlate = (element: Plate | Reagent): element is Plate => {
    return (element as Plate).plate_type !== undefined;
  };

  const isReagent = (element: Plate | Reagent): element is Reagent => {
    return (element as Reagent).volume !== undefined;
  };

  const isNumber = (str: string): boolean => {
    return !Number.isNaN(Number(str));
  };

  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const inputBg = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.primary.dark,
  );
  const evenRowBg = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.secondary.dark,
  );
  const oddRowBg = useColorModeValue(
    semantic.background.secondary.light,
    semantic.background.card.dark,
  );

  return (
    <VStack spacing={tokens.spacing.sm} align="stretch" width="100%">
      <HStack spacing={tokens.spacing.md} width="100%">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={SearchIcon} color={textSecondary} />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search Inventory"
            value={search}
            onChange={onSearchChange}
            borderColor={borderColor}
            bg={inputBg}
            _focus={{ borderColor: semantic.text.accent.light }}
          />
          <InputRightElement>
            <Icon
              as={CloseIcon}
              cursor="pointer"
              color={textSecondary}
              onClick={onClearSearch}
              _hover={{ color: semantic.text.accent.light }}
            />
          </InputRightElement>
        </InputGroup>
      </HStack>

      {searchResults.length > 0 && (
        <Box
          maxH="200px"
          overflowY="auto"
          width="100%"
          borderWidth={tokens.borders.widths.thin}
          borderColor={borderColor}
          borderRadius={tokens.borders.radii.md}>
          <List spacing={tokens.spacing.xs}>
            {searchResults.map((result, index) => (
              <ListItem
                key={`${result.id}-${result.name}`}
                bg={index % 2 === 0 ? evenRowBg : oddRowBg}
                p={tokens.spacing.sm}
                _hover={{
                  bg: useColorModeValue(
                    semantic.background.hover.light,
                    semantic.background.hover.dark,
                  ),
                }}
                borderRadius={tokens.borders.radii.sm}>
                {isPlate(result) && (
                  <Tooltip label="Click to find corresponding plate">
                    <Text
                      onClick={() => onPlateSelect(result)}
                      cursor="pointer"
                      color={textColor}
                      fontSize={tokens.typography.fontSizes.sm}>
                      Plate: {result.name} | {result.plate_type} | {result.barcode} |{" "}
                      {result.nest_id ? "Checked in" : "Not checked in"}
                    </Text>
                  </Tooltip>
                )}
                {isReagent(result) && (
                  <Tooltip label="Click to find corresponding plate">
                    <Text
                      onClick={() => onReagentSelect(result)}
                      cursor="pointer"
                      color={textColor}
                      fontSize={tokens.typography.fontSizes.sm}>
                      {isNumber(result.name)
                        ? `Culture: ${result.name} | creation: ${result.expiration_date} | `
                        : `Reagent: ${result.name} | ${result.volume} µL | expiry: ${result.expiration_date} | `}
                      inventory well ID {result.well_id}
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
