import { ProtocolDetailView } from "@/components/protocols/ProtocolDetailView";
import { ProtocolPageComponent } from "@/components/protocols/ProtocolPageComponent";
import { useRouter } from "next/router";

export default function ProtocolPage() {
  const router = useRouter();
  const { id } = router.query;

  // Add loading state for id
  if (!id || Array.isArray(id)) {
    return <ProtocolPageComponent />;
  }

  return (
    <div>
      <ProtocolDetailView id={Number(id)} />
    </div>
  );
}
