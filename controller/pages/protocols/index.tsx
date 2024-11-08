import ProtocolCardsComponent from "@/components/protocols/ProtocolCardsComponent";
import ProtocolListComponent from "@/components/protocols/ProtocolListComponent";
import { Protocol } from "gen-interfaces/protocol";
import { trpc } from "@/utils/trpc";
import { useEffect } from "react";

export default function Page() {
  
  useEffect(() => {
    document.title = "Protocols";
  }, []);

  return (
    <>
      <ProtocolCardsComponent />
    </>
  );
}
