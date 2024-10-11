import { useState, useEffect } from 'react';
import { trpc } from "@/utils/trpc";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { Box, Spinner, Alert, Button, HStack, Heading, VStack, Center, useToast, IconButton, Flex } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import styled from '@emotion/styled';

const CarouselContainer = styled.div`
  display: flex;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: auto;
`;

const CardsContainer = styled.div`
  display: flex;
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
`;

export function ToolStatusCardsComponent() {
  const utils = trpc.useContext();
  const toast = useToast();
  const availableToolsQuery = trpc.tool.availableIDs.useQuery();
  const availableToolIDs = availableToolsQuery.data || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      const newVisibleCards = Math.floor(window.innerWidth / 220);
      setVisibleCards(Math.max(1, Math.min(newVisibleCards, 5)));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const configureMutation = trpc.tool.configure.useMutation({
    onSuccess: () => {
      console.log("connected!!");
    },
    onError: (data) => {
      toast({
        title: "Failed to connect to instrument",
        description: `${data.message}`,
        status: "error",
        duration: 10000,
        isClosable: true,
        position: "top"
      });
    },
  });

  if (availableToolsQuery.isLoading) {
    return <Spinner size="lg" />;
  }
  if (availableToolsQuery.isError) {
    return <Alert status="error">Could not load tool info</Alert>;
  }

  const nextSlide = () => {
    if (currentIndex < availableToolIDs.length - visibleCards) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Box p={2} maxWidth="1200px" margin="auto">
      <VStack spacing={4} >
        <Heading mb={2} css={{ fontFamily: `'Bungee Shade', cursive` }}>
          Tools
        </Heading>
        <CarouselContainer>
          <CardsContainer style={{ 
            transform: `translateX(${-currentIndex * 220}px)`,
            width: `${availableToolIDs.length * 220}px`,
          }}>
            {availableToolIDs.map((toolId, index) => (
              <ToolStatusCard 
                key={`${toolId}-${index}`} 
                toolId={toolId} 
              />
            ))}
          </CardsContainer>
          <Flex justify="center" mt={4} width="100%">
            <IconButton
              aria-label="Previous tool"
              icon={<ChevronLeftIcon />}
              onClick={prevSlide}
              mr={2}
              isDisabled={currentIndex === 0}
            />
            <IconButton
              aria-label="Next tool"
              icon={<ChevronRightIcon />}
              onClick={nextSlide}
              ml={2}
              isDisabled={currentIndex >= availableToolIDs.length - visibleCards}
            />
          </Flex>
        </CarouselContainer>
      </VStack>
    </Box>
  );
}