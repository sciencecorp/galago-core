import { Variables } from "@/components/variables/Variables";
import { Box } from "@chakra-ui/react";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    document.title = "Variables";
  }, []);

  return (
    <Box mt={20}>
      <Variables />
    </Box>
  );
}
