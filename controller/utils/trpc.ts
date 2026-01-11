import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import SuperJSON from "superjson";
import type { AppRouter } from "../server/routers/_app";

function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";

  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;

  // assume localhost
  return `http://127.0.0.1:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx: _ctx }) {
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
