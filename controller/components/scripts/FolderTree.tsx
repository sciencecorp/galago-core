import React, { useState } from "react";
import {
  Box,
  HStack,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  VStack,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { ScriptFolder, Script } from "@/types/api";
import { validateFolderName, removeFileExtension, showErrorToast } from "./utils";
import {
  Icon,
  MenuIcon,
  PythonIcon,
  EditIcon,
  DeleteIcon,
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "../ui/Icons";
import { InlineFolderCreation } from "./NewFolder";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

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
  folders,
  scripts,
}): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const selectedBg = useColorModeValue(
    `${semantic.text.accent.light}15`,
    `${semantic.text.accent.dark}30`,
  );
  const hoverBg = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );
  const selectedColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );

  const handleRename = () => {
    const validationError = validateFolderName(newName);
    if (validationError) {
      showErrorToast("Invalid folder name", validationError);
      setIsEditing(false);
      return;
    }
    if (newName.trim() && newName !== folder.name) {
      onFolderRename(folder, newName);
    }
    setIsEditing(false);
  };

  const isActive = activeFolder?.id === folder.id;
  const isOpen = openFolders.has(folder.id);

  const childFolders = folders.filter((f) => f.parent_id === folder.id);
  const folderScripts = scripts.filter((s) => s.folder_id === folder.id);

  return (
    <Box>
      <HStack
        spacing={tokens.spacing.xs}
        mb={tokens.spacing.xs}
        px={tokens.spacing.sm}
        py={tokens.spacing.xs}
        borderRadius={tokens.borders.radii.md}
        bg={isActive ? selectedBg : "transparent"}
        _hover={{ bg: isActive ? selectedBg : hoverBg }}
        onClick={() => onFolderClick?.(folder)}
        cursor="pointer"
        position="relative">
        <Icon as={isOpen ? ChevronDownIcon : ChevronRightIcon} boxSize={3} color={textSecondary} />
        <Icon
          as={isOpen ? FolderOpenIcon : FolderIcon}
          color={isActive ? selectedColor : semantic.text.accent.light}
        />
        {isEditing ? (
          <Input
            size="sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsEditing(false);
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Text
            fontWeight={tokens.typography.fontWeights.medium}
            color={isActive ? selectedColor : textColor}
            fontSize={tokens.typography.fontSizes.sm}
            isTruncated>
            {folder.name}
          </Text>
        )}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Icon as={MenuIcon} />}
            variant="ghost"
            size="xs"
            ml="auto"
            onClick={(e) => e.stopPropagation()}
            aria-label="Folder options"
          />
          <MenuList>
            <MenuItem
              icon={<Icon as={EditIcon} />}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}>
              Rename
            </MenuItem>
            <MenuItem
              icon={<Icon as={DeleteIcon} />}
              onClick={(e) => {
                e.stopPropagation();
                onFolderDelete(folder);
              }}>
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>

      {isOpen && (
        <Box ml={tokens.spacing.md}>
          {childFolders.map((childFolder) => (
            <FolderNode
              key={childFolder.id}
              folder={childFolder}
              level={level + 1}
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
              folders={folders}
              scripts={scripts}
            />
          ))}

          {folderScripts.map((script) => (
            <ScriptNode
              key={script.id}
              script={script}
              isActive={activeScript === script.id.toString()}
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
}): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(removeFileExtension(script.name));

  const selectedBg = useColorModeValue(
    `${semantic.text.accent.light}15`,
    `${semantic.text.accent.dark}30`,
  );
  const hoverBg = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );
  const selectedColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);

  const handleRename = () => {
    if (newName.trim() && newName !== removeFileExtension(script.name)) {
      onRename(script, newName);
    }
    setIsEditing(false);
  };

  return (
    <HStack
      spacing={tokens.spacing.xs}
      mb={tokens.spacing.xs}
      px={tokens.spacing.sm}
      py={tokens.spacing.xs}
      borderRadius={tokens.borders.radii.md}
      bg={isActive ? selectedBg : "transparent"}
      _hover={{ bg: isActive ? selectedBg : hoverBg }}
      onClick={onClick}
      cursor="pointer"
      position="relative">
      <Box width="3px" />
      <Icon as={PythonIcon} color={semantic.text.accent.light} />
      {isEditing ? (
        <Input
          size="sm"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") setIsEditing(false);
          }}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <Text
          fontWeight={tokens.typography.fontWeights.medium}
          color={isActive ? selectedColor : textColor}
          fontSize={tokens.typography.fontSizes.sm}
          isTruncated>
          {removeFileExtension(script.name)}
        </Text>
      )}
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<Icon as={MenuIcon} />}
          variant="ghost"
          size="xs"
          ml="auto"
          onClick={(e) => e.stopPropagation()}
          aria-label="Script options"
        />
        <MenuList>
          <MenuItem
            icon={<Icon as={EditIcon} />}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}>
            Rename
          </MenuItem>
          <MenuItem
            icon={<Icon as={DeleteIcon} />}
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
  children,
}) => {
  const rootFolders = folders.filter((folder) => !folder.parent_id);
  const rootScripts = scripts.filter((script) => !script.folder_id);

  return (
    <VStack align="stretch" spacing={tokens.spacing.xs} width="100%">
      {children}

      {isCreatingRootFolder && (
        <Box mb={tokens.spacing.xs}>
          <InlineFolderCreation
            onSubmit={(name) => onFolderCreate(name)}
            onCancel={() => onCancelRootFolderCreation?.()}
          />
        </Box>
      )}

      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          level={0}
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
          folders={folders}
          scripts={scripts}
        />
      ))}

      {rootScripts.map((script) => (
        <ScriptNode
          key={script.id}
          script={script}
          isActive={activeScript === script.id.toString()}
          onClick={() => onScriptClick(script)}
          onRename={onScriptRename}
          onDelete={onScriptDelete}
        />
      ))}
    </VStack>
  );
};
