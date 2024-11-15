import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import {
  Box,
  Spinner,
  Alert,
  Heading,
  VStack,
  useToast,
  IconButton,
  Flex,
  SimpleGrid,
  Switch,
  FormControl,
  FormLabel,
  useColorModeValue,
  HStack,
  Text,
  ButtonGroup,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import styled from "@emotion/styled";
import { NewToolModal } from "./NewToolModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { load } from "@grpc/grpc-js";
import { Tool } from "@/types/api";

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

interface ToolStatusCardsProps {
  showAsGrid?: boolean;
}
export const ToolStatusCardsComponent: React.FC<ToolStatusCardsProps> = (props) => {
  const { showAsGrid } = props;
  const utils = trpc.useContext();
  const toast = useToast();
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery();
  const [toolIds, setToolIds] = useState<string[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    if (fetchedIds) {
      console.log("Tool IDs fetched", fetchedIds);
      setToolIds(fetchedIds);
    }
  }, [fetchedIds]);

  useEffect(() => {
    const handleResize = () => {
      const newVisibleCards = Math.floor(window.innerWidth / 280);
      setVisibleCards(Math.max(1, Math.min(newVisibleCards, 4)));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const configureMutation = trpc.tool.configure.useMutation({
    onError: (data) => {
      toast({
        title: "Failed to connect to instrument",
        description: `${data.message}`,
        status: "error",
        duration: 10000,
        isClosable: true,
        position: "top",
      });
    },
  });

  // if (availableToolsQuery.isLoading) {
  //   return <Spinner size="lg" />;
  // }
  // if (toolIds.isError) {
  //   return <Alert status="error">Could not load tool info</Alert>;
  // }

  const nextSlide = () => {
    if (currentIndex < toolIds.length - visibleCards) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Box>
      <VStack spacing={4}>
        {showAsGrid ? (
          <>
            <PageHeader title="Tools" mainButton={<NewToolModal />} />
            <SimpleGrid columns={[1, 2, 3, 4]} spacing={2}>
              {toolIds.map((toolId, index) => (
                <ToolStatusCard key={`${toolId}-${index}`} toolId={toolId} />
              ))}
            </SimpleGrid>
          </>
        ) : (
          <CarouselContainer>
            <CardsContainer
              style={{
                transform: `translateX(${-currentIndex * 280}px)`,
                width: `${toolIds.length * 280}px`,
              }}>
              {toolIds.map((toolId, index) => (
                <ToolStatusCard key={`${toolId}-${index}`} toolId={toolId} />
              ))}
            </CardsContainer>
            <Flex justify="center" mt={4} width="100%">
              <IconButton
                colorScheme="teal"
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
                isDisabled={currentIndex >= toolIds.length - visibleCards}
              />
            </Flex>
          </CarouselContainer>
        )}
      </VStack>
    </Box>
  );
};
