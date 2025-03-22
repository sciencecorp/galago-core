import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  VStack,
  Input,
  useColorModeValue,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { Plate } from "@/types/api";
import { EditableText } from "@/components/ui/Form";
import { DeleteWithConfirmation } from "@/components/ui/Delete";
import { renderDatetime } from "@/components/ui/Time";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

interface PlatesTableProps {
  plates: Plate[];
  onUpdate: (plate: Plate) => Promise<void>;
  onDelete: (plate: Plate) => Promise<void>;
}

export const PlatesTable: React.FC<PlatesTableProps> = ({ plates, onUpdate, onDelete }) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const cardBg = useColorModeValue(semantic.background.card.light, semantic.background.card.dark);
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const hoverBgColor = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );

  if (!plates) {
    return null;
  }
  const filteredPlates = plates.filter((plate) =>
    plate.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth={tokens.borders.widths.thin}
      borderRadius={tokens.borders.radii.lg}
      boxShadow={tokens.shadows.sm}>
      <CardBody>
        <VStack align="stretch" spacing={tokens.spacing.md}>
          <Input
            placeholder="Search plates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderColor={borderColor}
            _focus={{ borderColor: semantic.text.accent.light }}
          />
          <Box overflowX="auto">
            <Table
              variant="simple"
              size="sm"
              sx={{
                th: {
                  borderColor: borderColor,
                  color: textSecondary,
                  fontSize: tokens.typography.fontSizes.sm,
                },
                td: {
                  borderColor: borderColor,
                  color: textColor,
                  fontSize: tokens.typography.fontSizes.sm,
                },
              }}>
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
                  <Tr key={plate.id} _hover={{ bg: hoverBgColor }}>
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
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};
