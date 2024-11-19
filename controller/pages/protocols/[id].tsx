import { ProtocolDetailView } from "@/components/protocols/ProtocolDetailView";
import { ProtocolPageComponent } from "@/components/protocols/ProtocolPageComponent";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ProtocolPage() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    document.title = id ? `Protocol ${id}` : "Protocols";
  }, [id]);

  // If no ID is provided, show the protocol list view
  if (!id) {
    return <ProtocolPageComponent />;
  }

  // If ID is provided, show the protocol detail view
  return <ProtocolDetailView id={id as string} />;
}