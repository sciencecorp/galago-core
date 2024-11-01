import ProtocolCardsComponent from "@/components/protocols/ProtocolCardsComponent";
import ProtocolListComponent from "@/components/protocols/ProtocolListComponent";
import { Protocol } from "gen-interfaces/protocol";
import { trpc } from "@/utils/trpc";

export default function Page() {
  return (
    <>
      <ProtocolCardsComponent />
    </>
  );
}
