import React from "react"; 
import { Box, Flex, Text } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";


export const FormsCarousel: React.FC = () => {
    const { data: forms, isLoading } = trpc.form.getAll.useQuery();

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!forms || forms.length === 0) {
        return <Text>No forms available</Text>;
    }

    return (
        <Flex overflowX="auto" p={4} gap={4}>
            {forms.map((form) => (
                <Box
                    key={form.id}
                    minWidth="200px"
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="md"
                >
                    <Text fontWeight="bold">{form.name}</Text>
                    <Text>{form.description}</Text>
                </Box>
            ))}
        </Flex>
    );
};

export default FormsCarousel;