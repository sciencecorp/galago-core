import "@/styles/globals.css";
import {
  Box,
  ChakraProvider,
  VStack,
  extendTheme,
  useColorMode,
  Button,
  IconButton,
} from "@chakra-ui/react";

import { trpc } from "../utils/trpc";
import Nav from "@/components/ui/Nav";
import type { AppType } from "next/app";
import WarningBanner from "@/components/WarningBanner";
import customTheme from "@/themes/customTheme";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "@/components/ui/SideBar";

require("log-timestamp");

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Sidebar>
        <VStack spacing={0} pt={5} pl={4} align="stretch">
          <Component {...pageProps} />
        </VStack>
      </Sidebar>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);
