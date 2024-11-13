import React from "react";
import {Box, HStack,Heading,ButtonGroup,useColorModeValue} from "@chakra-ui/react";

interface PageHeaderProps {
    title: string;
    mainButton: React.ReactNode;   
    secondaryButton?: React.ReactNode;
}

export const PageHeader : React.FC<PageHeaderProps> = (props) => {
    
    const {title, mainButton, secondaryButton} = props;
    const headerColor = useColorModeValue("teal.800", "white.500");

    return(
        <Box width="100%">
            <HStack mb={2} justify="space-between" width="100%">
                <Box>
                    <Heading mb={2}>
                        {title}
                    </Heading>
                </Box>

                <ButtonGroup>
                    {mainButton}
                    {secondaryButton}
                </ButtonGroup>
            </HStack>
        </Box>
    )

}