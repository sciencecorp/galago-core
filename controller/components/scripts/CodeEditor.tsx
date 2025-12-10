import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  HStack,
  Text,
  Input,
  VStack,
  useColorModeValue,
  Tooltip,
  Card,
  CardBody,
  Icon,
  useDisclosure,
  IconButton,
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
  loadingToast,
} from "../ui/Toast";
import { useScriptColors } from "../ui/Theme";
import {
  CloseIcon,
  PythonIcon,
  CodeIcon,
  PlayIcon,
  SaveIcon,
  JavaScriptIcon,
  CSharpIcon,
  DownloadIcon,
} from "../ui/Icons";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import { useScriptIO } from "@/hooks/useScriptIO";
import { errorToast } from "../ui/Toast";
import { FaFileImport, FaFileExport } from "react-icons/fa";

import { fileTypeToExtensionMap } from "./utils";
import { Console } from "./Console";
import { ResizablePanel } from "./ResizablePanel";
import { logAction } from "@/server/logger";

export const ScriptsEditor: React.FC = (): JSX.Element => {
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<ScriptFolder | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<number>>(new Set());
  const [activeOpenFolder, setActiveOpenFolder] = useState<ScriptFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { hoverBg, bgColor, borderColor, consoleHeaderBg, consoleBg } = useScriptColors();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [folders, setFolders] = useState<ScriptFolder[]>([]);
  const { data: fetchedScript, refetch } = trpc.script.getAll.useQuery();
  const { data: fetchedFolders, refetch: refetchFolders } = trpc.script.getAllFolders.useQuery();
  const { data: selectedWorkcellName } = trpc.workcell.getSelectedWorkcell.useQuery();
  const { data: workcells } = trpc.workcell.getAll.useQuery();
  const editScript = trpc.script.edit.useMutation();
  const deleteScript = trpc.script.delete.useMutation();
  const addFolder = trpc.script.addFolder.useMutation();
  const editFolder = trpc.script.editFolder.useMutation();
  const deleteFolder = trpc.script.deleteFolder.useMutation();
  const codeTheme = useColorModeValue("vs-light", "vs-dark");
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});
  const [scriptsEdited, setScriptsEdited] = useState<Script[]>([]);
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
  const [editorLanguage, setEditorLanguage] = useState<string>("python");
  const jsIconColor = useColorModeValue("orange", "yellow");

  // Define refreshData function here
  const refreshData = async () => {
    await refetch();
    await refetchFolders();
  };

  // Get active script based on activeTab name
  const getActiveScript = () => {
    if (!activeTab) return null;
    return scripts.find((s) => `${s.name}.${fileTypeToExtensionMap[s.language]}` === activeTab);
  };

  // Get active script ID based on activeTab name
  const activeScriptId = getActiveScript()?.id;

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
    const activeScript = getActiveScript();
    if (activeScript) {
      setEditorLanguage(activeScript.language || "python");

      // If we have edited content for this script, use that
      if (activeScript.id && editedContents[activeScript.id]) {
        setCurrentContent(editedContents[activeScript.id]);
      } else {
        // Otherwise use the original content
        setCurrentContent(activeScript.content || "");
      }
    }
  }, [activeTab, scripts, editedContents]);

  useEffect(() => {
    if (fetchedFolders) {
      setFolders(fetchedFolders);
    }
  }, [fetchedFolders]);

  const handleRunScript = async () => {
    setRunError(false);
    setConsoleText("");
    if (!activeTab) return;

    // Create a promise that wraps the mutation
    const runScriptPromise = new Promise((resolve, reject) => {
      runScript.mutate(activeTab, {
        onSuccess: (data) => {
          // Handle the response data the same way as before
          if (data?.meta_data?.response) {
            setConsoleText(data.meta_data.response);
            setRunError(false);
          } else if (data?.error_message) {
            setRunError(true);
            setConsoleText(data.error_message);
            reject(new Error(data.error_message));
            return;
          } else {
            setRunError(false);
            setConsoleText("");
          }
          resolve(data);
        },
        onError: (error) => {
          setRunError(true);

          // Check if this is a gRPC connection error
          if (error.message && error.message.includes("UNAVAILABLE: No connection established")) {
            const userFriendlyMessage = `Cannot connect to script execution server. Please ensure the gRPC Python server is running and accessible.

Connection Error: ${error.message}

To resolve this issue:
1. Verify the Python gRPC server is started
2. Check if the server is running on the expected port (1010)
3. Ensure there are no network connectivity issues`;

            setConsoleText(userFriendlyMessage);
            reject(new Error("gRPC Server Connection Failed"));
          } else if (error.message && error.message.includes("ENETUNREACH")) {
            const userFriendlyMessage = `Network unreachable - Cannot connect to script execution server.

The system cannot establish a connection to the gRPC server. This typically means:
1. The Python gRPC server is not running
2. Network configuration issues
3. Port 1010 may be blocked or unavailable

Original Error: ${error.message}`;

            setConsoleText(userFriendlyMessage);
            reject(new Error("Network Connection Failed"));
          } else {
            setConsoleText(error.message);
            reject(error);
          }
        },
      });
    });

    // Use the loadingToast with the promise
    loadingToast(
      `Executing ${activeTab}...`,
      "Please wait for script to complete.",
      runScriptPromise,
      {
        successTitle: `Script ${activeTab} completed!`,
        successDescription: () => "The script execution finished successfully",
        errorTitle: "Failed to run script",
        errorDescription: (error) => {
          // Provide more specific error messages for connection issues
          if (error.message === "gRPC Server Connection Failed") {
            return "Cannot connect to script execution server. Please check if the gRPC Python server is running. If it is, check the status of Tool Box in the tools page.";
          } else if (error.message === "Network Connection Failed") {
            return "Network connection to script execution server failed. Please verify server status.";
          } else {
            return `Error: ${error.message}`;
          }
        },
      },
    );

    try {
      await runScriptPromise;
    } catch (error) {
      logAction({
        level: "error",
        action: "Script Execution Failed",
        details: `Error executing script ${activeTab}: ${error}`,
      });
    }
  };

  const handleSave = async () => {
    if (!activeTab) {
      showErrorToast("No active tab", "Please select a script to save.");
      return;
    }

    const activeScript = getActiveScript();
    if (!activeScript) {
      warningToast("Script not found", "Could not find the active script.");
      return;
    }

    const editedContent = editorRef.current?.getValue();
    if (!editedContent) {
      warningToast("No content", "No content to save.");
      return;
    }

    if (editedContent === activeScript.content) {
      warningToast("No changes detected", "No edits were made to the active script.");
      return;
    }

    try {
      await editScript.mutateAsync({
        ...activeScript,
        content: editedContent, // Always save the raw edited content
      });

      // Clear the edited content after saving
      if (activeScript.id) {
        setEditedContents((prev) => {
          const newState = { ...prev };
          delete newState[activeScript.id];
          return newState;
        });
      }

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

      const tabName = `${scriptToDelete.name}.${fileTypeToExtensionMap[scriptToDelete.language]}`;
      if (openTabs.includes(tabName)) {
        removeTab(tabName);
        if (activeTab === tabName) {
          setActiveTab(openTabs[0] || null);
        }
      }

      // Clear any edited content for this script
      if (scriptToDelete.id) {
        setEditedContents((prev) => {
          const newState = { ...prev };
          delete newState[scriptToDelete.id];
          return newState;
        });
      }

      await refreshData();
      onClose();
      setScriptToDelete(null);
    } catch (error) {
      showErrorToast("Error deleting script", String(error));
    }
  };

  useEffect(() => {
    if (openTabs.length > 0 && !activeTab) {
      setActiveTab(openTabs[openTabs.length - 1]);
    }
  }, [openTabs, activeTab]);

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
    const cleanNewName = newName.trim();
    try {
      await editScript.mutateAsync({
        ...script,
        name: cleanNewName,
      });

      // Update tabs if the renamed script was open
      const oldTabName = `${script.name}.${fileTypeToExtensionMap[script.language]}`;
      const newTabName = `${cleanNewName}.${fileTypeToExtensionMap[script.language]}`;

      if (openTabs.includes(oldTabName)) {
        setOpenTabs(openTabs.map((tab) => (tab === oldTabName ? newTabName : tab)));
      }
      if (activeTab === oldTabName) {
        setActiveTab(newTabName);
      }
      await refreshData();
    } catch (error) {
      errorToast("Error renaming script", `Please try again. ${error}`);
    }
    setEditingScriptName(null);
  };

  const handleFolderCreate = async (name: string, parentId?: number) => {
    // Get the workcell ID from the selected workcell name
    const selectedWorkcell = workcells?.find((wc) => wc.name === selectedWorkcellName);
    if (!selectedWorkcell) {
      showErrorToast("Error creating folder", "No workcell selected");
      return;
    }

    await addFolder.mutateAsync({
      name,
      parent_id: parentId,
      workcell_id: selectedWorkcell.id,
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
      errorToast("Error renaming folder", String(error));
    }
  };

  const handleFolderDelete = async (folder: ScriptFolder) => {
    try {
      await deleteFolder.mutateAsync(folder.id);
      await refreshData();
    } catch (error) {
      errorToast("Error deleting folder", String(error));
    }
  };

  const handleScriptClick = (script: Script) => {
    setActiveFolder(null);
    const fullName = `${script.name}.${fileTypeToExtensionMap[script.language]}`;
    handleScriptClicked(fullName, script);
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

  const getTabIcon = (tabName: string) => {
    const extension = tabName.split(".").pop();
    if (extension === "js") {
      return <JavaScriptIcon color={activeTab === tabName ? jsIconColor : "gray"} />;
    } else if (extension === "cs" || extension === "csharp") {
      return <CSharpIcon color={activeTab === tabName ? jsIconColor : "gray"} />;
    } else {
      return <PythonIcon fontSize="13px" color={activeTab === tabName ? "teal" : "gray"} />;
    }
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
              {getTabIcon(tab)}
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

  const removeTab = (tab: string) => {
    // If active tab is being removed, capture its content first
    if (activeTab === tab) {
      const activeScript = getActiveScript();
      if (activeScript?.id && editorRef.current) {
        const currentValue = editorRef.current.getValue();
        // Store current edits in case the tab is reopened
        if (currentValue !== activeScript.content) {
          setEditedContents((prev) => ({
            ...prev,
            [activeScript.id]: currentValue,
          }));
        }
      }
    }

    // Remove the tab
    const newTabs = openTabs.filter((t) => t !== tab);
    setOpenTabs(newTabs);

    // If we're removing the active tab, set a new active tab
    if (activeTab === tab && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1]);
    } else if (newTabs.length === 0) {
      setActiveTab(null);
    }
  };

  const handleCodeChange = (value?: string) => {
    if (!activeTab || !value) return;

    const activeScript = getActiveScript();
    if (!activeScript || !activeScript.id) return;

    // Store edited content by script id to prevent content mixing
    setEditedContents((prev) => ({
      ...prev,
      [activeScript.id]: value,
    }));

    setScriptsEdited((prev) => {
      const existingScriptIndex = prev.findIndex((script) => script.id === activeScript.id);
      if (existingScriptIndex >= 0) {
        return prev.map((script, index) =>
          index === existingScriptIndex ? { ...script, content: value } : script,
        );
      } else {
        return [...prev, { ...activeScript, content: value }];
      }
    });
  };

  const handleScriptClicked = (fullName: string, script?: Script) => {
    setActiveFolder(null);

    // If opening a new tab, make sure we sync any unsaved changes first
    if (activeTab && !openTabs.includes(fullName)) {
      const currentScript = getActiveScript();
      if (currentScript?.id && editorRef.current) {
        const currentValue = editorRef.current.getValue();
        if (currentValue !== currentScript.content) {
          setEditedContents((prev) => ({
            ...prev,
            [currentScript.id]: currentValue,
          }));
        }
      }
    }

    if (!openTabs.includes(fullName)) {
      setOpenTabs([...openTabs, fullName]);
    }
    setActiveTab(fullName);
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
      size="sm">
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
      size="sm">
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
                subTitle="Create and manage Python and JavaScript scripts"
                titleIcon={<Icon as={CodeIcon} boxSize={8} color="teal.500" />}
                mainButton={importButton}
                // secondaryButton={exportButton}
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Hidden file input for import - accept .py and .js files */}
        <Input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          style={{ display: "none" }}
          accept=".py,.js"
        />

        <Card borderRadius="lg" bg={headerBg} shadow="md">
          <CardBody>
            <HStack
              width="100%"
              alignItems="stretch"
              spacing={1}
              height="calc(100vh - 100px)"
              minH="500px">
              <ResizablePanel
                initialWidth="200px"
                minWidth="100px"
                maxWidth="30%"
                borderColor={borderColor}>
                <VStack alignItems="flex-start" spacing={4} height="100%">
                  <HStack width="100%" spacing={2}>
                    <Input
                      size="sm"
                      fontSize="xs"
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
              </ResizablePanel>

              <VStack flex={1} spacing={0} height="100%">
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
                      <Tooltip label="Download Script" openDelay={1000} hasArrow>
                        <IconButton
                          aria-label="Download Script"
                          icon={<DownloadIcon size={14} />}
                          colorScheme="gray"
                          variant="outline"
                          onClick={onExportConfig}
                          isDisabled={!activeTab || isExporting}
                          isLoading={isExporting}
                          size="sm"
                        />
                      </Tooltip>
                      <Tooltip label="Save script" openDelay={1000} hasArrow>
                        <IconButton
                          aria-label="Save Script"
                          icon={<SaveIcon />}
                          colorScheme="gray"
                          variant="outline"
                          onClick={handleSave}
                          size="sm"
                        />
                      </Tooltip>
                      <Tooltip label="Run Script" openDelay={1000} hasArrow>
                        <IconButton
                          aria-label="Run Script"
                          icon={<PlayIcon />}
                          variant="outline"
                          onClick={() => {
                            handleRunScript();
                          }}
                          size="sm"
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>
                  <Box width="100%" overflow="hidden">
                    {activeTab && openTabs.length > 0 ? (
                      <Editor
                        height="90vh"
                        language={editorLanguage}
                        value={currentContent}
                        theme={codeTheme}
                        options={{
                          fontSize: 14,
                          wordWrap: "on",
                        }}
                        onChange={(value) => handleCodeChange(value)}
                        onMount={handleEditorDidMount}
                        key={activeTab}
                      />
                    ) : (
                      <Box
                        width="100%"
                        height="90vh"
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

                <Console
                  consoleText={consoleText}
                  runError={runError}
                  consoleHeaderBg={consoleHeaderBg}
                  consoleBg={consoleBg}
                  borderColor={borderColor}
                />
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
