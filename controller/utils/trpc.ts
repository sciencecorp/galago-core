import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import SuperJSON from "superjson";
import type { AppRouter } from "../server/routers/_app";

/**
 * Get the base URL for tRPC requests
 * 
 * tRPC requests should always use relative paths on the client to avoid CORS issues.
 * The browser will automatically use the same origin as the page.
 */
function getBaseUrl() {
  if (typeof window === "undefined") {
    // Server-side rendering
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return `http://127.0.0.1:${process.env.PORT ?? 3010}`;
  }

  // Client-side: Always use relative paths to avoid CORS issues
  // This works for both web mode and Electron (when loaded via http://localhost)
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
