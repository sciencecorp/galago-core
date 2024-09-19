import NewProtocolRunModal from "@/components/protocols/NewProtocolRunModal";
import { ProtocolDetailsComponent } from "@/components/protocols/ProtocolDetailsComponent";
import { VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <VStack p={12} margin="auto" align="start" spacing={16}>
      <NewProtocolRunModal id={String(id)} />
    </VStack>
  );
}
