// Import this at the top of your Page component file
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { Box, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";

export default function Page() {
  const router = useRouter();
  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;

  const infoQuery = trpc.tool.info.useQuery({ toolId: id || "" });
  const configDefault = infoQuery.data;

  if (configDefault != undefined) {
    return (
      <>
        <VStack spacing={2}>
          <Box padding={4} width="50%">
            <Box display="flex" justifyContent="center" width="100%">
              <ToolStatusCard toolId={id || ""} />
            </Box>
          </Box>
        </VStack>
      </>
    );
  }
}
