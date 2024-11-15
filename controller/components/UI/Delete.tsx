import { useDisclosure, IconButton, Text, Button } from "@chakra-ui/react";
import React from "react";
import { RiDeleteBinLine } from "react-icons/ri";

import { ConfirmationModal } from "./ConfirmationModal";

export interface DeleteButtonProps {
  label: string;
  onDelete: () => void;
  customText?: string;
  variant?: "icon" | "button";
  disabled?: boolean;
  showText?: boolean;
}

export const DeleteWithConfirmation = (props: DeleteButtonProps) => {
  const { disabled, label, onDelete, showText, variant = "icon", customText } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {variant === "icon" && (
        <>
          <IconButton
            mr={2}
            aria-label={`Delete ${label}`}
            disabled={!!disabled}
            icon={<RiDeleteBinLine />}
            size="xs"
            onClick={onOpen}
          />
          {showText && (
            <Text fontSize="md" onClick={onOpen} width="100%">
              Delete
            </Text>
          )}
        </>
      )}
      {variant === "button" && (
        <Button onClick={onOpen} colorScheme="red" variant="solid">
          Delete
        </Button>
      )}
      <ConfirmationModal
        colorScheme="red"
        confirmText={"Delete"}
        header={`Delete ${label}?`}
        isOpen={isOpen}
        onClick={() => {
          onDelete();
          onClose();
        }}
        onClose={onClose}>
        {customText || `Are you sure you want to delete this ${label}?`}
      </ConfirmationModal>
    </>
  );
};
