import { useEffect } from "react";
import { useColorMode } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";

/**
 * Make the DB value (`app_settings.theme`) the source-of-truth for Chakra color mode.
 * This runs once settings are loaded, so it works even if browser storage is cleared.
 */
export function ThemeSync() {
  const { colorMode, setColorMode } = useColorMode();
  const { data: settings } = trpc.settings.getAll.useQuery();

  useEffect(() => {
    if (!settings) return;

    const theme =
      settings.find((s: { name: string; value: string }) => s.name === "theme")?.value ?? "System";

    if (theme === "Light" && colorMode !== "light") setColorMode("light");
    if (theme === "Dark" && colorMode !== "dark") setColorMode("dark");

    if (theme === "System" && typeof window !== "undefined") {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      const target = prefersDark ? "dark" : "light";
      if (colorMode !== target) setColorMode(target);
    }
  }, [settings, colorMode, setColorMode]);

  return null;
}
