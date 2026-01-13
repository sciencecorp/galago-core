import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spacer,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Search, LibraryBig } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { errorToast, successToast, warningToast } from "@/components/ui/Toast";
import { HubItemDetailModal } from "./HubItemDetailModal";
import type { HubItem, HubItemSummary, HubItemType } from "./hubTypes";
import {
  HUB_TYPES,
  formatHubTimestamp,
  hubItemToJsonFile,
  itemTypeLabel,
  normalizeTags,
} from "./hubUtils";
// Hub runs fully via tRPC + local storage; downloads are done client-side from payload.

function isRecord(v: any): v is Record<string, any> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function unwrapHubPayload<T = any>(payload: any): T {
  // Some users may upload a "hub item JSON" that itself wraps the real payload under `payload`.
  // Prefer unwrapping once when it looks like a hub item envelope.
  if (
    isRecord(payload) &&
    "payload" in payload &&
    isRecord((payload as any).payload) &&
    // heuristics: hub envelope usually has some of these
    ("id" in payload || "type" in payload || "created_at" in payload || "updated_at" in payload)
  ) {
    return (payload as any).payload as T;
  }
  return payload as T;
}

function normalizeWorkcellImportPayload(raw: any): any {
  const p = unwrapHubPayload<any>(raw);
  if (isRecord(p) && isRecord((p as any).workcell)) return p;

  // Accept a flat-ish workcell payload and wrap it
  if (isRecord(p) && typeof (p as any).name === "string") {
    return {
      version: (p as any).version,
      exportedAt: (p as any).exportedAt,
      workcell: {
        name: (p as any).name,
        location: (p as any).location ?? null,
        description: (p as any).description ?? null,
      },
      tools: (p as any).tools,
      hotels: (p as any).hotels,
      labware: (p as any).labware,
      forms: (p as any).forms,
      variables: (p as any).variables,
      protocols: (p as any).protocols,
      scriptFolders: (p as any).scriptFolders,
      scripts: (p as any).scripts,
    };
  }

  return p;
}

