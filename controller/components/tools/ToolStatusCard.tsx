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
  useToast,
  useDisclosure,
  Modal,
  useColorModeValue,
} from "@chakra-ui/react";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import Link from "next/link";
import { ToolConfigEditor } from "./ToolConfigEditor";
import { ToolStatusTag } from "./ToolStatusTag";
import { EditMenu } from "@/components/ui/EditMenu";
import { EditToolModal } from "./EditToolConfig";
import { useRouter } from "next/router";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";
import { Icon, ToolIcons } from "../ui/Icons";
import { useEffect, useState } from "react";

interface ToolStatusCardProps {
  toolId: string;
  style?: any;
}

export default function ToolStatusCard({ toolId, style = {} }: ToolStatusCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const cardBg = useColorModeValue(
    semantic.background.card.light,
    semantic.background.primary.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.primary.light,
    semantic.border.primary.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const shadowColor = useColorModeValue(
    `${semantic.border.primary.light}40`,
    `${semantic.border.primary.dark}40`,
  );

  const infoQuery = trpc.tool.info.useQuery({ toolId: toolId || "" });
  const toolData = infoQuery.data;
  const { description, name } = infoQuery.data || {};
  const deleteTool = trpc.tool.delete.useMutation();
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery();
  const editTool = trpc.tool.edit.useMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();
  if (infoQuery.isLoading) {
    return <Spinner size="lg" color={accentColor} />;
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
    if (!config.image_url) {
      return <Box></Box>;
    } else if (config.name === "Tool Box") {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Icon as={ToolIcons.Toolbox} color={accentColor} boxSize="100px" />
        </Box>
      );
    } else {
      return (
        <Image
          src={config.image_url}
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
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth={tokens.borders.widths.thin}
        height="280px"
        width="280px"
        borderRadius={tokens.borders.radii.lg}
        boxShadow={`0 4px 8px ${shadowColor}`}
        transition="all 0.2s"
        overflow="hidden"
        _hover={{
          transform: "translateY(-5px)",
          boxShadow: `0 6px 12px ${shadowColor}`,
        }}
        p={tokens.spacing.sm}
        style={{ ...style }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <CardHeader pb={0}>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Link href={`/tools/${toolId}`} passHref>
                <Heading size="md" color={textColor}>
                  {name}
                </Heading>
              </Link>
              <Text fontSize={tokens.typography.fontSizes.sm} color={textSecondary}>
                {description}
              </Text>
            </Box>
            <Box top={-5} right={-5} position="relative">
              {toolId !== "Tool Box" && (
                <EditMenu onEdit={onOpen} onDelete={() => handleDelete(toolId)} />
              )}
            </Box>
          </Flex>
        </CardHeader>
        <CardBody mt={0}>
          <VStack align="stretch" spacing={tokens.spacing.md} mb={tokens.spacing.sm}>
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
