import React, { useEffect, useMemo, useState } from "react";
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
import { Search, UploadCloud, LibraryBig } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { errorToast, successToast, warningToast } from "@/components/ui/Toast";
import { HubUploadModal } from "./HubUploadModal";
import { HubItemDetailModal } from "./HubItemDetailModal";
import type { HubItem, HubItemSummary, HubItemType } from "./hubTypes";
import {
  HUB_TYPES,
  formatHubTimestamp,
  hubItemToJsonFile,
  itemTypeLabel,
  normalizeTags,
} from "./hubUtils";
import { uploadFile, downloadFile } from "@/server/utils/api";

function isRecord(v: any): v is Record<string, any> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function HubComponent(): JSX.Element {
  const headerBg = useColorModeValue("white", "gray.700");
  const subtleBg = useColorModeValue("gray.50", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  const [source, setSource] = useState<"hub" | "library">("hub");
  const [selectedType, setSelectedType] = useState<HubItemType | "all">("all");
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const uploadModal = useDisclosure();
  const detailModal = useDisclosure();

  const hubListQuery = trpc.hub.list.useQuery(
    {
      type: selectedType === "all" ? undefined : selectedType,
      q: q.trim() ? q.trim() : undefined,
    },
    { enabled: source === "hub" },
  );

  const libraryListQuery = trpc.hubLibrary.list.useQuery(
    {
      type: selectedType === "all" ? undefined : selectedType,
      q: q.trim() ? q.trim() : undefined,
    },
    { enabled: source === "library" },
  );

  const listQuery = source === "hub" ? hubListQuery : libraryListQuery;

  const activeHubItemQuery = trpc.hub.get.useQuery(
    { id: activeId || "", type: selectedType === "all" ? undefined : selectedType },
    { enabled: !!activeId && source === "hub" },
  );

  const activeLibraryItemQuery = trpc.hubLibrary.get.useQuery(
    { id: activeId || "" },
    { enabled: !!activeId && source === "library" },
  );

  const hubDelete = trpc.hub.delete.useMutation();
  const [isUploadingToHub, setIsUploadingToHub] = useState(false);

  const workcellGetSelected = trpc.workcell.getSelectedWorkcell.useQuery();
  const workcellGet = trpc.workcell.get.useMutation();
  const workcellSetSelected = trpc.workcell.setSelectedWorkcell.useMutation();
  const toolClearStore = trpc.tool.clearToolStore.useMutation();

  const variableGetAll = trpc.variable.getAll.useQuery();
  const variableAdd = trpc.variable.add.useMutation();
  const variableEdit = trpc.variable.edit.useMutation();

  const scriptAdd = trpc.script.add.useMutation();

  const items = useMemo(
    () =>
      ((listQuery.data ?? []) as HubItemSummary[]).map((i) => ({
        ...i,
        source: i.source || (source === "hub" ? "hub" : "library"),
      })),
    [listQuery.data, source],
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

  useEffect(() => {
    // Switching sources should reset the active detail state to avoid mixing fetches.
    detailModal.onClose();
    setActiveId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const handleUpload = async (args: {
    file: File;
    type: HubItemType;
    name?: string;
    description?: string;
    tagsCsv?: string;
  }) => {
    try {
      // IMPORTANT: do not send File through tRPC (it is JSON-serialized and will break).
      // Upload directly to FastAPI as multipart/form-data.
      setIsUploadingToHub(true);
      await uploadFile(`/hub/items/upload`, args.file, {
        item_type: args.type,
        name: args.name ?? "",
        description: args.description ?? "",
        tags: args.tagsCsv ?? "",
      });
      successToast("Uploaded to Hub", "Your item is now available to load.");
      await listQuery.refetch();
    } catch (e: any) {
      errorToast("Upload failed", e?.message || String(e));
    } finally {
      setIsUploadingToHub(false);
    }
  };

  const handleDelete = async (item: HubItem) => {
    try {
      if (item.source === "library") return;
      await hubDelete.mutateAsync({ id: item.id, type: item.type });
      successToast("Deleted", "Hub item removed.");
      detailModal.onClose();
      setActiveId(null);
      await listQuery.refetch();
    } catch (e: any) {
      errorToast("Delete failed", e?.message || String(e));
    }
  };

  const handleDownload = async (item: HubItem) => {
    try {
      if (item.source === "library") {
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
      await downloadFile(
        `/hub/items/${item.id}/download?item_type=${encodeURIComponent(item.type)}`,
        `${item.name.replace(/\s+/g, "_") || item.id}.json`,
      );
      successToast("Download started", "Your browser should begin downloading the JSON file.");
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
    const f = hubItemToJsonFile(item);
    await uploadFile("/workcells/import", f);
    // Best-effort: select the imported workcell (prefer payload.name)
    const importedName =
      (isRecord(item.payload) && typeof item.payload.name === "string" && item.payload.name) ||
      item.name;
    await workcellSetSelected.mutateAsync(importedName);
    await toolClearStore.mutateAsync();
  };

  const loadLabware = async (item: HubItem) => {
    const f = hubItemToJsonFile(item);
    await uploadFile("/labware/import", f);
  };

  const loadForm = async (item: HubItem) => {
    const f = hubItemToJsonFile(item);
    await uploadFile("/forms/import", f);
  };

  const loadProtocol = async (item: HubItem) => {
    const wcId = await ensureSelectedWorkcellId();
    if (!wcId) {
      throw new Error("No workcell selected. Select a workcell first, then load this protocol.");
    }
    const f = hubItemToJsonFile(item);
    await uploadFile("/protocols/import", f, { workcell_id: wcId });
  };

  const loadVariables = async (item: HubItem) => {
    const vars = item.payload;
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

    const existing = variableGetAll.data || [];
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
    const payload = item.payload;
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
      await scriptAdd.mutateAsync({
        name,
        content,
        language,
        description: typeof s.description === "string" ? s.description : "Imported from Hub",
        folder_id: (s.folder_id ?? null) as any,
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
    listQuery.isLoading ||
    hubDelete.isLoading ||
    isUploadingToHub ||
    activeHubItemQuery.isFetching ||
    activeLibraryItemQuery.isFetching ||
    workcellSetSelected.isLoading ||
    toolClearStore.isLoading ||
    variableAdd.isLoading ||
    variableEdit.isLoading ||
    scriptAdd.isLoading;

  const activeItem = ((source === "hub" ? activeHubItemQuery.data : activeLibraryItemQuery.data) ||
    null) as HubItem | null;

  return (
    <VStack spacing={4} align="stretch" minH="100vh" pb={10}>
      <Card bg={headerBg} shadow="md" borderRadius="lg">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <PageHeader
              title="Galago Hub"
              subTitle="Save, browse, and load workcells, protocols, variables, scripts, labware, forms, and more."
              titleIcon={<Icon as={LibraryBig} boxSize={8} color="teal.500" />}
              mainButton={
                source === "hub" ? (
                  <Button
                    size="sm"
                    colorScheme="teal"
                    leftIcon={<UploadCloud size={18} />}
                    onClick={uploadModal.onOpen}>
                    Upload JSON
                  </Button>
                ) : null
              }
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
              <Button
                size="sm"
                variant={source === "hub" ? "solid" : "outline"}
                colorScheme="teal"
                onClick={() => setSource("hub")}>
                My Hub
              </Button>
              <Button
                size="sm"
                variant={source === "library" ? "solid" : "outline"}
                colorScheme="teal"
                onClick={() => setSource("library")}>
                Library
              </Button>
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

      {listQuery.isLoading ? (
        <Box border="1px" borderColor={border} borderRadius="md" p={6} bg={subtleBg}>
          <Text color="gray.500">Loading Hub items…</Text>
        </Box>
      ) : items.length === 0 ? (
        <EmptyState
          title="No Hub items yet"
          description="Upload JSON exports from Workcells, Protocols, Labware, Forms, or bring your own configs to load later."
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

      <HubUploadModal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.onClose}
        onUpload={handleUpload}
        isUploading={isUploadingToHub}
      />

      <HubItemDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => {
          detailModal.onClose();
          setActiveId(null);
        }}
        item={activeItem}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onLoad={handleLoad}
        canDelete={activeItem?.source !== "library"}
        isLoading={isBusy}
      />
    </VStack>
  );
}
