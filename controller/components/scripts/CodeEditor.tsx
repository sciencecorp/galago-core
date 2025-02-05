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
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { CloseIcon } from "@chakra-ui/icons";
import { SiPython } from "react-icons/si";
import { set } from "zod";
import { RiAddFill } from "react-icons/ri";
import { trpc } from "@/utils/trpc";
import { Script } from "@/types/api";
import { RiDeleteBinLine } from "react-icons/ri";
import { NewScript } from "./NewScript";
import { PageHeader } from "../ui/PageHeader";
import { DeleteWithConfirmation } from "../ui/Delete";
import { VscCode } from "react-icons/vsc";

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
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>("");
  const consoleHeaderBg = useColorModeValue("gray.100", "gray.800");
  const [consoleText, setConsoleText] = useState<string>("");
  const activeTabFontColor = useColorModeValue("teal.600", "teal.200");
  const runScript = trpc.script.run.useMutation();
  const [runError, setRunError] = useState<boolean>(false);
  const headerBg = useColorModeValue("white", "gray.700");

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
      <HStack spacing={0} justifyContent="flex-start">
        {openTabs.map((tab, index) => (
          <Button
            leftIcon={<SiPython fontSize="12px" />}
            key={index}
            onClick={() => setActiveTab(tab)}
            borderRadius={0}
            variant="outline"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            minW="180px"
            maxW="480px"
            w={tab.length > 15 ? "auto" : "180px"}
            paddingX={2}>
            <Box flex="1" textAlign="left" pl={1} isTruncated width="100%" pr={2}>
              <Text color={activeTab === tab ? activeTabFontColor : ""}>{tab}</Text>
            </Box>
            <CloseIcon fontSize={8} onClick={() => removeTab(tab)} />
          </Button>
        ))}
      </HStack>
    );
  };

  const Scripts = () => {
    return (
      <Box height="100%" display="flex" flexDirection="column">
        <VStack spacing={0.5} align="stretch" width="100%" flex="1" overflowY="auto">
          {scripts.map((script, index) => (
            <Tooltip label={script.description} key={index}>
              <Button
                justifyContent="flex-start"
                leftIcon={<SiPython />}
                borderRadius={0}
                key={index}
                onClick={() => handleScriptClicked(script.name)}
                width="100%">
                <HStack justify="space-between" width="100%">
                  <Text fontSize="14px">{script.name}</Text>
                  <Spacer />
                  <DeleteWithConfirmation label="Script" onDelete={() => handleDelete(script)} />
                </HStack>
              </Button>
            </Tooltip>
          ))}
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
    if (!openTabs.includes(script)) {
      setOpenTabs([...openTabs, script]);
    }
    setActiveTab(script);
  };

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch" width="100%">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Scripts"
                subTitle="Create and manage Python scripts"
                titleIcon={<Icon as={VscCode} boxSize={8} color="teal.500" />}
                mainButton={<NewScript />}
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
            <HStack width="100%" alignItems="flex-start" spacing={4}>
              <VStack width="200px" minW="200px" alignItems="flex-start" spacing={4}>
                <Input
                  placeholder="Search scripts..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Box width="100%">
                  <Scripts />
                </Box>
              </VStack>

              <VStack flex={1} spacing={0}>
                <HStack width="100%" spacing={4} align="flex-start" justify="space-between">
                  <Box width="100%">
                    <HStack width="100%" justify="space-between" mb={2}>
                      <Box flex={1} overflow="hidden">
                        <Tabs />
                      </Box>
                      <HStack spacing={2} flexShrink={0}>
                        <Button colorScheme="gray" onClick={handleSave}>
                          Save
                        </Button>
                        <Button colorScheme="teal" onClick={handleRunScript}>
                          Run
                        </Button>
                      </HStack>
                    </HStack>
                    <Box width="100%" overflow="hidden">
                      {activeTab && openTabs.length > 0 ? (
                        <Editor
                          height="60vh"
                          defaultLanguage="python"
                          value={currentContent}
                          theme={codeTheme}
                          options={{
                            fontSize: 20,
                            wordWrap: "on",
                          }}
                          onChange={(value) => handleCodeChange(value)}
                        />
                      ) : (
                        <Box
                          width="100%"
                          height="60vh"
                          display="flex"
                          justifyContent="center"
                          alignItems="center">
                          <Text>Select a script to view or edit</Text>
                        </Box>
                      )}
                    </Box>
                    <Box
                      width="100%"
                      height="20vh"
                      bg={consoleBg}
                      borderTop={`1px solid ${borderColor}`}>
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
                </HStack>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
