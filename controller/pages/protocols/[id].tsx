import { ProtocolDesigner } from "@/components/protocols/ProtocolDesigner";
import { ProtocolPageComponent } from "@/components/protocols/ProtocolPageComponent";
import { useRouter } from "next/router";
import { Box } from "@chakra-ui/react";

export default function ProtocolPage() {
  const router = useRouter();
  const { id } = router.query;

  // Add loading state for id
  if (!id || Array.isArray(id)) {
    return <ProtocolPageComponent />;
  }

  return (
    <Box display="flex" flexDirection="column" width="100%" height="100%">
      <ProtocolDesigner id={id} />
    </Box>
  );
}