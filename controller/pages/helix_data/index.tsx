import React from "react";
import { Box } from "@chakra-ui/react";
import UploadData from "@/components/helix_data/UploadData";

const DataPage: React.FC = () => {
  return (
    <Box mt={8}>
      <UploadData />
    </Box>
  );
};

export default DataPage;
