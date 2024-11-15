import React from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Box, VStack, Input } from "@chakra-ui/react";
import { Plate } from "@/types/api";
import { EditableText } from "../ui/Form";
import { DeleteWithConfirmation } from "../ui/Delete";
import { renderDatetime } from "@/components/ui/Time";

interface PlatesTableProps {
  plates: Plate[];
  onUpdate: (plate: Plate) => Promise<void>;
  onDelete: (plate: Plate) => Promise<void>;
}

export const PlatesTable: React.FC<PlatesTableProps> = ({ plates, onUpdate, onDelete }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  if (!plates) {
    return null;
  }
  const filteredPlates = plates.filter((plate) =>
    plate.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} boxShadow="sm">
      <VStack align="stretch" spacing={4}>
        <Input
          placeholder="Search plates"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Barcode</Th>
              <Th>Updated On</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPlates.map((plate) => (
              <Tr key={plate.id}>
                <Td>
                  <EditableText
                    onSubmit={async (value) => {
                      value && (await onUpdate({ ...plate, name: value }));
                    }}
                    defaultValue={plate.name ?? ""}
                  />
                </Td>
                <Td>
                  <EditableText
                    onSubmit={async (value) => {
                      value && (await onUpdate({ ...plate, plate_type: value }));
                    }}
                    defaultValue={plate.plate_type}
                  />
                </Td>
                <Td>{plate.barcode}</Td>
                <Td>{renderDatetime("")}</Td>
                <Td>
                  <DeleteWithConfirmation onDelete={() => onDelete(plate)} label="plate" />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};
