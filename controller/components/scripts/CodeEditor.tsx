import react, { useState } from "react";

import { Box, Button, Center, HStack, Heading, Select, VStack } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { Font } from "@react-pdf/renderer";
import { css, Global } from "@emotion/react";

interface ScriptsEditorProps {
    code: string;
}

export const ScriptsEditor : React.FC<ScriptsEditorProps> = (props) => {
    const {code} = props;

    const handleCodeChange = (value?: string) => {
        console.log(value);
    };

    return (
        
    <Box>
        <Heading size="lg">Scripts</Heading>
        <HStack width="100%">
            <VStack width="15%">
            </VStack>
            <Editor
            height="90vh"
            defaultLanguage="python"
            defaultValue={code.trim()}
            theme="vs-dark"
            options={{
              fontSize: 20,
            }}
            onChange={(value) => handleCodeChange(value)}
          />
        </HStack>
        <Center p={5}>
            <HStack>
                <Button colorScheme="teal">Save</Button>
                <Button colorScheme="red">Discard</Button>
            </HStack>
        </Center>

    </Box>
    
    )
};