import { trpc } from "@/utils/trpc";
import {
  Card,
  CardBody,
  Heading,
  Text,
  HStack,
  VStack,
  Icon,
  CardFooter,
  Button,
  useColorModeValue,
  Badge,
  Avatar,
  AvatarGroup,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { DeleteWithConfirmation } from "../ui/Delete";
import { Workcell } from "@/types/api";
import { EditableText } from "../ui/Form";
import { BsTools } from "react-icons/bs";
import { MdLocationOn } from "react-icons/md";
import Avvvatars from "avvvatars-react";
import { errorToast } from "../ui/Toast";
interface WorkcellCardProps {
  workcell: Workcell;
  onChange?: () => void;
}

export const WorkcellCard: React.FC<WorkcellCardProps> = (props) => {
  const { workcell } = props;
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
  const { data: selectedWorkcellData, refetch } =
    trpc.workcell.getSelectedWorkcell.useQuery();

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
  }, [workcell.name, selectedWorkcellData]);

  const handleDelete = async () => {
    try {
      if (selectedWorkcellData === workcell.name) {
        await setWorkcell.mutate("");
      }
      await deleteWorkcell.mutateAsync(workcell.id);
      await clearToolStore.mutate();
      props.onChange && props.onChange();
    } catch (error) {
      errorToast(
        "Error deleting workcell",
        `Can't delete a workcell with active protocols. ${error}. `
      );
    }
  };

  const handleEdit = async (editedWorkcell: Workcell) => {
    try {
      await editWorkcell.mutateAsync(editedWorkcell);
      props.onChange && props.onChange();
    } catch (error) {
      errorToast("Error updating workcell", `Please try again. ${error}`);
    }
  };

  // Generate a consistent color based on workcell name
  const getWorkcellColor = (name: string) => {
    const colors = [
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "blue",
      "cyan",
      "purple",
      "pink",
    ];
    const hash = name
      .split("")
      .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
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
      overflow="hidden"
      height="100%"
      margin="2px"
      width="100%"
    >
      <CardBody p={4}>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Avvvatars value={workcell.name} style="shape" size={48} />
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
                    onSubmit={(value) =>
                      handleEdit({ ...workcell, location: value || "" })
                    }
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
              onSubmit={(value) =>
                handleEdit({ ...workcell, description: value || "" })
              }
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
            <AvatarGroup size="md" max={8} spacing="-0.75rem">
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
      <CardFooter
        pt={4}
        pb={4}
        px={4}
        borderTop="1px"
        borderColor={borderColor}
      >
        <Button
          width="full"
          colorScheme={isSelected ? "teal" : "gray"}
          variant={isSelected ? "solid" : "outline"}
          onClick={handleSelect}
          size="sm"
        >
          {isSelected ? "Selected" : "Select Workcell"}
        </Button>
      </CardFooter>
    </Card>
  );
};
