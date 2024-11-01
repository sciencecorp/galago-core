import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { ChangeLogView } from "../../components/data/ChangeLogView";

const ChangeLog: React.FC = () => {
  return (
    <Box>
      <Flex left={0} top={0}>
        <Box flex="1" p={4}></Box>
      </Flex>
      <ChangeLogView />
    </Box>
  );
};

export default ChangeLog;
