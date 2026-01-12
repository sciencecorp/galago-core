import { useState, useEffect, useMemo } from "react";
import {
  Box,
  VStack,
  useColorModeValue,
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
import { ClipboardPenLine } from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { Form } from "@/types";
import { CreateFormModal } from "./createFormModal";

export const Forms = () => {
  const { data: fetchedForms, refetch } = trpc.form.getAll.useQuery();

  const headerBg = useColorModeValue("white", "gray.700");
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const { data: selectedWorkcell } = trpc.workcell.getSelectedWorkcell.useQuery();

  useEffect(() => {
    if (fetchedForms) {
      setForms(fetchedForms);
    }
  }, [fetchedForms]);

  const handleFormCancel = () => {
    setSelectedForm(null);
  };

  const stats = useMemo(
    () => ({
      totalForms: forms.length,
      activeFields: selectedForm?.fields?.length || 0,
      selectedFormName: selectedForm?.name || "None",
    }),
    [forms.length, selectedForm?.fields?.length, selectedForm?.name],
  );

  return (
    <Box width="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md" borderRadius="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Forms"
                subTitle="Create and manage your forms"
                titleIcon={<Icon as={ClipboardPenLine} boxSize={8} color="teal.500" />}
                mainButton={<CreateFormModal isDisabled={!selectedWorkcell} />}
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
        {selectedWorkcell && (
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
        )}
      </VStack>
    </Box>
  );
};
