import { trpc } from "@/utils/trpc";
import {
  Alert,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  HStack,
  Spinner,
  VStack,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  Icon,
  CardFooter,
  Button,
  ButtonGroup,
  useColorModeValue,
  Editable,
  useToast,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { DeleteWithConfirmation } from "../ui/Delete";
import { Workcell } from "@/types/api";
import { LuCheck, LuX } from "react-icons/lu";
import { EditMenu } from "../ui/EditMenu";
import { EditableText } from "../ui/Form";

interface WorkcellCardProps {
  workcell: Workcell;
  onChange?: () => void;
}

export const WorkcellCard: React.FC<WorkcellCardProps> = (props) => {
  const { workcell } = props;
  const [isHovered, setIsHovered] = useState(false);
  const bg = useColorModeValue("teal.700", "teal.200");
  const toolBg = useColorModeValue("gray.200", "gray.800");
  const deleteWorkcell = trpc.workcell.delete.useMutation();
  const clearToolStore = trpc.tool.clearToolStore.useMutation();
  const editWorkcell = trpc.workcell.edit.useMutation();
  const setWorkcell = trpc.workcell.setSelectedWorkcell.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const [selectedWorkcell, setSelectedWorkcell] = useState<string | null>(null);
  const { data: selectedWorkcellData, refetch } = trpc.workcell.getSelectedWorkcell.useQuery();
  const toast = useToast();

  const handleSelect = async () => {
    await setWorkcell.mutate(workcell.name);
    await clearToolStore.mutate();
    document.title = `Workcell - ${workcell.name}`;
  };

  useEffect(() => {
    if (selectedWorkcellData) {
      setSelectedWorkcell(selectedWorkcellData);
      if (selectedWorkcellData === workcell.name) {
        document.title = `Workcell - ${workcell.name}`;
      }
    }
  }, [selectedWorkcellData]);

  const handleDelete = async () => {
    try {
      await setWorkcell.mutate("");
      await deleteWorkcell.mutateAsync(workcell.id);
      await clearToolStore.mutate();
      props.onChange && props.onChange();
    } catch (error) {
      toast({
        title: "Error deleting workcell",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = async (editedWorkcell: Workcell) => {
    try {
      await editWorkcell.mutateAsync(editedWorkcell);
      props.onChange && props.onChange();
    } catch (error) {
      toast({
        title: "Error updating workcell",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const Tools = () => {
    if (!workcell) return;
    if (!workcell.tools) return;
    return (
      <Box p={2} borderRadius="md" bg={toolBg}>
        {selectedWorkcell === workcell.name ? (
          <Text as="b">{workcell.tools.length} Tools</Text>
        ) : (
          <Text color="gray.400">{workcell.tools.length} Tools</Text>
        )}
      </Box>
    );
  };

  const Location = () => {
    if (!workcell) return;
    if (!workcell.location) return;
    return (
      <Box p={2} borderRadius="md" bg={toolBg}>
        {selectedWorkcell === workcell.name ? (
          <EditableText
            preview={<Text as="b">{workcell.location}</Text>}
            defaultValue={workcell.location}
            onSubmit={(value) => {
              value && handleEdit({ ...workcell, location: value });
            }}
          />
        ) : (
          <Text>{workcell.location}</Text>
        )}
      </Box>
    );
  };

  return (
    <Card
      p={2}
      width="380px"
      height="280px"
      borderRadius="xl"
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      border={selectedWorkcell === workcell.name ? "1px solid" : "1px solid"}
      borderColor={selectedWorkcell === workcell.name ? bg : "gray.200"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      boxShadow={isHovered ? "xl" : "sm"}
      transform={isHovered ? "translateY(-5px)" : "none"}
      transition="all 0.2s ease-in-out"
      cursor="pointer">
      <VStack width="100%" alignItems="stretch">
        <CardBody width="100%">
          <Flex justifyContent="space-between" width="100%">
            <Heading size="md">
              <EditableText
                preview={
                  selectedWorkcell === workcell.name ? (
                    <Text as="b" color={bg}>
                      {workcell.name}
                    </Text>
                  ) : (
                    <Text color="gray.400">{workcell.name}</Text>
                  )
                }
                defaultValue={workcell.name}
                onSubmit={(value) => {
                  value && handleEdit({ ...workcell, name: value });
                }}
              />
            </Heading>
          </Flex>
          <Text fontSize="16px" mt={8}>
            <EditableText
              preview={
                selectedWorkcell === workcell.name ? (
                  <Text fontSize="18px">{workcell.description}</Text>
                ) : (
                  <Text color="gray.400">{workcell.description}</Text>
                )
              }
              defaultValue={workcell.description}
              onSubmit={(value) => {
                value && handleEdit({ ...workcell, description: value });
              }}
            />
          </Text>
          <Box mt={2} width="100%">
            <HStack width="100%" spacing={1}>
              {Tools()}
              {Location()}
            </HStack>
          </Box>
        </CardBody>
        <CardFooter pt={0} justifyContent="flex-start" width="100%">
          <ButtonGroup>
            <Button
              onClick={async () => {
                handleSelect();
              }}
              colorScheme={selectedWorkcell === workcell.name ? "teal" : "gray"}
              variant="solid">
              {selectedWorkcell === workcell.name ? "Selected" : "Select"}
            </Button>
            <DeleteWithConfirmation
              disabled={(selectedWorkcell === workcell.name)}
              onDelete={handleDelete}
              label="workcell"
              variant="button"
              customText="Are you sure? This will delete all tools in this workcell."
            />
          </ButtonGroup>
        </CardFooter>
      </VStack>
    </Card>
  );
};
