import React from "react";
import {
  Box,
  HStack,
  Heading,
  ButtonGroup,
  useColorModeValue,
  VStack,
  Text,
} from "@chakra-ui/react";

interface PageHeaderProps {
  title: string;
  mainButton: React.ReactNode;
  subTitle?: string;
  titleIcon?: React.ReactNode;
  secondaryButton?: React.ReactNode;
  tertiaryButton?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = (props) => {
  const { title, mainButton, secondaryButton, tertiaryButton, titleIcon, subTitle } = props;
  return (
    <Box width="100%">
      <HStack mb={2} justify="space-between" width="100%">
        <Box>
          <HStack>
            <VStack align="flex-start">
              <HStack>
                <Heading mb={0}>{title}</Heading>
                {titleIcon}
              </HStack>
              <Heading size="sm">{subTitle}</Heading>
            </VStack>
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
