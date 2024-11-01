// Import this at the top of your Page component file
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import {
  Select,
  Button,
  FormControl,
  FormLabel,
  Box,
  Grid,
  VStack,
  Input,
  NumberInput,
  NumberInputField,
  Heading,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { PF400 } from "@/components/tools/advanced/pf400";
import { ToolConfig } from "gen-interfaces/controller";

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
              <ToolStatusCard toolId={String(id)} />
            </Box>
          </Box>
          <PF400 toolId={id} config={configDefault as ToolConfig} />
        </VStack>
      </>
    );
  }
}
