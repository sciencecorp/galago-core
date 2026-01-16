import "@/styles/globals.css";
import { ChakraProvider, VStack, Box } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import type { AppType } from "next/app";
import Sidebar from "@/components/ui/SideBar";
import { GlobalQueueStatusIndicator } from "@/components/runs/status/GlobalQueueStatusIndicator";
import { TutorialProvider } from "@/components/tutorial/TutorialContext";
import { tutorialSteps } from "@/components/tutorial/tutorialSteps";
import { TutorialModal } from "@/components/tutorial/TutorialModal";
import { useVersionCheck } from "@/hooks/useVersionCheck";
import { ThemeSync } from "@/components/settings/ThemeSync";
import { SessionSync } from "@/components/settings/SessionSync";
import { TelemetrySync } from "@/components/settings/TelemetrySync";
import customTheme from "@/themes/customTheme";

require("log-timestamp");

const VersionChecker = () => {
  const { data: settings } = trpc.settings.getAll.useQuery();
  const autoUpdate =
    settings?.find((s: { name: string; value: string }) => s.name === "auto_update")?.value ??
    "true";
  const enabled = !["false", "0", "no", "off"].includes(String(autoUpdate).trim().toLowerCase());

  useVersionCheck(enabled);
  return null;
};

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider theme={customTheme}>
      <ThemeSync />
      <SessionSync />
      <TelemetrySync />
      <VersionChecker />
      <TutorialProvider steps={tutorialSteps}>
        <Sidebar>
          <Box height="100vh" overflow="auto" display="flex" flexDirection="column">
            <GlobalQueueStatusIndicator />
            <VStack align="stretch" flex="1" overflow="auto" spacing={4} p={4}>
              <Component {...pageProps} />
            </VStack>
          </Box>
        </Sidebar>
        <TutorialModal />
      </TutorialProvider>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);
