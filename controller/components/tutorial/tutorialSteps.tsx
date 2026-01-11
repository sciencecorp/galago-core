import { useEffect, useRef } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  Link,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import type { TutorialStep } from "./TutorialContext";
import { useTutorial } from "./TutorialContext";

function RunsStepBody() {
  const { demoData, isBusy, hasQueuedTutorialRun, queueTutorialRun } = useTutorial();
  const hasProtocol = !!demoData?.protocols?.[0]?.id;
  const didAutoQueueRef = useRef(false);

  useEffect(() => {
    // Auto-queue once when arriving at Runs during the walkthrough (when demo data is enabled).
    if (!hasProtocol) return;
    if (didAutoQueueRef.current) return;
    if (hasQueuedTutorialRun) return;

    didAutoQueueRef.current = true;
    queueTutorialRun({ numberOfRuns: 1 }).catch(() => {
      // toast is handled inside queueTutorialRun
    });
  }, [hasProtocol, hasQueuedTutorialRun, queueTutorialRun]);

  return (
    <Box>
      <Text>
        Runs are protocol executions. Use this page to monitor progress (including the Gantt chart)
        and understand what’s currently happening.
      </Text>
      <HStack mt={3} spacing={3}>
        <Button
          size="sm"
          colorScheme="teal"
          onClick={() => queueTutorialRun({ numberOfRuns: 1, force: true })}
          isLoading={isBusy}
          isDisabled={!hasProtocol || isBusy}>
          {hasQueuedTutorialRun ? "Queue another tutorial run" : "Queue tutorial run"}
        </Button>
        {!hasProtocol && (
          <Text fontSize="sm" color="gray.500">
            (Enable “Create demo data” to queue the tutorial protocol.)
          </Text>
        )}
      </HStack>
    </Box>
  );
}

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
          <ListItem>Use Workcells to create/import the environment you’re running in.</ListItem>
          <ListItem>Use Tools to add tools from the driver library and connect them.</ListItem>
          <ListItem>Build Protocols, then monitor Runs (Gantt), and debug via Logs.</ListItem>
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
          Create or import a <b>workcell</b>. This is the top-level container that ties tools,
          labware context, and automation configuration together.
        </Text>
        <UnorderedList mt={3} spacing={1}>
          <ListItem>If you’re new, start by creating a workcell, then set it as selected.</ListItem>
          <ListItem>Import is useful when you’re loading an existing cell configuration.</ListItem>
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
          common tools: <b>pf400</b>, <b>opentrons2</b>, <b>cytation</b>, and <b>liconic</b>. After
          adding, configuration typically happens in the separate <b>Galago Tools</b> app (physical
          instrument ↔ digital representation), then you return here to connect.
        </Text>
        <UnorderedList mt={3} spacing={1}>
          <ListItem>
            Click <b>Connect All</b> to connect every tool with a config.
          </ListItem>
          <ListItem>
            Want to run a simulated protocol (no hardware)? Turn <b>Simulate</b> on for each tool,
            then connect.
          </ListItem>
          <ListItem>Click a tool card to open its dedicated command page.</ListItem>
          <ListItem>
            Open{" "}
            <Link
              href="http://localhost:8080"
              isExternal
              color="teal.500"
              textDecoration="underline"
              _hover={{ color: "teal.600" }}>
              Tools Manager
            </Link>{" "}
            and confirm it’s running on{" "}
            <Link
              href="http://localhost:8080"
              isExternal
              color="teal.500"
              textDecoration="underline"
              _hover={{ color: "teal.600" }}>
              localhost:8080
            </Link>{" "}
            (you should see a green status tag on tool cards when everything is healthy).
          </ListItem>
          <ListItem>
            Learn more about each tool in the{" "}
            <Link
              href="https://galago.bio/user-guide/tools.html"
              isExternal
              color="teal.500"
              textDecoration="underline"
              _hover={{ color: "teal.600" }}>
              Tools docs
            </Link>
            .
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
          Write scripts in supported languages (Python, JavaScript, C#). Scripts are great for
          “glue” logic: calling a LIMS, doing math mid-protocol, and reading/updating variables.
        </Text>
        <Text mt={3} color="gray.600">
          Tip: scripts can be executed directly, or invoked from a protocol step (often via Tool
          Box).
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
          Demo protocol: <b>Tutorial Create Variables …</b> runs a Tool Box script that seeds common
          variables so you can quickly try Runs/Logs without hardware.
        </Text>
        <UnorderedList mt={3} spacing={1}>
          <ListItem>Add tool commands (including script steps) to build the workflow.</ListItem>
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
    body: <RunsStepBody />,
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
          Logs show what happened across the system. If something fails during a run or tool
          connect, this is the first place to check.
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
          <ListItem>Use logs as your audit/debug trail.</ListItem>
        </UnorderedList>
        <Text mt={3} color="gray.500" fontSize="sm">
          (If you enabled demo data, you can remove it from the panel above.)
        </Text>
      </Box>
    ),
  },
];
