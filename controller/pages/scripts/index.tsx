import { ToolStatusCardsComponent } from "../../components/tools/ToolStatusCardsComponent";
import {ScriptsEditor} from "../../components/scripts/CodeEditor";
import { useEffect } from "react";

export default function Page() {
    
  useEffect(() => {
    document.title = "Scripts";
  }, []);

  return <ScriptsEditor code= ""/>;
}
