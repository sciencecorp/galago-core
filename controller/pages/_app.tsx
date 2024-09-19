import "@/styles/globals.css";
import { Box, ChakraProvider, VStack, extendTheme , useColorMode, Button, IconButton} from "@chakra-ui/react";
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
      position="fixed"
      bottom="20px"
      right="20px"
    />
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
          <DarkModeToggle />
        </VStack>
        
      </SidebarProvider>
      
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);