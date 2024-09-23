import "@/styles/globals.css";
import { Box, ChakraProvider, VStack, extendTheme , useColorMode, Button, IconButton, Text, HStack} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { trpc } from "../utils/trpc";
import Nav from "@/components/Nav";
import type { AppType } from "next/app";
import WarningBanner from '@/components/WarningBanner'; 
import DataSideBar from "@/components/data/DataSideBar";
import { SidebarProvider } from "./SidebarContext";
import customTheme from "@/themes/customTheme";

require('log-timestamp')

function RenderAppWarning(){
  if(process.env.appMode != "PROD"){
    return <WarningBanner message="Warning you are running this application in DEVELOPMENT mode. " />
  }
}

function DarkModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
      aria-label="Toggle dark mode"
      right={0}
    />
  );
}

function Footer() {
  return (
    <Box 
      as="footer"
      position="fixed" // Fixes the footer at the bottom
      bottom={0}       // Aligns it to the bottom
      width="100%"     // Full width of the screen
      textAlign="center"
      py={4}           // Padding for the footer
      borderTop="1px solid" // Top border
      zIndex={1}       // Ensures it stays above other content
    >
      <HStack>
        <Box width="98%">
          <Text left={10}>© {new Date().getFullYear()} Science Corporation. All rights reserved.</Text>
        </Box>
        <Box width="3%">
          <DarkModeToggle />
        </Box>
      </HStack>
    </Box>
  );
}

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider theme={customTheme}>
      <SidebarProvider>
        <VStack spacing={0} align="center">
          <Nav/>
          <Box maxWidth="1800px" margin="auto" flex="1">
            <Component {...pageProps} />
          </Box>
        </VStack>
        <Footer />

      </SidebarProvider>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);