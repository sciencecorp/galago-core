import React, { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Code,
  Divider,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spacer,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import type { HubItem } from "./hubTypes";
import { HubFormPreview } from "./HubFormPreview";

function isRecord(v: any): v is Record<string, any> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

type Node = {
  key: string;
  label: string;
  count?: number;
  colorScheme: string;
  details?: any;
};

function extractInventoryRoot(payload: any): any {
  if (!isRecord(payload)) return payload;
  // Some payloads may wrap inventory under an `inventory` property.
  if (isRecord(payload.inventory)) return payload.inventory;
  return payload;
}

function buildSingleTypeNode(item: HubItem): Node {
  const p = item.payload;

  if (item.type === "forms") {
    const fields = isRecord(p) && Array.isArray(p.fields) ? p.fields : [];
    return { key: "forms", label: "Forms", count: 1, colorScheme: "yellow", details: { fields } };
  }

  if (item.type === "variables") {
    const vars = Array.isArray(p)
      ? p
      : isRecord(p) && Array.isArray(p.variables)
        ? p.variables
        : isRecord(p)
          ? [p]
          : [];
    return {
      key: "variables",
      label: "Variables",
      count: vars.length,
      colorScheme: "red",
      details: { vars },
    };
  }

  if (item.type === "protocols") {
    const commands = isRecord(p) && Array.isArray(p.commands) ? p.commands : [];
    return {
      key: "protocols",
      label: "Protocols",
      count: 1,
      colorScheme: "green",
      details: { commands },
    };
  }

  if (item.type === "scripts") {
    const name = isRecord(p) && typeof p.name === "string" ? p.name : item.name;
    const language = isRecord(p) && typeof p.language === "string" ? p.language : "";
    const content = isRecord(p) && typeof p.content === "string" ? p.content : "";
    return {
      key: "scripts",
      label: "Scripts",
      count: 1,
      colorScheme: "purple",
      details: { name, language, content },
    };
  }

  if (item.type === "labware") {
    return {
      key: "labware",
      label: "Labware",
      count: 1,
      colorScheme: "teal",
      details: { labware: p },
    };
  }

  if (item.type === "inventory") {
    return {
      key: "inventory",
      label: "Inventory",
      count: 1,
      colorScheme: "orange",
      details: { inventory: p },
    };
  }

  // Fallback (shouldn't happen given HubItemType union)
  return {
    key: item.type,
    label: item.type,
    count: 1,
    colorScheme: "gray",
    details: { payload: p },
  };
}

function extractNodes(item: HubItem): { centerLabel: string; nodes: Node[] } {
  const p = item.payload;
  const nodes: Node[] = [];

  const centerLabel = (isRecord(p) && typeof p.name === "string" && p.name) || item.name;

  // Non-workcell items: keep the "map" simple — just one bubble is enough.
  // Inventory is the exception (it benefits from nesting breakdown).
  if (item.type !== "workcells" && item.type !== "inventory") {
    return { centerLabel, nodes: [buildSingleTypeNode(item)] };
  }

  // Inventory: show nesting breakdown (plates -> wells -> reagents, etc.)
  if (item.type === "inventory") {
    const inv = extractInventoryRoot(p);
    const hotelsArr = isRecord(inv) && Array.isArray(inv.hotels) ? inv.hotels : [];
    const nestsArr = isRecord(inv) && Array.isArray(inv.nests) ? inv.nests : [];
    const platesArr = isRecord(inv) && Array.isArray(inv.plates) ? inv.plates : [];
    const wellsArr = isRecord(inv) && Array.isArray(inv.wells) ? inv.wells : [];
    const reagentsArr = isRecord(inv) && Array.isArray(inv.reagents) ? inv.reagents : [];

    if (
      hotelsArr.length === 0 &&
      nestsArr.length === 0 &&
      platesArr.length === 0 &&
      wellsArr.length === 0 &&
      reagentsArr.length === 0
    ) {
      // Fallback to a single bubble if we can't detect nested arrays.
      return { centerLabel, nodes: [buildSingleTypeNode(item)] };
    }

    return {
      centerLabel,
      nodes: [
        {
          key: "inventory_hotels",
          label: "Hotels",
          count: hotelsArr.length,
          colorScheme: "orange",
          details: { items: hotelsArr },
        },
        {
          key: "inventory_nests",
          label: "Nests",
          count: nestsArr.length,
          colorScheme: "orange",
          details: { items: nestsArr },
        },
        {
          key: "inventory_plates",
          label: "Plates",
          count: platesArr.length,
          colorScheme: "orange",
          details: { items: platesArr },
        },
        {
          key: "inventory_wells",
          label: "Wells",
          count: wellsArr.length,
          colorScheme: "orange",
          details: { items: wellsArr },
        },
        {
          key: "inventory_reagents",
          label: "Reagents",
          count: reagentsArr.length,
          colorScheme: "orange",
          details: { items: reagentsArr },
        },
      ].filter((n) => (n.count ?? 0) > 0),
    };
  }

  // Workcells: show the richer multi-node breakdown.
  if (isRecord(p)) {
    const toolsArr = Array.isArray(p.tools) ? p.tools : null;
    if (toolsArr)
      nodes.push({
        key: "tools",
        label: "Tools",
        count: toolsArr.length,
        colorScheme: "teal",
        details: { tools: toolsArr },
      });

    // Inventory grouping: hotels, nests, plates, wells, reagents (within a workcell setup)
    const hotelsArr = Array.isArray(p.hotels) ? p.hotels : null;
    const nestsArr = Array.isArray(p.nests) ? p.nests : null;
    const platesArr = Array.isArray(p.plates) ? p.plates : null;
    const wellsArr = Array.isArray(p.wells) ? p.wells : null;
    const reagentsArr = Array.isArray(p.reagents) ? p.reagents : null;
    const invCount =
      (hotelsArr?.length ?? 0) +
      (nestsArr?.length ?? 0) +
      (platesArr?.length ?? 0) +
      (wellsArr?.length ?? 0) +
      (reagentsArr?.length ?? 0);
    if (invCount > 0) {
      nodes.push({
        key: "inventory_group",
        label: "Inventory",
        count: invCount,
        colorScheme: "orange",
        details: { hotelsArr, nestsArr, platesArr, wellsArr, reagentsArr },
      });
    }

    // Protocol/script/form-ish
    if (Array.isArray(p.commands))
      nodes.push({
        key: "commands",
        label: "Commands",
        count: p.commands.length,
        colorScheme: "green",
        details: { commands: p.commands },
      });
    // Forms can be either single form with fields, or a bundle containing forms[]
    if (Array.isArray(p.forms))
      nodes.push({
        key: "forms_bundle",
        label: "Forms",
        count: p.forms.length,
        colorScheme: "yellow",
        details: { forms: p.forms },
      });
    if (Array.isArray(p.fields))
      nodes.push({
        key: "fields",
        label: "Fields",
        count: p.fields.length,
        colorScheme: "yellow",
        details: { fields: p.fields },
      });
    if (typeof p.content === "string")
      nodes.push({
        key: "content",
        label: "Content",
        count: undefined,
        colorScheme: "gray",
        details: { content: p.content },
      });
    if (Array.isArray(p.variables))
      nodes.push({
        key: "variables",
        label: "Variables",
        count: p.variables.length,
        colorScheme: "red",
        details: { vars: p.variables },
      });
    if (Array.isArray(p.scripts))
      nodes.push({
        key: "scripts_bundle",
        label: "Scripts",
        count: p.scripts.length,
        colorScheme: "purple",
        details: { scripts: p.scripts },
      });
  }

  // Keep it tidy
  const dedup = new Map<string, Node>();
  for (const n of nodes) dedup.set(n.key, n);

  return { centerLabel, nodes: Array.from(dedup.values()).slice(0, 10) };
}

export function HubItemMapTab({ item }: { item: HubItem }): JSX.Element {
  const bg = useColorModeValue("gray.50", "gray.900");
  const border = useColorModeValue("gray.200", "gray.700");
  const centerBg = useColorModeValue("white", "gray.800");
  const lineColor = useColorModeValue("#CBD5E0", "#4A5568");
  const panelHeaderBg = useColorModeValue("gray.100", "gray.700");

  const { centerLabel, nodes } = useMemo(() => extractNodes(item), [item]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0);
  const [selectedFormIndex, setSelectedFormIndex] = useState(0);

  const size = 440;
  const center = size / 2;
  const radius = 150;
  const childR = 42;
  const centerR = 70;

  const positioned = useMemo(() => {
    const n = nodes.length || 1;
    return nodes.map((node, idx) => {
      const theta = (Math.PI * 2 * idx) / n - Math.PI / 2;
      const x = center + radius * Math.cos(theta);
      const y = center + radius * Math.sin(theta);
      return { ...node, x, y, theta };
    });
  }, [nodes, center, radius]);

  return (
    <VStack align="stretch" spacing={4}>
      <Box border="1px" borderColor={border} borderRadius="lg" bg={bg} overflow="hidden" p={4}>
        <Box
          position="relative"
          mx="auto"
          width={{ base: "100%", md: `${size}px` }}
          maxW={`${size}px`}
          height={`${size}px`}>
          {/* Connections */}
          <Box as="svg" position="absolute" inset={0} width="100%" height="100%">
            {positioned.map((n) => (
              <line
                key={`line-${n.key}`}
                x1={center}
                y1={center}
                x2={n.x}
                y2={n.y}
                stroke={lineColor}
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.55}
              />
            ))}
          </Box>

          {/* Center bubble */}
          <Box
            position="absolute"
            left={`${center - centerR}px`}
            top={`${center - centerR}px`}
            width={`${centerR * 2}px`}
            height={`${centerR * 2}px`}
            borderRadius="999px"
            bg={centerBg}
            border="1px"
            borderColor={border}
            boxShadow="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            px={4}>
            <VStack spacing={1}>
              <Text fontWeight="bold" noOfLines={2}>
                {centerLabel}
              </Text>
              <Badge colorScheme="purple" variant="subtle">
                {item.type}
              </Badge>
            </VStack>
          </Box>

          {/* Child bubbles */}
          {positioned.map((n, idx) => (
            <Box
              key={n.key}
              position="absolute"
              left={`${n.x - childR}px`}
              top={`${n.y - childR}px`}
              width={`${childR * 2}px`}
              height={`${childR * 2}px`}
              borderRadius="999px"
              border="1px"
              borderColor={border}
              bg={centerBg}
              boxShadow="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              px={2}
              cursor="pointer"
              _hover={{ transform: "scale(1.03)" }}
              transition="transform 0.12s ease"
              onClick={() => {
                setSelectedNode(n);
                setSelectedScriptIndex(0);
                setSelectedFormIndex(0);
              }}>
              <VStack spacing={0} lineHeight={1}>
                <Badge colorScheme={n.colorScheme} variant="solid" fontSize="0.65rem">
                  {n.label}
                </Badge>
                {typeof n.count === "number" ? (
                  <Text fontWeight="bold" fontSize="sm">
                    {n.count}
                  </Text>
                ) : (
                  <Text fontSize="xs" color="gray.500">
                    •
                  </Text>
                )}
              </VStack>
            </Box>
          ))}
        </Box>
      </Box>

      <HStack justify="space-between" color="gray.500" fontSize="sm">
        <Text>Parsed view (best-effort) of what’s inside the JSON.</Text>
        <Text>{nodes.length} nodes</Text>
      </HStack>

      <Modal isOpen={!!selectedNode} onClose={() => setSelectedNode(null)} size="2xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader pr="56px">
            <HStack spacing={3} align="center">
              <Text>{selectedNode?.label}</Text>
              {typeof selectedNode?.count === "number" ? (
                <Badge colorScheme={selectedNode?.colorScheme || "gray"}>
                  {selectedNode?.count}
                </Badge>
              ) : null}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {!selectedNode ? null : (
              <VStack align="stretch" spacing={4}>
                {/* Tools: show image + name */}
                {selectedNode.key === "tools" && Array.isArray(selectedNode.details?.tools) ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {selectedNode.details.tools.map((t: any, i: number) => (
                      <Box
                        key={`${t?.id ?? t?.name ?? i}`}
                        border="1px"
                        borderColor={border}
                        borderRadius="md"
                        overflow="hidden">
                        {t?.image_url ? (
                          <Image
                            src={t.image_url}
                            alt={t?.name || "tool"}
                            width="100%"
                            maxH="150px"
                            objectFit="contain"
                          />
                        ) : null}
                        <Box p={3}>
                          <Text fontWeight="bold" noOfLines={1}>
                            {t?.name ?? `Tool ${i + 1}`}
                          </Text>
                          {t?.type ? (
                            <Text fontSize="sm" color="gray.500">
                              {t.type}
                            </Text>
                          ) : null}
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : null}

                {/* Scripts / Content: code-themed preview */}
                {selectedNode.key === "scripts" ||
                selectedNode.key === "content" ||
                selectedNode.key === "scripts_bundle" ? (
                  <Box>
                    {selectedNode.key === "scripts_bundle" &&
                    Array.isArray(selectedNode.details?.scripts) ? (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box border="1px" borderColor={border} borderRadius="md" p={2}>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Scripts
                          </Text>
                          <VStack align="stretch" spacing={1} maxH="320px" overflowY="auto">
                            {selectedNode.details.scripts.slice(0, 200).map((s: any, i: number) => {
                              const name = typeof s?.name === "string" ? s.name : `Script ${i + 1}`;
                              const isActive = i === selectedScriptIndex;
                              return (
                                <Button
                                  key={`${s?.id ?? name}-${i}`}
                                  size="sm"
                                  justifyContent="flex-start"
                                  variant={isActive ? "solid" : "ghost"}
                                  colorScheme={isActive ? "purple" : "gray"}
                                  onClick={() => setSelectedScriptIndex(i)}>
                                  {name}
                                </Button>
                              );
                            })}
                          </VStack>
                          <Text mt={2} fontSize="xs" color="gray.500">
                            Showing up to 200 scripts.
                          </Text>
                        </Box>
                        <Box>
                          {(() => {
                            const scripts = selectedNode.details?.scripts || [];
                            const s = scripts[selectedScriptIndex] || {};
                            const name = typeof s?.name === "string" ? s.name : "Script";
                            const language = typeof s?.language === "string" ? s.language : "";
                            const content = typeof s?.content === "string" ? s.content : "";
                            return (
                              <Box
                                border="1px"
                                borderColor={border}
                                borderRadius="md"
                                overflow="hidden">
                                <Box px={3} py={2} bg={panelHeaderBg}>
                                  <HStack>
                                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                                      {name}
                                    </Text>
                                    <Spacer />
                                    {language ? <Badge variant="subtle">{language}</Badge> : null}
                                  </HStack>
                                </Box>
                                <Box
                                  bg="gray.900"
                                  color="gray.100"
                                  px={3}
                                  py={3}
                                  maxH="320px"
                                  overflow="auto">
                                  <Code
                                    display="block"
                                    whiteSpace="pre"
                                    bg="transparent"
                                    color="inherit"
                                    fontSize="xs">
                                    {content || "// (empty)"}
                                  </Code>
                                </Box>
                              </Box>
                            );
                          })()}
                        </Box>
                      </SimpleGrid>
                    ) : (
                      <Box border="1px" borderColor={border} borderRadius="md" overflow="hidden">
                        <Box px={3} py={2} bg={panelHeaderBg}>
                          <HStack>
                            <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                              {selectedNode.details?.name || selectedNode.label}
                            </Text>
                            <Spacer />
                            {selectedNode.details?.language ? (
                              <Badge variant="subtle">{selectedNode.details.language}</Badge>
                            ) : null}
                          </HStack>
                        </Box>
                        <Box
                          bg="gray.900"
                          color="gray.100"
                          px={3}
                          py={3}
                          maxH="360px"
                          overflow="auto">
                          <Code
                            display="block"
                            whiteSpace="pre"
                            bg="transparent"
                            color="inherit"
                            fontSize="xs">
                            {selectedNode.details?.content || "// (empty)"}
                          </Code>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : null}

                {/* Variables: list */}
                {selectedNode.key === "variables" && Array.isArray(selectedNode.details?.vars) ? (
                  <Box border="1px" borderColor={border} borderRadius="md" overflow="hidden">
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Type</Th>
                          <Th>Value</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedNode.details.vars.slice(0, 200).map((v: any, i: number) => (
                          <Tr key={`${v?.id ?? v?.name ?? i}`}>
                            <Td fontWeight="semibold">{v?.name ?? `var_${i + 1}`}</Td>
                            <Td>{v?.type ?? ""}</Td>
                            <Td>
                              <Text noOfLines={2} maxW="420px">
                                {typeof v?.value === "string" ? v.value : JSON.stringify(v?.value)}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    <Box p={3}>
                      <Text fontSize="xs" color="gray.500">
                        Showing up to 200 variables.
                      </Text>
                    </Box>
                  </Box>
                ) : null}

                {/* Inventory group: show breakdown */}
                {selectedNode.key === "inventory_group" ? (
                  <Box>
                    <StatGroup>
                      <Stat>
                        <StatLabel>Hotels</StatLabel>
                        <StatNumber>{selectedNode.details?.hotelsArr?.length ?? 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Nests</StatLabel>
                        <StatNumber>{selectedNode.details?.nestsArr?.length ?? 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Plates</StatLabel>
                        <StatNumber>{selectedNode.details?.platesArr?.length ?? 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Wells</StatLabel>
                        <StatNumber>{selectedNode.details?.wellsArr?.length ?? 0}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Reagents</StatLabel>
                        <StatNumber>{selectedNode.details?.reagentsArr?.length ?? 0}</StatNumber>
                      </Stat>
                    </StatGroup>
                    <Divider my={4} />
                    <Text fontSize="sm" color="gray.500">
                      Inventory is grouped because these objects are tightly related (storage +
                      contents + tracking).
                    </Text>
                  </Box>
                ) : null}

                {/* Inventory nodes (hub inventory items): list a best-effort preview */}
                {selectedNode.key.startsWith("inventory_") &&
                selectedNode.key !== "inventory_group" &&
                Array.isArray(selectedNode.details?.items) ? (
                  <Box border="1px" borderColor={border} borderRadius="md" overflow="hidden">
                    <Box px={3} py={2} bg={panelHeaderBg}>
                      <HStack>
                        <Text fontSize="sm" fontWeight="bold">
                          Items
                        </Text>
                        <Spacer />
                        <Text fontSize="xs" color="gray.500">
                          Showing up to 200.
                        </Text>
                      </HStack>
                    </Box>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Type</Th>
                          <Th>ID</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedNode.details.items.slice(0, 200).map((it: any, i: number) => {
                          const name =
                            (isRecord(it) && typeof it.name === "string" && it.name) ||
                            (isRecord(it) && typeof it.label === "string" && it.label) ||
                            `Item ${i + 1}`;
                          const type = isRecord(it) && typeof it.type === "string" ? it.type : "";
                          const id =
                            isRecord(it) && (typeof it.id === "string" || typeof it.id === "number")
                              ? String(it.id)
                              : "";
                          return (
                            <Tr key={`${id || name}-${i}`}>
                              <Td maxW="260px">
                                <Text noOfLines={1} fontWeight="semibold">
                                  {name}
                                </Text>
                              </Td>
                              <Td>{type}</Td>
                              <Td maxW="280px">
                                <Text noOfLines={1}>{id}</Text>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                ) : null}

                {/* Forms: show fields */}
                {(selectedNode.key === "forms" || selectedNode.key === "fields") &&
                Array.isArray(selectedNode.details?.fields) ? (
                  <Tabs variant="enclosed" colorScheme="yellow" isFitted defaultIndex={0}>
                    <TabList>
                      <Tab>Preview</Tab>
                      <Tab>Fields</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel px={0} pt={4}>
                        <HubFormPreview fields={selectedNode.details.fields} title="Form preview" />
                      </TabPanel>
                      <TabPanel px={0} pt={4}>
                        <Box border="1px" borderColor={border} borderRadius="md" p={3}>
                          <Text fontWeight="bold" mb={2}>
                            Fields
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            {selectedNode.details.fields.slice(0, 100).map((f: any, i: number) => (
                              <Box
                                key={`${f?.label ?? i}`}
                                border="1px"
                                borderColor={border}
                                borderRadius="md"
                                p={2}>
                                <HStack>
                                  <Text fontWeight="semibold" noOfLines={1}>
                                    {f?.label ?? `Field ${i + 1}`}
                                  </Text>
                                  <Spacer />
                                  {f?.type ? <Badge variant="subtle">{f.type}</Badge> : null}
                                </HStack>
                                {f?.description ? (
                                  <Text fontSize="sm" color="gray.500" noOfLines={2}>
                                    {f.description}
                                  </Text>
                                ) : null}
                              </Box>
                            ))}
                          </VStack>
                          <Text mt={3} fontSize="xs" color="gray.500">
                            Showing up to 100 fields.
                          </Text>
                        </Box>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                ) : null}

                {/* Forms bundle: select a form, preview it */}
                {selectedNode.key === "forms_bundle" &&
                Array.isArray(selectedNode.details?.forms) ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box border="1px" borderColor={border} borderRadius="md" p={2}>
                      <Text fontSize="sm" fontWeight="bold" mb={2}>
                        Forms
                      </Text>
                      <VStack align="stretch" spacing={1} maxH="320px" overflowY="auto">
                        {selectedNode.details.forms.slice(0, 200).map((f: any, i: number) => {
                          const name = typeof f?.name === "string" ? f.name : `Form ${i + 1}`;
                          const isActive = i === selectedFormIndex;
                          return (
                            <Button
                              key={`${f?.id ?? name}-${i}`}
                              size="sm"
                              justifyContent="flex-start"
                              variant={isActive ? "solid" : "ghost"}
                              colorScheme={isActive ? "yellow" : "gray"}
                              onClick={() => setSelectedFormIndex(i)}>
                              {name}
                            </Button>
                          );
                        })}
                      </VStack>
                      <Text mt={2} fontSize="xs" color="gray.500">
                        Showing up to 200 forms.
                      </Text>
                    </Box>
                    <Box>
                      {(() => {
                        const forms = selectedNode.details?.forms || [];
                        const f = forms[selectedFormIndex] || {};
                        const name = typeof f?.name === "string" ? f.name : "Form";
                        const fields = Array.isArray(f?.fields) ? f.fields : [];
                        const description =
                          typeof f?.description === "string" ? f.description : undefined;
                        return (
                          <HubFormPreview fields={fields} title={name} description={description} />
                        );
                      })()}
                    </Box>
                  </SimpleGrid>
                ) : null}

                {/* Fallback */}
                {selectedNode.key !== "tools" &&
                selectedNode.key !== "scripts" &&
                selectedNode.key !== "scripts_bundle" &&
                selectedNode.key !== "content" &&
                selectedNode.key !== "variables" &&
                selectedNode.key !== "inventory_group" &&
                !selectedNode.key.startsWith("inventory_") &&
                selectedNode.key !== "forms" &&
                selectedNode.key !== "forms_bundle" &&
                selectedNode.key !== "fields" ? (
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      No rich preview for this node yet.
                    </Text>
                  </Box>
                ) : null}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
