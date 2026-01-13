import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";

function pickSetting(settings: Array<{ name: string; value: string }> | undefined, name: string) {
  return settings?.find((s) => s.name === name)?.value;
}

function parseBool(v: string | undefined, fallback: boolean) {
  if (v == null) return fallback;
  const s = v.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;
  return fallback;
}

/**
 * Minimal "telemetry" implementation:
 * - metrics: store page views into the local `logs` table
 * - diagnostics: store client errors into the local `logs` table
 */
export function TelemetrySync() {
  const router = useRouter();
  const { data: settings } = trpc.settings.getAll.useQuery();
  const addLog = trpc.logging.add.useMutation();

  const telemetryMetrics = useMemo(() => {
    return parseBool(pickSetting(settings as any, "telemetry_metrics"), true);
  }, [settings]);
  const telemetryDiagnostics = useMemo(() => {
    return parseBool(pickSetting(settings as any, "telemetry_diagnostics"), true);
  }, [settings]);

  const lastPathRef = useRef<string | null>(null);

  // Metrics: page views
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!router?.events) return;
    if (!telemetryMetrics) return;

    const onDone = (url: string) => {
      if (lastPathRef.current === url) return;
      lastPathRef.current = url;
      addLog.mutate({
        level: "info",
        action: "telemetry.page_view",
        details: JSON.stringify({ path: url, ts: new Date().toISOString() }),
      });
    };

    router.events.on("routeChangeComplete", onDone);
    return () => {
      router.events.off("routeChangeComplete", onDone);
    };
  }, [router, telemetryMetrics, addLog]);

  // Diagnostics: client errors
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!telemetryDiagnostics) return;

    const onError = (event: ErrorEvent) => {
      addLog.mutate({
        level: "error",
        action: "telemetry.client_error",
        details: JSON.stringify({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: (event.error as any)?.stack,
          ts: new Date().toISOString(),
        }),
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      addLog.mutate({
        level: "error",
        action: "telemetry.unhandled_rejection",
        details: JSON.stringify({
          reason: String((event as any).reason),
          ts: new Date().toISOString(),
        }),
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [telemetryDiagnostics, addLog]);

  return null;
}
