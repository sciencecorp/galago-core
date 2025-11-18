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
import { FaRegListAlt } from "react-icons/fa";
import { PageHeader } from "../ui/PageHeader";
import { Form } from "@/types";
import { CreateFormModal } from "./createFormModal";

export const Forms = () => {
  const { data: fetchedForms, isLoading, refetch, isError } = trpc.form.getAll.useQuery();

  const headerBg = useColorModeValue("white", "gray.700");
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const { data: selectedWorkcellData, refetch: refetchWorkcell } =
    trpc.workcell.getSelectedWorkcell.useQuery();
  const [selectedWorkcell, setSelectedWorkcell] = useState<string | null>(null);

  useEffect(() => {
    if (fetchedForms) {
      setForms(fetchedForms);
    }
  }, [fetchedForms]);

  const handleFormCancel = () => {
    setSelectedForm(null);
  };

  useEffect(() => {
    if (selectedWorkcellData) {
      setSelectedWorkcell(selectedWorkcellData);
    }
  }, [selectedWorkcellData]);

  const stats = useMemo(
    () => ({
      totalForms: forms.length,
      activeFields: selectedForm?.fields?.length || 0,
      selectedFormName: selectedForm?.name || "None",
    }),
    [forms.length, selectedForm?.fields?.length, selectedForm?.name],
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
                titleIcon={<Icon as={FaRegListAlt} boxSize={8} color="teal.500" />}
                mainButton={<CreateFormModal isDisabled={true} />}
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
              isDisabled={!selectedWorkcell}
            />
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
