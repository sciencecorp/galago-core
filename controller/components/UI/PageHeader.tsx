import React from "react";
import { Box, HStack, Heading, ButtonGroup, useColorModeValue } from "@chakra-ui/react";

interface PageHeaderProps {
  title: string;
  mainButton: React.ReactNode;
  titleIcon?: React.ReactNode;
  secondaryButton?: React.ReactNode;
  tertiaryButton?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = (props) => {
  const { title, mainButton, secondaryButton,tertiaryButton, titleIcon} = props;
  return (
    <Box width="100%">
      <HStack mb={2} justify="space-between" width="100%">
        <Box>
          <HStack>
            <Heading mb={2}>{title}</Heading>
            {titleIcon}
          </HStack>
        </Box>
        <ButtonGroup>
          {mainButton}
          {secondaryButton}
          {tertiaryButton}
        </ButtonGroup>
      </HStack>
    </Box>
  );
};
