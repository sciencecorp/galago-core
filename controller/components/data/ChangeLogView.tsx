import React, { useState, useEffect } from "react";
import { Button, Td, Tr, Box } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

interface ChangeLogViewProps {}

export const ChangeLogView: React.FC<ChangeLogViewProps> = ({}) => {
  const [text, setText] = useState("");
  useEffect(() => {
    // Fetch the markdown file
    fetch("/ChangeLog.pdf")
      .then((response) => response.text())
      .then((markdownText) => {
        // Set the markdown text to state
        setText(markdownText);
      })
      .catch((error) => {
        console.error("Error loading markdown file:", error);
      });
  }, []);

  return (
    <Box width="100%">
      {text && (
        <object
          width="1000px"
          height="1000px"
          data="/ChangeLog.pdf#zoom=120&scrollbar=1&toolbar=1&navpanes=0"
          type="application/pdf">
          {" "}
        </object>
      )}
    </Box>
  );
};
