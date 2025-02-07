import React, { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  Icon,
  Tooltip,
  useColorModeValue,
  Collapse,
  VStack,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { RiFolderLine } from 'react-icons/ri';
import { SiPython } from 'react-icons/si';
import { Script } from '@/types/api';
import { ContextMenu } from './ContextMenu';

interface FolderNode {
  name: string;
  path: string;
  scripts: Script[];
  subFolders: FolderNode[];
}

interface FolderTreeProps {
  node: FolderNode;
  level: number;
  selectedItem: { type: 'folder' | 'file'; path: string } | null;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onSelectItem: (type: 'folder' | 'file', path: string) => void;
  onNewFolder: (folderName: string) => void;
  onNewScript: (scriptName: string) => void;
  onScriptClick: (name: string) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  node,
  level,
  selectedItem,
  expandedFolders,
  onToggleFolder,
  onSelectItem,
  onNewFolder,
  onNewScript,
  onScriptClick,
}) => {
  const isExpanded = expandedFolders.has(node.path);
  const indent = level * 12;
  const folderIconColor = useColorModeValue("gray.500", "gray.400");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const isSelected = selectedItem?.path === node.path;
  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'file', path: string) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectItem(type, path);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleFileClick = (script: Script) => {
    onScriptClick(script.name);
    onSelectItem('file', script.name);
  };

  return (
    <>
      {node.path !== "/" && (
        <Box position="relative">
          <Button
            width="100%"
            justifyContent="flex-start"
            variant="ghost"
            height="32px"
            pl={`${indent}px`}
            leftIcon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            onClick={() => onToggleFolder(node.path)}
            onContextMenu={(e) => handleContextMenu(e, 'folder', node.path)}
            bg={isSelected ? selectedBg : undefined}
            _hover={{ bg: hoverBg }}
          >
            <Icon as={RiFolderLine} color={folderIconColor} mr={2} />
            <Text fontSize="sm">{node.name}</Text>
          </Button>

          {contextMenu && selectedItem?.type === 'folder' && selectedItem.path === node.path && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
              onNewFolder={onNewFolder}
              onNewScript={onNewScript}
              type="folder"
            />
          )}
        </Box>
      )}

      <Collapse in={isExpanded}>
        <VStack spacing={0} align="stretch">
          {node.scripts.map((script, index) => (
            <Tooltip key={index} label={script.description}>
              <Box position="relative">
                <Button
                  width="100%"
                  justifyContent="flex-start"
                  variant="ghost"
                  height="32px"
                  pl={`${indent + (node.path === "/" ? 0 : 24)}px`}
                  bg={selectedItem?.path === script.name ? selectedBg : undefined}
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleFileClick(script)}
                  onContextMenu={(e) => handleContextMenu(e, 'file', script.name)}
                >
                  <HStack spacing={2}>
                    <SiPython size={14} />
                    <Text fontSize="sm">{script.name}</Text>
                  </HStack>
                </Button>

                {contextMenu && selectedItem?.type === 'file' && selectedItem.path === script.name && (
                  <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onOpen={() => onScriptClick(script.name)}
                    type="file"
                  />
                )}
              </Box>
            </Tooltip>
          ))}
          {node.subFolders.map((subFolder, index) => (
            <FolderTree
              key={index}
              node={subFolder}
              level={level + 1}
              selectedItem={selectedItem}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onSelectItem={onSelectItem}
              onNewFolder={onNewFolder}
              onNewScript={onNewScript}
              onScriptClick={onScriptClick}
            />
          ))}
        </VStack>
      </Collapse>
    </>
  );
}; 