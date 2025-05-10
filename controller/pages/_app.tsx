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
import type { AppProps } from "next/app";
import WarningBanner from "@/components/WarningBanner";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "@/components/ui/SideBar";
import { AuthProvider } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

require("log-timestamp");

interface AppContentProps {
  Component: AppProps['Component'];
  pageProps: any;
}

const AppContent: React.FC<AppContentProps> = ({ Component, pageProps }) => {
  const router = useRouter();
  const { isLoading } = useRouteGuard();
  
  // Don't show sidebar on login page or auth pages
  const isPublicPage = router.pathname === "/login" || router.pathname.startsWith("/auth/");

  if (isLoading) {
    // You could add a loading spinner here
    return <Box p={8}>Loading...</Box>;
  }

  return isPublicPage ? (
    <Component {...pageProps} />
  ) : (
    <Sidebar>
      <VStack spacing={0} pt={5} pl={4} align="stretch">
        <Component {...pageProps} />
      </VStack>
    </Sidebar>
  );
};

interface CustomAppProps extends AppProps {
  pageProps: {
    session?: Session | null;
    [key: string]: any;
  }
}

const MyApp = ({ Component, pageProps }: CustomAppProps) => {
  const { session, ...restPageProps } = pageProps;
  
  return (
    <SessionProvider session={session}>
      <ChakraProvider>
        <AuthProvider>
          <AppContent Component={Component} pageProps={restPageProps} />
        </AuthProvider>
      </ChakraProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
