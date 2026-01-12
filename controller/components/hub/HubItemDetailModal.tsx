import { useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Code,
  Divider,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Download, Play, Trash2 } from "lucide-react";
import type { HubItem } from "./hubTypes";
import { formatHubTimestamp } from "./hubUtils";
import { HubItemMapTab } from "./HubItemMapTab";

export function HubItemDetailModal({
  isOpen,
  onClose,
  item,
  onLoad,
  onDelete,
  onDownload,
  canDelete,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: HubItem | null;
  onLoad: (item: HubItem) => Promise<void>;
  onDelete: (item: HubItem) => Promise<void>;
  onDownload: (item: HubItem) => Promise<void>;
  canDelete?: boolean;
  isLoading?: boolean;
}): JSX.Element {
  const bg = useColorModeValue("white", "gray.900");
  const codeBg = useColorModeValue("gray.50", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  const payloadPretty = useMemo(() => {
    if (!item) return "";
    try {
      return JSON.stringify(item.payload, null, 2);
    } catch {
      return String(item.payload);
    }
  }, [item]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={bg}>
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <HStack spacing={3}>
              <Text fontSize="lg" fontWeight="bold">
                {item?.name ?? "Hub item"}
              </Text>
              {item?.type && (
                <Badge colorScheme="purple" variant="subtle">
                  {item.type}
                </Badge>
              )}
            </HStack>
            {item?.description ? (
              <Text fontSize="sm" color="gray.500">
                {item.description}
              </Text>
            ) : null}
            {item?.updated_at || item?.created_at ? (
              <Text fontSize="xs" color="gray.500">
                Updated: {formatHubTimestamp(item.updated_at || item.created_at)}
              </Text>
            ) : null}
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!item ? null : (
            <VStack align="stretch" spacing={4}>
              <HStack spacing={2} wrap="wrap">
                {(item.tags || []).map((t) => (
                  <Badge key={t} colorScheme="teal" variant="outline">
                    {t}
                  </Badge>
                ))}
              </HStack>

              <Divider />

              <Tabs variant="enclosed" colorScheme="teal" isFitted defaultIndex={0}>
                <TabList>
                  <Tab>Map</Tab>
                  <Tab>Payload</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0} pt={4}>
                    <HubItemMapTab item={item} />
                  </TabPanel>
                  <TabPanel px={0} pt={4}>
                    <Box border="1px" borderColor={border} borderRadius="md" overflow="hidden">
                      <Box px={3} py={2} bg={codeBg} borderBottom="1px" borderColor={border}>
                        <Text fontSize="sm" fontWeight="semibold">
                          Payload (JSON)
                        </Text>
                      </Box>
                      <Box px={3} py={3} bg={codeBg}>
                        <Code
                          whiteSpace="pre"
                          display="block"
                          width="100%"
                          bg="transparent"
                          fontSize="xs">
                          {payloadPretty}
                        </Code>
                      </Box>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2} width="100%">
            {canDelete === false ? (
              <Box />
            ) : (
              <Button
                leftIcon={<Trash2 size={16} />}
                variant="outline"
                colorScheme="red"
                isDisabled={!item}
                isLoading={!!isLoading}
                onClick={() => item && onDelete(item)}>
                Delete
              </Button>
            )}
            <Spacer />
            <Button
              leftIcon={<Download size={16} />}
              variant="outline"
              isDisabled={!item}
              isLoading={!!isLoading}
              onClick={() => item && onDownload(item)}>
              Download
            </Button>
            <Button
              leftIcon={<Play size={16} />}
              colorScheme="teal"
              isDisabled={!item}
              isLoading={!!isLoading}
              onClick={() => item && onLoad(item)}>
              Load into setup
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
