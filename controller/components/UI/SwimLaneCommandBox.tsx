import {
    Box,
    Text,
    Tag,
    useColorModeValue,
    IconButton,
    Image,
    HStack,
    VStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
  } from "@chakra-ui/react";
  import { HamburgerIcon, ArrowForwardIcon } from "@chakra-ui/icons";
  import { PiToolbox } from "react-icons/pi";
  import { IoPlaySkipForward } from "react-icons/io5";
  import { BsSkipForwardFill } from "react-icons/bs";
  import { VscRunBelow } from "react-icons/vsc";
  import { trpc } from "@/utils/trpc";
  import { DeleteWithConfirmation } from "@/components/UI/Delete";
  import { ParameterEditor } from "@/components/UI/ParameterEditor";
  
  interface SwimLaneCommandBoxProps {
    command: any;
    isEditing?: boolean;
    onParamChange?: (newParams: Record<string, any>) => void;
    onParamExpand?: (expanded: boolean) => void;
    onDelete?: () => void;
    isLast: boolean;
    showActions?: boolean;
    onSkip?: () => void;
    onSkipUntil?: () => void;
    onSendToTool?: () => void;
  }
  
  export const SwimLaneCommandBox: React.FC<SwimLaneCommandBoxProps> = ({
    command,
    isEditing = false,
    onParamChange,
    onParamExpand,
    onDelete,
    isLast,
    showActions = false,
    onSkip,
    onSkipUntil,
    onSendToTool,
  }) => {
    const boxBg = useColorModeValue("white", "gray.700");
    const boxBorder = useColorModeValue("gray.200", "gray.600");
    const arrowColor = useColorModeValue("gray.500", "gray.400");
    const infoQuery = trpc.tool.info.useQuery({ toolId: command.commandInfo.toolId });
  
    const formatToolId = (toolId: string) => {
      return toolId
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
  
    const renderToolImage = (config: any) => {
      if (!config) return null;
      if (!config.image_url) return null;
      if (config.name === "Tool Box") {
        return (
          <IconButton
            aria-label="Tool Box"
            icon={<PiToolbox style={{ width: "100%", height: "100%" }} />}
            variant="ghost"
            colorScheme="teal"
            isRound
            size="md"
          />
        );
      }
      return (
        <Image
          src={config.image_url}
          alt={config.name}
          sizes="100vw"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain"
          }}
        />
      );
    };
  
    return (
      <HStack>
        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={6}
          minW="250px"
          maxW="250px"
          bg={boxBg}
          borderColor={boxBorder}
          shadow="sm"
          position="relative">
          {showActions && (
            <Box position="absolute" top="2" right="2">
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Options"
                  icon={<HamburgerIcon />}
                  size="sm"
                  variant="ghost"
                />
                <MenuList>
                  {onSkip && (
                    <MenuItem onClick={onSkip}>
                      <IoPlaySkipForward />
                      <Box as="span" ml={2}>Skip</Box>
                    </MenuItem>
                  )}
                  {onSkipUntil && (
                    <MenuItem onClick={onSkipUntil}>
                      <BsSkipForwardFill />
                      <Box as="span" ml={2}>Skip to this command</Box>
                    </MenuItem>
                  )}
                  {onSendToTool && (
                    <MenuItem onClick={onSendToTool}>
                      <VscRunBelow />
                      <Box as="span" ml={2}>Send to Tool</Box>
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            </Box>
          )}
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="md">
                {formatToolId(command.commandInfo.toolId)}
              </Text>
            </HStack>
            <Tag isTruncated>{command.commandInfo.command}</Tag>
            <ParameterEditor
              params={command.commandInfo.params}
              isEditing={isEditing}
              onParamChange={onParamChange}
            />
            {isEditing && onDelete && (
              <Box alignSelf="flex-end">
                <DeleteWithConfirmation
                  label="command"
                  onDelete={onDelete}
                  variant="icon"
                  size="sm"
                />
              </Box>
            )}
          </VStack>
          <Box 
            position="absolute" 
            bottom="4"
            right="4"
            opacity="0.9"
          >
            {renderToolImage(infoQuery.data)}
          </Box>
        </Box>
        {!isLast && (
          <Box color={arrowColor}>
            <ArrowForwardIcon boxSize={6} />
          </Box>
        )}
      </HStack>
    );
  };