import "@/styles/globals.css";
import { Box, ChakraProvider, VStack } from "@chakra-ui/react";

import { trpc } from "../utils/trpc";
import Nav from "@/components/ui/Nav";
import type { AppProps } from "next/app";
import Sidebar from "@/components/ui/SideBar";
import { AuthProvider, storeToken } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { SessionProvider, useSession } from "next-auth/react";
import { Session } from "next-auth";
import theme from "../theme";
import { useEffect } from "react";

require("log-timestamp");

// Component to handle session changes and sync tokens
const SessionSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();

  useEffect(() => {
    // When NextAuth session changes, sync token to localStorage
    if (session?.accessToken) {
      storeToken(session.accessToken as string);
    }
  }, [session]);

  return <>{children}</>;
};

interface AppContentProps {
  Component: AppProps["Component"];
  pageProps: any;
}

const AppContent: React.FC<AppContentProps> = ({ Component, pageProps }) => {
  const router = useRouter();
  const { isLoading } = useRouteGuard();

  // Don't show sidebar on login page or auth pages
  const isPublicPage = router.pathname === "/login" || router.pathname.startsWith("/auth/");

  if (isLoading) {
    return null; // Show nothing while loading
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
  };
}

const MyApp = ({ Component, pageProps }: CustomAppProps) => {
  const { session, ...restPageProps } = pageProps;

  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <ChakraProvider theme={theme}>
          <SessionSync>
            <AppContent Component={Component} pageProps={restPageProps} />
          </SessionSync>
        </ChakraProvider>
      </AuthProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
