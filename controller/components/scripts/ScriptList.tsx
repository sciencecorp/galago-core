import React from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { SiPython } from 'react-icons/si';
import { Script } from '@/types/api';

interface ScriptListProps {
  scripts: Script[];
  searchQuery: string;
  onScriptClick: (name: string) => void;
  onScriptDelete: (script: Script) => void;
}

export const ScriptList: React.FC<ScriptListProps> = ({
  scripts,
  searchQuery,
  onScriptClick,
  onScriptDelete,
}) => {
  const hoverBg = useColorModeValue("gray.100", "gray.600");

  return (
    <VStack spacing={0} align="stretch">
      {scripts
        .filter(script => 
          script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          script.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((script, index) => (
          <Tooltip key={index} label={script.description}>
            <Box>
              <Menu>
                <MenuButton
                  as={Button}
                  width="100%"
                  justifyContent="flex-start"
                  variant="ghost"
                  height="32px"
                  _hover={{ bg: hoverBg }}
                >
                  <HStack spacing={2}>
                    <SiPython size={14} />
                    <Text fontSize="sm">{script.name}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {script.folder}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => onScriptClick(script.name)}>Open</MenuItem>
                  <MenuItem onClick={() => onScriptDelete(script)}>Delete</MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </Tooltip>
        ))}
    </VStack>
  );
}; 