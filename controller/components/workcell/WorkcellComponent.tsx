import React, { useEffect, useState } from "react";
import { Box, Button, useToast, Flex } from "@chakra-ui/react";
import { PageHeader } from "../ui/PageHeader";
import { NewWorkcellModal } from "./NewWorkcellModal";
import { trpc } from "@/utils/trpc";
import { Workcell } from "@/types/api";
import { WorkcellCard } from "./WorkcellCard";

export const WorkcellComponent = () => {
  const toast = useToast();
  const { data: fetchedWorkcells, refetch } = trpc.workcell.getAll.useQuery();
  const [workcells, setWorkcells] = useState<Workcell[]>([]);
  useEffect(() => {
    if (fetchedWorkcells) {
      setWorkcells(fetchedWorkcells);
    }
  }, [fetchedWorkcells]);

  return (
    <Box flex={1}>
      <PageHeader title="Workcell" mainButton={<NewWorkcellModal />} />
      <Flex wrap="wrap" justify="center" gap={4} mt={4} p={2} alignItems="flex-start">
        {workcells &&
          workcells.map((workcell) => (
            <WorkcellCard key={workcell.id} onChange={refetch} workcell={workcell} />
          ))}
      </Flex>
    </Box>
  );
};
