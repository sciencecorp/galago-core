import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import SuperJSON from "superjson";
import type { AppRouter } from "../server/routers/_app";

/**
 * Get the base URL for tRPC requests
 * 
 * For Electron production mode (file:// protocol), we need absolute URLs.
 * For web mode, relative paths work fine.
 */
function getBaseUrl() {
  if (typeof window === "undefined") {
    // Server-side rendering
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return `http://127.0.0.1:${process.env.PORT ?? 3010}`;
  }

  // Check if we're in Electron production mode (file:// protocol)
  if (window.location.protocol === "file:") {
    // Get API port from URL query params or use default
    const urlParams = new URLSearchParams(window.location.search);
    const apiPort = urlParams.get("apiPort") || "8000";
    return `http://127.0.0.1:${apiPort}`;
  }

  // Client-side web mode: Use relative paths to avoid CORS issues
  return "";
}

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      transformer: SuperJSON,
    };
  },
  ssr: false,
});
