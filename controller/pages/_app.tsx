import "@/styles/globals.css";
import { ChakraProvider, VStack } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import type { AppType } from "next/app";
import Sidebar from "@/components/ui/SideBar";
import { GlobalQueueStatusIndicator } from "@/components/runs/status/GlobalQueueStatusIndicator";
import { TutorialProvider } from "@/components/tutorial/TutorialContext";
import { tutorialSteps } from "@/components/tutorial/tutorialSteps";
import { TutorialModal } from "@/components/tutorial/TutorialModal";

require("log-timestamp");

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <TutorialProvider steps={tutorialSteps}>
        <Sidebar>
          <GlobalQueueStatusIndicator />
          <VStack align="stretch" flex="1" spacing={4} p={0}>
            <Component {...pageProps} />
          </VStack>
        </Sidebar>
        <TutorialModal />
      </TutorialProvider>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);
