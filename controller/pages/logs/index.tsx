import { useEffect } from "react";
import { LogView } from "@/components/logs/LogView";

export default function Page() {
  useEffect(() => {
    document.title = "Logs";
  }, []);

  return <LogView />;
}
