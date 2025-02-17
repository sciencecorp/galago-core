import React, { useState, useEffect, use } from "react";
import {
  Box,
  Button,
  HStack,
  Text,
  Input,
  VStack,
  Spacer,
  useColorModeValue,
  Flex,
  useToast,
  Tooltip,
  Wrap,
  Card,
  CardBody,
  Icon,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Collapse,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { CloseIcon, ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { SiPython } from "react-icons/si";
import { set } from "zod";
import {
  RiAddFill,
  RiFolderAddLine,
  RiFolderLine,
  RiFileAddLine,
  RiSearchLine,
} from "react-icons/ri";
import { trpc } from "@/utils/trpc";
import { Script } from "@/types/api";
import { RiDeleteBinLine } from "react-icons/ri";
import { PageHeader } from "../ui/PageHeader";
import { DeleteWithConfirmation } from "../ui/Delete";
import { VscCode } from "react-icons/vsc";
import { FiBook } from "react-icons/fi";
import { ContextMenu } from "./ContextMenu";
import { Explorer } from "./Explorer";

interface FolderNode {
  name: string;
  path: string;
  scripts: Script[];
  subFolders: FolderNode[];
}

export const ScriptsEditor: React.FC = (props) => {
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const consoleBg = useColorModeValue("white", "#222324");
  const [scripts, setScripts] = useState<Script[]>([]);
  const { data: fetchedScript, refetch } = trpc.script.getAll.useQuery();
  const editScript = trpc.script.edit.useMutation();
  const deleteScript = trpc.script.delete.useMutation();
  const codeTheme = useColorModeValue("vs-light", "vs-dark");
  const toast = useToast();
  const [scriptsEdited, setScriptsEdited] = useState<Script[]>([]);
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>("");
  const consoleHeaderBg = useColorModeValue("gray.100", "gray.800");
  const [consoleText, setConsoleText] = useState<string>("");
  const activeTabFontColor = useColorModeValue("teal.600", "teal.200");
  const runScript = trpc.script.run.useMutation();
  const [runError, setRunError] = useState<boolean>(false);
  const headerBg = useColorModeValue("white", "gray.700");
  const tabBg = useColorModeValue("gray.50", "gray.700");
  const activeTabBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.100", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const [currentFolder, setCurrentFolder] = useState<string>("/");
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [showNewFolderInput, setShowNewFolderInput] = useState<boolean>(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]));
  const [showNewScriptInput, setShowNewScriptInput] = useState<boolean>(false);
  const [newScriptName, setNewScriptName] = useState<string>("");
  const addScript = trpc.script.add.useMutation();
  const [temporaryFolders, setTemporaryFolders] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<{
    type: "folder" | "file";
    path: string;
  } | null>(null);

  useEffect(() => {
    setCurrentContent(scripts.find((script) => script.name === activeTab)?.content || "");
  }, [activeTab]);

  const handleRunScript = async () => {
    setRunError(false);
    setConsoleText("");
    if (!activeTab) return;
    toast({
      title: `Executing ${activeTab}...`,
      description: `Please wait.`,
      status: "loading",
      duration: null,
      isClosable: false,
      position: "top", // or "bottom"
    });
    try {
      const response = await runScript.mutateAsync(activeTab, {
        onSuccess: () => {
          toast.closeAll();
          toast({
            title: `Script Completed!`,
            status: "success",
            duration: 2000,
            isClosable: true,
            position: "top",
          });
        },
        onError: (error) => {
          setRunError(true);
          setConsoleText(error.message);
          toast.closeAll();
          toast({
            title: "Failed to run script",
            description: `Error= ${error.message}`,
            status: "error",
            duration: 10000,
            isClosable: true,
            position: "top",
          });
        },
      });
      if (response?.error_message) {
        setRunError(true);
        setConsoleText(response.error_message);
        setRunError(true);
        setConsoleText(response?.error_message || "");
        toast.closeAll();
        toast({
          title: "Failed to run script",
          description: `Error= ${response?.error_message || ""}`,
          status: "error",
          duration: 10000,
          isClosable: true,
          position: "top",
        });
        return;
      }
      setConsoleText(response?.meta_data?.response || "");
    } catch (error) {
      //setConsoleText(error);
    }
  };

  const handleSave = async () => {
    if (!activeTab) {
      toast({
        title: "No active tab",
        description: "Please select a script to save.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const script = scriptsEdited.find((script) => script.name === activeTab);
    if (!script) {
      toast({
        title: "No changes detected",
        description: "No edits were made to the active script.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      await editScript.mutateAsync(script);
      refetch();
      toast({
        title: "Script updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error("Error updating script:", error);
      toast({
        title: "Error updating script",
        description: "An error occurred while saving the script. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleDelete = async (script: Script) => {
    try {
      await deleteScript.mutateAsync(script.id);
      if (openTabs.includes(script.name)) {
        setOpenTabs(openTabs.filter((t) => t !== script.name));
      }

      refetch();
      toast({
        title: "Script deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error deleting script",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  useEffect(() => {
    if (openTabs.length > 0) {
      setActiveTab(openTabs[openTabs.length - 1]);
    }
  }, [openTabs]);

  useEffect(() => {
    if (fetchedScript) {
      setScripts(
        fetchedScript.filter((script) =>
          script.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }
  }, [fetchedScript, searchQuery]);

  const Tabs = () => {
    return (
      <Box
        width="100%"
        overflowX="auto"
        css={{
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }}>
        <Flex width="max-content" minWidth="100%" py={1}>
          {openTabs.map((tab, index) => (
            <Button
              key={index}
              onClick={() => setActiveTab(tab)}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              minW="180px"
              maxW="280px"
              height="36px"
              mr={1}
              borderWidth="1px"
              borderColor={activeTab === tab ? borderColor : "transparent"}
              borderRadius="md"
              bg={activeTab === tab ? activeTabBg : tabBg}
              _hover={{ bg: hoverBg }}
              transition="all 0.2s"
              position="relative"
              overflow="hidden"
              flexShrink={0}
              px={3}>
              <HStack spacing={2} flex={1}>
                <SiPython fontSize="12px" color={activeTab === tab ? "teal" : "gray"} />
                <Text color={activeTab === tab ? activeTabFontColor : ""} fontSize="sm" isTruncated>
                  {tab}
                </Text>
              </HStack>
              <Box
                as={CloseIcon}
                fontSize={8}
                opacity={0.7}
                _hover={{ opacity: 1 }}
                ml={2}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  removeTab(tab);
                }}
              />
              {activeTab === tab && (
                <Box position="absolute" bottom={0} left={0} right={0} height="2px" bg="teal.500" />
              )}
            </Button>
          ))}
        </Flex>
      </Box>
    );
  };

  const buildFolderTree = () => {
    const root: FolderNode = { name: "/", path: "/", scripts: [], subFolders: [] };
    const folderMap = new Map<string, FolderNode>();
    folderMap.set("/", root);

    // Add temporary folders first
    temporaryFolders.forEach((folderPath) => {
      const folderParts = folderPath.split("/").filter(Boolean);
      let currentPath = "";

      folderParts.forEach((part) => {
        const parentPath = currentPath || "/";
        currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;

        if (!folderMap.has(currentPath)) {
          const newFolder: FolderNode = {
            name: part,
            path: currentPath,
            scripts: [],
            subFolders: [],
          };
          folderMap.set(currentPath, newFolder);

          const parentFolder = folderMap.get(parentPath);
          if (parentFolder) {
            parentFolder.subFolders.push(newFolder);
          }
        }
      });
    });

    // Then add script folders and scripts as before
    scripts.forEach((script) => {
      const folderPath = script.folder;
      if (!folderMap.has(folderPath)) {
        const folderParts = folderPath.split("/").filter(Boolean);
        let currentPath = "";

        folderParts.forEach((part) => {
          const parentPath = currentPath || "/";
          currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;

          if (!folderMap.has(currentPath)) {
            const newFolder: FolderNode = {
              name: part,
              path: currentPath,
              scripts: [],
              subFolders: [],
            };
            folderMap.set(currentPath, newFolder);

            const parentFolder = folderMap.get(parentPath);
            if (parentFolder) {
              parentFolder.subFolders.push(newFolder);
            }
          }
        });
      }
    });

    scripts.forEach((script) => {
      const folder = folderMap.get(script.folder);
      if (folder) {
        folder.scripts.push(script);
      }
    });

    return root;
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const FolderTree: React.FC<{ node: FolderNode; level: number }> = ({ node, level }) => {
    const isExpanded = expandedFolders.has(node.path);
    const indent = level * 12;
    const folderIconColor = useColorModeValue("gray.500", "gray.400");
    const hoverBg = useColorModeValue("gray.100", "gray.700");
    const isSelected = selectedItem?.type === "folder" && selectedItem.path === node.path;
    const selectedBg = useColorModeValue("blue.50", "blue.900");
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const handleContextMenu = (e: React.MouseEvent, type: "folder" | "file", path: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedItem({ type, path });
      setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (type: "folder" | "file", path: string) => {
      setSelectedItem({ type, path });
      if (type === "folder") {
        toggleFolder(path);
      }
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
              onClick={() => handleClick("folder", node.path)}
              onContextMenu={(e) => handleContextMenu(e, "folder", node.path)}
              bg={isSelected ? selectedBg : undefined}
              _hover={{ bg: hoverBg }}>
              <Icon as={RiFolderLine} color={folderIconColor} mr={2} />
              <Text fontSize="sm">{node.name}</Text>
            </Button>
          </Box>
        )}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onNewFolder={() => setShowNewFolderInput(true)}
            onNewScript={() => setShowNewScriptInput(true)}
          />
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
                    bg={
                      selectedItem?.type === "file" && selectedItem.path === script.name
                        ? selectedBg
                        : undefined
                    }
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleClick("file", script.name)}
                    onContextMenu={(e) => handleContextMenu(e, "file", script.name)}>
                    <HStack spacing={2}>
                      <SiPython size={14} />
                      <Text fontSize="sm">{script.name}</Text>
                    </HStack>
                  </Button>
                </Box>
              </Tooltip>
            ))}
            {node.subFolders.map((subFolder, index) => (
              <FolderTree key={index} node={subFolder} level={level + 1} />
            ))}
          </VStack>
        </Collapse>
      </>
    );
  };

  const handleCreateFolder = () => {
    if (!newFolderName) return;

    const targetPath = selectedItem?.path || currentFolder;
    const newFolder = targetPath === "/" ? `/${newFolderName}` : `${targetPath}/${newFolderName}`;

    setTemporaryFolders((prev) => new Set([...prev, newFolder]));
    setNewFolderName("");
    setShowNewFolderInput(false);
    setCurrentFolder(newFolder);
    setExpandedFolders((prev) => new Set([...prev, newFolder]));
  };

  const handleFolderInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateFolder();
    } else if (e.key === "Escape") {
      setShowNewFolderInput(false);
      setNewFolderName("");
    }
  };

  const validateScriptName = (name: string): string => {
    if (!name) return "Name cannot be empty";
    if (name.length > 25) return "Name cannot exceed 25 characters";
    if (/[ .\\/]/.test(name)) return "Name cannot contain spaces, periods, or slashes";
    return "";
  };

  const handleCreateScript = async () => {
    if (!newScriptName) return;

    const isNotValid = validateScriptName(newScriptName);
    if (isNotValid) {
      toast({
        title: "Error creating script",
        description: isNotValid,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const targetPath = selectedItem?.path || currentFolder;
    const name = `${newScriptName}.py`;
    const script = {
      name,
      description: "",
      content: "",
      language: "python",
      is_blocking: true,
      folder: targetPath,
    };

    try {
      await addScript.mutateAsync(script);
      await refetch();

      // When a script is created, make all parent folders permanent
      const folderParts = targetPath.split("/").filter(Boolean);
      let currentPath = "";
      folderParts.forEach((part) => {
        currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;
        setTemporaryFolders((prev) => {
          const next = new Set(prev);
          next.delete(currentPath);
          return next;
        });
      });

      toast({
        title: "Script created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewScriptName("");
      setShowNewScriptInput(false);
      handleScriptClicked(name);
    } catch (error) {
      toast({
        title: "Error creating script",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleScriptInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateScript();
    } else if (e.key === "Escape") {
      setShowNewScriptInput(false);
      setNewScriptName("");
    }
  };

  const Scripts = () => {
    const folderTree = buildFolderTree();
    const [explorerActiveTab, setExplorerActiveTab] = useState<"explorer" | "search">("explorer");

    const handleSelectItem = (type: "folder" | "file", path: string) => {
      setSelectedItem({ type, path });
    };

    const handleNewFolder = (folderName: string) => {
      // Only use the selected path if it's a folder type
      const targetPath = selectedItem?.type === "folder" ? selectedItem.path : currentFolder;
      const newFolder = targetPath === "/" ? `/${folderName}` : `${targetPath}/${folderName}`;

      setTemporaryFolders((prev) => new Set([...prev, newFolder]));
      setCurrentFolder(newFolder);
      setExpandedFolders((prev) => new Set([...prev, newFolder]));
    };

    const handleNewScript = async (scriptName: string) => {
      // Only use the selected path if it's a folder type
      const targetPath = selectedItem?.type === "folder" ? selectedItem.path : currentFolder;
      const name = `${scriptName}.py`;
      const script = {
        name,
        description: "",
        content: "",
        language: "python",
        is_blocking: true,
        folder: targetPath,
      };

      try {
        await addScript.mutateAsync(script);
        await refetch();

        // When a script is created, make all parent folders permanent
        const folderParts = targetPath.split("/").filter(Boolean);
        let currentPath = "";
        folderParts.forEach((part) => {
          currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;
          setTemporaryFolders((prev) => {
            const next = new Set(prev);
            next.delete(currentPath);
            return next;
          });
        });

        toast({
          title: "Script created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        handleScriptClicked(name);
      } catch (error) {
        toast({
          title: "Error creating script",
          description: `Please try again. ${error}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    return (
      <Box height="100%" display="flex" flexDirection="column">
        <Box flex={1} overflowY="auto">
          <Explorer
            scripts={scripts}
            selectedItem={selectedItem}
            expandedFolders={expandedFolders}
            folderTree={folderTree}
            onToggleFolder={toggleFolder}
            onSelectItem={handleSelectItem}
            onNewFolder={handleNewFolder}
            onNewScript={handleNewScript}
            onScriptClick={handleScriptClicked}
            onScriptDelete={handleDelete}
            activeTab={explorerActiveTab}
            onTabChange={setExplorerActiveTab}
          />
        </Box>
      </Box>
    );
  };

  const OutputConsole = () => {
    return (
      <Flex width="100%" bg={consoleBg}>
        <Box borderBottom="1px solid gray" width="100%" bg={consoleHeaderBg} p={1}>
          <Text>Output Console</Text>
        </Box>
      </Flex>
    );
  };

  const removeTab = (tab: string) => {
    setOpenTabs(openTabs.filter((t) => t !== tab));
  };

  const handleCodeChange = (value?: string) => {
    if (!activeTab) return;
    setScriptsEdited((prev) => {
      const existingScript = prev.find((script) => script.name === activeTab);
      if (existingScript) {
        return prev.map((script) =>
          script.name === activeTab ? { ...script, content: value || "" } : script,
        );
      } else {
        const script = scripts.find((script) => script.name === activeTab);
        if (script) {
          return [...prev, { ...script, content: value || "" }];
        }
      }
      return prev;
    });
  };

  const handleScriptClicked = (script: string) => {
    if (!openTabs.includes(script)) {
      setOpenTabs([...openTabs, script]);
    }
    setActiveTab(script);
  };

  return (
    <Box overflow="hidden">
      <VStack spacing={4} align="stretch" width="100%">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Scripts"
                subTitle="Create and manage Python scripts"
                titleIcon={<Icon as={VscCode} boxSize={8} color="teal.500" />}
                mainButton={<div />}
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Scripts</StatLabel>
                  <StatNumber>{scripts.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Open Scripts</StatLabel>
                  <StatNumber>{openTabs.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Active Script</StatLabel>
                  <StatNumber fontSize="lg">{activeTab?.replace(".py", "") || "None"}</StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={headerBg} shadow="md">
          <CardBody>
            <Flex width="100%" alignItems="flex-start">
              <Box width="200px" minW="200px" flexShrink={0}>
                <Box width="100%" overflowY="auto">
                  <Scripts />
                </Box>
              </Box>

              <Box flex={1} minW={0} ml={4}>
                <Box
                  width="100%"
                  borderRadius="md"
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor={borderColor}>
                  <Box width="100%" borderBottomWidth="1px" borderColor={borderColor} p={2}>
                    <Flex width="100%" justify="space-between" align="center">
                      <Box flex={1} minW={0} overflow="hidden">
                        <Tabs />
                      </Box>
                      <HStack spacing={2} flexShrink={0} ml={2}>
                        <Button colorScheme="gray" onClick={handleSave}>
                          Save
                        </Button>
                        <Button colorScheme="teal" onClick={handleRunScript}>
                          Run
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>
                  <Box width="100%">
                    {activeTab && openTabs.length > 0 ? (
                      <Box width="100%">
                        <Editor
                          height="55vh"
                          defaultLanguage="python"
                          value={currentContent}
                          theme={codeTheme}
                          options={{
                            fontSize: 20,
                            wordWrap: "on",
                          }}
                          onChange={(value) => handleCodeChange(value)}
                        />
                      </Box>
                    ) : (
                      <Box
                        width="100%"
                        height="55vh"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        bg={bgColor}
                        position="relative"
                        _before={{
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(128,128,128,0.1) 10px, rgba(128,128,128,0.1) 20px)",
                        }}>
                        <VStack spacing={4}>
                          <Text fontSize="sm" color="gray.400">
                            Select a script to get started
                          </Text>
                          <Icon as={VscCode} boxSize={8} color="gray.400" />
                        </VStack>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box
                  width="100%"
                  height="20vh"
                  bg={consoleBg}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  overflow="hidden">
                  <OutputConsole />
                  <Box width="100%" height="80%" p={2} overflowY="auto">
                    <Text
                      whiteSpace="pre-wrap"
                      fontFamily="monospace"
                      textColor={runError ? "red" : ""}>
                      {consoleText}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
