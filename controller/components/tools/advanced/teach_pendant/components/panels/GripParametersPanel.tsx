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
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, HamburgerIcon, CheckIcon } from "@chakra-ui/icons";
import { GripParams } from "../types";
import { useState, useRef } from "react";
import { useOutsideClick } from "@chakra-ui/react";

interface EditableParams {
  id: number;
  width: number;
  speed: number;
  force: number;
}

interface GripParametersPanelProps {
  params: GripParams[];
  onEdit: (params: GripParams) => void;
  onInlineEdit: (params: GripParams) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  bgColor: string;
  bgColorAlpha: string;
  defaultParamsId: number | null;
  onSetDefault: (id: number | null) => void;
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

  const handleValueChange = (field: keyof EditableParams, value: number) => {
    if (editingParams) {
      setEditingParams({
        ...editingParams,
        [field]: isNaN(value) ? 0 : value,
      });
    }
  };

  const handleSaveParams = (param: GripParams) => {
    if (editingParams) {
      const updatedParams = {
        ...param,
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
                {params.map((param) => (
                  <Tr key={param.id} bg={param.id === defaultParamsId ? bgColorAlpha : undefined}>
                    <Td>
                      <Switch
                        isChecked={param.id === defaultParamsId}
                        onChange={() => onSetDefault(param.id ? (param.id === defaultParamsId ? null : param.id) : null)}
                      />
                    </Td>
                    <Td>{param.name}</Td>
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
      </VStack>
    </Box>
  );
};