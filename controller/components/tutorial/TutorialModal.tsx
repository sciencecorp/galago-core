import React from "react";
import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Spinner,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useTutorial } from "./TutorialContext";

export function TutorialModal() {
  const {
    isOpen,
    isMinimized,
    close,
    minimize,
    resume,
    skip,
    next,
    back,
    stepIndex,
    steps,
    isBusy,
    useDemoData,
    setUseDemoData,
    demoData,
    resetDemoData,
    start,
  } = useTutorial();

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const floatingBg = useColorModeValue("white", "gray.800");
  const floatingBorder = useColorModeValue("gray.200", "whiteAlpha.300");
  const subtleText = useColorModeValue("gray.500", "gray.400");
  const demoPanelText = useColorModeValue("gray.600", "gray.300");

  // When minimized, show a small floating widget so the underlying page is fully usable.
  if (isOpen && isMinimized) {
    return (
      <Box position="fixed" bottom={4} right={4} zIndex={1400} maxW="360px">
        <Box
          borderWidth="1px"
          borderRadius="md"
          bg={floatingBg}
          borderColor={floatingBorder}
          shadow="lg"
          p={3}
          pointerEvents="auto">
          <HStack spacing={3}>
            <Box>
              <Text fontWeight="semibold" noOfLines={1}>
                Walkthrough: {step?.title ?? "Walkthrough"}
              </Text>
              <Text fontSize="sm" color={subtleText}>
                Step {Math.min(stepIndex + 1, steps.length)} of {steps.length}
                {isBusy ? " • Working…" : ""}
              </Text>
            </Box>
            <Spacer />
            <Button size="md" colorScheme="teal" onClick={resume} isDisabled={isBusy} fontSize="sm">
              Resume
            </Button>
            <Button size="md" variant="ghost" onClick={skip} isDisabled={isBusy} fontSize="sm">
              End
            </Button>
          </HStack>
        </Box>
      </Box>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={close} size="xl" closeOnOverlayClick={!isBusy} isCentered>
      <ModalOverlay />
      <ModalContent bg={floatingBg} borderColor={floatingBorder} borderWidth="1px">
        <ModalHeader>
          <HStack spacing={3}>
            <Text>{step?.title ?? "Walkthrough"}</Text>
            <Badge variant="subtle" colorScheme="teal">
              {Math.min(stepIndex + 1, steps.length)}/{steps.length}
            </Badge>
            {isBusy && (
              <HStack spacing={2}>
                <Spinner size="sm" />
                <Text fontSize="sm" color={subtleText}>
                  Working…
                </Text>
              </HStack>
            )}
            <Spacer />
            <Menu>
              <Tooltip label="Walkthrough options" hasArrow openDelay={2000}>
                <MenuButton
                  as={IconButton}
                  aria-label="Walkthrough options"
                  icon={<HamburgerIcon />}
                  size="sm"
                  variant="ghost"
                  isDisabled={isBusy}
                />
              </Tooltip>
              <MenuList> 
                <MenuItem onClick={minimize} isDisabled={isBusy}>
                  Minimize
                </MenuItem>
                <MenuItem onClick={close} isDisabled={isBusy}>
                  Close
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {isFirst && (
              <Box>
                <Text color={subtleText}>
                  This walkthrough will guide you through each page and how Galago connects together
                  end-to-end.
                </Text>
                <Divider my={3} />
                <VStack align="stretch" spacing={2}>
                  <Checkbox
                    isChecked={useDemoData}
                    onChange={(e) => setUseDemoData(e.target.checked)}
                    isDisabled={isBusy}>
                    Create demo data (recommended)
                  </Checkbox>
                  <Text fontSize="sm" color={subtleText}>
                    Demo data is created via the normal APIs with “Tutorial …” names and can be
                    removed at the end.
                  </Text>
                </VStack>
                <Divider my={3} />
                <HStack>
                  <Button
                    colorScheme="teal"
                    onClick={() => start({ useDemoData })}
                    isLoading={isBusy}
                    loadingText="Starting…">
                    Start walkthrough
                  </Button>
                  <Button variant="ghost" onClick={skip} isDisabled={isBusy}>
                    Skip
                  </Button>
                </HStack>
              </Box>
            )}

            {!isFirst && <Box>{step?.body}</Box>}

            {demoData && (
              <Box borderWidth="1px" borderRadius="md" p={3}>
                <HStack>
                  <Text fontWeight="semibold">Tutorial demo data</Text>
                  <Spacer />
                  <Button size="xs" variant="outline" onClick={resetDemoData} isDisabled={isBusy}>
                    Remove demo data
                  </Button>
                </HStack>
                <Text mt={2} fontSize="sm" color={demoPanelText}>
                  Workcell: <b>{demoData.workcell?.name}</b>
                  <br />
                  Tools:{" "}
                  <b>
                    {(demoData.tools || [])
                      .map((t) => `${t.name} (${t.type})`)
                      .join(", ") || "—"}
                  </b>
                  <br />
                  Inventory:{" "}
                  <b>
                    {demoData.inventory?.hotel?.name
                      ? `${demoData.inventory.hotel.name} (${demoData.inventory?.nests?.length || 0} nests)`
                      : "—"}
                  </b>
                  <br />
                  Variables: <b>{(demoData.variables || []).map((v) => v.name).join(", ") || "—"}</b>
                  <br />
                  Scripts: <b>{(demoData.scripts || []).map((s) => s.name).join(", ") || "—"}</b>
                  <br />
                  Labware: <b>{(demoData.labware || []).map((l) => l.name).join(", ") || "—"}</b>
                  <br />
                  Forms: <b>{(demoData.forms || []).map((f) => f.name).join(", ") || "—"}</b>
                  <br />
                  Protocols: <b>{(demoData.protocols || []).map((p) => p.name).join(", ") || "—"}</b>
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack w="100%">
            <Button onClick={back} isDisabled={isFirst || isBusy}>
              Back
            </Button>
            <Spacer />
            <Button variant="ghost" onClick={skip} isDisabled={isBusy}>
              End
            </Button>
            <Button colorScheme="teal" onClick={next} isDisabled={isLast || isBusy}>
              Next
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


