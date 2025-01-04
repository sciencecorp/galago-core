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
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { GripParams } from "../types";

interface GripParametersPanelProps {
  params: GripParams[];
  onEdit: (params: GripParams) => void;
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
  onDelete,
  onAdd,
  bgColor,
  bgColorAlpha,
  defaultParamsId,
  onSetDefault,
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");

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
          <Box height="100%" overflow="auto" borderWidth="1px" borderRadius="md">
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
                    <Td>{param.width}</Td>
                    <Td>{param.speed}</Td>
                    <Td>{param.force}</Td>
                    <Td textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <Tooltip label="Edit parameters">
                          <IconButton
                            aria-label="Edit parameters"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => onEdit(param)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete parameters">
                          <IconButton
                            aria-label="Delete parameters"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => onDelete(param.id!)}
                          />
                        </Tooltip>
                      </HStack>
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