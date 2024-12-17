import {
    Box,
    VStack,
    Text,
    IconButton,
    HStack,
    useColorModeValue,
    Collapse,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
  } from "@chakra-ui/react";
  import { ChevronUpIcon, ChevronDownIcon, HamburgerIcon, AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
  import { useState } from "react";
  import { SequenceCommand } from "../types";
  
  interface CommandListProps {
    commands: SequenceCommand[];
    sequenceName: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onAdd?: () => void;
  }
  
  export const CommandList: React.FC<CommandListProps> = ({ 
    commands, 
    sequenceName,
    onEdit,
    onDelete,
    onAdd,
  }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    const bgColor = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const selectedBg = useColorModeValue("blue.50", "blue.900");
    
    return (
      <Box
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        p={3}
        bg={bgColor}
        width="100%"
      >
        <VStack spacing={2}>
          <HStack width="100%" justify="space-between">
            <Text fontWeight="bold">{sequenceName}</Text>
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Sequence options"
                icon={<HamburgerIcon />}
                size="sm"
                variant="ghost"
              />
              <MenuList>
                <MenuItem icon={<EditIcon />} onClick={onEdit}>
                  Edit Sequence
                </MenuItem>
                <MenuItem icon={<AddIcon />} onClick={onAdd}>
                  Add Command
                </MenuItem>
                <MenuItem icon={<DeleteIcon />} onClick={onDelete} color="red.500">
                  Delete Sequence
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
          
          <IconButton
            aria-label="Previous command"
            icon={<ChevronUpIcon />}
            variant="ghost"
            size="sm"
            onClick={() => {
              if (selectedIndex > 0) {
                setSelectedIndex(selectedIndex - 1);
              }
            }}
            isDisabled={selectedIndex === 0}
          />
          
          <VStack spacing={2} width="100%" maxHeight="300px" overflowY="auto">
            {commands.map((command, index) => (
              <Box
                key={index}
                px={4}
                py={2}
                cursor="pointer"
                borderRadius="md"
                bg={index === selectedIndex ? selectedBg : "transparent"}
                onClick={() => setSelectedIndex(index)}
                width="100%"
                transition="all 0.2s"
                opacity={index === selectedIndex ? 1 : 0.6}
              >
                <Text fontWeight={index === selectedIndex ? "bold" : "normal"}>
                  {command.command}
                </Text>
                {index === selectedIndex && (
                  <Collapse in={true}>
                    <Text fontSize="sm" color="gray.500">
                      {Object.entries(command.params)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </Text>
                  </Collapse>
                )}
              </Box>
            ))}
          </VStack>
          
          <IconButton
            aria-label="Next command"
            icon={<ChevronDownIcon />}
            variant="ghost"
            size="sm"
            onClick={() => {
              if (selectedIndex < commands.length - 1) {
                setSelectedIndex(selectedIndex + 1);
              }
            }}
            isDisabled={selectedIndex === commands.length - 1}
          />
        </VStack>
      </Box>
    );
  };