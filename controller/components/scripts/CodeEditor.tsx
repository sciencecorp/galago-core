import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  HStack,
  Text,
  Input,
  VStack,
  useColorModeValue,
  Flex,
  useToast,
  Tooltip,
  Card,
  CardBody,
  Icon,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  useDisclosure,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { trpc } from "@/utils/trpc";
import { Script, ScriptFolder } from "@/types/api";
import { NewScript } from "./NewScript";
import { NewFolder } from "./NewFolder";
import { PageHeader } from "../ui/PageHeader";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { ScriptFolderTree } from "./FolderTree";
import {
  warningToast,
  successToast as showSuccessToast,
  errorToast as showErrorToast,
} from "../ui/Toast";
import { useScriptColors } from "../ui/Theme";
import { CloseIcon, PythonIcon, CodeIcon, PlayIcon, SaveIcon, FolderAddIcon } from "../ui/Icons";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import { FaFileImport, FaFileExport } from "react-icons/fa";
import { useScriptIO } from "@/hooks/useScriptIO";

export const ScriptsEditor: React.FC = (): JSX.Element => {
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<ScriptFolder | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<number>>(new Set());
  const [activeOpenFolder, setActiveOpenFolder] = useState<ScriptFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { selectedBg, hoverBg, selectedColor, bgColor, borderColor, consoleHeaderBg, consoleBg } =
    useScriptColors();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [folders, setFolders] = useState<ScriptFolder[]>([]);
  const { data: fetchedScript, refetch } = trpc.script.getAll.useQuery();
  const { data: fetchedFolders, refetch: refetchFolders } = trpc.script.getAllFolders.useQuery();
  const editScript = trpc.script.edit.useMutation();
  const deleteScript = trpc.script.delete.useMutation();
  const addFolder = trpc.script.addFolder.useMutation();
  const editFolder = trpc.script.editFolder.useMutation();
  const deleteFolder = trpc.script.deleteFolder.useMutation();
  const codeTheme = useColorModeValue("vs-light", "vs-dark");
  const toast = useToast();
  const [scriptsEdited, setScriptsEdited] = useState<Script[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>("");
  const [consoleText, setConsoleText] = useState<string>("");
  const activeTabFontColor = useColorModeValue("teal.600", "teal.200");
  const runScript = trpc.script.run.useMutation();
  const [runError, setRunError] = useState<boolean>(false);
  const headerBg = useColorModeValue("white", "gray.700");
  const tabBg = useColorModeValue("gray.50", "gray.700");
  const activeTabBg = useColorModeValue("white", "gray.800");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scriptToDelete, setScriptToDelete] = useState<Script | null>(null);
  const [editingScriptName, setEditingScriptName] = useState<Script | null>(null);
  const [folderCreating, setFolderCreating] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  // Define refreshData function here
  const refreshData = async () => {
    await refetch();
    await refetchFolders();
  };

  // Get active script ID based on activeTab name
  const activeScriptId = scripts.find((s) => s.name === activeTab)?.id;

  // Instantiate the useScriptIO hook
  const {
    fileInputRef,
    handleExportConfig,
    handleImportClick,
    handleFileChange,
    isImporting,
    isExporting,
  } = useScriptIO(scripts, activeScriptId, refetch, refetchFolders);

  // Wrapped handlers to add toast notifications
  const onExportConfig = async () => {
    const result = await handleExportConfig();
    if (result.success) {
      showSuccessToast("Export Successful", result.message);
    } else {
      if (result.message.includes("Please select")) {
        warningToast("No Script Selected", result.message);
      } else {
        showErrorToast("Export Failed", result.message);
      }
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const result = await handleFileChange(event);
    if (result?.success) {
      showSuccessToast("Import Successful", result.message);
    } else if (result) {
      showErrorToast("Import Failed", result.message);
    }
  };

  const registerCustomHotkeys = (editor: any, monaco: any) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      await handleSave();
    });

    // Run script hotkey (F5)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, async () => {
      await handleRunScript();
    });
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    registerCustomHotkeys(editor, monaco);
  };

  useEffect(() => {
    setCurrentContent(scripts.find((script) => script.name === activeTab)?.content || "");
  }, [activeTab, scripts]);

  useEffect(() => {
    if (fetchedFolders) {
      setFolders(fetchedFolders);
    }
  }, [fetchedFolders]);

  const handleRunScript = async () => {
    setRunError(false);
    setConsoleText("");
    if (!activeTab) return;

    toast({
      title: `Executing ${activeTab}...`,
      description: "Please wait.",
      status: "loading",
      duration: null,
      isClosable: false,
      position: "bottom-left",
    });

    try {
      const response = await runScript.mutateAsync(activeTab, {
        onSuccess: () => {
          toast.closeAll();
          showSuccessToast("Script Completed!", "The script execution finished successfully.");
        },
        onError: (error) => {
          setRunError(true);
          setConsoleText(error.message);
          toast.closeAll();
          showErrorToast("Failed to run script", `Error= ${error.message}`);
        },
      });

      if (response?.error_message) {
        setRunError(true);
        setConsoleText(response.error_message);
        toast.closeAll();
        showErrorToast("Failed to run script", `Error= ${response.error_message}`);
        return;
      }
      setConsoleText(response?.meta_data?.response || "");
    } catch (error) {
      //setConsoleText(error);
    }
  };

  const handleSave = async () => {
    if (!activeTab) {
      showErrorToast("No active tab", "Please select a script to save.");
      return;
    }
    const editedContent = editorRef.current?.getValue();
    const currentScript = scripts.find((script) => script.name === activeTab);

    if (!currentScript || !editedContent) {
      warningToast("No script or content", "No script or content to save.");
      return;
    }

    if (editedContent === currentScript.content) {
      warningToast("No changes detected", "No edits were made to the active script.");
      return;
    }

    try {
      await editScript.mutateAsync({
        ...currentScript,
        content: editedContent, // Always save the raw edited content
      });
      refetch();
      showSuccessToast("Script updated successfully", "Your changes have been saved.");
    } catch (error) {
      showErrorToast(
        "Error updating script",
        "An error occurred while saving the script. Please try again.",
      );
    }
  };

  const handleDeleteScript = async () => {
    if (!scriptToDelete) return;
    try {
      await deleteScript.mutateAsync(scriptToDelete.id);
      if (openTabs.includes(scriptToDelete.name)) {
        removeTab(scriptToDelete.name);
        if (activeTab === scriptToDelete.name) {
          setActiveTab(openTabs[0] || null);
        }
      }
      await refreshData();
      onClose();
      setScriptToDelete(null);
    } catch (error) {
      showErrorToast("Error deleting script", String(error));
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

  const handleRename = async (script: Script, newName: string) => {
    // Remove .py from the new name if user added it
    const cleanNewName = newName.replace(/\.py$/, "");

    if (!cleanNewName.trim() || script.name.replace(/\.py$/, "") === cleanNewName) {
      setEditingScriptName(null);
      return;
    }

    try {
      await editScript.mutateAsync({
        ...script,
        name: `${cleanNewName}.py`,
      });

      // Update tabs if the renamed script was open
      if (openTabs.includes(script.name)) {
        setOpenTabs(openTabs.map((tab) => (tab === script.name ? `${cleanNewName}.py` : tab)));
      }
      if (activeTab === script.name) {
        setActiveTab(`${cleanNewName}.py`);
      }
      await refreshData();
    } catch (error) {
      toast({
        title: "Error renaming script",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    setEditingScriptName(null);
  };

  const handleFolderCreate = async (name: string, parentId?: number) => {
    await addFolder.mutateAsync({
      name,
      parent_id: parentId,
    });
    await refetchFolders();
  };

  const handleFolderRename = async (folder: ScriptFolder, newName: string) => {
    try {
      await editFolder.mutateAsync({
        id: folder.id,
        name: newName,
      });
      await refetchFolders();
    } catch (error) {
      toast({
        title: "Error renaming folder",
        description: String(error),
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleFolderDelete = async (folder: ScriptFolder) => {
    try {
      await deleteFolder.mutateAsync(folder.id);
      await refreshData();
    } catch (error) {
      toast({
        title: "Error deleting folder",
        description: String(error),
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleScriptClick = (script: Script) => {
    setActiveFolder(null);
    handleScriptClicked(script.name);
  };

  const handleFolderClick = (folder: ScriptFolder) => {
    setActiveTab(null);
    setActiveFolder(folder);
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder.id)) {
        next.delete(folder.id);
        setActiveOpenFolder(null);
      } else {
        next.add(folder.id);
        setActiveOpenFolder(folder);
      }
      return next;
    });
  };

  const Tabs = () => {
    return (
      <HStack spacing={0} justifyContent="flex-start" overflowX="auto" py={1}>
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
            px={3}>
            <HStack spacing={2} flex={1}>
              <PythonIcon fontSize="12px" color={activeTab === tab ? "teal" : "gray"} />
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
      </HStack>
    );
  };

  const Scripts = () => {
    return (
      <Box
        height="100%"
        display="flex"
        flexDirection="column"
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}>
        <VStack spacing={0.5} align="stretch" width="100%" overflowY="auto" height="100%">
          <ScriptFolderTree
            folders={folders}
            scripts={scripts}
            activeScript={activeTab}
            activeFolder={activeFolder}
            activeOpenFolder={activeOpenFolder}
            onScriptClick={handleScriptClick}
            onFolderClick={handleFolderClick}
            onScriptRename={handleRename}
            onScriptDelete={(script) => {
              onOpen();
              setScriptToDelete(script);
            }}
            onFolderCreate={(name, parentId) => {
              handleFolderCreate(name, activeOpenFolder?.id || parentId);
              setFolderCreating(false);
            }}
            onFolderRename={handleFolderRename}
            onFolderDelete={handleFolderDelete}
            openFolders={openFolders}
            isCreatingRootFolder={folderCreating}
            onCancelRootFolderCreation={() => setFolderCreating(false)}
          />
        </VStack>
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
    setActiveFolder(null);
    if (!openTabs.includes(script)) {
      setOpenTabs([...openTabs, script]);
    }
    setActiveTab(script);
  };

  // Define Import and Export buttons
  const importButton = (
    <Button
      leftIcon={<FaFileImport />}
      colorScheme="blue"
      variant="outline"
      onClick={handleImportClick}
      isLoading={isImporting}
      isDisabled={isImporting}
      size="sm" // Match other header buttons if necessary
    >
      Import
    </Button>
  );

  const exportButton = (
    <Button
      leftIcon={<FaFileExport />}
      colorScheme="green"
      variant="outline"
      onClick={onExportConfig}
      isDisabled={!activeTab || isExporting}
      isLoading={isExporting}
      size="sm" // Match other header buttons if necessary
    >
      Export Active Script
    </Button>
  );

  return (
    <Box maxW="100%">
      <ConfirmationModal
        colorScheme="red"
        confirmText={"Delete"}
        header={`Delete Script?`}
        isOpen={isOpen}
        onClick={() => {
          handleDeleteScript();
        }}
        onClose={onClose}>
        {`Are you sure you want to delete ${scriptToDelete?.name}?`}
      </ConfirmationModal>
      <VStack spacing={4} align="stretch" width="100%">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Scripts"
                subTitle="Create and manage Python scripts"
                titleIcon={<Icon as={CodeIcon} boxSize={8} color="teal.500" />}
                mainButton={importButton}
                secondaryButton={exportButton}
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

        {/* Hidden file input for import - only accept .py */}
        <Input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          style={{ display: "none" }}
          accept=".py"
        />

        <Card bg={headerBg} shadow="md">
          <CardBody>
            <HStack
              width="100%"
              alignItems="stretch"
              spacing={4}
              height="calc(100vh - 300px)"
              minH="500px">
              <VStack width="200px" minW="200px" alignItems="flex-start" spacing={4} height="100%">
                <HStack width="100%" spacing={2}>
                  <Input
                    placeholder="Search scripts..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <NewScript
                    activeFolderId={openFolders.size > 0 ? activeFolder?.id : undefined}
                    onScriptCreated={refreshData}
                  />
                  <NewFolder
                    isCreatingRoot={folderCreating}
                    onCancel={() => setFolderCreating(false)}
                    onFolderCreated={refreshData}
                    parentId={activeOpenFolder?.id}
                  />
                </HStack>
                <Box width="100%" flex={1} overflowY="auto" position="relative">
                  <Scripts />
                </Box>
              </VStack>

              <VStack flex={1} spacing={4} height="100%">
                <Box
                  width="100%"
                  borderRadius="md"
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor={borderColor}
                  flex={1}>
                  <HStack
                    width="100%"
                    justify="space-between"
                    p={2}
                    borderBottomWidth="1px"
                    borderColor={borderColor}>
                    <Box flex={1} overflow="hidden">
                      <Tabs />
                    </Box>
                    <HStack spacing={2} flexShrink={0}>
                      <Tooltip label="Save script" openDelay={1000} hasArrow>
                        <Button colorScheme="gray" onClick={handleSave}>
                          <Icon as={SaveIcon} boxSize={6} />
                        </Button>
                      </Tooltip>
                      <Tooltip label="Run script" openDelay={1000} hasArrow>
                        <Button colorScheme="gray" onClick={handleRunScript}>
                          <Icon as={PlayIcon} boxSize={4} />
                        </Button>
                      </Tooltip>
                    </HStack>
                  </HStack>
                  <Box width="100%" overflow="hidden">
                    {activeTab && openTabs.length > 0 ? (
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
                        onMount={handleEditorDidMount}
                      />
                    ) : (
                      <Box
                        width="100%"
                        height="55vh"
                        display="flex"
                        justifyContent="center"
                        alignItems="flex-start"
                        paddingTop="15vh"
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
                        <VStack spacing={2}>
                          <Text fontSize="sm" color="gray.400">
                            Select a script to get started
                          </Text>
                          <Icon as={CodeIcon} boxSize={8} color="gray.400" />
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
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
