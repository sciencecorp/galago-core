import { useEffect } from "react";
import { ToolStatusCardsComponent } from "../../components/tools/ToolsComponent";

export default function Page() {
  useEffect(() => {
    document.title = "Tools";
  }, []);

  return <ToolStatusCardsComponent showAsGrid />;
}
