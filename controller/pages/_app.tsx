// pages/_app.tsx
import "@/styles/globals.css";
import { ChakraProvider, VStack } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import type { AppType } from "next/app";
import Sidebar from "@/components/ui/SideBar";
import { GlobalQueueStatusIndicator } from "@/components/runs/status/GlobalQueueStatusIndicator";
import { TutorialProvider } from "@/components/tutorial/TutorialContext";
import { TutorialModal } from "@/components/tutorial/TutorialModal";
import { tutorialSteps } from "@/components/tutorial/tutorialSteps";

require("log-timestamp");

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <TutorialProvider steps={tutorialSteps}>
        <Sidebar>
          <GlobalQueueStatusIndicator />
          <VStack spacing={0} pt={5} mt={8} pl={2} align="stretch">
            <Component {...pageProps} />
          </VStack>
        </Sidebar>
        <TutorialModal />
      </TutorialProvider>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);
