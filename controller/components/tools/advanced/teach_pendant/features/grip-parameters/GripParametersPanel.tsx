import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  Switch,
  Tooltip,
  useColorModeValue,
  VStack,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  NumberInput,
  NumberInputField,
  Input,
} from "@chakra-ui/react";
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  HamburgerIcon,
  CheckIcon,
} from "@chakra-ui/icons";
import { GripParams } from "../../types";
import { useState, useRef } from "react";
import { useOutsideClick } from "@chakra-ui/react";
import { usePagination } from "../../hooks/usePagination";
import { PaginationControls } from "../../shared/ui/PaginationControls";
import { EditableText } from "@/components/ui/Form";
import { GripParametersPanelProps } from "../../types";

export const GripParametersPanel: React.FC<GripParametersPanelProps> = ({
  params,
  onEdit,
  onInlineEdit,
  onDelete,
  onDeleteAll,
  onAdd,
  bgColor,
  bgColorAlpha,
  defaultParamsId,
  onSetDefault,
}) => {
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    onPageChange,
    onItemsPerPageChange,
  } = usePagination(params);

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const tableBgColor = useColorModeValue("white", "gray.800");
  const headerBgColor = useColorModeValue("gray.50", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const tableRef = useRef<HTMLDivElement>(null);

  const handleSaveValue = (
    param: GripParams,
    field: keyof GripParams,
    value: any,
  ) => {
    const updatedParams = { ...param, [field]: value };
    onInlineEdit(updatedParams);
  };

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12} color={textColor}>
            Grip Parameters
          </Heading>
          <HStack>
            <Button
              leftIcon={<DeleteIcon />}
              size="sm"
              onClick={onDeleteAll}
              colorScheme="red"
              variant="outline"
            >
              Delete All
            </Button>
            <Button
              leftIcon={<AddIcon />}
              size="sm"
              onClick={onAdd}
              colorScheme="blue"
            >
              New Grip Parameters
            </Button>
          </HStack>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          <Box
            ref={tableRef}
            height="100%"
            overflow="auto"
            borderWidth="1px"
            borderRadius="md"
            borderColor={borderColor}
            boxShadow={useColorModeValue(
              "0 1px 3px rgba(0, 0, 0, 0.1)",
              "0 1px 3px rgba(0, 0, 0, 0.3)",
            )}
          >
            <Table
              variant="simple"
              size="sm"
              bg={tableBgColor}
              css={{
                tr: {
                  borderColor: borderColor,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: hoverBgColor,
                  },
                },
                th: {
                  borderColor: borderColor,
                  color: textColor,
                },
                td: {
                  borderColor: borderColor,
                  color: textColor,
                },
              }}
            >
              <Thead position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th bg={headerBgColor} color={textColor}>
                    Default
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Name
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Width
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Speed
                  </Th>
                  <Th bg={headerBgColor} color={textColor}>
                    Force
                  </Th>
                  <Th
                    width="120px"
                    minWidth="120px"
                    textAlign="right"
                    bg={headerBgColor}
                    color={textColor}
                  >
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedItems.map((param) => (
                  <Tr
                    key={param.id}
                    bg={param.id === defaultParamsId ? bgColorAlpha : undefined}
                    _hover={{ bg: hoverBgColor }}
                  >
                    <Td>
                      <Switch
                        isChecked={param.id === defaultParamsId}
                        onChange={() =>
                          onSetDefault(
                            param.id
                              ? param.id === defaultParamsId
                                ? null
                                : param.id
                              : null,
                          )
                        }
                      />
                    </Td>
                    <Td>
                      <EditableText
                        defaultValue={param.name}
                        onSubmit={(value) => {
                          value && handleSaveValue(param, "name", value);
                        }}
                      />
                    </Td>
                    <Td>
                      <EditableText
                        defaultValue={(param.width ?? 0).toString()}
                        onSubmit={(value) => {
                          const numValue = Number(value);
                          !isNaN(numValue) &&
                            handleSaveValue(param, "width", numValue);
                        }}
                      />
                    </Td>
                    <Td>
                      <EditableText
                        defaultValue={(param.speed ?? 0).toString()}
                        onSubmit={(value) => {
                          const numValue = Number(value);
                          !isNaN(numValue) &&
                            handleSaveValue(param, "speed", numValue);
                        }}
                      />
                    </Td>
                    <Td>
                      <EditableText
                        defaultValue={(param.force ?? 0).toString()}
                        onSubmit={(value) => {
                          const numValue = Number(value);
                          !isNaN(numValue) &&
                            handleSaveValue(param, "force", numValue);
                        }}
                      />
                    </Td>
                    <Td textAlign="right">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Grip parameter actions"
                          icon={<HamburgerIcon />}
                          variant="outline"
                          size="sm"
                          borderColor={borderColor}
                          minW="32px"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<DeleteIcon />}
                            onClick={() => onDelete(param.id!)}
                            color="red.500"
                          >
                            Delete Parameters
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={params.length}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </VStack>
    </Box>
  );
};
