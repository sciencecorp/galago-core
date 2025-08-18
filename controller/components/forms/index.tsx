import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
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
  useToast,
} from "@chakra-ui/react";
import { FormsList } from './formsList';
import { FormBuilder } from './formBuilder';
import { trpc } from '@/utils/trpc';
import { MdFormatListBulleted } from "react-icons/md";
import { PageHeader } from '../ui/PageHeader';
import { Form } from "@/types";
import { EmptyState } from "../ui/EmptyState";
import { CreateFormModal } from "./createFormModal";

export const Forms = () => {
  const { data: fetchedForms, isLoading, refetch } = trpc.form.getAll.useQuery();
  
  const headerBg = useColorModeValue("white", "gray.700");
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  useEffect(() => {
    if (fetchedForms) {
      setForms(fetchedForms);
    }
  }, [fetchedForms]);

  const handleFormCancel = () => {
    setSelectedForm(null);
  };
 
  const stats = useMemo(() => ({
    totalForms: forms.length,
    activeFields: selectedForm?.fields?.length || 0,
    selectedFormName: selectedForm?.name || "None"
  }), [forms.length, selectedForm?.fields?.length, selectedForm?.name]);


  if (isLoading) {
    return <Center><Spinner/></Center>;
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
                titleIcon={<Icon as={MdFormatListBulleted} boxSize={8} color="teal.500" />}
                mainButton={<CreateFormModal/>}
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
              <VStack spacing={4}>
                  <FormBuilder
                    forms={forms}
                    onCancel={handleFormCancel}
                    onUpdate={refetch}
                  />
              </VStack>
      </VStack>
    </Box>
  );
};
