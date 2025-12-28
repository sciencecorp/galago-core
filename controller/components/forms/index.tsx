import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  VStack,
  useColorModeValue,
  Center,
  Spinner,
  Icon,
  Card,
  CardBody,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { FormBuilder } from "./formBuilder";
import { trpc } from "@/utils/trpc";
import { List } from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { Form } from "@/types";
import { CreateFormModal } from "./createFormModal";

export const Forms = () => {
  const { data: forms, isLoading, refetch } = trpc.form.getAll.useQuery();

  const headerBg = useColorModeValue("white", "gray.700");
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const handleFormCancel = () => {
    setSelectedForm(null);
  };

  const stats = useMemo(
    () => ({
      totalForms: forms?.length || 0,
      activeFields: selectedForm?.fields?.length || 0,
      selectedFormName: selectedForm?.name || "None",
    }),
    [forms?.length, selectedForm?.fields?.length, selectedForm?.name],
  );

  if (isLoading) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  return (
    <Box width="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md" borderRadius="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Forms"
                subTitle="Create and manage your forms"
                titleIcon={<Icon as={List} boxSize={8} color="teal.500" />}
                mainButton={<CreateFormModal />}
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Forms</StatLabel>
                  <StatNumber>{stats.totalForms}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Number of Fields</StatLabel>
                  <StatNumber>{stats.activeFields}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Selected Form</StatLabel>
                  <StatNumber fontSize="lg">{stats.selectedFormName}</StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>
        <Card bg={headerBg} shadow="md" borderRadius="lg">
          <CardBody>
            <FormBuilder
              forms={forms}
              onCancel={handleFormCancel}
              onUpdate={refetch}
              onSelectForm={setSelectedForm}
            />
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
