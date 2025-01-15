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
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    NumberInput,
    NumberInputField,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, ChevronDownIcon, ChevronUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
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
    expandedCommandIndex?: number | null;
    onCommandClick?: (index: number) => void;
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
    expandedCommandIndex,
    onCommandClick,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [insertIndex, setInsertIndex] = useState<number | null>(null);
    const [editedSequenceName, setEditedSequenceName] = useState(sequenceName);
    const [localCommands, setLocalCommands] = useState(commands);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    const bgColor = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const selectedBg = useColorModeValue("blue.50", "blue.900");
    const arrowColor = useColorModeValue("gray.400", "gray.600");

    // Update local state when props change
    useEffect(() => {
        if (JSON.stringify(commands) !== JSON.stringify(localCommands)) {
            setLocalCommands(commands);
        }
        setEditedSequenceName(sequenceName);
        setHasUnsavedChanges(false);
    }, [commands, sequenceName]);

    const handleAddCommand = (index: number) => {
        setInsertIndex(index);
        setIsModalOpen(true);
    };

    const handleDeleteCommand = (index: number) => {
        const newCommands = localCommands.filter((_, i) => i !== index).map((cmd, idx) => ({
            ...cmd,
            order: idx,
        }));
        setLocalCommands(newCommands);
        setHasUnsavedChanges(true);
    };

    const handleEditCommand = (index: number, updatedCommand: Partial<SequenceCommand>) => {
        const newCommands = [...localCommands];
        newCommands[index] = {
            ...newCommands[index],
            ...updatedCommand,
        };
        setLocalCommands(newCommands);
        setHasUnsavedChanges(true);
    };

    const handleModalAddCommand = (command: { command: string; params: Record<string, any> }) => {
        const newCommand: SequenceCommand = {
            command: command.command,
            params: command.params,
            order: insertIndex !== null ? insertIndex : localCommands.length,
        };

        let newCommands: SequenceCommand[];
        if (insertIndex !== null) {
            newCommands = [...localCommands];
            newCommands.splice(insertIndex, 0, newCommand);
            newCommands = newCommands.map((cmd, idx) => ({
                ...cmd,
                order: idx,
            }));
        } else {
            newCommands = [...localCommands, { ...newCommand, order: localCommands.length }];
        }

        setLocalCommands(newCommands);
        setHasUnsavedChanges(true);
        setIsModalOpen(false);
        setInsertIndex(null);
    };

    const handleNameChange = (newName: string) => {
        setEditedSequenceName(newName);
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        if (hasUnsavedChanges) {
            onCommandsChange(localCommands);
            if (editedSequenceName !== sequenceName) {
                onSequenceNameChange?.(editedSequenceName);
            }
            setHasUnsavedChanges(false);
        }
        setIsEditing(false);
    };

    const getDisplayValue = (key: string, value: any): string => {
        // Handle waypoint coordinates
        if (key === 'waypoint') {
            const matchingPoint = teachPoints.find(p => p.coordinate === value);
            if (matchingPoint) {
                return matchingPoint.name;
            }
            // If no exact match found, try to find a point with similar coordinates
            // This helps with floating point precision differences
            const coordinates = value.split(" ").map(Number);
            const similarPoint = teachPoints.find(p => {
                const pointCoords = p.coordinate.split(" ").map(Number);
                return coordinates.length === pointCoords.length &&
                    coordinates.every((coord: number, i: number) => Math.abs(coord - pointCoords[i]) < 0.001);
            });
            return similarPoint ? similarPoint.name : value;
        }

        switch (key) {
            case 'nest_id':
                const nest = teachPoints.find(p => p.type === 'nest' && p.id === Number(value));
                return nest ? nest.name : value;
            case 'waypoint_id':
            case 'location_id':
                const point = teachPoints.find(p => p.id === Number(value));
                return point ? point.name : value;
            case 'motion_profile_id':
            case 'profile_id':
                const profile = motionProfiles.find(p => p.id === Number(value));
                return profile ? profile.name : value;
            case 'grip_params_id':
                const params = gripParams.find(p => p.id === Number(value));
                return params ? params.name : value;
            default:
                return String(value);
        }
    };

    const formatParamKey = (key: string): string => {
        return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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
                            colorScheme={isEditing ? (hasUnsavedChanges ? "blue" : "gray") : "gray"}
                            onClick={() => {
                                if (isEditing) {
                                    handleSave();
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                        >
                            {isEditing ? (hasUnsavedChanges ? "Save" : "Done") : "Edit"}
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
                                <VStack width="100%" spacing={0} align="stretch" mb={3}>
                                    <Box width="100%">
                                        <Box
                                            px={6}
                                            py={3}
                                            cursor="pointer"
                                            borderRadius="md"
                                            borderWidth="1px"
                                            borderColor={borderColor}
                                            bg={expandedCommandIndex === index ? selectedBg : "transparent"}
                                            onClick={() => onCommandClick?.(index)}
                                            width="100%"
                                            transition="all 0.2s"
                                            opacity={expandedCommandIndex === index ? 1 : 0.8}
                                            _hover={{
                                                transform: "scale(1.01)",
                                                opacity: 1,
                                                shadow: "sm",
                                            }}
                                        >
                                            <HStack justify="space-between">
                                                <HStack>
                                                    <Text fontWeight={expandedCommandIndex === index ? "bold" : "normal"}>
                                                        {command.command}
                                                    </Text>
                                                    <Text color="gray.500" fontSize="sm">
                                                        {(() => {
                                                            console.log('Command:', command.command);
                                                            console.log('Command params:', command.params);
                                                            console.log('TeachPoints:', teachPoints);
                                                            
                                                            if (command.command === "move") {
                                                                if (command.params.waypoint_id) {
                                                                    const displayValue = getDisplayValue('waypoint_id', command.params.waypoint_id);
                                                                    console.log('Move command waypoint_id:', command.params.waypoint_id);
                                                                    console.log('Display value:', displayValue);
                                                                    return `: ${displayValue}`;
                                                                }
                                                                if (command.params.waypoint) {
                                                                    const displayValue = getDisplayValue('waypoint', command.params.waypoint);
                                                                    console.log('Move command waypoint:', command.params.waypoint);
                                                                    console.log('Display value:', displayValue);
                                                                    return `: ${displayValue}`;
                                                                }
                                                                return '';
                                                            }
                                                            if (command.command === "approach" && command.params.nest_id) {
                                                                const displayValue = getDisplayValue('nest_id', command.params.nest_id);
                                                                console.log('Approach command nest_id:', command.params.nest_id);
                                                                console.log('Display value:', displayValue);
                                                                return `: ${displayValue}`;
                                                            }
                                                            if (command.command === "leave" && command.params.nest_id) {
                                                                const displayValue = getDisplayValue('nest_id', command.params.nest_id);
                                                                console.log('Leave command nest_id:', command.params.nest_id);
                                                                console.log('Display value:', displayValue);
                                                                return `: ${displayValue}`;
                                                            }
                                                            return '';
                                                        })()}
                                                    </Text>
                                                </HStack>
                                                <HStack spacing={1}>
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
                                                    <IconButton
                                                        aria-label={expandedCommandIndex === index ? "Collapse" : "Expand"}
                                                        icon={expandedCommandIndex === index ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onCommandClick?.(index);
                                                        }}
                                                    />
                                                </HStack>
                                            </HStack>
                                            <Collapse in={isEditing || expandedCommandIndex === index}>
                                                <VStack align="start" mt={3} spacing={3} pl={2}>
                                                    {Object.entries(command.params)
                                                        .filter(([key]) => key !== 'waypoint_id')
                                                        .map(([key, value]) => (
                                                        <HStack key={key} width="100%">
                                                            <Text fontSize="sm" color="gray.500" width="30%">
                                                                {formatParamKey(key)}:
                                                            </Text>
                                                            {isEditing && (key === 'waypoint' || key === 'coordinate') ? (
                                                                <Box width="100%" overflowX="auto">
                                                                    <Table size="sm" variant="simple" width="auto">
                                                                        <Thead>
                                                                            <Tr>
                                                                                <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J1</Th>
                                                                                <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J2</Th>
                                                                                <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J3</Th>
                                                                                <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J4</Th>
                                                                                <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J5</Th>
                                                                                <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J6</Th>
                                                                            </Tr>
                                                                        </Thead>
                                                                        <Tbody>
                                                                            <Tr>
                                                                                {(value || "0 0 0 0 0 0").split(" ").map((coord: string, i: number) => (
                                                                                    <Td key={i} padding={0.5} width="auto">
                                                                                        <NumberInput
                                                                                            size="xs"
                                                                                            value={parseFloat(coord) || 0}
                                                                                            onChange={(valueString) => {
                                                                                                const coords = (value || "0 0 0 0 0 0").split(" ").map(Number);
                                                                                                coords[i] = parseFloat(valueString) || 0;
                                                                                                handleEditCommand(index, {
                                                                                                    params: {
                                                                                                        ...command.params,
                                                                                                        [key]: coords.join(" "),
                                                                                                    },
                                                                                                });
                                                                                            }}
                                                                                            step={0.001}
                                                                                            precision={3}
                                                                                            width="35px"
                                                                                        >
                                                                                            <NumberInputField 
                                                                                                textAlign="right" 
                                                                                                paddingInline={0}
                                                                                                fontSize="xs"
                                                                                                px={0.5}
                                                                                            />
                                                                                        </NumberInput>
                                                                                    </Td>
                                                                                ))}
                                                                            </Tr>
                                                                        </Tbody>
                                                                    </Table>
                                                                </Box>
                                                            ) : isEditing ? (
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
                                                                key === 'waypoint' || key === 'coordinate' ? (
                                                                    <Box width="100%" overflowX="auto">
                                                                        <Table size="sm" variant="simple" width="auto">
                                                                            <Thead>
                                                                                <Tr>
                                                                                    <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J1</Th>
                                                                                    <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J2</Th>
                                                                                    <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J3</Th>
                                                                                    <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J4</Th>
                                                                                    <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J5</Th>
                                                                                    <Th padding={0.5} width="auto" fontSize="xs" textAlign="center" px={1}>J6</Th>
                                                                                </Tr>
                                                                            </Thead>
                                                                            <Tbody>
                                                                                <Tr>
                                                                                    {(value || "0 0 0 0 0 0").split(" ").map((coord: string, i: number) => (
                                                                                        <Td key={i} padding={0.5} width="auto">
                                                                                            <Text fontSize="xs" textAlign="center" width="35px">
                                                                                                {coord}
                                                                                            </Text>
                                                                                        </Td>
                                                                                    ))}
                                                                                </Tr>
                                                                            </Tbody>
                                                                        </Table>
                                                                    </Box>
                                                                ) : (
                                                                    <Text fontSize="sm" fontWeight="medium">
                                                                        {getDisplayValue(key, value)}
                                                                    </Text>
                                                                )
                                                            )}
                                                        </HStack>
                                                    ))}
                                                </VStack>
                                            </Collapse>
                                        </Box>
                                    </Box>
                                    {!isEditing && index < localCommands.length - 1 && (
                                        <Center>
                                            <Box color="gray.500" my={2}>
                                                <ArrowDownIcon />
                                            </Box>
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