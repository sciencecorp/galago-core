import "@/styles/globals.css";
import { ChakraProvider, VStack, Box } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import type { AppType } from "next/app";
import Sidebar from "@/components/ui/SideBar";
import { GlobalQueueStatusIndicator } from "@/components/runs/status/GlobalQueueStatusIndicator";
require("log-timestamp");

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Sidebar>
        <Box height="100vh" overflow="auto" display="flex" flexDirection="column">
          <GlobalQueueStatusIndicator />
          <VStack align="stretch" flex="1" overflow="auto" spacing={4} p={4}>
            <Component {...pageProps} />
          </VStack>
        </Box>
      </Sidebar>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);
