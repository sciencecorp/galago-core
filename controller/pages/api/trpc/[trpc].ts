import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "../../../server/routers/_app";
import "../../../server/crash-handler";
// ... rest of your imports
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => ({}),
});
