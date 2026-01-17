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
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FolderResponse, ScriptFolder, Script } from "@/types";
import { validateFolderName, removeFileExtension, showErrorToast } from "./utils";
import { useScriptColors } from "../ui/Theme";
import {
  MenuIcon,
  PythonIcon,
  EditIcon,
  DeleteIcon,
  FolderIcon,
  FolderOpenIcon,
  JavaScriptIcon,
  CSharpIcon,
} from "../ui/Icons";
import { InlineFolderCreation } from "./NewFolder";

interface FolderTreeProps {
  folders: FolderResponse[];
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
  onDragStart?: (script: Script) => void;
  onDropOnFolder?: (folder: ScriptFolder) => void;
  onDropOnRoot?: () => void;
  children?: React.ReactNode;
}

interface FolderNodeProps extends FolderTreeProps {
  folder: FolderResponse;
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
  onDragStart,
  onDropOnFolder,
  onDropOnRoot,
}): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const { selectedBg, hoverBg, selectedColor } = useScriptColors();
  const [isDragOver, setIsDragOver] = useState(false);

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

  return (
    <Box>
      <HStack
        spacing={1}
        mb={1}
        px={2}
        py={1}
        borderRadius="md"
        bg={isDragOver ? selectedBg : "transparent"}
        opacity={isDragOver ? 0.5 : 1}
        _hover={{ bg: isActive ? selectedBg : hoverBg }}
        onClick={() => onFolderClick?.(folder)}
        cursor="pointer"
        position="relative"
        transition="opacity 0.2s"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
          onDropOnFolder?.(folder);
        }}>
        <Icon
          as={isOpen ? FolderOpenIcon : FolderIcon}
          color={isActive ? selectedColor : "gray.500"}
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
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <Text flex={1} color={isActive ? selectedColor : "inherit"}>
            {folder.name}
          </Text>
        )}
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Folder options"
            icon={<MenuIcon />}
            variant="unstyled"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            position="absolute"
            right={2}
          />
          <MenuList minW="auto">
            <MenuItem
              icon={<EditIcon size={12} />}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}>
              Rename
            </MenuItem>
            <MenuItem
              icon={<DeleteIcon size={12} />}
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
        <Box ml={4}>
          {folder?.subFolders?.map((subfolder) => (
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
              onDragStart={onDragStart}
              onDropOnFolder={onDropOnFolder}
              onDropOnRoot={onDropOnRoot}
            />
          ))}
          {folder?.scripts?.map((script) => (
            <ScriptNode
              key={script.id}
              script={script}
              isActive={activeScript === script.name}
              onClick={() => onScriptClick(script)}
              onRename={onScriptRename}
              onDelete={onScriptDelete}
              onDragStart={onDragStart}
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
  onDragStart?: (script: Script) => void;
}

const ScriptNode: React.FC<ScriptNodeProps> = ({
  script,
  isActive,
  onClick,
  onRename,
  onDelete,
  onDragStart,
}): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(removeFileExtension(script.name));
  const { selectedBg, hoverBg, selectedColor } = useScriptColors();
  const jsIconColor = useColorModeValue("orange", "yellow");
  const [isDragging, setIsDragging] = useState(false);
  const dragImageRef = React.useRef<HTMLDivElement | null>(null);

  const handleRename = () => {
    if (newName.trim() && newName !== script.name.replace(/\.py$/, "")) {
      onRename(script, newName);
    }
    setIsEditing(false);
  };

  // ✅ Get the icon component based on language
  const getIcon = () => {
    if (script.language === "javascript") {
      return <JavaScriptIcon color={jsIconColor} />;
    } else if (script.language === "csharp") {
      return <CSharpIcon color="lightblue" />;
    } else {
      return <PythonIcon color="lightblue" />;
    }
  };

  return (
    <>
      {/* ✅ Hidden drag preview element */}
      <Box
        ref={dragImageRef}
        position="fixed"
        top="-1000px"
        left="-1000px"
        pointerEvents="none"
        zIndex={9999}>
        <HStack
          spacing={2}
          px={3}
          py={2}
          bg={useColorModeValue("white", "surface.section")}
          borderRadius="md"
          boxShadow="lg"
          border="1px solid"
          borderColor={useColorModeValue("gray.300", "whiteAlpha.200")}>
          {getIcon()}
          <Text fontSize="14px" fontWeight="medium">
            {script.name}
          </Text>
        </HStack>
      </Box>

      <HStack
        spacing={1}
        mb={1}
        px={2}
        py={1}
        borderRadius="md"
        border={isActive ? "1px solid teal" : "none"}
        bg={isActive ? selectedBg : "transparent"}
        _hover={{ bg: isActive ? selectedBg : hoverBg }}
        onClick={onClick}
        cursor="pointer"
        position="relative"
        draggable={!isEditing}
        onDragStart={(e) => {
          if (!isEditing && dragImageRef.current) {
            setIsDragging(true);
            onDragStart?.(script);

            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setDragImage(dragImageRef.current, 20, 20);
          }
        }}
        onDragEnd={() => {
          setIsDragging(false);
        }}
        opacity={isDragging ? 0.4 : 1}
        transition="opacity 0.5s">
        {script.language === "javascript" ? (
          <JavaScriptIcon color={isActive ? "teal" : jsIconColor} />
        ) : script.language === "csharp" ? (
          <CSharpIcon color={isActive ? "teal" : "lightblue"} />
        ) : (
          <PythonIcon color={isActive ? "teal" : "lightblue"} />
        )}
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
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <Text
            flex={1}
            fontSize="14px"
            fontWeight={isActive ? "medium" : "normal"}
            color={isActive ? selectedColor : "inherit"}>
            {`${script.name}`.length > 15 ? `${script.name.substring(0, 15)}...` : script.name}
          </Text>
        )}
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Script options"
            icon={<MenuIcon />}
            variant="unstyled"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            position="absolute"
            right={2}
          />
          <MenuList minW="auto">
            <MenuItem
              icon={<EditIcon size={12} />}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}>
              Rename
            </MenuItem>
            <MenuItem
              icon={<DeleteIcon size={12} />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(script);
              }}>
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </>
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
  onDragStart,
  onDropOnFolder,
  onDropOnRoot,
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
          onDragStart={onDragStart}
          onDropOnFolder={onDropOnFolder}
          onDropOnRoot={onDropOnRoot}
        />
      ))}
      {scripts.map((script) => (
        <ScriptNode
          key={script.id}
          script={script}
          isActive={activeScript?.split(".")[0] === script.name}
          onClick={() => onScriptClick(script)}
          onRename={onScriptRename}
          onDelete={onScriptDelete}
          onDragStart={onDragStart}
        />
      ))}
    </VStack>
  );
};
