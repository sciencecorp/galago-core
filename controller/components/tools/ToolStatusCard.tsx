import { trpc } from "@/utils/trpc";
import {
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
  useDisclosure,
  Modal,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tag,
} from "@chakra-ui/react";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import Link from "next/link";
import { ToolConfigEditor } from "./ToolConfigEditor";
import { ToolStatusTag } from "./ToolStatusTag";
import { HamburgerIcon } from "@chakra-ui/icons";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { PiToolbox } from "react-icons/pi";
import { EditMenu } from "@/components/ui/EditMenu";
import { EditToolModal } from "./EditToolConfig";
import { useRouter } from "next/router";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import ToolLogs from "@/pages/advanced";
import { successToast, errorToast } from "../ui/Toast";
const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 280px;
  width: 280px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: 0.3s ease-out;
  margin: 0 15px;
  margin-top: 10px;
  margin-bottom: 20px;
  overflow: hidden;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

interface ToolStatusCardProps {
  toolId: string;
  style?: any;
}

export default function ToolStatusCard({ toolId, style = {} }: ToolStatusCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const infoQuery = trpc.tool.info.useQuery({ toolId: toolId || "" });
  const toolData = infoQuery.data;
  const { description, name } = infoQuery.data || {};
  const deleteTool = trpc.tool.delete.useMutation();
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery();
  const editTool = trpc.tool.edit.useMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: openDeleteConfirm,
    onClose: closeDeleteConfirm,
  } = useDisclosure();

  if (infoQuery.isLoading) {
    return <Spinner size="lg" />;
  }

  if (infoQuery.isError || !toolData) {
    return <Alert status="error">Could not load tool info</Alert>;
  }

  const handleDelete = async (toolId: string) => {
    try {
      await deleteTool.mutateAsync(toolId);
      refetch();
      successToast("Tool deleted successfully", "");
    } catch (error) {
      errorToast("Error deleting tool", `Please try again. ${error}`);
    }
  };

  function renderToolImage(config: any) {
    if (!config.image_url) {
      return <Box></Box>;
    } else if (config.name === "Tool Box") {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconButton
            aria-label="Tool Box"
            icon={<PiToolbox style={{ width: "100%", height: "100%" }} />} // Ensure the icon fills the button
            variant="ghost"
            colorScheme="teal"
            isRound
            boxSize="100px"
          />
        </Box>
      );
    } else {
      return (
        <Image
          src={config.image_url}
          alt={config.name}
          objectFit="contain"
          height="120px"
          width="120px"
          transition="all 0.3s ease-in-out"
        />
      );
    }
  }

  return (
    <>
      <ConfirmationModal
        colorScheme="red"
        confirmText="Delete"
        header={`Delete command?`}
        isOpen={isDeleteConfirmOpen}
        onClick={async () => handleDelete(toolId)}
        onClose={closeDeleteConfirm}>
        <>
          {`Are you sure you want to delete this tool ${name}?`}
          {toolData.type === ToolType.pf400 && (
            <Tag colorScheme="orange" variant="solid" mt={4} p={2}>
              This will also delete teachpoints for this robot. Backup your data before proceeding.
            </Tag>
          )}
        </>
      </ConfirmationModal>
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        height="280px"
        width="280px"
        borderRadius="lg"
        boxShadow="md"
        transition="0.3s ease-out"
        overflow="hidden"
        _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
        p={2}
        style={{ ...style }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <CardHeader pb="0px">
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Link href={`/tools/${toolId}`} passHref>
                <Heading size="md">{name}</Heading>
              </Link>
              <Text fontSize="sm">{description}</Text>
            </Box>
            <Box top={-5} right={-5} position="relative">
              {toolId !== "tool_box" && <EditMenu onEdit={onOpen} onDelete={openDeleteConfirm} />}
            </Box>
          </Flex>
        </CardHeader>
        <CardBody mt="0px">
          <VStack align="stretch" spacing={4} mb={2}>
            <ToolStatusTag toolId={toolId} />

            {/* Always render the ToolConfigEditor but manage its visibility with CSS */}
            <Flex position="relative" width="100%" height="120px">
              {/* Tool Config Editor */}
              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                opacity={isHovered ? 1 : 0}
                pointerEvents={isHovered ? "auto" : "none"}
                transition="opacity 0.3s ease-in-out"
                display="flex"
                alignItems="center">
                <Box flex="1">
                  <ToolConfigEditor toolId={toolId} defaultConfig={toolData as ToolConfig} />
                </Box>
                <Box width="60px" height="60px" ml={2}>
                  <Link href={`/tools/${toolId}`}>{renderToolImage(toolData)}</Link>
                </Box>
              </Box>

              {/* Image when not hovered */}
              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                opacity={isHovered ? 0 : 1}
                pointerEvents={isHovered ? "none" : "auto"}
                transition="opacity 0.3s ease-in-out">
                <Link href={`/tools/${toolId}`}>{renderToolImage(toolData)}</Link>
              </Box>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
      <EditToolModal
        toolId={toolId}
        toolInfo={toolData as ToolConfig}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
}
