import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

interface GanttGridLinesProps {
  intervals: number;
}

export const GanttGridLines: React.FC<GanttGridLinesProps> = ({ intervals }) => {
  const borderColorAlpha = useColorModeValue("gray.300", "gray.600");

  const lines = [];
  for (let i = 1; i <= intervals; i++) {
    const left = `${(i / intervals) * 100}%`;
    lines.push(
      <Box
        key={i}
        position="absolute"
        left={left}
        top={0}
        bottom={0}
        width="1px"
        borderLeft="1px dashed"
        borderColor={borderColorAlpha}
        zIndex={1}
      />,
    );
  }
  return <>{lines}</>;
}; 