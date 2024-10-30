import "@/styles/globals.css";
import { Box, ChakraProvider, VStack, extendTheme , useColorMode, Button, IconButton} from "@chakra-ui/react";

import { trpc } from "../utils/trpc";
import Nav from "@/components/UI/Nav";
import type { AppType } from "next/app";
import WarningBanner from '@/components/WarningBanner'; 
import { SidebarProvider } from "./SidebarContext";
import customTheme from "@/themes/customTheme";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "@/components/UI/SideBar";

require('log-timestamp')

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Sidebar>
        <Component {...pageProps}/>
      </Sidebar>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);