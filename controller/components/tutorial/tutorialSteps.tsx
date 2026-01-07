import React from "react";
import { Box, Heading, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import type { TutorialStep } from "./TutorialContext";

export const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    route: "/",
    title: "Welcome to the Galago walkthrough",
    body: <Box />,
  },
  {
    id: "home",
    route: "/",
    title: "Home (Dashboard)",
    body: (
      <Box>
        <Text>
          Home is your hub: quick stats plus links to every major page. In general, your flow starts
          with <b>Workcells</b> (define the automation cell) and <b>Tools</b> (connect instruments),
          then you build <b>Protocols</b> and run them.
        </Text>
        <UnorderedList mt={3} spacing={1}>
          <ListItem>
            Use Workcells to create/import the environment you’re running in.
          </ListItem>
          <ListItem>
            Use Tools to add tools from the driver library and connect them (incl. Tool Box).
          </ListItem>
          <ListItem>
            Build Protocols, then monitor Runs (Gantt), and debug via Logs.
          </ListItem>
        </UnorderedList>
      </Box>
    ),
  },
  {
    id: "workcells",
    route: "/workcells",
    title: "Workcells",
    body: (
      <Box>
        <Text>
          Create or import a <b>workcell</b>. This is the top-level container that ties tools, labware
          context, and automation configuration together.
        </Text>
        <UnorderedList mt={3} spacing={1}>
          <ListItem>
            If you’re new, start by creating a workcell, then set it as selected.
          </ListItem>
          <ListItem>
            Import is useful when you’re loading an existing cell configuration.
          </ListItem>
        </UnorderedList>
      </Box>
    ),
  },
  {
    id: "tools",
    route: "/tools",
    title: "Tools",
    body: (
      <Box>
        <Text>
          Add tools from the tool driver library and connect them. In this tutorial we seed four
          common tools: <b>pf400</b>, <b>opentrons2</b>, <b>cytation</b>, and <b>liconic</b>.
          After adding, configuration typically happens in the separate <b>Galago Tools</b> app
          (physical instrument ↔ digital representation), then you return here to connect.
        </Text>
        <UnorderedList mt={3} spacing={1}>
          <ListItem>
            Click <b>Connect All</b> to connect every tool with a config.
          </ListItem>
          <ListItem>
            Click a tool card to open its dedicated command page.
          </ListItem>
          <ListItem>
            The built-in <b>Tool Box</b> tool provides utilities like running scripts and sending
            messages (email/Slack/etc).
          </ListItem>
        </UnorderedList>
      </Box>
    ),
  },
  {
    id: "variables",
    route: "/variables",
    title: "Variables",
    body: (
      <Box>
        <Text>
          Variables are shared values you can reference across the app. They become most powerful
          when used in <b>scripts</b> and <b>protocols</b> so runs can track metrics and adapt over
          time.
        </Text>
      </Box>
    ),
  },
  {
    id: "scripts",
    route: "/scripts",
    title: "Scripts",
    body: (
      <Box>
        <Text>
          Write scripts in supported languages (Python, JavaScript, C#). Scripts are great for “glue”
          logic: calling a LIMS, doing math mid-protocol, and reading/updating variables.
        </Text>
        <Text mt={3} color="gray.600">
          Tip: scripts can be executed directly, or invoked from a protocol step (often via Tool Box).
        </Text>
      </Box>
    ),
  },
  {
    id: "protocols",
    route: "/protocols",
    title: "Protocols",
    body: (
      <Box>
        <Text>
          Protocols are workflows composed of tool commands. You can incorporate variables as inputs
          and call scripts as steps to add decision-making and integrations.
        </Text>
        <Text mt={3} color="gray.600">
          Demo protocol: <b>Tutorial Media Exchange …</b> shows a realistic flow (fetch plate from
          Liconic → run an Opentrons program → read on Cytation → store plate back).
        </Text>
        <UnorderedList mt={3} spacing={1}>
          <ListItem>
            Add tool commands (including script steps) to build the workflow.
          </ListItem>
          <ListItem>
            Run the protocol to create a run that appears in <b>Runs</b>.
          </ListItem>
        </UnorderedList>
      </Box>
    ),
  },
  {
    id: "runs",
    route: "/runs",
    title: "Runs",
    body: (
      <Box>
        <Text>
          Runs are protocol executions. Use this page to monitor progress (including the Gantt chart)
          and understand what’s currently happening.
        </Text>
      </Box>
    ),
  },
  {
    id: "forms",
    route: "/forms",
    title: "Forms",
    body: (
      <Box>
        <Text>
          Forms can be inserted into protocols to collect structured operator input at the right
          time. This drastically improves the UX for protocol running.
        </Text>
      </Box>
    ),
  },
  {
    id: "inventory",
    route: "/inventory",
    title: "Inventory",
    body: (
      <Box>
        <Text>
          Track consumables and plates. If you have automated incubation, inventory helps you keep
          tabs on culture plates and represent storage locations (including static hotels).
        </Text>
      </Box>
    ),
  },
  {
    id: "labware",
    route: "/labware",
    title: "Labware",
    body: (
      <Box>
        <Text>
          Labware provides consistent physical context (plate types, definitions, layouts) so tools
          and protocols can refer to the same standardized objects.
        </Text>
      </Box>
    ),
  },
  {
    id: "logs",
    route: "/logs",
    title: "Logs",
    body: (
      <Box>
        <Text>
          Logs show what happened across the system. If something fails during a run or tool connect,
          this is the first place to check.
        </Text>
        <Text mt={3}>
          You’re done — you now have the map of how Galago fits together end-to-end.
        </Text>
        <Heading size="sm" mt={4}>
          Next steps
        </Heading>
        <UnorderedList mt={2} spacing={1}>
          <ListItem>
            Create/import a workcell, add tools, configure in Galago Tools, then connect here.
          </ListItem>
          <ListItem>
            Build a protocol that calls tool commands + scripts + variables, then monitor the run.
          </ListItem>
          <ListItem>
            Use logs as your audit/debug trail.
          </ListItem>
        </UnorderedList>
        <Text mt={3} color="gray.500" fontSize="sm">
          (If you enabled demo data, you can remove it from the panel above.)
        </Text>
      </Box>
    ),
  },
];


