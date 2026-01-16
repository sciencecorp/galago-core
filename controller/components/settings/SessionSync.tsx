import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";

const LAST_ROUTE_KEY = "galago:lastRoute";

const ALLOWED_PREFIXES = [
  "/",
  "/inventory",
  "/runs",
  "/protocols",
  "/scripts",
  "/settings",
  "/tools",
  "/variables",
  "/workcells",
  "/hub",
  "/forms",
  "/labware",
  "/logs",
  "/schedule",
  "/advanced",
];

function pickSetting(settings: Array<{ name: string; value: string }> | undefined, name: string) {
  return settings?.find((s) => s.name === name)?.value;
}

/**
 * Session restore behavior driven by `restore_on_startup`:
 * - "Last Session": restore last route
 * - "New Session": do not restore, but still remember routes going forward
 * - "None": do not restore and do not remember routes
 */
export function SessionSync() {
  const router = useRouter();
  const restoredRef = useRef(false);
  const { data: settings } = trpc.settings.getAll.useQuery();

  const restoreMode = useMemo(() => {
    const v = pickSetting(settings as any, "restore_on_startup") ?? "Last Session";
    return v;
  }, [settings]);

  // Persist last route (unless restore mode is "None")
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!router?.events) return;
    if (restoreMode === "None") return;

    const onDone = (url: string) => {
      try {
        localStorage.setItem(LAST_ROUTE_KEY, url);
      } catch {
        // ignore
      }
    };

    router.events.on("routeChangeComplete", onDone);
    return () => {
      router.events.off("routeChangeComplete", onDone);
    };
  }, [router, restoreMode]);

  // Restore last route once per app load
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!router.isReady) return;
    if (restoredRef.current) return;
    if (!settings) return;

    restoredRef.current = true;

    if (restoreMode === "None") {
      try {
        localStorage.removeItem(LAST_ROUTE_KEY);
      } catch {
        // ignore
      }
      return;
    }

    if (restoreMode === "New Session") {
      // Explicitly skip restore, but keep tracking routes for future sessions.
      return;
    }

    // Last Session
    const last = localStorage.getItem(LAST_ROUTE_KEY);
    if (!last) return;
    if (last === router.asPath) return;
    if (!ALLOWED_PREFIXES.some((p) => last === p || last.startsWith(p + "/"))) return;

    router.replace(last).catch(() => {
      // ignore
    });
  }, [router.isReady, restoreMode, router, settings]);

  return null;
}
