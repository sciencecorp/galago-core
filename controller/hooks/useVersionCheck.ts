import { useEffect, useRef } from "react";
import { warningToast } from "@/components/ui/Toast";

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/sciencecorp/galago-core/main/controller/package.json";
const SESSION_STORAGE_KEY = "galago-version-check-shown";

function isNewerVersion(localVersion: string, remoteVersion: string): boolean {
  const local = localVersion.split(".").map(Number);
  const remote = remoteVersion.split(".").map(Number);

  for (let i = 0; i < Math.max(local.length, remote.length); i++) {
    const l = local[i] || 0;
    const r = remote[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

export function useVersionCheck(enabled: boolean = true) {
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Only run once per component lifecycle
    if (hasChecked.current) return;
    hasChecked.current = true;

    // Check if we've already shown the toast this session
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      return;
    }

    const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;
    if (!currentVersion || currentVersion === "unknown") {
      return;
    }

    // Fetch the latest version from GitHub
    fetch(GITHUB_RAW_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((remotePackage) => {
        const remoteVersion = remotePackage.version;
        if (remoteVersion && isNewerVersion(currentVersion, remoteVersion)) {
          // Mark as shown for this session
          if (typeof window !== "undefined") {
            sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
          }

          warningToast(
            "Update Available",
            `A newer version of Galago (${remoteVersion}) is available  . You are running ${currentVersion}.`,
            "top",
          );
        }
      })
      .catch(() => {
        // Fail silently - don't bother the user if we can't check
      });
  }, [enabled]);
}
