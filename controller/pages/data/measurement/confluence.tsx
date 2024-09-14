import React from "react";
import { Box } from "@chakra-ui/react";
import ConfluenceData from "@/components/data/ConfluenceData"
import DataSideBar from "@/components/data/DataSideBar";

const Confluence: React.FC = () => {
  return (
    <Box mt={8}>
      <DataSideBar></DataSideBar>
      <Box height='70vw'>
        <ConfluenceData></ConfluenceData>
      </Box>
    </Box>
  );
};

export default Confluence;
