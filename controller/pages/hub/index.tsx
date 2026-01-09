import { HubComponent } from "@/components/hub/HubComponent";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    document.title = "Galago Hub";
  }, []);

  return <HubComponent />;
}
