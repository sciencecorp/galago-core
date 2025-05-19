import {
  Box,
  Button,
  HStack,
  VStack,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tag,
  useColorModeValue,
  IconButton,
  Divider,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Grid,
  GridItem,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, EditIcon, ArrowForwardIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";
import { AddToolCommandModal } from "./AddToolCommandModal";
import NewProtocolRunModal from "./NewProtocolRunModal";
import { trpc } from "@/utils/trpc";
import { capitalizeFirst } from "@/utils/parser";
import { VscRunBelow } from "react-icons/vsc";
import { ProtocolFormModal } from "./ProtocolFormModal";
import { FaPlay } from "react-icons/fa6";
import { SaveIcon } from "@/components/ui/Icons";
import { SiPlatformdotsh } from "react-icons/si";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { MdOutlineExitToApp, MdOutlineFormatListBulleted } from "react-icons/md";
import { CommandDetailsDrawer } from "./CommandDetailsDrawer";
import { ParameterSchema } from "@/types";
import CommandImage from "@/components/tools/CommandImage";
import { successToast, errorToast } from "../ui/Toast";
import { useCommonColors } from "@/components/ui/Theme";
import { PiPathBold } from "react-icons/pi";




export const CommandComponent: React.FC<{
  command: any;
  onCommandClick: (command: any) => void;
  onRunCommand: (command: any) => void;
  onDeleteCommand: () => void;
  isEditing?: boolean;
}> = ({ command, onCommandClick, onRunCommand, onDeleteCommand, isEditing = false }) => {
  const infoQuery = trpc.tool.info.useQuery({ toolId: command.commandInfo.toolId });

  return (
    <Box
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest(".command-menu")) {
          onCommandClick(command);
        }
      }}>
      <Box
        left="0px"
        right="0px"
        minW="200px"
        maxW="220px"
        height="150px"
        overflowY="auto"
        mr="4"
        fontSize="18px"
        borderLeftRadius="10"
        borderRightRadius="10"
        padding="4px"
        background={useColorModeValue("gray.50", "gray.700")}
        border="1px"
        borderColor={useColorModeValue("gray.200", "gray.600")}
        boxShadow={useColorModeValue("md", "none")}>
        <VStack alignItems="stretch">
          <Box>
            <HStack spacing={2}>
              <Box width="90%">
                <Text fontSize="16px" as="b">{capitalizeFirst(command.commandInfo.toolType)}</Text>
              </Box>
              <Box className="command-menu">
                <Menu>
                  <MenuButton
                    size="xs"
                    as={IconButton}
                    aria-label="Options"
                    border={0}
                    bg="transparent"
                    icon={<HamburgerIcon fontSize="sm" />}
                    variant="outline"
                  />
                  <MenuList>
                    <MenuItem onClick={() => onRunCommand(command)} icon={<VscRunBelow />}>
                      Run Command
                    </MenuItem>
                    {isEditing && (
                      <MenuItem onClick={onDeleteCommand} icon={<DeleteIcon />}>
                        Delete Command
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>
              </Box>
            </HStack>
          </Box>
          <Center p={0}>
            <VStack spacing={2}>
              <CommandImage
                config={infoQuery.data}
                command={command}
                onCommandClick={onCommandClick}
              />
              <Box bottom={0} position="sticky">
                <Text>{capitalizeFirst(command.commandInfo.command.replaceAll("_", " "))}</Text>
              </Box>
            </VStack>
          </Center>
        </VStack>
      </Box>
    </Box>
  );
};