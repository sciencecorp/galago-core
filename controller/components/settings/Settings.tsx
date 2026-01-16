import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Card,
  CardBody,
  Code,
  Divider,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Spinner,
  Spacer,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { CheckCircle2, Search, Settings as SettingsIcon, Trash2, X } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { PageHeader } from "@/components/ui/PageHeader";
import { errorToast, successToast } from "@/components/ui/Toast";
import type { Workcell } from "@/db/schema";

interface SettingConfig {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "select" | "text";
  options?: string[];
}

interface CategoryConfig {
  title: string;
  settings: SettingConfig[];
}

interface SettingsState {
  [key: string]: string | boolean;
}

type SlackChannelEntry = {
  id: string;
  name: string;
  channel: string; // channel name (#lab-alerts) or channel ID (recommended for bot token)
};

const settingsConfig: Record<string, CategoryConfig> = {
  appearance: {
    title: "Appearance",
    settings: [
      {
        id: "theme",
        label: "Theme",
        description: "Choose your preferred color theme",
        type: "select",
        options: ["Light", "Dark", "System"],
      },
      {
        id: "restore_unsaved_buffers",
        label: "Restore Unsaved Buffers",
        description: "Whether or not to restore unsaved buffers on restart",
        type: "toggle",
      },
    ],
  },
  session: {
    title: "Session",
    settings: [
      {
        id: "restore_on_startup",
        label: "Restore On Startup",
        description: "What to restore from the previous session when opening",
        type: "select",
        options: ["Last Session", "New Session", "None"],
      },
    ],
  },
  privacy: {
    title: "Privacy",
    settings: [
      {
        id: "telemetry_diagnostics",
        label: "Telemetry Diagnostics",
        description: "Send debug information like crash reports",
        type: "toggle",
      },
      {
        id: "telemetry_metrics",
        label: "Telemetry Metrics",
        description: "Send anonymized usage data",
        type: "toggle",
      },
    ],
  },
  updates: {
    title: "Auto Update",
    settings: [
      {
        id: "auto_update",
        label: "Auto Update",
        description: "Whether or not to automatically check for updates",
        type: "toggle",
      },
    ],
  },
  safety_ops: {
    title: "Safety & Ops",
    settings: [
      {
        id: "enable_slack_alerts_on_failure",
        label: "Slack Alerts on Failure",
        description:
          "Send Slack alerts when a run/queue fails (requires Slack webhook or bot token).",
        type: "toggle",
      },
      {
        id: "enable_email_alerts_on_failure",
        label: "Email Alerts on Failure",
        description: "Send email notifications when a run/queue fails (requires SMTP config).",
        type: "toggle",
      },
    ],
  },
  integrations: {
    title: "Integrations",
    settings: [
      {
        id: "slack_default_channel",
        label: "Slack Default Channel",
        description: "Used by tools for posting alerts (e.g. #lab-alerts).",
        type: "text",
      },
      {
        id: "smtp_host",
        label: "SMTP Host",
        description: "SMTP server hostname (e.g. smtp.office365.com).",
        type: "text",
      },
      {
        id: "smtp_port",
        label: "SMTP Port",
        description: "SMTP server port (e.g. 587).",
        type: "text",
      },
      {
        id: "smtp_user",
        label: "SMTP Username",
        description: "Account username for SMTP authentication.",
        type: "text",
      },
      {
        id: "smtp_from",
        label: "Email From",
        description: "From address for outgoing notifications.",
        type: "text",
      },
      {
        id: "smtp_to",
        label: "Email To",
        description: "Comma-separated recipients for notifications.",
        type: "text",
      },
    ],
  },
};

const DEFAULT_SETTINGS: SettingsState = {
  theme: "System",
  restore_unsaved_buffers: true,
  restore_on_startup: "Last Session",
  telemetry_diagnostics: true,
  telemetry_metrics: true,
  auto_update: true,
  enable_slack_alerts_on_failure: true,
  enable_email_alerts_on_failure: false,
  slack_default_channel: "",
  smtp_host: "",
  smtp_port: "587",
  smtp_user: "",
  smtp_from: "",
  smtp_to: "",
};

const parseBool = (value: string | undefined, fallback: boolean) => {
  if (value == null) return fallback;
  const v = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(v)) return true;
  if (["false", "0", "no", "off"].includes(v)) return false;
  return fallback;
};

