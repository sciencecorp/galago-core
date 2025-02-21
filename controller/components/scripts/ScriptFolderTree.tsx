import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  HStack,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  useToast,
  VStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { SiPython } from "react-icons/si";
import { RiEdit2Line, RiDeleteBinLine, RiFolderAddLine } from "react-icons/ri";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { ScriptFolder, Script } from "@/types/api";
import { trpc } from "@/utils/trpc";

interface FolderTreeProps {
  folders: ScriptFolder[];
  scripts: Script[];
  activeScript: string | null;
  activeFolder?: ScriptFolder | null;
  activeOpenFolder?: ScriptFolder | null;
  onScriptClick: (script: Script) => void;
  onFolderClick?: (folder: ScriptFolder) => void;
  onScriptRename: (script: Script, newName: string) => void;
  onScriptDelete: (script: Script) => void;
  onFolderCreate: (name: string, parentId?: number) => void;
  onFolderRename: (folder: ScriptFolder, newName: string) => void;
  onFolderDelete: (folder: ScriptFolder) => void;
  openFolders: Set<number>;
  isCreatingRootFolder?: boolean;
  onCancelRootFolderCreation?: () => void;
  children?: React.ReactNode;
}

interface FolderNodeProps extends FolderTreeProps {
  folder: ScriptFolder;
  level: number;
}

