import { Card, CardHeader, CardBody, HStack, Heading, Table, Thead, Tbody, Tr, Th, Td, IconButton } from "@chakra-ui/react";
import { TeachPoint, MotionProfile } from "../types";
import { TeachPointRow } from "../TeachPointRow";
import { AddIcon } from "@chakra-ui/icons";

interface TeachPointsPanelProps {
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: any[];
  sequences: any[];
  expandedRows: Set<number>;
  toggleRow: (id: number) => void;
  onImport: (data: any) => Promise<void>;
  onMove: (point: TeachPoint) => void;
  onEdit: (point: TeachPoint) => void;
  onDelete: (point: TeachPoint) => void;
  onAdd: () => void;
  bgColor: string;
  bgColorAlpha: string;
  searchTerm?: string;
}

export const TeachPointsPanel: React.FC<TeachPointsPanelProps> = ({
  teachPoints,
  motionProfiles,
  gripParams,
  sequences,
  expandedRows,
  toggleRow,
  onImport,
  onMove,
  onEdit,
  onDelete,
  onAdd,
  bgColor,
  bgColorAlpha,
  searchTerm = "",
}) => {
  const filteredPoints = teachPoints.filter(point => 
    point.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card width="100%" flex="1" bg={bgColor} borderColor={bgColorAlpha}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Teach Points</Heading>
          <IconButton
            aria-label="Add teach point"
            icon={<AddIcon />}
            onClick={onAdd}
            colorScheme="blue"
            variant="ghost"
            size="sm"
          />
        </HStack>
      </CardHeader>
      <CardBody overflowY="auto" maxHeight="calc(100vh - 700px)" minHeight="550px">
        <Table variant="simple">
          <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
            <Tr>
              <Th width="40px"></Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPoints.map((point) => (
              <TeachPointRow
                key={point.id}
                point={point}
                isExpanded={expandedRows.has(point.id)}
                onToggle={() => toggleRow(point.id)}
                onMove={onMove}
                onEdit={onEdit}
                onDelete={onDelete}
                bgColorAlpha={bgColorAlpha}
              />
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};