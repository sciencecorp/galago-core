import React from "react";
import { Box , Flex} from "@chakra-ui/react";
import UploadCytationData from "@/components/data/UploadCytationData";
import DataSideBar from "@/components/data/DataSideBar";

const DataPage: React.FC = () => {
  return (
    <Box>
      <Flex left={0} top={0}>
          <DataSideBar/>
          <Box flex="1" p={4}>
          </Box>
      </Flex>
      <UploadCytationData />
    </Box>
  );
};

export default DataPage;
