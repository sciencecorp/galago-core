import { useEffect } from "react";
import { Settings } from "@/components/settings/Settings";

export default function Page() {
  useEffect(() => {
    document.title = "Settings";
  }, []);

  return <Settings />;
}
