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
import { successToast, errorToast } from '../ui/Toast';


export const Forms = () => {
  const { data: fetchedForms, isLoading, refetch } = trpc.form.getAll.useQuery();
  const { data: fetchedVariables } = trpc.variable?.getAll.useQuery();
  const deleteForm = trpc.form.delete.useMutation();
  
  const headerBg = useColorModeValue("white", "gray.700");
  const [selectedFormName, setSelectedFormName] = useState<string | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const toast = useToast();

  // Memoize the forms update to prevent unnecessary re-renders
  useEffect(() => {
    if (fetchedForms) {
      setForms(fetchedForms);
    }
  }, [fetchedForms]);

  // Use useCallback for event handlers
  const handleFormCancel = useCallback(() => {
    setSelectedForm(null);
    setSelectedFormName(null);
  }, []);

  const handleFormSelect = useCallback((form: Form) => {
    setSelectedForm(form);
    setSelectedFormName(form.name);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle form save
  const handleFormSave = useCallback(() => {
    successToast('Success', 'Form saved successfully');
    refetch(); // Refresh the forms list
  }, [refetch]);

  // Handle form delete
  const handleFormDelete = useCallback(async () => {
    if (!selectedForm) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedForm.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await deleteForm.mutateAsync({ id: selectedForm.id });
      successToast('Success', 'Form deleted successfully');
      handleFormCancel(); // Clear selection
      refetch(); // Refresh the forms list
    } catch (error) {
      console.error('Failed to delete form:', error);
      errorToast('Error', 'Failed to delete form');
    }
  }, [selectedForm, deleteForm, handleFormCancel, refetch]);

  // Memoize computed values
  const stats = useMemo(() => ({
    totalForms: forms.length,
    activeFields: selectedForm?.fields?.length || 0,
    selectedFormName: selectedForm?.name || "None"
  }), [forms.length, selectedForm?.fields?.length, selectedForm?.name]);

  // Memoize the FormBuilder props to prevent unnecessary re-renders
  const formBuilderProps = useMemo(() => {
    if (!selectedForm) return null;
    
    return {
      formId: selectedForm.id,
      initialData: {
        name: selectedForm.name,
        description: selectedForm.description,
        fields: selectedForm.fields || [],
        background_color: selectedForm.background_color,
        background_image: selectedForm.background_image,
        size: selectedForm.size,
        is_locked: selectedForm.is_locked,
      }
    };
  }, [selectedForm]);

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
                mainButton={<CreateFormModal onSuccess={handleCreateSuccess} />}
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Forms</StatLabel>
                  <StatNumber>{stats.totalForms}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Active Fields</StatLabel>
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
        
        <HStack align="stretch" spacing={4}>
          <Box>
            <FormsList
              forms={forms || []}
              onSelectForm={handleFormSelect}
            />
          </Box>

          <Box flex="1" display="flex" alignItems="flex-start" justifyContent="center">
            {!selectedForm ? (
              <EmptyState
                title="No Form Selected"
                description="Please select a form from the list to view or edit."
              />
            ) : (
              <Box>
                {/* The FormBuilder now handles its own card, title, and buttons */}
                {formBuilderProps && (
                  <FormBuilder
                    formId={formBuilderProps.formId}
                    initialData={formBuilderProps.initialData}
                    onSave={handleFormSave}
                    onDelete={handleFormDelete}
                    onCancel={handleFormCancel}
                    cardWidth="800px"
                  />
                )}
              </Box>
            )}
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
};