import React, { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Tooltip,
  IconButton,
  Spacer,
  useColorModeValue,
} from '@chakra-ui/react';
import { RiFolderLine, RiFolderAddLine, RiFileAddLine, RiSearchLine } from 'react-icons/ri';
import { Script } from '@/types/api';
import { FolderTree } from './FolderTree';
import { ScriptList } from './ScriptList';

interface ExplorerProps {
  scripts: Script[];
  selectedItem: { type: 'folder' | 'file'; path: string } | null;
  expandedFolders: Set<string>;
  folderTree: any; // Using any for now, should use FolderNode type
  onToggleFolder: (path: string) => void;
  onSelectItem: (type: 'folder' | 'file', path: string) => void;
  onNewFolder: (folderName: string) => void;
  onNewScript: (scriptName: string) => void;
  onScriptClick: (name: string) => void;
  onScriptDelete: (script: Script) => void;
  activeTab?: 'explorer' | 'search';
  onTabChange?: (tab: 'explorer' | 'search') => void;
}

export const Explorer: React.FC<ExplorerProps> = ({
  scripts,
  selectedItem,
  expandedFolders,
  folderTree,
  onToggleFolder,
  onSelectItem,
  onNewFolder,
  onNewScript,
  onScriptClick,
  onScriptDelete,
  activeTab: externalActiveTab = 'explorer',
  onTabChange,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'explorer' | 'search'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [showNewScriptInput, setShowNewScriptInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newScriptName, setNewScriptName] = useState('');

  // Use external tab state if provided, otherwise use internal
  const activeTab = onTabChange ? externalActiveTab : internalActiveTab;
  const setActiveTab = (tab: 'explorer' | 'search') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFolderInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (newFolderName) {
        onNewFolder(newFolderName);
        setShowNewFolderInput(false);
        setNewFolderName('');
      }
    } else if (e.key === 'Escape') {
      setShowNewFolderInput(false);
      setNewFolderName('');
    }
  };

  const handleScriptInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (newScriptName) {
        onNewScript(newScriptName);
        setShowNewScriptInput(false);
        setNewScriptName('');
      }
    } else if (e.key === 'Escape') {
      setShowNewScriptInput(false);
      setNewScriptName('');
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <HStack mb={2} px={2} spacing={0}>
        <Tooltip label="Explorer" hasArrow>
          <Button
            size="sm"
            variant="ghost"
            width="40px"
            borderBottomWidth="2px"
            borderBottomColor={activeTab === 'explorer' ? 'teal.500' : 'transparent'}
            borderRadius="0"
            onClick={() => setActiveTab('explorer')}
          >
            <RiFolderLine />
          </Button>
        </Tooltip>
        <Tooltip label="Search" hasArrow>
          <Button
            size="sm"
            variant="ghost"
            width="40px"
            borderBottomWidth="2px"
            borderBottomColor={activeTab === 'search' ? 'teal.500' : 'transparent'}
            borderRadius="0"
            onClick={() => setActiveTab('search')}
          >
            <RiSearchLine />
          </Button>
        </Tooltip>
        <Spacer />
      </HStack>

      {activeTab === 'explorer' && (
        <HStack mb={2} px={2} spacing={2}>
          <Tooltip label="Create New Folder" hasArrow>
            <IconButton
              aria-label="New Folder"
              icon={<RiFolderAddLine />}
              size="sm"
              onClick={() => setShowNewFolderInput(true)}
            />
          </Tooltip>
          <Tooltip label="Create New Script" hasArrow>
            <IconButton
              aria-label="New Script"
              icon={<RiFileAddLine />}
              size="sm"
              onClick={() => setShowNewScriptInput(true)}
            />
          </Tooltip>
          <Spacer />
        </HStack>
      )}

      {showNewFolderInput && (
        <Box px={2} pb={2}>
          <Input
            placeholder="New folder name..."
            size="sm"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={handleFolderInputKeyDown}
            onBlur={() => setShowNewFolderInput(false)}
            autoFocus
          />
        </Box>
      )}

      {showNewScriptInput && (
        <Box px={2} pb={2}>
          <Input
            placeholder="New script name..."
            size="sm"
            value={newScriptName}
            onChange={(e) => setNewScriptName(e.target.value)}
            onKeyDown={handleScriptInputKeyDown}
            onBlur={() => setShowNewScriptInput(false)}
            autoFocus
          />
        </Box>
      )}

      {activeTab === 'search' && (
        <Box px={2} pb={2}>
          <Input
            placeholder="Search scripts..."
            size="sm"
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
          />
        </Box>
      )}

      <Box flex={1} overflowY="auto">
        {activeTab === 'explorer' ? (
          <FolderTree
            node={folderTree}
            level={0}
            selectedItem={selectedItem}
            expandedFolders={expandedFolders}
            onToggleFolder={onToggleFolder}
            onSelectItem={onSelectItem}
            onNewFolder={onNewFolder}
            onNewScript={onNewScript}
            onScriptClick={onScriptClick}
          />
        ) : (
          <ScriptList
            scripts={scripts}
            searchQuery={searchQuery}
            onScriptClick={onScriptClick}
            onScriptDelete={onScriptDelete}
          />
        )}
      </Box>
    </Box>
  );
}; 