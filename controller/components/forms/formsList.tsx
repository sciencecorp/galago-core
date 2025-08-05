import React, {useState} from "react"; 
import { Box, Flex, Text, Spinner, Center, VStack, Button,
    Input, InputGroup, InputLeftElement, InputRightElement,
    Tooltip
 } from "@chakra-ui/react";
import { Form } from "@/types/form";
import {  CloseIcon } from "@/components/ui/Icons";
import { SearchIcon } from "@chakra-ui/icons";

interface FormsListProps {
    forms: Form[];
    onSelectForm?: (form: Form) => void;
}

export const FormsList: React.FC<FormsListProps> = (props) => {
    const { forms, onSelectForm } = props;
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);

    return (
        <VStack>
                    <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search form..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputRightElement>
            <CloseIcon cursor="pointer" color="gray.300" onClick={() => setSearchQuery("")} />
          </InputRightElement>
        </InputGroup>
            {forms.filter((form) => form.name.toLowerCase().includes(searchQuery.toLowerCase())).map((form) => (
                <Tooltip
                    key={form.id}
                    label={form.description || "No description available"}
                    placement="right"
                    hasArrow
                    >
                <Button 
                    p={6}
                    key={form.id}
                    width="100%"
                    colorScheme={selectedForm?.id === form.id ? "teal" : "gray"}
                    justifyContent="flex-start"
                    onClick={() => {
                        setSelectedForm(form);
                        onSelectForm?.(form);
                    }}
                >
                    <Text fontWeight="bold">{form.name}</Text>
                </Button>
                </Tooltip>
            ))}
        </VStack>
    );
};
