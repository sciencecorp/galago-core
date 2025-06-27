import React, { useState, ReactNode, useEffect } from "react";
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
  Text,
} from "@chakra-ui/react";
import { FormsList } from './formsList';
import { trpc } from '@/utils/trpc';
import { MdFormatListBulleted } from "react-icons/md";
import { PageHeader } from '../ui/PageHeader';
import { Form } from '@/types/form';

export const Forms = () => {
    const { data: fetchedForms, isLoading, refetch } = trpc.form.getAll.useQuery();
    const headerBg = useColorModeValue("white", "gray.700");
    const [selectedFormName, setSelectedFormName] = useState<string | null>(null);
    const [forms, setForms] = useState<Form[]>([]);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const formHeight = selectedForm?.size === "small" ? "100px" : selectedForm?.size === "medium" ? "200px" : "300px";
    const formWidth = selectedForm?.size === "small" ? "200px" : selectedForm?.size === "medium" ? "400px" : "600px";

    useEffect(() => {
        if (fetchedForms) {
            setForms(fetchedForms);
        }
    }, [fetchedForms]);

    if (isLoading) {
        return <Center><Spinner/></Center>;
    }
    
    return (
        <Box width="100%">
            <VStack spacing={4} align="stretch">
                <Card bg={headerBg} shadow="md">
                    <CardBody>
                    <VStack spacing={4} align="stretch">
                        <PageHeader
                        title="Forms"
                        subTitle="Create and manage your forms"
                        titleIcon={<Icon as={MdFormatListBulleted} boxSize={8} color="teal.500" />}
                        />
                        <Divider />
                        <StatGroup>
                        <Stat>
                            <StatLabel>Total Forms</StatLabel>
                            <StatNumber>{forms.length}</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Forms in Use</StatLabel>
                            <StatNumber fontSize="lg">{selectedForm?.name || "None"}</StatNumber>
                        </Stat>
                        <Stat>
                            <StatLabel>Selected Form</StatLabel>
                            <StatNumber fontSize="lg">{selectedForm?.name || "None"}</StatNumber>
                        </Stat>
                        </StatGroup>
                    </VStack>
                    </CardBody>
                </Card>
                <HStack>
                    <Box>
                        <FormsList 
                            forms={forms || []} 
                            onSelectForm={(form) => {
                                setSelectedForm(form);
                                setSelectedFormName(form.name);
                            }} 
                        />
                    </Box>
                    <Center 
                        flex="1" 
                        height="100%">
                    <Card 
                        bg={headerBg}
                        maxW={formWidth}
                        height={formHeight}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        flex="1"
                        shadow="lg"
                        >
                        {selectedForm && (
                            <VStack spacing={4} align="stretch">
                                <Text fontWeight="bold">Selected Form:</Text>
                                <Text>{selectedForm.name}</Text>
                            </VStack>
                        )}
                    </Card>
                    </Center>
                </HStack>
            </VStack>
        </Box>
    );
};