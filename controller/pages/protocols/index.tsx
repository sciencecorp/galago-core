import { ProtocolPageComponent } from "@/components/protocols/ProtocolPageComponent";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    document.title = "Protocols";
  }, []);

  return (
    <>
      <ProtocolPageComponent />
    </>
  );
}
