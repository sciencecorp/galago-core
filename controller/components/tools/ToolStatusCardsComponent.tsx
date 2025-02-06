import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { Box, IconButton, Flex, SimpleGrid, VStack, useToast } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { NewToolModal } from "./NewToolModal";
import { PageHeader } from "@/components/ui/PageHeader";
import styled from "@emotion/styled";

export const ToolStatusCardsComponent: React.FC = () => {
  const { data: fetchedIds } = trpc.tool.availableIDs.useQuery();
  const [toolIds, setToolIds] = useState<string[]>([]);
  const { data: selectedWorkcellData } = trpc.workcell.getSelectedWorkcell.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [selectedWorkcell, setSelectedWorkcell] = useState<string | null>(null);

  useEffect(() => {
    if (fetchedIds) setToolIds(fetchedIds);
  }, [fetchedIds]);

  useEffect(() => {
    if (selectedWorkcellData) setSelectedWorkcell(selectedWorkcellData);
  }, [selectedWorkcellData]);

  useEffect(() => {
    const handleResize = () => {
      const newVisibleCards = Math.floor(window.innerWidth / 280);
      setVisibleCards(Math.max(1, Math.min(newVisibleCards, 4)));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <Box flex={1}>
      <PageHeader title="Tools" mainButton={<NewToolModal isDisabled={!selectedWorkcell} />} />
      <Flex wrap="wrap" justify="center" gap={2} mt={4} alignItems="flex-start">
        {toolIds.map((toolId, index) => (
          <ToolStatusCard key={`${toolId}-${index}`} toolId={toolId} />
        ))}
      </Flex>
    </Box>
  );
};
