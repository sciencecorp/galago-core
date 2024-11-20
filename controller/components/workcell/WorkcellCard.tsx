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
import { DeleteWithConfirmation } from "../UI/Delete";
import { Workcell } from "@/types/api";
import { LuCheck, LuX } from "react-icons/lu";
import { EditMenu } from "../UI/EditMenu";
import { EditableText } from "../UI/Form";

interface WorkcellCardProps {
  workcell: Workcell;
  onChange?: () => void;
}

export const WorkcellCard: React.FC<WorkcellCardProps> = (props) => {
  const { workcell } = props;
  const [isHovered, setIsHovered] = useState(false);
  const bg = useColorModeValue("teal.100", "teal.700");
  const toolBg = useColorModeValue("gray.100", "gray.700");
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

  useEffect(() => {
    if (selectedWorkcellData) {
      setSelectedWorkcell(selectedWorkcellData);
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
        {workcell.tools.length} Tools
      </Box>
    );
  };

  return (
    <Card
      p={2}
      width="380px"
      height="280px"
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      bg={selectedWorkcell === workcell.name ? bg : "transparent"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      boxShadow={isHovered ? "xl" : "sm"}
      transform={isHovered ? "translateY(-5px)" : "none"}
      transition="all 0.2s ease-in-out"
      cursor="pointer"
      shadow="md">
      <VStack width="100%" alignItems="stretch">
        <CardBody width="100%">
          <Flex justifyContent="space-between" width="100%">
            <Heading size="lg">
              <EditableText
                defaultValue={workcell.name}
                onSubmit={(value) => {
                  value && handleEdit({ ...workcell, name: value });
                }}
              />
            </Heading>
          </Flex>
          <Text fontSize="16px" mt={8}>
            <EditableText
              defaultValue={workcell.description}
              onSubmit={(value) => {
                value && handleEdit({ ...workcell, description: value });
              }}
            />
          </Text>
          <Box mt={2} width="100%">
            {Tools()}
          </Box>
        </CardBody>
        <CardFooter pt={0} justifyContent="flex-start" width="100%">
          <ButtonGroup>
            <Button
              onClick={async () => {
                await setWorkcell.mutate(workcell.name);
                await clearToolStore.mutate();
              }}
              colorScheme="teal"
              variant="solid">
              {selectedWorkcell === workcell.name ? 'Selected' : 'Select'}
            </Button>
            <DeleteWithConfirmation
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
