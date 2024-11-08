import React, { useState, useEffect, use } from "react";
import {
  Box,
  Button,
  Center,
  FormLabel,
  HStack,
  Text,
  Heading,
  Input,
  VStack,
  Spacer,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { CloseIcon } from "@chakra-ui/icons";
import { SiPython } from "react-icons/si";
import { set } from "zod";
import { RiAddFill } from "react-icons/ri";

interface ScriptsEditorProps {
  code: string;
}

export const ScriptsEditor: React.FC<ScriptsEditorProps> = (props) => {
  const { code } = props;
  const [allScripts, setAllScripts] = useState<string[]>([
    "Test.py",
    "Test2.py",
    "Test3.py",
    "Test4.py",
    "Test5.py",
    "Test6.py",
    "Test7.py",
    "Test8.py",
    "Test9.py",
    "Test10.py",
  ]);
  const [openTabs, setOpenTabs] = useState<string[]>([
    "Test.py",
    "Test2.py",
    "Test3.py",
    "Test4.py",
    "Test5.py",
  ]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredScripts, setFilteredScripts] = useState<string[]>([]);

  const codeTheme = useColorModeValue("vs-light", "vs-dark");
  useEffect(() => {
    if (openTabs.length > 0) {
      setActiveTab(openTabs[openTabs.length - 1]);
    }
  }, [openTabs]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredScripts(
        allScripts.filter((script) => script.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    } else {
      setFilteredScripts(allScripts);
    }
  }, [searchQuery]);

  const Tabs = () => {
    return (
      <HStack spacing={0} justifyContent="flex-start">
        {openTabs.map((tab, index) => (
          <Button
            key={index}
            onClick={() => setActiveTab(tab)}
            borderRadius={0}
            variant="outline"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="150px" // Adjust width as needed
            paddingX={2}
            bg={activeTab === tab ? "teal.600" : "transparent"}>
            <Box flex="1" textAlign="left">
              {tab}
            </Box>
            <CloseIcon fontSize={10} onClick={() => removeTab(tab)} />
          </Button>
        ))}
      </HStack>
    );
  };

  const Scripts = () => {
    return (
      <Box height="100%" display="flex" flexDirection="column">
        {/* Script List with Scrollable Area */}
        <VStack spacing={1} align="stretch" width="100%" flex="1" overflowY="auto">
          {filteredScripts.map((script, index) => (
            <Button
              justifyContent="flex-start"
              leftIcon={<SiPython />}
              borderRadius={0}
              key={index}
              onClick={() => handleScriptClicked(script)}
              width="100%">
              {script}
            </Button>
          ))}
        </VStack>
      </Box>
    );
  };

  const removeTab = (tab: string) => {
    setOpenTabs(openTabs.filter((t) => t !== tab));
  };

  const handleCodeChange = (value?: string) => {
    console.log(value);
  };

  const handleScriptClicked = (script: string) => {
    console.log(script);
    if (!openTabs.includes(script)) {
      setOpenTabs([...openTabs, script]);
    }
    setActiveTab(script);
  };

  return (
    <Box p={1} height="100%">
      <HStack justify="space-between" width="100%">
        <Heading size="lg">Scripts</Heading>
        <Button colorScheme="teal" leftIcon={<RiAddFill />}>
          New Script
        </Button>
      </HStack>
      <HStack width="100%" border="1px solid" boxShadow="md" mt={4} alignItems="flex-start">
        <VStack width="15%" alignItems="flex-start" spacing={4} p={0} height="100%">
          <Text ml={3} as="b">
            SEARCH
          </Text>
          <Input placeholder="Search" onChange={(e) => setSearchQuery(e.target.value)} />
          <Box width="100%">
            <Scripts />
          </Box>
        </VStack>
        <VStack width="85%" borderLeft="1px solid" boxShadow="md">
          <Box width="100%">
            <Tabs />
          </Box>
          <Editor
            height="60vh"
            defaultLanguage="python"
            defaultValue={code.trim()}
            theme={codeTheme}
            options={{
              fontSize: 20,
            }}
            onChange={(value) => handleCodeChange(value)}
          />
        </VStack>
      </HStack>
      <HStack
        spacing={2}
        padding={4}
        borderTop="1px solid"
        boxShadow="md"
        justifyContent="flex-end"
        bg="white"
        position="relative">
        <Button colorScheme="gray" size="sm">
          Save
        </Button>
        <Button colorScheme="teal" size="sm">
          Run
        </Button>
      </HStack>
    </Box>
  );
};
