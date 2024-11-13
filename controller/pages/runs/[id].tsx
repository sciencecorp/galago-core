import { ProtocolRunComponent } from "@/components/protocols/ProtocolRunComponent";
import { VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const id = String(router.query.id);

  return (
    <VStack p={12} margin="auto" align="start" spacing={16}>
      <ProtocolRunComponent id={id} />
    </VStack>
  );
}