export const Settings: React.FC = () => {
  const headerBg = useColorModeValue("white", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const dividerColor = useColorModeValue("gray.200", "gray.700");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const tabHoverBg = useColorModeValue("gray.50", "gray.700");
  const tabSelectedBg = useColorModeValue("white", "gray.700");
  const tabSelectedBorder = useColorModeValue("teal.500", "teal.300");

  const {
    data: fetchedSettings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = trpc.settings.getAll.useQuery();
  const utils = trpc.useContext();
  const setSetting = trpc.settings.set.useMutation();

  const { data: fetchedWorkcells } = trpc.workcell.getAll.useQuery();
  const { data: selectedWorkcellName } = trpc.workcell.getSelectedWorkcell.useQuery();
  const setSelectedWorkcell = trpc.workcell.setSelectedWorkcell.useMutation();

  const {
    data: fetchedSecrets,
    isLoading: isLoadingSecrets,
    refetch: refetchSecrets,
  } = trpc.secrets.getAll.useQuery();
  const { data: secretsStatus } = trpc.secrets.status.useQuery();
  const setSecret = trpc.secrets.set.useMutation();
  const clearSecret = trpc.secrets.clear.useMutation();

  const slackTest = trpc.integrations.slackTest.useMutation();
  const emailTest = trpc.integrations.emailTest.useMutation();

  const exportSettingsQuery = trpc.backup.exportSettings.useQuery(undefined, { enabled: false });
  const exportSecretsMetaQuery = trpc.backup.exportSecretsMeta.useQuery(undefined, {
    enabled: false,
  });
  const importSettings = trpc.backup.importSettings.useMutation();

  const { data: auditEvents, refetch: refetchAudit } = trpc.audit.getRecent.useQuery({
    limit: 100,
  });

  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [secretDrafts, setSecretDrafts] = useState<Record<string, string>>({
    slack_webhook_url: "",
    slack_bot_token: "",
    smtp_password: "",
  });
  const [search, setSearch] = useState("");
  const importFileRef = useRef<HTMLInputElement | null>(null);

  const [slackChannels, setSlackChannels] = useState<SlackChannelEntry[]>([]);
  const [slackChannelsDirty, setSlackChannelsDirty] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);
  const [pendingFocusKey, setPendingFocusKey] = useState<string | null>(null);

  const slackWebhookInputRef = useRef<HTMLInputElement | null>(null);
  const slackBotTokenInputRef = useRef<HTMLInputElement | null>(null);
  const smtpPasswordInputRef = useRef<HTMLInputElement | null>(null);

  const settingsByName = useMemo(() => {
    const map = new Map<string, string>();
    (fetchedSettings ?? []).forEach((s: { name: string; value: string }) =>
      map.set(s.name, s.value),
    );
    return map;
  }, [fetchedSettings]);

  const secretsByName = useMemo(() => {
    const map = new Map<string, boolean>();
    (fetchedSecrets ?? []).forEach((s: { name: string; is_set: unknown }) =>
      map.set(s.name, Boolean(s.is_set)),
    );
    return map;
  }, [fetchedSecrets]);

  useEffect(() => {
    if (!fetchedSettings) return;

    const next: SettingsState = { ...DEFAULT_SETTINGS };
    Object.values(settingsConfig).forEach((category) => {
      category.settings.forEach((s) => {
        const value = settingsByName.get(s.id);
        if (s.type === "toggle") {
          next[s.id] = parseBool(value, Boolean(DEFAULT_SETTINGS[s.id]));
        } else {
          next[s.id] = value ?? String(DEFAULT_SETTINGS[s.id]);
        }
      });
    });

    setSettings(next);

    // Load Slack channels list (stored as JSON in settings)
    const rawChannels = settingsByName.get("slack_channels");
    if (rawChannels) {
      try {
        const parsed = JSON.parse(rawChannels);
        if (Array.isArray(parsed)) {
          const normalized: SlackChannelEntry[] = parsed.map((row: any, idx: number) => ({
            id: String(row?.id ?? `${row?.name ?? "channel"}-${idx}`),
            name: String(row?.name ?? ""),
            channel: String(row?.channel ?? ""),
          }));
          setSlackChannels(normalized);
          setSlackChannelsDirty(false);
        }
      } catch {
        // ignore malformed JSON; user can re-save from UI
      }
    } else {
      setSlackChannels([]);
      setSlackChannelsDirty(false);
    }
  }, [fetchedSettings, settingsByName]);

  const persistSetting = async (name: string, value: string) => {
    // Optimistically update the shared settings cache so other app-level syncs
    // (e.g. ThemeSync) react immediately, without waiting for a refetch.
    const previous = utils.settings.getAll.getData();
    utils.settings.getAll.setData(undefined, (old) => {
      const list = old ? [...old] : [];
      const idx = list.findIndex((s: { name: string }) => s.name === name);
      const nextRow = {
        ...(idx >= 0 ? list[idx] : {}),
        name,
        value,
        is_active: true,
      };
      if (idx >= 0) list[idx] = nextRow as any;
      else list.push(nextRow as any);
      return list as any;
    });

    try {
      await setSetting.mutateAsync({ name, value, is_active: true });
      // Ensure we reconcile with DB truth (e.g. for timestamps / is_active).
      await utils.settings.getAll.invalidate();
    } catch (e: any) {
      // Roll back optimistic cache update.
      if (previous) utils.settings.getAll.setData(undefined, previous);
      else await utils.settings.getAll.invalidate();
      errorToast("Failed to save setting", e?.message || "Unknown error");
    }
  };

  const handleToggle = async (id: string) => {
    const nextValue = !Boolean(settings[id]);
    setSettings((prev) => ({ ...prev, [id]: nextValue }));
    await persistSetting(id, String(nextValue));
  };

  const handleSelectChange = async (id: string, value: string) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
    await persistSetting(id, value);
  };

  const handleTextChange = (id: string, value: string) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleTextBlur = async (id: string) => {
    await persistSetting(id, String(settings[id] ?? ""));
  };

  const saveSlackChannels = async () => {
    const payload = slackChannels
      .map((c) => ({
        name: String(c.name ?? "").trim(),
        channel: String(c.channel ?? "").trim(),
      }))
      .filter((c) => c.name || c.channel);

    await persistSetting("slack_channels", JSON.stringify(payload));
    setSlackChannelsDirty(false);
    successToast("Saved", "Slack channels updated");
  };

  const workcells: Workcell[] = fetchedWorkcells ?? [];

  const onSelectWorkcell = async (name: string) => {
    try {
      await setSelectedWorkcell.mutateAsync(name);
      successToast("Workcell updated", `Selected workcell set to "${name}"`);
    } catch (e: any) {
      errorToast("Failed to update workcell", e?.message || "Unknown error");
    }
  };

  const isBusy =
    isLoadingSettings || setSetting.isLoading || setSelectedWorkcell.isLoading || !fetchedSettings;

  const isSecretsBusy = isLoadingSecrets || setSecret.isLoading || clearSecret.isLoading;

  const downloadJson = (filename: string, obj: any) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const canTestSlack = secretsByName.get("slack_webhook_url");
  const canTestEmail =
    secretsByName.get("smtp_password") &&
    String(settings.smtp_host ?? "").trim() &&
    String(settings.smtp_from ?? "").trim() &&
    String(settings.smtp_to ?? "").trim();

  const canTestSlackWithToken =
    secretsByName.get("slack_bot_token") && String(settings.slack_default_channel ?? "").trim();
  const canTestSlackAny = Boolean(canTestSlack || canTestSlackWithToken);

  const normalizedSearch = search.trim().toLowerCase();
  const matches = (text: string) => text.toLowerCase().includes(normalizedSearch);
  const settingMatches = (s: SettingConfig) =>
    !normalizedSearch ||
    matches(s.id) ||
    matches(s.label) ||
    matches(s.description) ||
    (s.options?.some((o) => matches(o)) ?? false);

  const filteredCategories = useMemo(() => {
    return Object.entries(settingsConfig).map(([key, category]) => ({
      key,
      title: category.title,
      settings: category.settings.filter(settingMatches),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedSearch]);

  const orderedCategories = useMemo(() => {
    const preferredOrder = [
      "appearance",
      "session",
      "privacy",
      "updates",
      "safety_ops",
      "integrations",
    ];
    const byKey = new Map(filteredCategories.map((c) => [c.key, c]));
    const ordered = preferredOrder
      .map((k) => byKey.get(k))
      .filter(Boolean) as typeof filteredCategories;
    const rest = filteredCategories.filter((c) => !preferredOrder.includes(c.key));
    return [...ordered, ...rest];
  }, [filteredCategories]);

  const systemTabs = useMemo(
    () => [
      { key: "workcell", label: "Workcell" },
      { key: "secrets", label: "Secrets" },
      { key: "tests", label: "Tests" },
      { key: "backup", label: "Backup" },
      { key: "audit", label: "Audit" },
    ],
    [],
  );

  const systemTabIndexByKey = useMemo(() => {
    const base = orderedCategories.length;
    const map = new Map<string, number>();
    systemTabs.forEach((t, idx) => map.set(t.key, base + idx));
    return map;
  }, [orderedCategories.length, systemTabs]);

  const categoryTabIndexByKey = useMemo(() => {
    const map = new Map<string, number>();
    orderedCategories.forEach((c, idx) => map.set(c.key, idx));
    return map;
  }, [orderedCategories]);

  const searchResults = useMemo(() => {
    if (!normalizedSearch) return [];

    const results: Array<{
      key: string;
      label: string;
      description?: string;
      tabIndex: number;
      focusKey?: string;
    }> = [];

    // Category settings (left rail "non-system" tabs)
    orderedCategories.forEach((cat) => {
      const catIdx = categoryTabIndexByKey.get(cat.key);
      if (catIdx == null) return;
      cat.settings.forEach((s) => {
        if (!settingMatches(s)) return;
        results.push({
          key: `cat:${cat.key}:${s.id}`,
          label: `${cat.title}: ${s.label}`,
          description: s.description,
          tabIndex: catIdx,
        });
      });
    });

    // System items
    const secretsIdx = systemTabIndexByKey.get("secrets");
    if (secretsIdx != null) {
      const sysItems = [
        {
          label: "Secrets: Slack Webhook URL",
          description: "Encrypted secret used for Slack posting (incoming webhook).",
          focusKey: "slack_webhook_url",
        },
        {
          label: "Secrets: Slack Bot Token",
          description: "Encrypted secret used for Slack Web API (chat.postMessage).",
          focusKey: "slack_bot_token",
        },
        {
          label: "Secrets: SMTP Password",
          description: "Encrypted secret used for email sending (SMTP auth).",
          focusKey: "smtp_password",
        },
      ];
      sysItems.forEach((it) => {
        if (matches(it.label) || matches(it.description || "")) {
          results.push({
            key: `sys:secrets:${it.focusKey}`,
            label: it.label,
            description: it.description,
            tabIndex: secretsIdx,
            focusKey: it.focusKey,
          });
        }
      });
    }

    const testsIdx = systemTabIndexByKey.get("tests");
    if (testsIdx != null && (matches("tests") || matches("test slack") || matches("test email"))) {
      results.push({
        key: "sys:tests",
        label: "Tests: Send test Slack / Email",
        description: "Run server-side tests for Slack and email integrations.",
        tabIndex: testsIdx,
      });
    }

    const backupIdx = systemTabIndexByKey.get("backup");
    if (backupIdx != null && (matches("backup") || matches("export") || matches("import"))) {
      results.push({
        key: "sys:backup",
        label: "Backup: Export / Import Settings",
        description: "Download settings JSON or import to restore.",
        tabIndex: backupIdx,
      });
    }

    const auditIdx = systemTabIndexByKey.get("audit");
    if (auditIdx != null && (matches("audit") || matches("log"))) {
      results.push({
        key: "sys:audit",
        label: "Audit: Recent changes",
        description: "View recent settings/secrets changes.",
        tabIndex: auditIdx,
      });
    }

    // De-dupe by key + cap
    const seen = new Set<string>();
    return results.filter((r) => (seen.has(r.key) ? false : (seen.add(r.key), true))).slice(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedSearch, orderedCategories]);

  useEffect(() => {
    if (!pendingFocusKey) return;
    const secretsIdx = systemTabIndexByKey.get("secrets");
    if (secretsIdx == null || tabIndex !== secretsIdx) return;

    const ref =
      pendingFocusKey === "slack_webhook_url"
        ? slackWebhookInputRef
        : pendingFocusKey === "slack_bot_token"
          ? slackBotTokenInputRef
          : pendingFocusKey === "smtp_password"
            ? smtpPasswordInputRef
            : null;

    if (ref?.current) {
      // Small delay to ensure panel is mounted (isLazy)
      setTimeout(() => ref.current?.focus(), 50);
      setPendingFocusKey(null);
    }
  }, [pendingFocusKey, tabIndex, systemTabIndexByKey]);

  const renderSettingsList = (items: SettingConfig[]) => {
    return (
      <VStack spacing={4} align="stretch">
        {items.map((setting, index) => (
          <React.Fragment key={setting.id}>
            <HStack justify="space-between" align="start">
              <Box flex="1">
                <Text fontWeight="medium" mb={1}>
                  {setting.label}
                </Text>
                <Text fontSize="sm" color={mutedText}>
                  {setting.description}
                </Text>
              </Box>

              <Box minW="220px" textAlign="right">
                {setting.type === "toggle" ? (
                  <Switch
                    isChecked={Boolean(settings[setting.id])}
                    onChange={() => handleToggle(setting.id)}
                    colorScheme="blue"
                    size="md"
                    isDisabled={isBusy}
                  />
                ) : setting.type === "select" ? (
                  <Select
                    value={String(settings[setting.id] ?? "")}
                    onChange={(e) => handleSelectChange(setting.id, e.target.value)}
                    size="sm"
                    borderRadius="md"
                    bg={inputBg}
                    isDisabled={isBusy}>
                    {setting.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={String(settings[setting.id] ?? "")}
                    onChange={(e) => handleTextChange(setting.id, e.target.value)}
                    onBlur={() => handleTextBlur(setting.id)}
                    size="sm"
                    borderRadius="md"
                    bg={inputBg}
                    isDisabled={isBusy}
                  />
                )}
              </Box>
            </HStack>

            {index < items.length - 1 && <Divider borderColor={dividerColor} />}
          </React.Fragment>
        ))}
      </VStack>
    );
  };

  return (
    <Box maxW="100%" px={6} py={4}>
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <PageHeader
              title="Settings"
              subTitle="Local preferences for this workstation"
              titleIcon={<Icon as={SettingsIcon} boxSize={8} color="teal.500" />}
            />
          </CardBody>
        </Card>

        {isLoadingSettings && (
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <HStack spacing={3}>
                <Spinner size="sm" />
                <Text color={mutedText}>Loading settings…</Text>
              </HStack>
            </CardBody>
          </Card>
        )}

        {secretsStatus && !secretsStatus.configured ? (
          <Alert status="warning" variant="left-accent" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Secrets encryption is not configured</AlertTitle>
              <AlertDescription>
                Secret fields (Slack webhook/token, SMTP password) won’t save or work until{" "}
                <Code>GALAGO_SECRETS_KEY</Code> is set for the controller service.
              </AlertDescription>
            </Box>
          </Alert>
        ) : null}

        <Card bg={cardBg} shadow="md">
          <CardBody>
            <HStack spacing={4} width="100%">
              <InputGroup maxW="420px">
                <InputLeftElement pointerEvents="none">
                  <Search size={14} />
                </InputLeftElement>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search settings..."
                  size="sm"
                  bg={inputBg}
                />
                {normalizedSearch ? (
                  <InputRightElement>
                    <IconButton
                      aria-label="Clear search"
                      icon={<X size={14} />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setSearch("")}
                    />
                  </InputRightElement>
                ) : null}
              </InputGroup>
              <Spacer />
            </HStack>

            {normalizedSearch ? (
              <Box
                mt={3}
                borderWidth="1px"
                borderColor={dividerColor}
                borderRadius="md"
                bg={cardBg}>
                <VStack align="stretch" spacing={0}>
                  {(searchResults ?? []).length === 0 ? (
                    <Box px={3} py={2}>
                      <Text fontSize="sm" color={mutedText}>
                        No results for &quot;{normalizedSearch}&quot;.
                      </Text>
                    </Box>
                  ) : (
                    searchResults.map((r) => (
                      <Button
                        key={r.key}
                        variant="ghost"
                        justifyContent="flex-start"
                        borderRadius={0}
                        py={3}
                        onClick={() => {
                          setTabIndex(r.tabIndex);
                          if (r.focusKey) setPendingFocusKey(r.focusKey);
                        }}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {r.label}
                          </Text>
                          {r.description ? (
                            <Text fontSize="xs" color={mutedText}>
                              {r.description}
                            </Text>
                          ) : null}
                        </VStack>
                      </Button>
                    ))
                  )}
                </VStack>
              </Box>
            ) : null}
          </CardBody>
        </Card>

        <Tabs
          index={tabIndex}
          onChange={(idx) => setTabIndex(idx)}
          variant="unstyled"
          colorScheme="teal"
          orientation="vertical"
          isLazy>
          <HStack align="start" spacing={6}>
            <VStack align="stretch" minW="280px" maxH="70vh" overflowY="auto" spacing={3}>
              <TabList display="flex" flexDirection="column" gap={1}>
                {orderedCategories.map((c) => (
                  <Tab
                    key={c.key}
                    justifyContent="space-between"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="transparent"
                    _hover={{ bg: tabHoverBg }}
                    _selected={{
                      borderColor: tabSelectedBorder,
                      bg: tabSelectedBg,
                      boxShadow: "sm",
                    }}>
                    <span>{c.title}</span>
                    {normalizedSearch && c.settings.length > 0 ? (
                      <span>{c.settings.length}</span>
                    ) : null}
                  </Tab>
                ))}
              </TabList>

              <Text
                px={2}
                fontSize="xs"
                fontWeight="semibold"
                color={mutedText}
                textTransform="uppercase">
                System
              </Text>

              <TabList display="flex" flexDirection="column" gap={1}>
                {systemTabs.map((t) => (
                  <Tab
                    key={t.key}
                    justifyContent="flex-start"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="transparent"
                    _hover={{ bg: tabHoverBg }}
                    _selected={{
                      borderColor: tabSelectedBorder,
                      bg: tabSelectedBg,
                      boxShadow: "sm",
                    }}>
                    {t.label}
                  </Tab>
                ))}
              </TabList>
            </VStack>

            <TabPanels flex="1">
              {orderedCategories.map((c) => (
                <TabPanel key={c.key} px={0} pt={0}>
                  <Card bg={cardBg} shadow="md">
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          textTransform="uppercase"
                          color={mutedText}>
                          {c.title}
                        </Text>
                        {c.key === "integrations" ? (
                          <VStack align="stretch" spacing={4}>
                            {/* Slack channels manager */}
                            <Box>
                              <HStack justify="space-between" align="center" mb={2}>
                                <Text fontSize="sm" fontWeight="semibold">
                                  Slack Channels
                                </Text>
                                <HStack>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSlackChannels((prev) => [
                                        ...prev,
                                        {
                                          id: `new-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                                          name: "",
                                          channel: "",
                                        },
                                      ]);
                                      setSlackChannelsDirty(true);
                                    }}>
                                    Add channel
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={saveSlackChannels}
                                    isDisabled={!slackChannelsDirty}>
                                    Save channels
                                  </Button>
                                </HStack>
                              </HStack>

                              <Text fontSize="sm" color={mutedText} mb={3}>
                                Add multiple Slack destinations with friendly names. Use channel IDs
                                for bot-token sending when possible (recommended).
                              </Text>

                              <HStack justify="space-between" align="start" mb={4}>
                                <Box flex="1">
                                  <Text fontWeight="medium" mb={1}>
                                    Default Slack Channel
                                  </Text>
                                  <Text fontSize="sm" color={mutedText}>
                                    Used by tools and alerts when no channel is explicitly provided.
                                  </Text>
                                </Box>
                                <Box minW="320px" textAlign="right">
                                  <Select
                                    value={String(settings.slack_default_channel ?? "")}
                                    placeholder="Select default channel"
                                    size="sm"
                                    bg={inputBg}
                                    onChange={async (e) => {
                                      const value = e.target.value;
                                      setSettings((prev) => ({
                                        ...prev,
                                        slack_default_channel: value,
                                      }));
                                      await persistSetting("slack_default_channel", value);
                                    }}>
                                    {slackChannels
                                      .filter((c) => String(c.channel).trim())
                                      .map((c) => (
                                        <option key={c.id} value={c.channel}>
                                          {c.name ? `${c.name} — ${c.channel}` : c.channel}
                                        </option>
                                      ))}
                                  </Select>
                                </Box>
                              </HStack>

                              <Box
                                borderWidth="1px"
                                borderColor={dividerColor}
                                borderRadius="md"
                                p={3}
                                maxH="320px"
                                overflowY="auto">
                                {slackChannels.length === 0 ? (
                                  <Text fontSize="sm" color={mutedText}>
                                    No Slack channels configured yet. Click “Add channel”.
                                  </Text>
                                ) : (
                                  <VStack align="stretch" spacing={3}>
                                    {slackChannels.map((c) => (
                                      <Box key={c.id}>
                                        <HStack align="start" spacing={3}>
                                          <Box flex="1">
                                            <Text fontSize="xs" color={mutedText} mb={1}>
                                              Name
                                            </Text>
                                            <Input
                                              size="sm"
                                              bg={inputBg}
                                              value={c.name}
                                              placeholder="e.g. Lab Alerts"
                                              onChange={(e) => {
                                                const v = e.target.value;
                                                setSlackChannels((prev) =>
                                                  prev.map((x) =>
                                                    x.id === c.id ? { ...x, name: v } : x,
                                                  ),
                                                );
                                                setSlackChannelsDirty(true);
                                              }}
                                            />
                                          </Box>
                                          <Box flex="1">
                                            <Text fontSize="xs" color={mutedText} mb={1}>
                                              Channel
                                            </Text>
                                            <Input
                                              size="sm"
                                              bg={inputBg}
                                              value={c.channel}
                                              placeholder="#lab-alerts or C0123ABCDEF"
                                              onChange={(e) => {
                                                const v = e.target.value;
                                                setSlackChannels((prev) =>
                                                  prev.map((x) =>
                                                    x.id === c.id ? { ...x, channel: v } : x,
                                                  ),
                                                );
                                                setSlackChannelsDirty(true);
                                              }}
                                            />
                                          </Box>
                                          <IconButton
                                            aria-label="Remove channel"
                                            icon={<Trash2 size={16} />}
                                            size="sm"
                                            variant="ghost"
                                            mt={5}
                                            onClick={() => {
                                              setSlackChannels((prev) =>
                                                prev.filter((x) => x.id !== c.id),
                                              );
                                              setSlackChannelsDirty(true);
                                            }}
                                          />
                                        </HStack>
                                        <Divider mt={3} borderColor={dividerColor} />
                                      </Box>
                                    ))}
                                  </VStack>
                                )}
                              </Box>
                            </Box>

                            <Divider borderColor={dividerColor} />

                            {/* Other integration settings (filtered by search) */}
                            {renderSettingsList(
                              c.settings.filter((s) => s.id !== "slack_default_channel"),
                            )}
                          </VStack>
                        ) : (
                          renderSettingsList(c.settings)
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>
              ))}

              <TabPanel px={0} pt={0}>
                <Card bg={cardBg} shadow="md">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        color={mutedText}>
                        Workcell
                      </Text>
                      <HStack justify="space-between" align="start">
                        <Box flex="1">
                          <Text fontWeight="medium" mb={1}>
                            Selected Workcell
                          </Text>
                          <Text fontSize="sm" color={mutedText}>
                            Used as the default workcell for protocols, tools, and inventory.
                          </Text>
                        </Box>
                        <Box minW="260px" textAlign="right">
                          <Select
                            value={selectedWorkcellName ?? ""}
                            placeholder={workcells.length ? "Select workcell" : "No workcells"}
                            onChange={(e) => onSelectWorkcell(e.target.value)}
                            isDisabled={!workcells.length || setSelectedWorkcell.isLoading}
                            size="sm"
                            bg={inputBg}>
                            {workcells.map((wc) => (
                              <option key={wc.id} value={wc.name}>
                                {wc.name}
                              </option>
                            ))}
                          </Select>
                        </Box>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel px={0} pt={0}>
                <Card bg={cardBg} shadow="md">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        color={mutedText}>
                        Secrets (encrypted at rest)
                      </Text>

                      <VStack align="stretch" spacing={4}>
                        {/* Slack webhook */}
                        <HStack justify="space-between" align="start">
                          <Box flex="1">
                            <Text fontWeight="medium" mb={1}>
                              Slack Webhook URL
                            </Text>
                            <Text fontSize="sm" color={mutedText}>
                              Stored encrypted. Not displayed after saving.
                            </Text>
                            <HStack mt={1} spacing={2} color={mutedText}>
                              {secretsByName.get("slack_webhook_url") ? (
                                <>
                                  <Icon as={CheckCircle2} boxSize={4} color="green.400" />
                                  <Text fontSize="xs">Set</Text>
                                </>
                              ) : (
                                <Text fontSize="xs">Not set</Text>
                              )}
                            </HStack>
                          </Box>
                          <Box minW="360px" textAlign="right">
                            <VStack align="stretch" spacing={2}>
                              <Input
                                type="password"
                                placeholder="Paste Slack incoming webhook URL"
                                ref={slackWebhookInputRef}
                                value={secretDrafts.slack_webhook_url}
                                onChange={(e) =>
                                  setSecretDrafts((p) => ({
                                    ...p,
                                    slack_webhook_url: e.target.value,
                                  }))
                                }
                                isDisabled={isSecretsBusy}
                                bg={inputBg}
                              />
                              <HStack justify="flex-end">
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={async () => {
                                    try {
                                      await setSecret.mutateAsync({
                                        name: "slack_webhook_url",
                                        value: secretDrafts.slack_webhook_url,
                                        is_active: true,
                                      });
                                      setSecretDrafts((p) => ({ ...p, slack_webhook_url: "" }));
                                      await refetchSecrets();
                                      successToast("Saved", "Slack webhook stored securely");
                                    } catch (e: any) {
                                      errorToast(
                                        "Failed to save secret",
                                        e?.message || "Unknown error",
                                      );
                                    }
                                  }}
                                  isDisabled={!secretDrafts.slack_webhook_url || isSecretsBusy}>
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<Trash2 size={16} />}
                                  onClick={async () => {
                                    try {
                                      await clearSecret.mutateAsync("slack_webhook_url");
                                      await refetchSecrets();
                                      successToast("Cleared", "Slack webhook removed");
                                    } catch (e: any) {
                                      errorToast(
                                        "Failed to clear secret",
                                        e?.message || "Unknown error",
                                      );
                                    }
                                  }}
                                  isDisabled={isSecretsBusy}>
                                  Clear
                                </Button>
                              </HStack>
                            </VStack>
                          </Box>
                        </HStack>

                        <Divider borderColor={dividerColor} />

                        {/* Slack bot token */}
                        <HStack justify="space-between" align="start">
                          <Box flex="1">
                            <Text fontWeight="medium" mb={1}>
                              Slack Bot Token
                            </Text>
                            <Text fontSize="sm" color={mutedText}>
                              Alternative to webhook. Used with Slack Web API (chat.postMessage).
                              Requires a channel in “Slack Default Channel”.
                            </Text>
                            <HStack mt={1} spacing={2} color={mutedText}>
                              {secretsByName.get("slack_bot_token") ? (
                                <>
                                  <Icon as={CheckCircle2} boxSize={4} color="green.400" />
                                  <Text fontSize="xs">Set</Text>
                                </>
                              ) : (
                                <Text fontSize="xs">Not set</Text>
                              )}
                            </HStack>
                          </Box>
                          <Box minW="360px" textAlign="right">
                            <VStack align="stretch" spacing={2}>
                              <Input
                                type="password"
                                placeholder="Paste Slack bot token (xoxb-...)"
                                ref={slackBotTokenInputRef}
                                value={secretDrafts.slack_bot_token}
                                onChange={(e) =>
                                  setSecretDrafts((p) => ({
                                    ...p,
                                    slack_bot_token: e.target.value,
                                  }))
                                }
                                isDisabled={isSecretsBusy}
                                bg={inputBg}
                              />
                              <HStack justify="flex-end">
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={async () => {
                                    try {
                                      await setSecret.mutateAsync({
                                        name: "slack_bot_token",
                                        value: secretDrafts.slack_bot_token,
                                        is_active: true,
                                      });
                                      setSecretDrafts((p) => ({ ...p, slack_bot_token: "" }));
                                      await refetchSecrets();
                                      successToast("Saved", "Slack bot token stored securely");
                                    } catch (e: any) {
                                      errorToast(
                                        "Failed to save secret",
                                        e?.message || "Unknown error",
                                      );
                                    }
                                  }}
                                  isDisabled={!secretDrafts.slack_bot_token || isSecretsBusy}>
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<Trash2 size={16} />}
                                  onClick={async () => {
                                    try {
                                      await clearSecret.mutateAsync("slack_bot_token");
                                      await refetchSecrets();
                                      successToast("Cleared", "Slack bot token removed");
                                    } catch (e: any) {
                                      errorToast(
                                        "Failed to clear secret",
                                        e?.message || "Unknown error",
                                      );
                                    }
                                  }}
                                  isDisabled={isSecretsBusy}>
                                  Clear
                                </Button>
                              </HStack>
                            </VStack>
                          </Box>
                        </HStack>

                        <Divider borderColor={dividerColor} />

                        {/* SMTP password */}
                        <HStack justify="space-between" align="start">
                          <Box flex="1">
                            <Text fontWeight="medium" mb={1}>
                              SMTP Password
                            </Text>
                            <Text fontSize="sm" color={mutedText}>
                              Stored encrypted. Not displayed after saving.
                            </Text>
                            <HStack mt={1} spacing={2} color={mutedText}>
                              {secretsByName.get("smtp_password") ? (
                                <>
                                  <Icon as={CheckCircle2} boxSize={4} color="green.400" />
                                  <Text fontSize="xs">Set</Text>
                                </>
                              ) : (
                                <Text fontSize="xs">Not set</Text>
                              )}
                            </HStack>
                          </Box>
                          <Box minW="360px" textAlign="right">
                            <VStack align="stretch" spacing={2}>
                              <Input
                                type="password"
                                placeholder="Paste SMTP password"
                                ref={smtpPasswordInputRef}
                                value={secretDrafts.smtp_password}
                                onChange={(e) =>
                                  setSecretDrafts((p) => ({ ...p, smtp_password: e.target.value }))
                                }
                                isDisabled={isSecretsBusy}
                                bg={inputBg}
                              />
                              <HStack justify="flex-end">
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={async () => {
                                    try {
                                      await setSecret.mutateAsync({
                                        name: "smtp_password",
                                        value: secretDrafts.smtp_password,
                                        is_active: true,
                                      });
                                      setSecretDrafts((p) => ({ ...p, smtp_password: "" }));
                                      await refetchSecrets();
                                      successToast("Saved", "SMTP password stored securely");
                                    } catch (e: any) {
                                      errorToast(
                                        "Failed to save secret",
                                        e?.message || "Unknown error",
                                      );
                                    }
                                  }}
                                  isDisabled={!secretDrafts.smtp_password || isSecretsBusy}>
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<Trash2 size={16} />}
                                  onClick={async () => {
                                    try {
                                      await clearSecret.mutateAsync("smtp_password");
                                      await refetchSecrets();
                                      successToast("Cleared", "SMTP password removed");
                                    } catch (e: any) {
                                      errorToast(
                                        "Failed to clear secret",
                                        e?.message || "Unknown error",
                                      );
                                    }
                                  }}
                                  isDisabled={isSecretsBusy}>
                                  Clear
                                </Button>
                              </HStack>
                            </VStack>
                          </Box>
                        </HStack>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel px={0} pt={0}>
                <Card bg={cardBg} shadow="md">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        color={mutedText}>
                        Integration Tests
                      </Text>
                      <HStack justify="space-between" align="start">
                        <Box flex="1">
                          <Text fontWeight="medium" mb={1}>
                            Send test messages
                          </Text>
                          <Text fontSize="sm" color={mutedText}>
                            Tests run server-side using encrypted secrets. Results show as toasts.
                          </Text>
                        </Box>
                        <HStack>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            isDisabled={!canTestSlackAny || slackTest.isLoading}
                            isLoading={slackTest.isLoading}
                            onClick={async () => {
                              try {
                                await slackTest.mutateAsync({
                                  message: "Galago: Slack test message",
                                  channel:
                                    String(settings.slack_default_channel ?? "").trim() ||
                                    undefined,
                                });
                                successToast("Slack test sent", "Check your Slack channel");
                              } catch (e: any) {
                                errorToast("Slack test failed", e?.message || "Unknown error");
                              }
                            }}>
                            Test Slack
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="green"
                            variant="outline"
                            isDisabled={!canTestEmail || emailTest.isLoading}
                            isLoading={emailTest.isLoading}
                            onClick={async () => {
                              try {
                                await emailTest.mutateAsync({
                                  subject: "Galago: Email test",
                                  message: "This is a test email from Galago.",
                                });
                                successToast("Email test sent", "Check your inbox");
                              } catch (e: any) {
                                errorToast("Email test failed", e?.message || "Unknown error");
                              }
                            }}>
                            Test Email
                          </Button>
                        </HStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel px={0} pt={0}>
                <Card bg={cardBg} shadow="md">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        color={mutedText}>
                        Backup
                      </Text>
                      <HStack justify="space-between" align="start">
                        <Box flex="1">
                          <Text fontWeight="medium" mb={1}>
                            Export / Import Settings
                          </Text>
                          <Text fontSize="sm" color={mutedText}>
                            Exports settings to JSON. Import upserts by name. Secrets are never
                            exported (only metadata can be exported).
                          </Text>
                        </Box>
                        <HStack>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const res = await exportSettingsQuery.refetch();
                                const settingsList = res.data ?? [];
                                downloadJson(`galago-settings-backup.json`, {
                                  settings: settingsList,
                                });
                                successToast("Exported", "Settings JSON downloaded");
                              } catch (e: any) {
                                errorToast("Export failed", e?.message || "Unknown error");
                              }
                            }}
                            isDisabled={exportSettingsQuery.isFetching}>
                            Export Settings
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const res = await exportSecretsMetaQuery.refetch();
                                downloadJson(`galago-secrets-meta.json`, {
                                  secrets: res.data ?? [],
                                });
                                successToast("Exported", "Secrets metadata JSON downloaded");
                              } catch (e: any) {
                                errorToast("Export failed", e?.message || "Unknown error");
                              }
                            }}
                            isDisabled={exportSecretsMetaQuery.isFetching}>
                            Export Secrets Meta
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => importFileRef.current?.click()}
                            isLoading={importSettings.isLoading}>
                            Import Settings
                          </Button>
                          <input
                            ref={importFileRef}
                            type="file"
                            accept="application/json"
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const text = await file.text();
                                const parsed = JSON.parse(text);
                                const list = Array.isArray(parsed?.settings)
                                  ? parsed.settings
                                  : null;
                                if (!list)
                                  throw new Error(
                                    "Invalid file format: expected { settings: [...] }",
                                  );
                                await importSettings.mutateAsync({
                                  settings: list.map((s: any) => ({
                                    name: String(s.name),
                                    value: String(s.value ?? ""),
                                    is_active: s.is_active != null ? Boolean(s.is_active) : true,
                                  })),
                                });
                                await refetchSettings();
                                await refetchAudit();
                                successToast("Imported", "Settings imported successfully");
                              } catch (err: any) {
                                errorToast("Import failed", err?.message || "Unknown error");
                              } finally {
                                e.target.value = "";
                              }
                            }}
                          />
                        </HStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel px={0} pt={0}>
                <Card bg={cardBg} shadow="md">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Text
                          fontSize="xs"
                          fontWeight="semibold"
                          textTransform="uppercase"
                          color={mutedText}>
                          Audit Log
                        </Text>
                        <Button size="xs" variant="outline" onClick={() => refetchAudit()}>
                          Refresh
                        </Button>
                      </HStack>
                      <VStack align="stretch" spacing={2}>
                        {(auditEvents ?? []).slice(0, 20).map((evt) => {
                          const when = evt.created_at
                            ? new Date(evt.created_at).toLocaleString()
                            : "";
                          const target = evt.target_name ? ` • ${evt.target_name}` : "";
                          return (
                            <Box key={evt.id}>
                              <Text fontSize="sm" fontWeight="medium">
                                {evt.action}
                                {target}
                              </Text>
                              <Text fontSize="xs" color={mutedText}>
                                {when}
                              </Text>
                              <Divider borderColor={dividerColor} mt={2} />
                            </Box>
                          );
                        })}
                        {!auditEvents?.length && (
                          <Text fontSize="sm" color={mutedText}>
                            No audit events yet.
                          </Text>
                        )}
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </HStack>
        </Tabs>
      </VStack>
    </Box>
  );
};
