import {
  Box,
  Button,
  HStack,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  IconButton,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, EditIcon, ArrowForwardIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useState, useEffect, useCallback, useRef } from "react";
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


// Swimlane Component for multiple processes
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

  const handleNameChange = () => {
    onEditSwimlane(swimlane.id, nameValue, descriptionValue);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameChange();
    }
  };

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      mb={4}
      bg={isSelected ? highlightColor : bgColor}
      borderColor={borderColor}
      className="swimlane-container">
      <VStack align="stretch" spacing={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <HStack spacing={2}>
            <EditableText
              defaultValue={nameValue}
              onSubmit={(value)=>{
                if(value){
                  setNameValue(value);
                  handleNameChange();
                }
              }}
            />
          </HStack>
          {isEditingName ? (
            <VStack align="start" w="100%">
              <Input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameChange}
                onKeyDown={handleKeyDown}
                placeholder="Process name"
                autoFocus
              />
              <Input
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                onBlur={handleNameChange}
                onKeyDown={handleKeyDown}
                placeholder="Process description (optional)"
              />
            </VStack>
          ) : (
            <VStack align="start" spacing={1}>
              <Heading size="md">{swimlane.name}</Heading>
              {swimlane.description && (
                <Text fontSize="sm" color="gray.500">
                  {swimlane.description}
                </Text>
              )}
            </VStack>
          )}
          <HStack>
            {isEditing && (
              <>
                <Tooltip label="Edit process">
                  <IconButton
                    aria-label="Edit process"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                  />
                </Tooltip>
                <Tooltip label="Delete process">
                  <IconButton
                    aria-label="Delete process"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => onRemoveSwimlane(swimlane.id)}
                  />
                </Tooltip>
              </>
            )}
          </HStack>
        </HStack>
        <Box
          overflowX="auto"
          py={2}
          maxW="90vw"
          onWheel={(e: any) => handleWheel(e)}
          css={{
            "&::-webkit-scrollbar": {
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "4px",
              "&:hover": {},
            },
          }}>
          <Droppable droppableId={swimlane.id} direction="horizontal">
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <HStack
                ref={provided.innerRef}
                {...provided.droppableProps}>
                {swimlane.commands.length === 0 && isEditing ? (
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => onAddCommandAtPosition(swimlane.id, 0)}>
                    Add First Command
                  </Button>
                ) : (
                  swimlane.commands.map((command: any, index: number) => (
                    <Draggable
                      key={`${swimlane.id}-${command.queueId}`}
                      draggableId={`${swimlane.id}-${command.queueId}`}
                      index={index}
                      isDragDisabled={!isEditing}>
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <HStack
                          spacing={0}
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
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => onAddCommandAtPosition(swimlane.id, index)}
                              _hover={{ bg: "blue.100" }}
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
                            <Box
                              position="relative"
                              right={2}
                            >
                            <IconButton
                              aria-label="Add command after"
                              icon={<AddIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => onAddCommandAtPosition(swimlane.id, index + 1)}
                              _hover={{ bg: "blue.100" }}
                            />
                            </Box>

                          ) : (
                            index < swimlane.commands.length - 1 && (
                              <Box color={arrowColor}>
                                <ArrowForwardIcon />
                              </Box>
                            )
                          )}
                        </HStack>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </HStack>
            )}
          </Droppable>
        </Box>
      </VStack>
    </Box>
  );
};