const FolderNode: React.FC<FolderNodeProps> = ({
  folder,
  level,
  activeScript,
  activeFolder,
  onScriptClick,
  onFolderClick,
  onScriptRename,
  onScriptDelete,
  onFolderCreate,
  onFolderRename,
  onFolderDelete,
  openFolders,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [isCreatingSubfolder, setIsCreatingSubfolder] = useState(false);
  const toast = useToast();

  const selectedBg = useColorModeValue("teal.50", "teal.900");
  const hoverBg = useColorModeValue("gray.100", "gray.600");
  const selectedColor = useColorModeValue("teal.600", "teal.200");

  const handleRename = () => {
    if (newName.trim() && newName !== folder.name) {
      onFolderRename(folder, newName);
    }
    setIsEditing(false);
  };

  const isActive = activeFolder?.id === folder.id;
  const isOpen = openFolders.has(folder.id);

  return (
    <Box>
      <HStack 
        spacing={1} 
        mb={1}
        px={2}
        py={1}
        borderRadius="md"
        bg={isActive ? selectedBg : "transparent"}
        _hover={{ bg: isActive ? selectedBg : hoverBg }}
        onClick={() => onFolderClick?.(folder)}
        cursor="pointer"
        position="relative"
      >
        <Icon 
          as={isOpen ? FaFolderOpen : FaFolder} 
          color={isActive ? selectedColor :  "gray.500"} 
        />
        {isEditing ? (
          <Input
            size="sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <Text
            flex={1}
            color={isActive ? selectedColor : "inherit"}
          >
            {folder.name}
          </Text>
        )}
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Folder options"
            icon={<HamburgerIcon />}
            variant="unstyled"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            position="absolute"
            right={2}
          />
          <MenuList minW="auto">
            <MenuItem
              icon={<RiFolderAddLine />}
              onClick={(e) => {
                e.stopPropagation();
                setIsCreatingSubfolder(true);
              }}>
              New Sub-folder
            </MenuItem>
            <MenuItem
              icon={<RiEdit2Line />}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}>
              Rename
            </MenuItem>
            <MenuItem
              icon={<RiDeleteBinLine />}
              onClick={(e) => {
                e.stopPropagation();
                if (folder.scripts.length > 0 || folder.subfolders.length > 0) {
                  toast({
                    title: "Cannot delete non-empty folder",
                    status: "error",
                    duration: 3000,
                  });
                  return;
                }
                onFolderDelete(folder);
              }}>
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      {isCreatingSubfolder && (
        <Box ml={4} mb={1}>
          <InlineFolderCreation
            onSubmit={(name) => {
              onFolderCreate(name, folder.id);
              setIsCreatingSubfolder(false);
            }}
            onCancel={() => setIsCreatingSubfolder(false)}
          />
        </Box>
      )}
      {isOpen && (
        <Box ml={4}>
          {folder.subfolders.map((subfolder) => (
            <FolderNode
              key={subfolder.id}
              folder={subfolder}
              level={level + 1}
              folders={[]}
              scripts={[]}
              activeScript={activeScript}
              activeFolder={activeFolder}
              onScriptClick={onScriptClick}
              onFolderClick={onFolderClick}
              onScriptRename={onScriptRename}
              onScriptDelete={onScriptDelete}
              onFolderCreate={onFolderCreate}
              onFolderRename={onFolderRename}
              onFolderDelete={onFolderDelete}
              openFolders={openFolders}
            />
          ))}
          {folder.scripts.map((script) => (
            <ScriptNode
              key={script.id}
              script={script}
              isActive={activeScript === script.name}
              onClick={() => onScriptClick(script)}
              onRename={onScriptRename}
              onDelete={onScriptDelete}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

interface ScriptNodeProps {
  script: Script;
  isActive: boolean;
  onClick: () => void;
  onRename: (script: Script, newName: string) => void;
  onDelete: (script: Script) => void;
}

const ScriptNode: React.FC<ScriptNodeProps> = ({
  script,
  isActive,
  onClick,
  onRename,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(script.name.replace(/\.py$/, ''));

  const selectedBg = useColorModeValue("teal.50", "teal.900");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const selectedColor = useColorModeValue("teal.600", "teal.200");

  const handleRename = () => {
    if (newName.trim() && newName !== script.name.replace(/\.py$/, '')) {
      onRename(script, newName);
    }
    setIsEditing(false);
  };

  return (
    <HStack
      spacing={1}
      mb={1}
      px={2}
      py={1}
      borderRadius="md"
      bg={isActive ? selectedBg : "transparent"}
      _hover={{ bg: isActive ? selectedBg : hoverBg }}
      onClick={onClick}
      cursor="pointer"
      position="relative"
    >
      <SiPython color={isActive ? "teal" : "gray"} />
      {isEditing ? (
        <Input
          size="sm"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          onClick={(e) => e.stopPropagation()}
          autoFocus
        />
      ) : (
        <Text
          flex={1}
          fontSize="14px"
          fontWeight={isActive ? "medium" : "normal"}
          color={isActive ? selectedColor : "inherit"}>
          {script.name.replace(/\.py$/, '')}
        </Text>
      )}
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Script options"
          icon={<HamburgerIcon />}
          variant="unstyled"
          size="sm"
          onClick={(e) => e.stopPropagation()}
          position="absolute"
          right={2}
        />
        <MenuList minW="auto">
          <MenuItem 
            icon={<RiEdit2Line />}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}>
            Rename
          </MenuItem>
          <MenuItem
            icon={<RiDeleteBinLine />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(script);
            }}>
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};

interface InlineFolderCreationProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

const InlineFolderCreation: React.FC<InlineFolderCreationProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hoverBg = useColorModeValue("gray.100", "gray.600");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      setName("");
    } else {
      onCancel();
    }
  };

  return (
    <HStack
      spacing={1}
      px={2}
      py={1}
      borderRadius="md"
      bg={hoverBg}
    >
      <Icon as={FaFolder} color="teal.500" />
      <Input
        ref={inputRef}
        size="sm"
        value={name}
        placeholder="New folder name"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={handleSubmit}
      />
    </HStack>
  );
};

export const ScriptFolderTree: React.FC<FolderTreeProps> = ({
  folders,
  scripts,
  activeScript,
  activeFolder,
  onScriptClick,
  onFolderClick,
  onScriptRename,
  onScriptDelete,
  onFolderCreate,
  onFolderRename,
  onFolderDelete,
  openFolders,
  isCreatingRootFolder,
  onCancelRootFolderCreation,
}) => {
  return (
    <VStack align="stretch" width="100%" spacing={1}>
      {isCreatingRootFolder && (
        <InlineFolderCreation
          onSubmit={(name) => onFolderCreate(name)}
          onCancel={() => onCancelRootFolderCreation?.()}
        />
      )}
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          level={0}
          folders={folders}
          scripts={scripts}
          activeScript={activeScript}
          activeFolder={activeFolder}
          onScriptClick={onScriptClick}
          onFolderClick={onFolderClick}
          onScriptRename={onScriptRename}
          onScriptDelete={onScriptDelete}
          onFolderCreate={onFolderCreate}
          onFolderRename={onFolderRename}
          onFolderDelete={onFolderDelete}
          openFolders={openFolders}
        />
      ))}
      {scripts
        .filter((script) => !script.folder_id)
        .map((script) => (
          <ScriptNode
            key={script.id}
            script={script}
            isActive={activeScript === script.name}
            onClick={() => onScriptClick(script)}
            onRename={onScriptRename}
            onDelete={onScriptDelete}
          />
        ))}
    </VStack>
  );
}; 