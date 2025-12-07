import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  HStack,
  Button,
  Switch,
  useColorMode,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Icon,
  Spinner,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
  Flex,
  Spacer,
  useColorModeValue,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon, CheckCircleIcon, DownloadIcon, SettingsIcon } from "@chakra-ui/icons";
import { FaTools, FaFolder, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { BsBoxSeam } from "react-icons/bs";

interface InstalledTool {
  name: string;
  source: "user" | "bundled";
  path: string;
}

export const Settings: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Electron detection and state
  const [isElectron, setIsElectron] = useState(false);
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [installedTools, setInstalledTools] = useState<InstalledTool[]>([]);
  const [toolsDirectory, setToolsDirectory] = useState<string | null>(null);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [dataDirectory, setDataDirectory] = useState<string | null>(null);

  useEffect(() => {
    // Check if running in Electron
    if (typeof window !== "undefined" && window.galagoDesktop?.isElectron) {
      setIsElectron(true);
      loadElectronInfo();
    }
  }, []);

  const loadElectronInfo = async () => {
    if (!window.galagoDesktop) return;

    try {
      // Get app version
      const version = await window.galagoDesktop.getAppVersion();
      setAppVersion(version);

      // Get data directory
      const dataDir = await window.galagoDesktop.getDataDirectory();
      setDataDirectory(dataDir);

      // Get tools directory
      const toolsDir = await window.galagoDesktop.getToolsDirectory();
      setToolsDirectory(toolsDir);

      // Load installed tools
      await loadInstalledTools();
    } catch (error) {
      console.error("Failed to load Electron info:", error);
    }
  };

  const loadInstalledTools = async () => {
    if (!window.galagoDesktop) return;

    setIsLoadingTools(true);
    try {
      const tools = await window.galagoDesktop.getInstalledTools();
      setInstalledTools(tools);
    } catch (error) {
      console.error("Failed to load installed tools:", error);
    } finally {
      setIsLoadingTools(false);
    }
  };

  const handleInstallTools = async () => {
    if (!window.galagoDesktop) return;

    try {
      // Open file dialog
      const selectResult = await window.galagoDesktop.selectToolsZip();
      if (!selectResult.success || selectResult.canceled) {
        return;
      }

      setIsInstalling(true);

      // Install tools
      const installResult = await window.galagoDesktop.installToolsFromZip(selectResult.path!);

      if (installResult.success) {
        toast({
          title: "Tools Installed",
          description: `Tools have been installed to ${installResult.toolsDir}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Reload tools list
        await loadInstalledTools();
      } else {
        toast({
          title: "Installation Failed",
          description: installResult.error || "Unknown error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Installation Failed",
        description: String(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Box maxW="900px" mx="auto" mt={8} p={6}>
      <Heading size="xl" mb={8}>
        <Icon as={SettingsIcon} mr={3} />
        Settings
      </Heading>

      <VStack spacing={6} align="stretch">
        {/* Appearance Section */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader pb={2}>
            <Heading size="md">Appearance</Heading>
          </CardHeader>
          <CardBody>
            <HStack justify="space-between" align="center">
              <HStack spacing={4}>
                <Icon as={colorMode === "light" ? SunIcon : MoonIcon} boxSize={5} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">Dark Mode</Text>
                  <Text fontSize="sm" color="gray.500">
                    Switch between light and dark themes
                  </Text>
                </VStack>
              </HStack>
              <Switch
                size="lg"
                isChecked={colorMode === "dark"}
                onChange={toggleColorMode}
                colorScheme="blue"
              />
            </HStack>
          </CardBody>
        </Card>

        {/* Electron-only sections */}
        {isElectron && (
          <>
            {/* Application Info */}
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader pb={2}>
                <Heading size="md">Application Info</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text color="gray.500">Version</Text>
                    <Badge colorScheme="blue" fontSize="sm">
                      {appVersion || "Loading..."}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.500">Platform</Text>
                    <Badge colorScheme="purple" fontSize="sm">
                      {window.galagoDesktop?.platform || "Unknown"}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between" align="start">
                    <Text color="gray.500">Data Directory</Text>
                    <Text fontSize="sm" maxW="400px" textAlign="right" wordBreak="break-all">
                      {dataDirectory || "Loading..."}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Tools Management */}
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader pb={2}>
                <Flex align="center">
                  <Icon as={FaTools} mr={2} />
                  <Heading size="md">Tool Drivers</Heading>
                  <Spacer />
                  <Button
                    leftIcon={<DownloadIcon />}
                    colorScheme="blue"
                    size="sm"
                    onClick={handleInstallTools}
                    isLoading={isInstalling}
                    loadingText="Installing...">
                    Install Tools
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Tool Drivers Required</AlertTitle>
                      <AlertDescription fontSize="sm">
                        Download and install the Galago Tools package to enable hardware
                        communication with lab instruments.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <HStack justify="space-between" align="start">
                    <Text color="gray.500">Tools Directory</Text>
                    <Text fontSize="sm" maxW="400px" textAlign="right" wordBreak="break-all">
                      {toolsDirectory || "Loading..."}
                    </Text>
                  </HStack>

                  <Divider />

                  <Box>
                    <HStack mb={3}>
                      <Text fontWeight="medium">Installed Tools</Text>
                      <Badge colorScheme="green">{installedTools.length}</Badge>
                      <Spacer />
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={loadInstalledTools}
                        isLoading={isLoadingTools}>
                        Refresh
                      </Button>
                    </HStack>

                    {isLoadingTools ? (
                      <Flex justify="center" py={4}>
                        <Spinner />
                      </Flex>
                    ) : installedTools.length === 0 ? (
                      <Alert status="warning" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          No tools installed. Click &quot;Install Tools&quot; to add tool drivers.
                        </Text>
                      </Alert>
                    ) : (
                      <List spacing={2}>
                        {installedTools.map((tool) => (
                          <ListItem
                            key={tool.name}
                            display="flex"
                            alignItems="center"
                            p={2}
                            borderRadius="md"
                            bg={useColorModeValue("gray.50", "gray.700")}>
                            <ListIcon
                              as={FaCheckCircle}
                              color="green.500"
                            />
                            <Text fontWeight="medium" mr={2}>
                              {tool.name}
                            </Text>
                            <Badge
                              colorScheme={tool.source === "bundled" ? "purple" : "blue"}
                              size="sm">
                              {tool.source}
                            </Badge>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </>
        )}

        {/* Web mode info */}
        {!isElectron && (
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader pb={2}>
              <Heading size="md">Application Mode</Heading>
            </CardHeader>
            <CardBody>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Web Mode</AlertTitle>
                  <AlertDescription>
                    Running in web browser mode. Tool driver management is only available in the
                    Galago Desktop application.
                  </AlertDescription>
                </Box>
              </Alert>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};
