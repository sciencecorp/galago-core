import React, { useState, useEffect } from "react";
import {
  VStack,
  Box,
  HStack,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Switch,
  InputRightElement,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Labware } from "./types";
import { LabwareModal } from "./LabwareModal";
import { DeleteWithConfirmation } from "../ui/Delete";
import { renderDatetime } from "@/components/ui/Time";
import { EditableText } from "../ui/Form";
import { WellPlateIcon } from "../UI/Icons";
import { SearchIcon } from "@chakra-ui/icons";
export const Labware: React.FC = () => {
  const [labware, setLabware] = useState<Labware[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  const { data: fetchedLabware, refetch } = trpc.labware.getAll.useQuery();
  const editLabware = trpc.labware.edit.useMutation();
  const deleteLabware = trpc.labware.delete.useMutation();

  useEffect(() => {
    if (fetchedLabware) {
      setLabware(fetchedLabware);
    }
  }, [fetchedLabware]);

  const handleDelete = async (labware: Labware) => {
    try {
      if (labware.id === undefined) {
        return;
      }
      await deleteLabware.mutateAsync(labware.id);
      refetch();
      toast({
        title: "Labware deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting labware",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredLabware = labware?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleLabwareUpdate = async (editedLabware: Labware) => {
    try {
      await editLabware.mutateAsync(editedLabware);
      refetch();
      toast({
        title: "Labware updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error updating labware",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box flex={1} maxW="100%" overflowX="auto">
      <VStack align="stretch" spacing={6} width="100%" p={4}>
        <HStack mt={2} mb={2} justify="space-between" width="100%">
          <Heading size="lg">Labware</Heading>
          <LabwareModal />
        </HStack>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search labware"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        <Box overflowX="auto" width="100%">
          <Table variant="simple" width="100%" size="sm">
            <Thead>
              <Tr>
                <Th></Th>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Rows</Th>
                <Th>Columns</Th>
                <Th>Z Offset</Th>
                <Th>Width</Th>
                <Th>Height</Th>
                <Th>Plate Lid Offset</Th>
                <Th>Lid Offset</Th>
                <Th>Stack Height</Th>
                <Th>Has Lid</Th>
                <Th>Updated On</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredLabware.map((item) => (
                <Tr key={item.id}>
                  <Td width="50px">
                    <WellPlateIcon rows={item.number_of_rows} columns={item.number_of_columns} />
                  </Td>
                  <Td>
                    <EditableText
                      onSubmit={async (value) => {
                        value && (await handleLabwareUpdate({ ...item, name: value }));
                      }}
                      defaultValue={item.name}
                    />
                  </Td>
                  <Td>
                    <EditableText
                      onSubmit={async (value) => {
                        value && (await handleLabwareUpdate({ ...item, description: value }));
                      }}
                      defaultValue={item.description}
                    />
                  </Td>
                  <Td>
                    <EditableText
                      onSubmit={async (value) => {
                        const numValue = Number(value);
                        !isNaN(numValue) &&
                          (await handleLabwareUpdate({ ...item, number_of_rows: numValue }));
                      }}
                      defaultValue={item.number_of_rows.toString()}
                    />
                  </Td>
                  <Td>
                    <EditableText
                      onSubmit={async (value) => {
                        const numValue = Number(value);
                        !isNaN(numValue) &&
                          (await handleLabwareUpdate({ ...item, number_of_columns: numValue }));
                      }}
                      defaultValue={item.number_of_columns.toString()}
                    />
                  </Td>
                  <Td>
                    <EditableText
                      onSubmit={async (value) => {
                        const numValue = Number(value);
                        !isNaN(numValue) &&
                          (await handleLabwareUpdate({ ...item, z_offset: numValue }));
                      }}
                      defaultValue={item.z_offset.toString()}
                    />
                  </Td>
                  <Td>
                    <EditableText
                      onSubmit={async (value) => {
                        const numValue = Number(value);
                        !isNaN(numValue) &&
                          (await handleLabwareUpdate({ ...item, width: numValue }));
                      }}
                      defaultValue={item.width.toString()}
                    />
                  </Td>
                  <Td>
                    <EditableText
                      onSubmit={async (value) => {
                        const numValue = Number(value);
                        !isNaN(numValue) &&
                          (await handleLabwareUpdate({ ...item, height: numValue }));
                      }}
                      defaultValue={item.height.toString()}
                    />
                  </Td>
                  <Td>
                    <EditableText
                      onSubmit={async (value) => {
                        const numValue = Number(value);
                        !isNaN(numValue) &&
                          (await handleLabwareUpdate({ ...item, plate_lid_offset: numValue }));
                      }}
                      defaultValue={item.plate_lid_offset.toString()}
                    />
                  </Td>
                  <Td>
                    <EditableText
                      onSubmit={async (value) => {
                        const numValue = Number(value);
                        !isNaN(numValue) &&
                          (await handleLabwareUpdate({ ...item, lid_offset: numValue }));
                      }}
                      defaultValue={item.lid_offset.toString()}
                    />
                  </Td>
                  <Td>
                    <EditableText
                      onSubmit={async (value) => {
                        const numValue = Number(value);
                        !isNaN(numValue) &&
                          (await handleLabwareUpdate({ ...item, stack_height: numValue }));
                      }}
                      defaultValue={item.stack_height.toString()}
                    />
                  </Td>
                  <Td>
                    <Switch
                      isChecked={item.has_lid}
                      onChange={async (e) => {
                        await handleLabwareUpdate({ ...item, has_lid: e.target.checked });
                      }}
                    />
                  </Td>
                  <Td>{renderDatetime(item.updated_at ?? "")}</Td>
                  <Td>
                    <DeleteWithConfirmation onDelete={() => handleDelete(item)} label="labware" />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};
