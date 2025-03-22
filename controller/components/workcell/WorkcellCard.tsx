import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  Button,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Avatar,
  Editable,
  EditableInput,
  EditablePreview,
  EditableTextarea,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Workcell, Tool } from "@/types/api";
import { Icon, FormIcons } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

interface WorkcellCardProps {
  workcell: Workcell;
  selectedWorkcellId: number | null;
  setSelectedWorkcellId: (id: number | null) => void;
  setSelectedWorkcellData: (data: Workcell | null) => void;
}

export const WorkcellCard: React.FC<WorkcellCardProps> = ({
  workcell,
  selectedWorkcellId,
  setSelectedWorkcellId,
  setSelectedWorkcellData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workcell.name);
  const [description, setDescription] = useState(workcell.description || "");
  const [location, setLocation] = useState(workcell.location || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const editWorkcell = trpc.workcell.edit.useMutation();
  const deleteWorkcell = trpc.workcell.delete.useMutation();
  const { data: tools } = trpc.tool.getAll.useQuery();
  const { refetch } = trpc.workcell.getAll.useQuery();

  const bgColor = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.primary.dark,
  );
  const selectedBgColor = useColorModeValue(
    `${semantic.text.accent.light}20`,
    `${semantic.text.accent.dark}20`,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const selectedBorderColor = useColorModeValue(
    semantic.text.accent.light,
    semantic.text.accent.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const secondaryTextColor = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const buttonHoverBg = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );
  const dividerColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );

  const isSelected = selectedWorkcellId === workcell.id;

  useEffect(() => {
    setName(workcell.name);
    setDescription(workcell.description || "");
    setLocation(workcell.location || "");
  }, [workcell]);

  const handleSelect = () => {
    if (isSelected) {
      setSelectedWorkcellId(null);
      setSelectedWorkcellData(null);
    } else {
      setSelectedWorkcellId(workcell.id);
      setSelectedWorkcellData(workcell);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkcell.mutateAsync(workcell.id);
      toast({
        title: "Workcell deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (isSelected) {
        setSelectedWorkcellId(null);
        setSelectedWorkcellData(null);
      }
      await refetch();
    } catch (error) {
      toast({
        title: "Error deleting workcell",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsDeleting(false);
    onClose();
  };

  const handleSave = async () => {
    try {
      await editWorkcell.mutateAsync({
        ...workcell,
        name,
        description,
        location,
      });
      toast({
        title: "Workcell updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
      await refetch();
    } catch (error) {
      toast({
        title: "Error updating workcell",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setName(workcell.name);
    setDescription(workcell.description || "");
    setLocation(workcell.location || "");
    setIsEditing(false);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "red.500",
      "orange.500",
      "yellow.500",
      "green.500",
      "teal.500",
      "blue.500",
      "cyan.500",
      "purple.500",
      "pink.500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const associatedTools = tools?.filter((tool) => tool.workcell_id === workcell.id);

  return (
    <>
      <Card
        onClick={handleSelect}
        cursor="pointer"
        bg={isSelected ? selectedBgColor : bgColor}
        borderWidth={tokens.borders.widths.thin}
        borderColor={isSelected ? selectedBorderColor : borderColor}
        borderRadius={tokens.borders.radii.md}
        boxShadow={tokens.shadows.sm}
        mb={tokens.spacing.md}
        transition="all 0.2s"
        _hover={{
          boxShadow: tokens.shadows.md,
          borderColor: isSelected ? selectedBorderColor : accentColor,
        }}>
        <CardHeader pb={tokens.spacing.xs}>
          <Flex justify="space-between" align="center">
            <Flex align="center">
              <Avatar
                size="sm"
                name={workcell.name}
                bg={getAvatarColor(workcell.name)}
                color="white"
                mr={tokens.spacing.sm}
              />
              {isEditing ? (
                <Editable
                  defaultValue={name}
                  isPreviewFocusable={false}
                  onSubmit={(nextValue) => setName(nextValue)}>
                  <EditablePreview
                    fontWeight="bold"
                    color={textColor}
                    px={tokens.spacing.xs}
                    _hover={{
                      bg: buttonHoverBg,
                      borderRadius: tokens.borders.radii.sm,
                    }}
                  />
                  <EditableInput
                    color={textColor}
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </Editable>
              ) : (
                <Heading size="md" color={textColor}>
                  {name}
                </Heading>
              )}
            </Flex>
            <Flex>
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel();
                    }}
                    color={textColor}
                    _hover={{ bg: buttonHoverBg }}
                    mr={tokens.spacing.xs}>
                    <Icon as={FormIcons.Close} mr={tokens.spacing.xs} />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave();
                    }}
                    bg={accentColor}
                    color="white"
                    _hover={{ bg: `${accentColor}90` }}>
                    <Icon as={FormIcons.Check} mr={tokens.spacing.xs} />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    color={textColor}
                    _hover={{ bg: buttonHoverBg }}
                    mr={tokens.spacing.xs}>
                    <Icon as={FormIcons.Edit} mr={tokens.spacing.xs} />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen();
                    }}
                    color="red.500"
                    _hover={{ bg: "red.50" }}>
                    <Icon as={FormIcons.Delete} mr={tokens.spacing.xs} />
                    Delete
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
        </CardHeader>
        <Divider borderColor={dividerColor} />
        <CardBody pt={tokens.spacing.sm}>
          <Box mb={tokens.spacing.sm}>
            <Text fontWeight="bold" fontSize="sm" color={secondaryTextColor}>
              Description
            </Text>
            {isEditing ? (
              <Editable
                defaultValue={description || "No description"}
                isPreviewFocusable={false}
                onSubmit={(nextValue) => setDescription(nextValue)}>
                <EditablePreview
                  color={textColor}
                  px={tokens.spacing.xs}
                  _hover={{
                    bg: buttonHoverBg,
                    borderRadius: tokens.borders.radii.sm,
                  }}
                />
                <EditableTextarea
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                />
              </Editable>
            ) : (
              <Text color={textColor}>{description || "No description"}</Text>
            )}
          </Box>
          <Box mb={tokens.spacing.sm}>
            <Text fontWeight="bold" fontSize="sm" color={secondaryTextColor}>
              Location
            </Text>
            {isEditing ? (
              <Editable
                defaultValue={location || "No location"}
                isPreviewFocusable={false}
                onSubmit={(nextValue) => setLocation(nextValue)}>
                <EditablePreview
                  color={textColor}
                  px={tokens.spacing.xs}
                  _hover={{
                    bg: buttonHoverBg,
                    borderRadius: tokens.borders.radii.sm,
                  }}
                />
                <EditableInput
                  color={textColor}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                />
              </Editable>
            ) : (
              <Text color={textColor}>{location || "No location"}</Text>
            )}
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="sm" color={secondaryTextColor}>
              Tools
            </Text>
            <Flex wrap="wrap" gap={tokens.spacing.xs}>
              {associatedTools && associatedTools.length > 0 ? (
                associatedTools.map((tool) => (
                  <Box
                    key={tool.id}
                    bg={buttonHoverBg}
                    color={textColor}
                    px={tokens.spacing.sm}
                    py={tokens.spacing.xs}
                    borderRadius={tokens.borders.radii.md}
                    fontSize="sm"
                    display="flex"
                    alignItems="center">
                    <Icon as={FormIcons.Edit} mr={tokens.spacing.xs} />
                    {tool.name}
                  </Box>
                ))
              ) : (
                <Text color={textColor}>No tools associated</Text>
              )}
            </Flex>
          </Box>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg={bgColor}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}
          boxShadow={tokens.shadows.md}>
          <ModalHeader color={textColor}>Delete Workcell</ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <Text color={textColor}>
              Are you sure you want to delete the workcell "{workcell.name}"? This action cannot be
              undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={onClose}
              color={textColor}
              _hover={{ bg: buttonHoverBg }}
              mr={tokens.spacing.sm}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
