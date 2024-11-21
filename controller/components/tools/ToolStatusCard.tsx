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
  useToast,
  useDisclosure,
  Modal,
} from "@chakra-ui/react";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import Link from "next/link";
import { ToolConfigEditor } from "./ToolConfigEditor";
import { ToolStatusTag } from "./ToolStatusTag";
import { HamburgerIcon } from "@chakra-ui/icons";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { PiToolbox } from "react-icons/pi";
import { DeleteWithConfirmation } from "@/components/UI/Delete";
import { EditMenu } from "@/components/UI/EditMenu";
import { Tool } from "@/types/api";
import { EditToolModal } from "./EditToolConfig";
import { useRouter } from "next/router";

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



export default function ToolStatusCard({ toolId,  style = {} }: ToolStatusCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const infoQuery = trpc.tool.info.useQuery({ toolId: toolId || "" });
  const toolData = infoQuery.data;
  const { description, name } = infoQuery.data || {};
  const deleteTool = trpc.tool.delete.useMutation();
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery();
  const editTool = trpc.tool.edit.useMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();
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
      toast({
        title: "Tool deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error deleting tool",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  function renderToolImage(config: any) {
    console.log("Config das:", config);
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
          src={`/tool_icons/${config.type}.png`}
          alt={config.name}
          objectFit="contain"
          height={isHovered ? "120px" : "120px"}
          width={isHovered ? "120px" : "120px"}
          transition="all 0.3s ease-in-out"
        />
      );
    }
  }

  return (
    <>
      <StyledCard
        p={2}
        style={{ width: "280px", ...style }}
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
              {toolId !== "tool_box" && (
                <EditMenu onEdit={onOpen} onDelete={() => handleDelete(toolId)} />
              )}
            </Box>
          </Flex>
        </CardHeader>
        <CardBody mt="0px">
          <VStack align="stretch" spacing={4} mb={2}>
            <ToolStatusTag toolId={toolId} />
            <Flex
              justifyContent="center"
              alignItems="center"
              height={isHovered ? "auto" : "100%"}
              transition="all 0.3s ease-in-out">
              {isHovered ? (
                <Flex justifyContent="space-between" alignItems="center" width="100%">
                  <Box flex="1" opacity={isHovered ? 1 : 0} transition="opacity 0.3s">
                    <ToolConfigEditor toolId={toolId} defaultConfig={toolData as ToolConfig} />
                  </Box>
                  <Box width="60px" height="60px">
                    {<Link href={`/tools/${toolId}`}>{renderToolImage(toolData)}</Link>}
                  </Box>
                </Flex>
              ) : (
                <Box>{<Link href={`/tools/${toolId}`}>{renderToolImage(toolData)}</Link>}</Box>
              )}
            </Flex>
          </VStack>
        </CardBody>
      </StyledCard>
      <EditToolModal
        toolId={toolId}
        toolInfo={toolData as ToolConfig}
        isOpen={isOpen}
        onClose={onClose}
        refetch={refetch}
      />
    </>
  );
}
