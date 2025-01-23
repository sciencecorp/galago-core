import { VStack, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { TeachPointsPanel } from "./TeachPointsPanel";
import { MotionProfilesPanel } from "./MotionProfilesPanel";
import { GripParametersPanel } from "./GripParametersPanel";
import { SequencesPanel } from "./SequencesPanel";
import { TeachPoint } from "../types";

interface DataPanelProps {
  locations: any[];
  motionProfiles: any[];
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
}

export const DataPanel: React.FC<DataPanelProps> = ({
  locations,
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
}) => {
  return (
    <VStack width="100%" spacing={4}>
      <Tabs variant="enclosed" width="100%">
        <TabList>
          <Tab>Teach Points</Tab>
          <Tab>Motion Profiles</Tab>
          <Tab>Grip Parameters</Tab>
          <Tab>Sequences</Tab>
        </TabList>

        <TabPanels>
          <TabPanel padding={0}>
            <TeachPointsPanel
              teachPoints={locations}
              motionProfiles={motionProfiles}
              gripParams={gripParams}
              sequences={sequences}
              expandedRows={expandedRows}
              toggleRow={toggleRow}
              onImport={onImport}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              bgColor={bgColor}
              bgColorAlpha={bgColorAlpha}
            />
          </TabPanel>
          {/* Keep other tab panels */}
        </TabPanels>
      </Tabs>
    </VStack>
  );
};
