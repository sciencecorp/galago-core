import { WorkcellComponent } from "@/components/workcell/WorkcellComponent";

import { Box } from "@chakra-ui/react";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    document.title = "Workcell";
  }, []);

  return (
    <Box>
      <WorkcellComponent />
    </Box>
  );
}
