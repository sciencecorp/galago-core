import { useEffect } from "react";
import { ToolStatusCardsComponent } from "../../components/tools/ToolStatusCardsComponent";

export default function Page() {
  
  useEffect(() => {
    document.title = "Tools";
  }, []);

  return <ToolStatusCardsComponent showAsGrid />;
}
