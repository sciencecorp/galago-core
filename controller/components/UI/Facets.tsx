import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Button,
  Checkbox,
  HStack,
  InputGroup,
  VStack,
  Text,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Box,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import { observer } from "mobx-react";
import { SearchField } from "../UI/form";
import { capitalize } from "../utils";
import { IoFilterSharp } from "react-icons/io5";

export const Facets = observer(
  (props: {
    filters: { variant: string; name: string; keys?: string[] }[];
    setFilters: (obj: Object) => void;
    store: any;
    refresh?: () => void;
    searchFilter?: { name: string; placeHolder: string };
    variant?: "button" | "inline";
    background?: boolean;
    width?: string;
  }) => {
    const {
      filters,
      setFilters,
      store,
      refresh,
      searchFilter,
      variant = "inline",
      background,
      width = "300px",
    } = props;
    const bgColor = useColorModeValue("gray.50", "gray.700");
    const handleFacetChange = (field: string, value: string, checked: boolean) => {
      const updatedFilters = {
        ...store,
        [field]: {
          ...store[field],
          [value]: checked,
        },
      };
      setFilters(updatedFilters);
    };

    const handleSearchFilterChange = (field: string, value: string) => {
      const updatedFilters = {
        ...store,
        [field]: value,
      };
      setFilters(updatedFilters);
    };

    const Facet = useMemo(() => {
      return (
        <VStack bg={bgColor} borderRadius="md" p={4} align="stretch" width={width}>
          {/* Optional search filter */}
          {searchFilter && (
            <InputGroup mb={4}>
              <SearchField
                width="100%"
                name={searchFilter.placeHolder}
                value={store[searchFilter.name] || ""}
                onChange={(e) => {
                  handleSearchFilterChange(searchFilter.name, e.target.value);
                }}
              />
            </InputGroup>
          )}

          <Text fontSize="sm" fontWeight="semibold">
            Filter By:
          </Text>

          <Accordion allowMultiple>
            {filters.map((filter, index) => {
              if (filter.variant === "checkbox" && filter.keys && Array.isArray(filter.keys)) {
                return (
                  <AccordionItem key={`facet-row-${index}`} border="none" mb={2}>
                    <h2>
                      <AccordionButton paddingInline={0} justifyContent="flex-start">
                        <HStack>
                          <Box as="span">
                            <ChevronRightIcon />
                          </Box>
                          <Text
                            textTransform="uppercase"
                            letterSpacing="0.05em"
                            fontWeight="extrabold"
                            whiteSpace="nowrap"
                            fontSize="xs"
                            ml={2}>
                            {filter.name.replaceAll("_", " ")}
                          </Text>
                        </HStack>
                      </AccordionButton>
                    </h2>
                    <AccordionPanel paddingInline={0.5} pt={0} pb={4}>
                      <VStack align="start" mt={3} ml={2} overflowY="auto" maxHeight="250px">
                        {filter.keys
                          .slice()
                          .sort()
                          .map((type, keyIndex) => {
                            const isChecked = store[filter.name]?.[type] === true;
                            return (
                              <HStack key={`${type}-${keyIndex}`} justify="space-between">
                                <Checkbox
                                  isChecked={isChecked}
                                  onChange={(e) => {
                                    handleFacetChange(filter.name, type, e.target.checked);
                                  }}>
                                  {capitalize(type.replace("_", " "))}
                                </Checkbox>
                              </HStack>
                            );
                          })}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                );
              } else if (filter.variant === "button" && filter.keys && Array.isArray(filter.keys)) {
                return (
                  <AccordionItem key={`facet-row-${index}`} border="none" mb={2}>
                    <h2>
                      <AccordionButton paddingInline={0} justifyContent="flex-start">
                        <HStack>
                          <Box as="span">
                            <ChevronRightIcon />
                          </Box>
                          <Text
                            textTransform="uppercase"
                            letterSpacing="0.05em"
                            fontWeight="extrabold"
                            whiteSpace="nowrap"
                            fontSize="xs"
                            ml={2}>
                            {filter.name}
                          </Text>
                        </HStack>
                      </AccordionButton>
                    </h2>
                    <AccordionPanel paddingInline={0.5} pt={0} pb={4}>
                      <VStack align="start" mt={3} ml={2} overflowY="auto" maxHeight="250px">
                        {filter.keys.sort().map((key, keyIndex) => (
                          <Button
                            key={`${key}-${keyIndex}`}
                            size="sm"
                            variant={store[filter.name]?.[key] ? "solid" : "outline"}
                            onClick={() => {
                              const updatedFilters = {
                                ...store,
                                [filter.name]: {
                                  ...store[filter.name],
                                  [key]: !store[filter.name]?.[key],
                                },
                              };
                              setFilters(updatedFilters);
                            }}>
                            {key}
                          </Button>
                        ))}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                );
              } else {
                return <Box></Box>;
              }
            })}
          </Accordion>
        </VStack>
      );
    }, [filters, store, searchFilter, bgColor]);

    return variant === "button" ? (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Button leftIcon={<IoFilterSharp />}>Filters</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverBody>{Facet}</PopoverBody>
        </PopoverContent>
      </Popover>
    ) : (
      Facet
    );
  }
);