export function HubComponent(): JSX.Element {
  const headerBg = useColorModeValue("white", "gray.700");
  const subtleBg = useColorModeValue("gray.50", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  const [selectedType, setSelectedType] = useState<HubItemType | "all">("all");
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const detailModal = useDisclosure();

  const libraryListQuery = trpc.hubLibrary.list.useQuery({
    type: selectedType === "all" ? undefined : selectedType,
    q: q.trim() ? q.trim() : undefined,
  });

  const activeLibraryItemQuery = trpc.hubLibrary.get.useQuery(
    { id: activeId || "" },
    { enabled: !!activeId },
  );

  const workcellGetSelected = trpc.workcell.getSelectedWorkcell.useQuery();
  const workcellGet = trpc.workcell.get.useMutation();
  const workcellSetSelected = trpc.workcell.setSelectedWorkcell.useMutation();
  const toolClearStore = trpc.tool.clearToolStore.useMutation();

  const variableGetAll = trpc.variable.getAll.useQuery(undefined, { enabled: false });
  const variableAdd = trpc.variable.add.useMutation();
  const variableEdit = trpc.variable.edit.useMutation();

  const scriptAdd = trpc.script.add.useMutation();
  const workcellImport = trpc.workcell.importConfig.useMutation();
  const labwareImport = trpc.labware.importConfig.useMutation();
  const formImport = trpc.form.importConfig.useMutation();
  const protocolImport = trpc.protocol.import.useMutation();

  const items = useMemo(
    () => (libraryListQuery.data ?? []) as HubItemSummary[],
    [libraryListQuery.data],
  );

  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    for (const t of HUB_TYPES) byType[t.type] = 0;
    for (const i of items) byType[i.type] = (byType[i.type] || 0) + 1;
    return byType;
  }, [items]);

  const openItem = async (id: string) => {
    setActiveId(id);
    detailModal.onOpen();
  };

  const handleDownload = async (item: HubItem) => {
    try {
      // Download directly from the in-memory payload (works for both library + hub).
      if (item.source === "library" || item.source === "hub") {
        const f = hubItemToJsonFile(item);
        const blobUrl = window.URL.createObjectURL(f);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = f.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        successToast("Download started", "Your browser should begin downloading the JSON file.");
        return;
      }
    } catch (e: any) {
      errorToast("Download failed", e?.message || String(e));
    }
  };

  const ensureSelectedWorkcellId = async (): Promise<number | null> => {
    const selectedName = (workcellGetSelected.data || "").toString();
    if (!selectedName) return null;
    const wc = await workcellGet.mutateAsync(selectedName);
    return (wc as any)?.id ?? null;
  };

  const loadWorkcell = async (item: HubItem) => {
    const payload = normalizeWorkcellImportPayload(item.payload);
    await workcellImport.mutateAsync(payload);
    // Best-effort: select the imported workcell (prefer payload.name)
    const unwrapped = unwrapHubPayload<any>(item.payload);
    const importedName =
      (isRecord(unwrapped) &&
        isRecord((unwrapped as any).workcell) &&
        typeof (unwrapped as any).workcell.name === "string" &&
        (unwrapped as any).workcell.name) ||
      (isRecord(unwrapped) &&
        typeof (unwrapped as any).name === "string" &&
        (unwrapped as any).name) ||
      item.name;
    await workcellSetSelected.mutateAsync(importedName);
    await toolClearStore.mutateAsync();
  };

  const loadLabware = async (item: HubItem) => {
    await labwareImport.mutateAsync(unwrapHubPayload(item.payload) as any);
  };

  const loadForm = async (item: HubItem) => {
    // Accept either raw form or wrapper { form: ... } / { forms: [...] }
    const p = unwrapHubPayload<any>(item.payload);
    const formPayload =
      (isRecord(p) && isRecord((p as any).form) && (p as any).form) ||
      (isRecord(p) && Array.isArray((p as any).forms) && (p as any).forms?.[0]) ||
      p;
    await formImport.mutateAsync(formPayload);
  };

  const loadProtocol = async (item: HubItem) => {
    const wcId = await ensureSelectedWorkcellId();
    if (!wcId) {
      throw new Error("No workcell selected. Select a workcell first, then load this protocol.");
    }
    const p = unwrapHubPayload<any>(item.payload);
    const protocolPayload = (
      isRecord(p) && isRecord((p as any).protocol) ? (p as any).protocol : p
    ) as any;
    await protocolImport.mutateAsync({ workcellId: wcId, protocol: protocolPayload });
  };

  const loadVariables = async (item: HubItem) => {
    const vars = unwrapHubPayload<any>(item.payload);
    const incoming: any[] = Array.isArray(vars)
      ? vars
      : isRecord(vars) && Array.isArray(vars.variables)
        ? vars.variables
        : isRecord(vars)
          ? [vars]
          : [];

    if (incoming.length === 0) {
      throw new Error("No variables found in payload.");
    }

    const existingRes = await variableGetAll.refetch();
    const existing = existingRes.data || [];
    for (const v of incoming) {
      if (!isRecord(v) || typeof v.name !== "string") continue;
      const name = v.name;
      const value = typeof v.value === "string" ? v.value : JSON.stringify(v.value ?? "");
      const type =
        v.type === "number" ||
        v.type === "boolean" ||
        v.type === "string" ||
        v.type === "array" ||
        v.type === "json"
          ? v.type
          : "string";

      const match = existing.find((ev: any) => ev.name === name);
      if (match?.id) {
        await variableEdit.mutateAsync({ id: match.id, name, value, type });
      } else {
        await variableAdd.mutateAsync({ name, value, type });
      }
    }
  };

  const loadScripts = async (item: HubItem) => {
    const payload = unwrapHubPayload<any>(item.payload);
    const incoming: any[] = Array.isArray(payload)
      ? payload
      : isRecord(payload) && Array.isArray(payload.scripts)
        ? payload.scripts
        : isRecord(payload)
          ? [payload]
          : [];

    if (incoming.length === 0) {
      throw new Error("No scripts found in payload.");
    }

    for (const s of incoming) {
      if (!isRecord(s)) continue;
      const name = typeof s.name === "string" ? s.name : item.name;
      const content = typeof s.content === "string" ? s.content : "";
      const language = typeof s.language === "string" ? s.language : "python";
      const folderId =
        typeof (s as any).folderId === "number"
          ? ((s as any).folderId as number)
          : typeof (s as any).folder_id === "number"
            ? ((s as any).folder_id as number)
            : null;
      await scriptAdd.mutateAsync({
        name,
        content,
        language,
        folderId,
      });
    }
  };

  const handleLoad = async (item: HubItem) => {
    try {
      if (item.type === "inventory") {
        warningToast(
          "Not supported yet",
          "Inventory load is coming soon. You can still download the snapshot JSON.",
        );
        return;
      }

      if (item.type === "workcells") await loadWorkcell(item);
      if (item.type === "labware") await loadLabware(item);
      if (item.type === "forms") await loadForm(item);
      if (item.type === "protocols") await loadProtocol(item);
      if (item.type === "variables") await loadVariables(item);
      if (item.type === "scripts") await loadScripts(item);

      successToast("Loaded", "Hub item loaded into your current setup.");
    } catch (e: any) {
      errorToast("Load failed", e?.message || String(e));
    }
  };

  const isBusy =
    libraryListQuery.isLoading ||
    activeLibraryItemQuery.isFetching ||
    workcellImport.isLoading ||
    labwareImport.isLoading ||
    formImport.isLoading ||
    protocolImport.isLoading ||
    workcellSetSelected.isLoading ||
    toolClearStore.isLoading ||
    variableAdd.isLoading ||
    variableEdit.isLoading ||
    scriptAdd.isLoading;

  const activeItem = (activeLibraryItemQuery.data || null) as HubItem | null;

  return (
    <VStack spacing={4} align="stretch" minH="100vh" pb={10}>
      <Card bg={headerBg} shadow="md" borderRadius="lg">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <PageHeader
              title="Galago Hub"
              subTitle="Browse and load workcells, protocols, variables, scripts, labware, forms, and more."
              titleIcon={<Icon as={LibraryBig} boxSize={8} color="teal.500" />}
            />
            <Divider />
            <StatGroup>
              <Stat>
                <StatLabel>Total</StatLabel>
                <StatNumber>{items.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Workcells</StatLabel>
                <StatNumber>{stats.workcells || 0}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Protocols</StatLabel>
                <StatNumber>{stats.protocols || 0}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Labware</StatLabel>
                <StatNumber>{stats.labware || 0}</StatNumber>
              </Stat>
            </StatGroup>
          </VStack>
        </CardBody>
      </Card>

      <Card border="1px" borderColor={border}>
        <CardBody>
          <Flex gap={3} wrap="wrap" align="center">
            <HStack spacing={2} wrap="wrap">
              <Badge colorScheme="teal" variant="subtle">
                Library
              </Badge>
              <Box w={2} />
              <Button
                size="sm"
                variant={selectedType === "all" ? "solid" : "outline"}
                colorScheme="purple"
                onClick={() => setSelectedType("all")}>
                All
              </Button>
              {HUB_TYPES.map((t) => (
                <Button
                  key={t.type}
                  size="sm"
                  variant={selectedType === t.type ? "solid" : "outline"}
                  onClick={() => setSelectedType(t.type)}>
                  {t.label}
                </Button>
              ))}
            </HStack>
            <Spacer />
            <InputGroup maxW="420px">
              <InputLeftElement pointerEvents="none">
                <Search size={16} />
              </InputLeftElement>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Hub..." />
            </InputGroup>
          </Flex>
        </CardBody>
      </Card>

      {libraryListQuery.isLoading ? (
        <Box border="1px" borderColor={border} borderRadius="md" p={6} bg={subtleBg}>
          <Text color="gray.500">Loading Hub items…</Text>
        </Box>
      ) : items.length === 0 ? (
        <EmptyState
          title="No library items found"
          description="No matching Hub library items were found for your current filters."
          size="220px"
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {items.map((item) => (
            <Card
              key={`${item.type}:${item.id}`}
              border="1px"
              borderColor={border}
              _hover={{ borderColor: "teal.400", transform: "translateY(-1px)" }}
              transition="all 0.15s ease"
              cursor="pointer"
              onClick={() => openItem(item.id)}>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack>
                    <Badge colorScheme="purple" variant="subtle">
                      {itemTypeLabel(item.type)}
                    </Badge>
                    <Spacer />
                    <Text fontSize="xs" color="gray.500">
                      {formatHubTimestamp(item.updated_at || item.created_at)}
                    </Text>
                  </HStack>

                  <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text fontSize="sm" color="gray.500" noOfLines={2}>
                      {item.description}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="gray.400" noOfLines={2}>
                      No description.
                    </Text>
                  )}

                  <HStack spacing={2} wrap="wrap">
                    {normalizeTags(item.tags)
                      .slice(0, 4)
                      .map((t) => (
                        <Badge key={t} colorScheme="teal" variant="outline">
                          {t}
                        </Badge>
                      ))}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <HubItemDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => {
          detailModal.onClose();
          setActiveId(null);
        }}
        item={activeItem}
        onDelete={async () => {}}
        onDownload={handleDownload}
        onLoad={handleLoad}
        canDelete={false}
        isLoading={isBusy}
      />
    </VStack>
  );
}
