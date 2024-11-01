import React, { useEffect } from "react";
import { useRef } from "react";
import {
  VStack,
  Select,
  Text,
  Icon,
  Checkbox,
  IconButton,
  Divider,
  Input,
  FormHelperText,
  Box,
  useDisclosure,
  Modal,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Button,
  ButtonGroup,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { ToolType } from "gen-interfaces/controller";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";

interface SettingsProps {
  IsVisible: boolean;
}

export const SettingsModalComponent: React.FC<SettingsProps> = ({ IsVisible }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showModal, setShowmodal] = useState<boolean>(IsVisible);
  const [workcellConfigPath, setWorkcellConfigPath] = useState<string>("");
  const [dataDirectoryPath, setDataDirectoryPath] = useState<string>("");
  const [workcells, setWorkcells] = useState<string[]>();
  const commandMutation = trpc.tool.runCommand.useMutation();

  const handleModalClose = () => {
    setShowmodal(false);
    onClose();
  };

  useEffect(() => {
    setShowmodal(true);
  }, [IsVisible]);

  useEffect(() => {
    const fetchWorkcellNames = async () => {
      const workcellsResponse = await GetWorkcellNames();
      let workcellArray: string[] = [];
      console.log(workcellsResponse?.meta_data);
      if (workcellsResponse?.meta_data) {
        for (let workcell of workcellsResponse.meta_data["workcells"]) {
          workcellArray.push(workcell);
        }
        setWorkcells(workcellArray);
      }
    };

    fetchWorkcellNames();
  }, []);

  const GetWorkcellNames = useCallback(async (): Promise<ExecuteCommandReply | undefined> => {
    const toolCommand: ToolCommandInfo = {
      toolId: "toolbox",
      toolType: "toolbox" as ToolType,
      command: "get_workcells",
      params: {},
    };

    const response: ExecuteCommandReply | undefined =
      await commandMutation.mutateAsync(toolCommand);
    return response;
  }, []);

  const saveSettingsConfirmModal = () => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered={true}>
        <ModalContent>
          <ModalHeader>Confirm Action</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Save New Settings?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3}>
              Accept
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  //Your component logic goes here
  return (
    <VStack>
      <Box>
        <Modal isOpen={showModal} onClose={handleModalClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Settings</ModalHeader>
            <ModalCloseButton onClick={handleModalClose} />
            <ModalBody>
              <VStack align="start" spacing={4}>
                <FormControl>
                  <FormLabel>Workcell Config</FormLabel>
                  <HStack>
                    <Box width="95%">
                      <Select placeholder="Select option">
                        {workcells &&
                          workcells.map((workcell, index) => (
                            <option key={index} value={workcell}>
                              {workcell}
                            </option>
                          ))}
                      </Select>
                      {
                        //<Input value={workcellConfigPath} readOnly />
                      }
                    </Box>
                  </HStack>
                  <FormHelperText>Select the workcell to load.</FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel>Host Ip</FormLabel>
                  <Input></Input>
                  <FormHelperText>
                    The computer running the app. Defaults to localhost if not provided. Required to
                    access the app from the network.
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel>Redis Host</FormLabel>
                  <Input></Input>
                  <FormHelperText>
                    You must configure redis and specify url to run protocols.
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel>Slack Bot Token</FormLabel>
                  <Input></Input>
                  <FormHelperText>
                    Required to use slack messaging utils. Eg. errors, run start/end, etc.
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <HStack>
                    <FormLabel>Enable Slack Errors</FormLabel>
                    <Checkbox />
                  </HStack>
                </FormControl>
              </VStack>
            </ModalBody>
            <Divider />
            <ModalFooter>
              <ButtonGroup>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    saveSettingsConfirmModal();
                  }}>
                  Save
                </Button>
                <Button onClick={handleModalClose}>Cancel</Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </VStack>
  );
};

export default SettingsModalComponent;
