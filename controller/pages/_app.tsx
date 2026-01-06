// pages/_app.tsx
import "@/styles/globals.css";
import { ChakraProvider, VStack } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import type { AppType } from "next/app";
import Sidebar from "@/components/ui/SideBar";
import { GlobalQueueStatusIndicator } from "@/components/runs/status/GlobalQueueStatusIndicator";

require("log-timestamp");

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Sidebar>
        <GlobalQueueStatusIndicator />
        <VStack align="stretch">
          <Component {...pageProps} />
        </VStack>
      </Sidebar>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);
