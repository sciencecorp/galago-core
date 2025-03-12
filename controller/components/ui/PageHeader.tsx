import React from "react";
import {
  Box,
  HStack,
  Heading,
  ButtonGroup,
  useColorModeValue,
  VStack,
  Text,
  Flex,
} from "@chakra-ui/react";
import { semantic } from "../../themes/colors";

interface PageHeaderProps {
  title: string;
  mainButton?: React.ReactNode;
  subTitle?: string;
  titleIcon?: React.ReactNode;
  secondaryButton?: React.ReactNode;
  tertiaryButton?: React.ReactNode;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = (props) => {
  const { title, mainButton, secondaryButton, tertiaryButton, titleIcon, subTitle, icon } = props;
  return (
    <Box width="100%">
      <Flex justify="space-between" align="center" width="100%">
        <HStack spacing={4}>
          {titleIcon || icon}
          <VStack align="start" spacing={1}>
            <Heading size="lg">{title}</Heading>
            {subTitle && (
              <Text color={semantic.text.secondary.light} fontSize="sm">
                {subTitle}
              </Text>
            )}
          </VStack>
        </HStack>
        <ButtonGroup>
          {mainButton}
          {secondaryButton}
          {tertiaryButton}
        </ButtonGroup>
      </Flex>
    </Box>
  );
};
