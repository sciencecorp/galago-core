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
import { AddIcon, DeleteIcon, EditIcon, HamburgerIcon, CheckIcon } from "@chakra-ui/icons";
import { GripParams, GripParametersPanelProps } from "../types";
import { useState, useRef } from "react";
import { useOutsideClick } from "@chakra-ui/react";
import { usePagination } from "../../hooks/usePagination";
import { PaginationControls } from "../common/PaginationControls";

interface EditableParams {
  id: number;
  name: string;
  width: number;
  speed: number;
  force: number;
}



export const GripParametersPanel: React.FC<GripParametersPanelProps> = ({
  params,
  onEdit,
  onInlineEdit,
  onDelete,
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
  const [editingParams, setEditingParams] = useState<EditableParams | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: tableRef,
    handler: () => {
      if (editingParams) {
        setEditingParams(null);
      }
    },
  });

  const handleValueChange = (field: keyof EditableParams, value: number | string) => {
    if (editingParams) {
      setEditingParams({
        ...editingParams,
        [field]: field === 'name' ? value : (isNaN(value as number) ? 0 : value),
      });
    }
  };

  const handleSaveParams = (param: GripParams) => {
    if (editingParams) {
      const updatedParams = {
        ...param,
        name: editingParams.name,
        width: editingParams.width,
        speed: editingParams.speed,
        force: editingParams.force,
      };
      onInlineEdit(updatedParams);
      setEditingParams(null);
    }
  };

  const startEditing = (param: GripParams) => {
    setEditingParams({
      id: param.id!,
      name: param.name,
      width: param.width,
      speed: param.speed,
      force: param.force,
    });
  };

  return (
    <Box height="100%" overflow="hidden">
      <VStack height="100%" spacing={4}>
        <HStack width="100%" justify="space-between">
          <Heading size="md" paddingTop={12}>Grip Parameters</Heading>
          <Button leftIcon={<AddIcon />} size="sm" onClick={onAdd}>
            New Grip Parameters
          </Button>
        </HStack>
        <Box width="100%" flex={1} overflow="hidden">
          <Box ref={tableRef} height="100%" overflow="auto" borderWidth="1px" borderRadius="md">
            <Table variant="simple" size="sm" css={{
              'tr': {
                borderColor: borderColor,
              },
              'th': {
                borderColor: borderColor,
              },
              'td': {
                borderColor: borderColor,
              }
            }}>
              <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
                <Tr>
                  <Th>Default</Th>
                  <Th>Name</Th>
                  <Th>Width</Th>
                  <Th>Speed</Th>
                  <Th>Force</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedItems.map((param) => (
                  <Tr key={param.id} bg={param.id === defaultParamsId ? bgColorAlpha : undefined}>
                    <Td>
                      <Switch
                        isChecked={param.id === defaultParamsId}
                        onChange={() => onSetDefault(param.id ? (param.id === defaultParamsId ? null : param.id) : null)}
                      />
                    </Td>
                    <Td>
                      {editingParams?.id === param.id ? (
                        <Input
                          value={editingParams?.name ?? ''}
                          onChange={(e) => handleValueChange('name', e.target.value)}
                          size="xs"
                          width="120px"
                        />
                      ) : param.name}
                    </Td>
                    {editingParams?.id === param.id ? (
                      <>
                        <Td>
                          <NumberInput
                            value={editingParams?.width ?? 0}
                            onChange={(_, value) => handleValueChange('width', value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={255}
                          >
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingParams?.speed ?? 0}
                            onChange={(_, value) => handleValueChange('speed', value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={255}
                          >
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                        <Td>
                          <NumberInput
                            value={editingParams?.force ?? 0}
                            onChange={(_, value) => handleValueChange('force', value)}
                            step={1}
                            precision={0}
                            size="xs"
                            min={0}
                            max={255}
                          >
                            <NumberInputField width="65px" textAlign="left" />
                          </NumberInput>
                        </Td>
                      </>
                    ) : (
                      <>
                        <Td>{param.width}</Td>
                        <Td>{param.speed}</Td>
                        <Td>{param.force}</Td>
                      </>
                    )}
                    <Td textAlign="right">
                      {editingParams?.id === param.id ? (
                        <Tooltip label="Save parameters">
                          <IconButton
                            aria-label="Save parameters"
                            icon={<CheckIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleSaveParams(param)}
                          />
                        </Tooltip>
                      ) : (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Grip parameter actions"
                            icon={<HamburgerIcon />}
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<EditIcon />}
                              onClick={() => startEditing(param)}
                            >
                              Edit Parameters
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem
                              icon={<DeleteIcon />}
                              onClick={() => onDelete(param.id!)}
                              color="red.500"
                            >
                              Delete Parameters
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
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
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </VStack>
    </Box>
  );
};