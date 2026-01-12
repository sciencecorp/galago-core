import { trpc } from "@/utils/trpc";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Spinner,
  VStack,
  Flex,
  Image,
  IconButton,
  useDisclosure,
  useColorModeValue,
  Alert,
  Tag,
} from "@chakra-ui/react";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import Link from "next/link";
import { ToolConfigEditor } from "./ToolConfigEditor";
import { ToolStatusTag } from "./ToolStatusTag";
import { useState } from "react";
import { ToolCase } from "lucide-react";
import { EditMenu } from "@/components/ui/EditMenu";
import { EditToolModal } from "./EditToolConfig";
// import { useRouter } from "next/router";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { successToast, errorToast } from "../ui/Toast";

interface ToolStatusCardProps {
  toolId: string;
  style?: any;
}

export default function ToolStatusCard({ toolId, style = {} }: ToolStatusCardProps) {
  // const _router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const infoQuery = trpc.tool.info.useQuery({ toolId: toolId || "" });
  const toolData = infoQuery.data;
  const { description, name } = infoQuery.data || {};
  const deleteTool = trpc.tool.delete.useMutation();
  const { data: selectedWorkcellData } = trpc.workcell.getSelectedWorkcell.useQuery();
  const { data: workcells } = trpc.workcell.getAll.useQuery();
  const { data: _fetchedIds, refetch } = trpc.tool.availableIDs.useQuery({
    workcellId: workcells?.find((workcell) => workcell.name === selectedWorkcellData)?.id,
  });
  // const _editTool = trpc.tool.edit.useMutation();
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
      await refetch();
      successToast("Tool deleted successfully", "");
    } catch (error) {
      errorToast("Error deleting tool", `Please try again. ${error}`);
    }
  };

  function renderToolImage(config: any) {
    console.log("Rendering image url", config.imageUrl);
    if (!config.imageUrl) {
      return <Box></Box>;
    } else if (config.name === "Tool Box") {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconButton
            aria-label="Tool Box"
            icon={<ToolCase style={{ width: "100%", height: "100%" }} />} // Ensure the icon fills the button
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
          src={config.imageUrl}
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
          <Flex position="relative" alignItems="flex-start">
            <Box flex="1" minW={0} pr={10} maxW="100%">
              <Link href={`/tools/${toolId}`} passHref>
                <Heading size="md" isTruncated maxW="100%" title={name}>
                  {name}
                </Heading>
              </Link>
              <Text fontSize="sm" isTruncated maxW="100%" title={description}>
                {description}
              </Text>
            </Box>
            <Box position="absolute" top={0} right={0} zIndex={1}>
              {toolId !== "Tool Box" && <EditMenu onEdit={onOpen} onDelete={openDeleteConfirm} />}
            </Box>
          </Flex>
        </CardHeader>
        <CardBody mt="0px">
          <VStack align="stretch" spacing={4} mb={2}>
            <ToolStatusTag toolId={toolId} isConfiguring={isConfiguring} />

            {/* Always render the ToolConfigEditor but manage its visibility with CSS */}
            <Flex position="relative" width="100%" height="120px">
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
                  <ToolConfigEditor
                    toolId={toolId}
                    defaultConfig={toolData as ToolConfig}
                    onConfiguring={setIsConfiguring}
                  />
                </Box>
                <Box width="60px" height="60px" ml={2}>
                  <Link href={`/tools/${toolId}`}>{renderToolImage(toolData)}</Link>
                </Box>
              </Box>

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
      <EditToolModal toolId={toolId} isOpen={isOpen} onClose={onClose} />
    </>
  );
}
