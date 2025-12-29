import "@/styles/globals.css";
import { ChakraProvider, VStack } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import type { AppType } from "next/app";
import Sidebar from "@/components/ui/SideBar";
import { GlobalQueueStatusIndicator } from "@/components/runs/status/GlobalQueueStatusIndicator";

require("log-timestamp");

// Run database setup SYNCHRONOUSLY on server startup
if (typeof window === "undefined") {
  const { execSync } = require("child_process");
  const fs = require("fs");
  const path = require("path");

  console.log("🚀 Initializing database...");

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("📁 Created data directory");
  }

  try {
    console.log("🔄 Syncing database schema...");
    // Run synchronously to block until complete
    execSync("npx drizzle-kit push", {
      env: { ...process.env, DRIZZLE_KIT_ACCEPT_ALL: "1" },
      stdio: "inherit", // Show drizzle-kit output
    });
    console.log("✅ Database schema synced");
  } catch (error) {
    console.error("❌ Database sync failed:", error);
  }
}

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider>
      <Sidebar>
        <GlobalQueueStatusIndicator />
        <VStack spacing={0} pt={5} mt={8} pl={2} align="stretch">
          <Component {...pageProps} />
        </VStack>
      </Sidebar>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);
