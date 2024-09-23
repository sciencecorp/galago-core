import "@/styles/globals.css";
import { Box, ChakraProvider, VStack, extendTheme , useColorMode,useColorModeValue, Button, IconButton, Text, HStack} from "@chakra-ui/react";
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
  const bgColor = useColorModeValue("#F9F9F9", "gray.700");
  return (
    <Box 
      as="footer"
      position="fixed" 
      bottom={0}      
      width="100%"  
      textAlign="center"
      py={4}      
      borderTop="1px solid" 
      zIndex={1}
      bg={bgColor}
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
        <VStack spacing={0} align="center" minHeight="100vh">
          <Nav/>
          <Box 
            as="main"
            maxWidth="1800px"
            margin="auto" 
            paddingBottom="80px" 
            flex="1">
            <Component {...pageProps} />
          </Box>
        </VStack>
        <Footer />

      </SidebarProvider>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);