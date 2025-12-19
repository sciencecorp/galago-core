import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Switch,
  Select,
  Box,
  Divider,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { Settings } from "lucide-react";
import axios from "axios";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
  workcellId?: number;
}

interface SettingConfig {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "select";
  options?: string[];
}

interface CategoryConfig {
  title: string;
  settings: SettingConfig[];
}

interface SettingsState {
  [key: string]: string | boolean;
}

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
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, userId, workcellId }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [settings, setSettings] = useState<SettingsState>({
    theme: colorMode === "dark" ? "Dark" : "Light",
    restore_unsaved_buffers: true,
    restore_on_startup: "Last Session",
    telemetry_diagnostics: true,
    telemetry_metrics: true,
    auto_update: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  // Sync theme with color mode
  useEffect(() => {
    if (settings.theme === "Dark" && colorMode === "light") {
      toggleColorMode();
    } else if (settings.theme === "Light" && colorMode === "dark") {
      toggleColorMode();
    }
  }, [settings.theme]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (userId) params.append("user_id", userId.toString());
      if (workcellId) params.append("workcell_id", workcellId.toString());

      const response = await axios.get(`/api/settings/profile?${params}`);

      // Flatten the profile structure
      const flatSettings: SettingsState = {};
      Object.values(response.data).forEach((category: any) => {
        Object.assign(flatSettings, category);
      });

      setSettings((prev) => ({ ...prev, ...flatSettings }));
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: SettingsState) => {
    try {
      await axios.post("/api/settings/bulk", {
        settings: updatedSettings,
        user_id: userId,
        workcell_id: workcellId,
      });

      toast({
        title: "Settings saved",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleToggle = (id: string) => {
    const newSettings = {
      ...settings,
      [id]: !settings[id],
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSelectChange = (id: string, value: string) => {
    const newSettings = {
      ...settings,
      [id]: value,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent maxH="80vh" bg={colorMode === "dark" ? "gray.800" : "white"}>
        <ModalHeader
          borderBottom="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}>
          <HStack spacing={3}>
            <Settings size={20} />
            <Text>Settings</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack spacing={8} align="stretch">
            {Object.entries(settingsConfig).map(([key, category]) => (
              <Box key={key}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  mb={4}
                  letterSpacing="wider">
                  {category.title}
                </Text>

                <VStack spacing={4} align="stretch">
                  {category.settings.map((setting, index) => (
                    <React.Fragment key={setting.id}>
                      <HStack justify="space-between" align="start">
                        <Box flex="1">
                          <Text fontWeight="medium" mb={1}>
                            {setting.label}
                          </Text>
                          <Text
                            fontSize="sm"
                            color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                            {setting.description}
                          </Text>
                        </Box>

                        <Box minW="150px" textAlign="right">
                          {setting.type === "toggle" ? (
                            <Switch
                              isChecked={Boolean(settings[setting.id])}
                              onChange={() => handleToggle(setting.id)}
                              colorScheme="blue"
                              size="md"
                              isDisabled={isLoading}
                            />
                          ) : (
                            <Select
                              value={String(settings[setting.id])}
                              onChange={(e) => handleSelectChange(setting.id, e.target.value)}
                              size="sm"
                              borderRadius="md"
                              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                              isDisabled={isLoading}>
                              {setting.options?.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Select>
                          )}
                        </Box>
                      </HStack>

                      {index < category.settings.length - 1 && (
                        <Divider borderColor={colorMode === "dark" ? "gray.700" : "gray.200"} />
                      )}
                    </React.Fragment>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;
