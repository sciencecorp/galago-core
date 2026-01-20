import { RunsComponent } from "@/components/runs/RunsComponent";
import { Box } from "@chakra-ui/react";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    document.title = "Runs";
  }, []);

  return (
    <Box maxW="100%">
      <RunsComponent />
    </Box>
  );
}
