import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  useToast,
  Flex,
  Container,
  VStack,
  useColorModeValue,
  Icon,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { PageHeader } from "../ui/PageHeader";
import { NewWorkcellModal } from "./NewWorkcellModal";
import { trpc } from "@/utils/trpc";
import { Workcell } from "@/types/api";
import { WorkcellCard } from "./WorkcellCard";
import { GiChaingun } from "react-icons/gi";

export const WorkcellComponent = () => {
  const toast = useToast();
  const { data: fetchedWorkcells, refetch } = trpc.workcell.getAll.useQuery();
  const [workcells, setWorkcells] = useState<Workcell[]>([]);
  const { data: selectedWorkcellId } = trpc.workcell.getSelectedWorkcell.useQuery();

  const containerBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (fetchedWorkcells) {
      setWorkcells(fetchedWorkcells);
    }
  }, [fetchedWorkcells]);

  const getActiveWorkcells = () => {
    return workcells.filter((w) => selectedWorkcellId && w.id.toString() === selectedWorkcellId)
      .length;
  };

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Workcells"
                subTitle="Manage and configure your workcells"
                mainButton={<NewWorkcellModal />}
                titleIcon={<Icon as={GiChaingun} boxSize={8} color="teal.500" />}
              />

              <Divider />

              <StatGroup>
                <Stat>
                  <StatLabel>Total Workcells</StatLabel>
                  <StatNumber>{workcells.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Active Workcell</StatLabel>
                  <StatNumber fontSize="lg">{selectedWorkcellId || "None"}</StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={headerBg} shadow="md">
          <CardBody>
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
              spacing={6}
              w="100%"
              alignItems="start">
              {workcells.map((workcell) => (
                <WorkcellCard key={workcell.id} onChange={refetch} workcell={workcell} />
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
