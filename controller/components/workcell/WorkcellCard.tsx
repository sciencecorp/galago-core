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
  Badge,
  Wrap,
  WrapItem,
  Avatar,
  AvatarGroup,
  Tooltip,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { DeleteWithConfirmation } from "../ui/Delete";
import { Workcell } from "@/types/api";
import { LuCheck, LuX } from "react-icons/lu";
import { EditMenu } from "../ui/EditMenu";
import { EditableText } from "../ui/Form";
import { BsTools } from "react-icons/bs";
import { MdLocationOn } from "react-icons/md";
import { format } from "date-fns";

interface WorkcellCardProps {
  workcell: Workcell;
  onChange?: () => void;
}

export const WorkcellCard: React.FC<WorkcellCardProps> = (props) => {
  const { workcell } = props;
  const [isHovered, setIsHovered] = useState(false);
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const selectedBg = useColorModeValue("teal.50", "teal.900");
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
      if (selectedWorkcellData === workcell.name) {
        await setWorkcell.mutate("");
      }
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

  // Generate a consistent color based on workcell name
  const getWorkcellColor = (name: string) => {
    const colors = ["red", "orange", "yellow", "green", "teal", "blue", "cyan", "purple", "pink"];
    const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  const isSelected = selectedWorkcellData === workcell.name;

  return (
    <Card
      bg={isSelected ? selectedBg : cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      shadow="md"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
      overflow="hidden">
      <CardBody p={4}>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={workcell.name}
                bg={`${getWorkcellColor(workcell.name)}.500`}
                color="white"
              />
              <VStack align="start" spacing={0}>
                <EditableText
                  defaultValue={workcell.name}
                  preview={<Heading size="md">{workcell.name}</Heading>}
                  onSubmit={(value) => {
                    if (value) handleEdit({ ...workcell, name: value });
                  }}
                />
                <HStack fontSize="sm" color="gray.500">
                  <Icon as={MdLocationOn} />
                  <EditableText
                    defaultValue={workcell.location || ""}
                    preview={<Text>{workcell.location || "No location"}</Text>}
                    onSubmit={(value) => handleEdit({ ...workcell, location: value || "" })}
                  />
                </HStack>
              </VStack>
            </HStack>
            <DeleteWithConfirmation
              onDelete={handleDelete}
              label="workcell"
              variant="icon"
              customText="Are you sure? This will delete all tools in this workcell."
            />
          </HStack>

          {workcell.description && (
            <EditableText
              defaultValue={workcell.description}
              preview={
                <Text fontSize="sm" color="gray.500" noOfLines={2}>
                  {workcell.description}
                </Text>
              }
              onSubmit={(value) => handleEdit({ ...workcell, description: value || "" })}
            />
          )}

          <HStack justify="space-between" align="center">
            <HStack>
              <Icon as={BsTools} />
              <Text fontSize="sm">{workcell.tools.length} Tools</Text>
            </HStack>
            <Badge colorScheme={isSelected ? "teal" : "gray"}>
              {isSelected ? "Active" : "Inactive"}
            </Badge>
          </HStack>

          {workcell.tools.length > 0 && (
            <AvatarGroup size="md" max={4} spacing="-1.5rem">
              {workcell.tools.map((tool) => (
                <Tooltip key={tool.id} label={tool.name}>
                  <Avatar
                    name={tool.name}
                    src={tool.image_url}
                    bg={`${getWorkcellColor(tool.name)}.500`}
                    p={1}
                    borderWidth={2}
                    borderColor={cardBg}
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          )}
        </VStack>
      </CardBody>

      <CardFooter pt={0} pb={4} px={4} borderTop="1px" borderColor={borderColor}>
        <Button
          width="full"
          colorScheme={isSelected ? "teal" : "gray"}
          variant={isSelected ? "solid" : "outline"}
          onClick={handleSelect}
          size="sm">
          {isSelected ? "Selected" : "Select Workcell"}
        </Button>
      </CardFooter>
    </Card>
  );
};
