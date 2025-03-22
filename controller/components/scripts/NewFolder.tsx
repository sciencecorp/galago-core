import React, { useState, useRef, useEffect } from "react";
import { HStack, Input, IconButton, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { validateFolderName, showErrorToast } from "./utils";
import { Icon, FolderIcon, FolderAddIcon } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

interface NewFolderProps {
  isDisabled?: boolean;
  parentId?: number;
  onFolderCreated?: () => void;
  isCreatingRoot?: boolean;
  onCancel?: () => void;
}

interface InlineFolderCreationProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export const InlineFolderCreation: React.FC<InlineFolderCreationProps> = ({
  onSubmit,
  onCancel,
}): JSX.Element => {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hoverBg = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const validationError = validateFolderName(name);
    if (validationError) {
      showErrorToast("Invalid folder name", validationError);
      return;
    }
    if (name.trim()) {
      onSubmit(name.trim());
      setName("");
    } else {
      onCancel();
    }
  };

  return (
    <HStack
      spacing={tokens.spacing.xs}
      px={tokens.spacing.sm}
      py={tokens.spacing.xs}
      borderRadius={tokens.borders.radii.md}
      bg={hoverBg}>
      <Icon as={FolderIcon} color={semantic.text.accent.light} />
      <Input
        ref={inputRef}
        size="sm"
        value={name}
        placeholder="New folder name"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={handleSubmit}
      />
    </HStack>
  );
};

export const NewFolder: React.FC<NewFolderProps> = ({
  isDisabled,
  parentId,
  onFolderCreated,
  isCreatingRoot,
  onCancel,
}) => {
  const addFolder = trpc.script.addFolder.useMutation();
  const { refetch: refetchFolders } = trpc.script.getAllFolders.useQuery();

  const handleCreate = async () => {
    try {
      await addFolder.mutateAsync({
        name: "new_folder",
        parent_id: parentId,
      });
      await refetchFolders();
      onFolderCreated?.();
    } catch (error) {
      showErrorToast("Error creating folder", String(error));
    }
  };

  return (
    <Tooltip label="Create new folder" placement="top">
      <IconButton
        aria-label="New folder"
        icon={<Icon as={FolderAddIcon} />}
        colorScheme="teal"
        variant="ghost"
        size="md"
        isDisabled={isDisabled}
        onClick={handleCreate}
      />
    </Tooltip>
  );
};
