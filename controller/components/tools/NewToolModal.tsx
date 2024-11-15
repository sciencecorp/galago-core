import React, { useState, useEffect } from "react";
import {
  VStack,
  Button,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { RiAddFill } from "react-icons/ri";
import { ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";
import { Tool } from "@/types/api";

interface NewToolModalProps {
  isDisabled?: boolean;
}
export const NewToolModal: React.FC<NewToolModalProps> = (props) => {
  const { isDisabled} = props;
  const [name, setName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [type, setType] = useState<ToolType>(ToolType.UNRECOGNIZED);
  const addTool = trpc.tool.add.useMutation();
  const [description, setDescription] = useState("");
  const {data: fetchedIds, refetch} = trpc.tool.availableIDs.useQuery();
  const availableTools = Object.values(ToolType);
  const [defaultConfig, setDefaultConfig] = useState<any>(null);
  
  const { data: configData, isFetching: isConfigLoading } = trpc.tool.getToolconfigDefinitions.useQuery(
    type as ToolType,
    {
      enabled: !!type, // Only fetch when type is set
    }
  );
  
  useEffect(() => {
    console.log("Butotn is disabled: ", isDisabled);
    if (configData) {
      console.log("Config definition is: ", configData);
      setDefaultConfig(configData);
    }
  }, [configData]);

  const handleSave = async () => {
    let workcell_id = 1;
    let ip = "localhost";
    let image_url = `/tool_icons/${type}.png`;
    const tool = { name, type, workcell_id, ip, image_url, description, config: { [type] : defaultConfig || { }}};
    setIsLoading(true);
    try {
      await addTool.mutateAsync(tool);
      await refetch();
      toast({
        title: `Tool created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error creating tool",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
    clearForm();
  };

  const clearForm = () => {
    setName("");
    setValue("");
    setType(ToolType.UNRECOGNIZED);
    setDescription("");
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="teal" leftIcon={<RiAddFill />} isDisabled={isDisabled}>
        New Tool
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Tool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Select Tool Type</FormLabel>
                <Select value={type} 
                  onChange={(e) => {
                    const enumValue = e.target.value as ToolType;
                    console.log("Selected tool type: ", enumValue);
                    setType(enumValue); // This sets the actual enum value, not the string
                  }}
                
                placeholder="Select Tool">
                  {availableTools
                    .filter(
                      (x) =>
                        x !== ToolType.UNRECOGNIZED &&
                        x !== ToolType.unknown &&
                        x !== ToolType.toolbox,
                    )
                    .sort()
                    .map((tool) => (
                      <option key={tool} value={tool}>
                        {capitalizeFirst(tool.replaceAll("_", " "))}
                      </option>
                    ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleSave} mr={3} isLoading={isLoading}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
