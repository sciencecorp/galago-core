import React, { useState, useRef, useEffect } from "react";
import { HStack, Input, Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { validateFolderName, showErrorToast } from "./utils";
import { useScriptColors } from "../ui/Theme";
import { FolderIcon, FolderAddIcon } from "../ui/Icons";

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
  const { hoverBg } = useScriptColors();

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
    <HStack spacing={1} px={2} py={1} borderRadius="md" bg={hoverBg}>
      <Icon as={FolderIcon} color="teal.500" />
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
  const { data: selectedWorkcellName } =
    trpc.workcell.getSelectedWorkcell.useQuery();
  const { data: workcells } = trpc.workcell.getAll.useQuery();

  const handleCreate = async () => {
    try {
      // Get the workcell ID from the selected workcell name
      const selectedWorkcell = workcells?.find(
        (wc) => wc.name === selectedWorkcellName,
      );
      if (!selectedWorkcell) {
        showErrorToast("Error creating folder", "No workcell selected");
        return;
      }

      await addFolder.mutateAsync({
        name: "new_folder",
        parent_id: parentId,
        workcell_id: selectedWorkcell.id,
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
        isDisabled={isDisabled}
        onClick={handleCreate}
      />
    </Tooltip>
  );
};
