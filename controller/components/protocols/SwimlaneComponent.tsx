import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  IconButton,
  Tooltip,
  Flex,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { useState } from "react";
import {
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";
import { CommandComponent } from "./CommandComponent";
import { Swimlane } from "@/types/api";
import { EditableText } from "../ui/Form";

const handleWheel = (e: WheelEvent) => {
  const container = e.currentTarget as HTMLElement;
  if (e.deltaY !== 0) {
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  }
};

export const SwimlaneComponent: React.FC<{
  swimlane: Swimlane;
  isEditing: boolean;
  onCommandClick: (command: any) => void;
  onRunCommand: (command: any) => void;
  onDeleteCommand: (swimlaneId: string, commandIndex: number) => void;
  onAddCommandAtPosition: (swimlaneId: string, position: number) => void;
  onRemoveSwimlane: (swimlaneId: string) => void;
  onEditSwimlane: (swimlaneId: string, newName: string, newDescription?: string) => void;
  isSelected?: boolean;
}> = ({
  swimlane,
  isEditing,
  onCommandClick,
  onRunCommand,
  onDeleteCommand,
  onAddCommandAtPosition,
  onRemoveSwimlane,
  onEditSwimlane,
  isSelected,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(swimlane.name);
  const [descriptionValue, setDescriptionValue] = useState(swimlane.description || "");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const highlightColor = useColorModeValue("blue.50", "blue.900");
  const arrowColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="md"
      mb={4}
      bg={isSelected ? highlightColor : bgColor}
      borderColor={borderColor}
      className="swimlane-container">
      <VStack align="stretch" spacing={0}>
        <HStack justifyContent="space-between" alignItems="center">
          <VStack spacing={0} align="flex-start">
            <EditableText
              defaultValue={swimlane.name}
              preview={<Text fontSize="md" fontWeight="bold">{swimlane.name}</Text>}
              onSubmit={(value)=>{
                if(value){
                  onEditSwimlane(swimlane.id, value, descriptionValue);
                }
              }}
            />
            <EditableText 
              defaultValue={swimlane.description}
              placeholder="Description"
              preview={<Text color="GrayText" fontSize="sm">{swimlane.description || "Enter Description"}</Text>}
              onSubmit={(value)=>{
                if(value){
                  onEditSwimlane(swimlane.id, nameValue, value);
                }
              }}
            />
          </VStack>
          <Tooltip label="Delete process">
            <IconButton
              aria-label="Delete process"
              icon={<DeleteIcon />}
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={() => onRemoveSwimlane(swimlane.id)}
            />
          </Tooltip>
        </HStack>
        <Box
          overflowX="auto"
          py={2}
          maxW="85vw"
          onWheel={(e: any) => handleWheel(e)}
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
            msOverflowStyle: "none" /* IE and Edge */,
          }}>
          <Droppable droppableId={swimlane.id} direction="horizontal">
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <Flex
                ref={provided.innerRef}
                {...provided.droppableProps}
                alignItems="center"
                flexWrap="nowrap">
                {swimlane.commands.length === 0 && isEditing ? (
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="gray"
                    variant="outline"
                    onClick={() => onAddCommandAtPosition(swimlane.id, 0)}>
                    Add Command
                  </Button>
                ) : (
                  swimlane.commands.map((command: any, index: number) => (
                    <Draggable

                      key={`${swimlane.id}-${command.queueId}`}
                      draggableId={`${swimlane.id}-${command.queueId}`}
                      index={index}
                      isDragDisabled={!isEditing}>
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <Flex
                          alignItems="center"
                          justifyContent="start"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                          }}>
                          {isEditing && index === 0 && (
                            <IconButton
                              aria-label="Add command before"
                              icon={<AddIcon />}
                              size="xs"
                              color="gray.500"
                              variant="ghost"
                              onClick={() => onAddCommandAtPosition(swimlane.id, index)}
                              _hover={{ bg: "blue.100" }}
                              mr={1}
                            />
                          )}
                          <CommandComponent
                            command={command}
                            onCommandClick={(cmd) => onCommandClick(cmd)}
                            onRunCommand={onRunCommand}
                            onDeleteCommand={() => onDeleteCommand(swimlane.id, index)}
                            isEditing={isEditing}
                          />
                          {isEditing ? (
                            <IconButton
                              aria-label="Add command after"
                              icon={<AddIcon />}
                              size="sm"
                              color="gray.500"
                              variant="ghost"
                              onClick={() => onAddCommandAtPosition(swimlane.id, index + 1)}
                              _hover={{ bg: "blue.100" }}
                              ml={-2}
                              mr={2}
                            />
                          ) : (
                            index < swimlane.commands.length - 1 && (
                              <Box 
                                ml={-2}
                                mr={2}
                                color={arrowColor} >
                                <ArrowForwardIcon />
                              </Box>
                            )
                          )}
                        </Flex>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </Flex>
            )}
          </Droppable>
        </Box>
      </VStack>
    </Box>
  );
};