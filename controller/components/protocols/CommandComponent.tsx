import {
  Box,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Center,
  Flex,
} from "@chakra-ui/react";
import { DeleteIcon, HamburgerIcon } from "@chakra-ui/icons";
import { trpc } from "@/utils/trpc";
import { capitalizeAll, capitalizeFirst } from "@/utils/parser";
import { VscRunBelow } from "react-icons/vsc";
import CommandImage from "@/components/tools/CommandImage";

export const CommandComponent: React.FC<{
  command: any;
  onCommandClick: (command: any) => void;
  onRunCommand: (command: any) => void;
  onDeleteCommand: () => void;
  isEditing?: boolean;
}> = ({ command, onCommandClick, onRunCommand, onDeleteCommand, isEditing = false }) => {
  const infoQuery = trpc.tool.info.useQuery({ toolId: command.tool_id });
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
        minW="190px"
        maxW="210px"
        height="140px"
        overflow="hidden"
        mr="4"
        fontSize="18px"
        borderLeftRadius="10"
        borderRightRadius="10"
        padding="4px"
        background={useColorModeValue("gray.50", "gray.700")}
        border="1px"
        borderColor={useColorModeValue("gray.200", "gray.600")}
        boxShadow={useColorModeValue("md", "none")}
        sx={{
          "&::-webkit-scrollbar": {
            width: "10px",
            height: "10px",
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "transparent",
          },
          "&:hover::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
          },
          "&": {
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent",
          },
          "&:hover": {
            scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
          },
          msOverflowStyle: "none",
        }}>
        <VStack alignItems="stretch" height="100%" spacing="0">
          <Flex position="relative" alignItems="center" justifyContent="center" pb="1" width="100%">
            <Box className="command-menu" position="absolute" right="0" top="0" zIndex="1">
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
                <MenuList minW="120px" maxW="150px">
                  <MenuItem
                    onClick={() => onRunCommand(command)}
                    icon={<VscRunBelow fontSize="xs" />}>
                    <Text fontSize="xs">Run Command</Text>
                  </MenuItem>
                  {isEditing && (
                    <MenuItem onClick={onDeleteCommand} icon={<DeleteIcon fontSize="xs" />}>
                      <Text fontSize="xs">Delete Command</Text>
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            </Box>

            <Box textAlign="center" width="80%" mx="auto">
              <Text
                fontSize="14px"
                as="b"
                isTruncated
                title={capitalizeAll(command?.tool_id.replace("_", " "))}>
                {capitalizeAll(command?.tool_id.replace("_", " "))}
              </Text>
            </Box>
          </Flex>

          <Center p={0} flex="1" overflow="hidden">
            <VStack spacing={2} justifyContent="center" maxW="100%">
              <Box maxW="100%">
                <CommandImage
                  config={infoQuery.data}
                  command={command}
                  onCommandClick={onCommandClick}
                />
              </Box>
              <Box position="sticky" bottom={0} maxW="100%">
                <Text
                  fontSize="sm"
                  textAlign="center"
                  isTruncated
                  title={capitalizeFirst(command.command.replaceAll("_", " "))}>
                  {capitalizeFirst(command.command.replaceAll("_", " "))}
                </Text>
              </Box>
            </VStack>
          </Center>
        </VStack>
      </Box>
    </Box>
  );
};
