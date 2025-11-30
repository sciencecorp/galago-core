import React, { useState } from "react";
import {
  Box,
  VStack,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  useColorModeValue,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { Tool } from "@/types/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaRegListAlt } from "react-icons/fa";
import { DeckConfigEditor } from "./DeckConfigEditor";
import { trpc } from "@/utils/trpc";
import { CreateDeckConfigModal } from "./CreateDeckConfigModal";

interface BravoAdvancedProps {
  tool: Tool;
}

export const BravoAdvanced: React.FC<BravoAdvancedProps> = ({ tool }) => {
  const headerBg = useColorModeValue("white", "gray.700");
  const [currentDeckPositions, setCurrentDeckPositions] = useState<any[]>([]);

  const { data: configs, refetch: refetchConfigs } = trpc.bravoDeckConfig.getAll.useQuery();

  return (
    <Box p={6} minH="100vh">
      <VStack spacing={6} align="stretch" maxW="1600px" mx="auto">
        <Card bg={headerBg} shadow="md" borderRadius="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Bravo Advanced Controls"
                subTitle="Agilent Bravo Deck and Sequence Management"
                titleIcon={<Icon as={FaRegListAlt} boxSize={8} color="teal.500" />}
                mainButton={
                  <CreateDeckConfigModal
                    currentDeckPositions={currentDeckPositions}
                    onConfigCreated={() => {
                      refetchConfigs();
                    }}
                  />
                }
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Deck Configs</StatLabel>
                  <StatNumber>{configs?.length || 0}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Total Protocols</StatLabel>
                  <StatNumber>0</StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Tabs colorScheme="teal" variant="enclosed">
              <TabList>
                <Tab>Deck Configurations</Tab>
                <Tab>Protocol Builder</Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <DeckConfigEditor onDeckPositionsChange={setCurrentDeckPositions} />
                </TabPanel>
                <TabPanel>
                  <Box p={8} textAlign="center" color="gray.500">
                    Protocol Builder - Coming Soon
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
