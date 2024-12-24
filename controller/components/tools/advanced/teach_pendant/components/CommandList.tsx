import {
    Box,
    VStack,
    Text,
    IconButton,
    HStack,
    useColorModeValue,
    Collapse,
    Input,
    Button,
    FormControl,
    FormLabel,
    Center,
    SlideFade,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { SequenceCommand } from "../types";
import { CommandModal } from "../modals/CommandModal";
import { TeachPoint, MotionProfile, GripParams } from "../types";

interface CommandListProps {
    commands: SequenceCommand[];
    sequenceName: string;
    teachPoints: TeachPoint[];
    motionProfiles: MotionProfile[];
    gripParams: GripParams[];
    onDelete?: () => void;
    onCommandsChange: (commands: SequenceCommand[]) => void;
    onSequenceNameChange?: (name: string) => void;
}

export const CommandList: React.FC<CommandListProps> = ({ 
    commands, 
    sequenceName,
    teachPoints,
    motionProfiles,
    gripParams,
    onDelete,
    onCommandsChange,
    onSequenceNameChange,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [insertIndex, setInsertIndex] = useState<number | null>(null);
    const [editedSequenceName, setEditedSequenceName] = useState(sequenceName);
    const [localCommands, setLocalCommands] = useState(commands);
    
    const bgColor = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const selectedBg = useColorModeValue("blue.50", "blue.900");
    const arrowColor = useColorModeValue("gray.400", "gray.600");

    // Update local state when props change
    useEffect(() => {
        setLocalCommands(commands);
        setEditedSequenceName(sequenceName);
    }, [commands, sequenceName]);

    const handleAddCommand = (index: number) => {
        setInsertIndex(index);
        setIsModalOpen(true);
    };

    const handleDeleteCommand = (index: number) => {
        const newCommands = [...localCommands];
        newCommands.splice(index, 1);
        // Reorder remaining commands
        const reorderedCommands = newCommands.map((cmd, idx) => ({
            ...cmd,
            order: idx,
        }));
        setLocalCommands(reorderedCommands);
        onCommandsChange(reorderedCommands);
    };

    const handleEditCommand = (index: number, updatedCommand: Partial<SequenceCommand>) => {
        const newCommands = [...localCommands];
        newCommands[index] = {
            ...newCommands[index],
            ...updatedCommand,
        };
        setLocalCommands(newCommands);
        onCommandsChange(newCommands);
    };

    const handleModalAddCommand = (command: { command: string; params: Record<string, any> }) => {
        const newCommand: SequenceCommand = {
            command: command.command,
            params: command.params,
            order: insertIndex !== null ? insertIndex : localCommands.length,
        };

        const newCommands = [...localCommands];
        if (insertIndex !== null) {
            newCommands.splice(insertIndex, 0, newCommand);
            // Reorder all commands after insertion
            const reorderedCommands = newCommands.map((cmd, idx) => ({
                ...cmd,
                order: idx,
            }));
            setLocalCommands(reorderedCommands);
            onCommandsChange(reorderedCommands);
        } else {
            newCommands.push(newCommand);
            setLocalCommands(newCommands);
            onCommandsChange(newCommands);
        }

        setIsModalOpen(false);
        setInsertIndex(null);
    };

    const handleNameChange = (newName: string) => {
        setEditedSequenceName(newName);
        onSequenceNameChange?.(newName);
    };
    
    return (
        <Box
            border="1px"
            borderColor={borderColor}
            borderRadius="md"
            p={3}
            bg={bgColor}
            width="100%"
            height="100%"
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            <VStack spacing={2} height="100%" width="100%">
                <HStack width="100%" justify="space-between" align="start">
                    <Box flex={1}>
                        {isEditing ? (
                            <FormControl>
                                <FormLabel>Sequence Name</FormLabel>
                                <Input
                                    value={editedSequenceName}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    size="sm"
                                />
                            </FormControl>
                        ) : (
                            <Text fontWeight="bold">{sequenceName}</Text>
                        )}
                    </Box>
                    <HStack>
                        <Button
                            size="sm"
                            colorScheme={isEditing ? "blue" : "gray"}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? "Save" : "Edit"}
                        </Button>
                        {isEditing && (
                            <IconButton
                                aria-label="Delete sequence"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={onDelete}
                            />
                        )}
                    </HStack>
                </HStack>
                
                <Box width="100%" flex={1} overflowY="auto" px={2}>
                    <VStack spacing={0} width="100%" align="stretch">
                        {isEditing && (
                            <SlideFade in={isEditing} offsetY="-20px">
                                <IconButton
                                    aria-label="Add command at start"
                                    icon={<AddIcon />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAddCommand(0)}
                                    width="100%"
                                />
                            </SlideFade>
                        )}
                        
                        {localCommands.map((command, index) => (
                            <SlideFade key={index} in={true} offsetY="20px">
                                <VStack width="100%" spacing={0} align="stretch">
                                    <Box width="100%">
                                        <Box
                                            px={6}
                                            py={3}
                                            cursor="pointer"
                                            borderRadius="md"
                                            bg={index === selectedIndex ? selectedBg : "transparent"}
                                            onClick={() => setSelectedIndex(index)}
                                            width="100%"
                                            transition="all 0.2s"
                                            opacity={index === selectedIndex ? 1 : 0.6}
                                            _hover={{
                                                transform: "scale(1.01)",
                                                opacity: 0.9,
                                            }}
                                        >
                                            <HStack justify="space-between">
                                                <Text fontWeight={index === selectedIndex ? "bold" : "normal"}>
                                                    {command.command}
                                                </Text>
                                                {isEditing && (
                                                    <IconButton
                                                        aria-label="Delete command"
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCommand(index);
                                                        }}
                                                    />
                                                )}
                                            </HStack>
                                            {index === selectedIndex && (
                                                <Collapse in={true}>
                                                    <VStack align="start" mt={3} spacing={3}>
                                                        {Object.entries(command.params).map(([key, value]) => (
                                                            <HStack key={key} width="100%">
                                                                <Text fontSize="sm" color="gray.500" width="30%">
                                                                    {key}:
                                                                </Text>
                                                                {isEditing ? (
                                                                    <Input
                                                                        size="sm"
                                                                        value={value}
                                                                        onChange={(e) => {
                                                                            handleEditCommand(index, {
                                                                                params: {
                                                                                    ...command.params,
                                                                                    [key]: e.target.value,
                                                                                },
                                                                            });
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Text fontSize="sm">{value}</Text>
                                                                )}
                                                            </HStack>
                                                        ))}
                                                    </VStack>
                                                </Collapse>
                                            )}
                                        </Box>
                                    </Box>
                                    {!isEditing && index < localCommands.length - 1 && (
                                        <Center py={2}>
                                            <ChevronDownIcon 
                                                boxSize={6} 
                                                color={arrowColor}
                                                transition="transform 0.2s"
                                                _hover={{
                                                    transform: "scale(1.2)",
                                                }}
                                            />
                                        </Center>
                                    )}
                                    {isEditing && (
                                        <SlideFade in={isEditing} offsetY="-20px">
                                            <IconButton
                                                aria-label={`Add command after ${index}`}
                                                icon={<AddIcon />}
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleAddCommand(index + 1)}
                                                width="100%"
                                                my={2}
                                            />
                                        </SlideFade>
                                    )}
                                </VStack>
                            </SlideFade>
                        ))}
                    </VStack>
                </Box>
            </VStack>

            <CommandModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setInsertIndex(null);
                }}
                onAddCommand={handleModalAddCommand}
                teachPoints={teachPoints}
                motionProfiles={motionProfiles}
                gripParams={gripParams}
            />
        </Box>
    );
};