import { useDisclosure, IconButton, Text, Button } from "@chakra-ui/react";
import React from "react";
import { RiDeleteBin5Line } from "react-icons/ri";

import { ConfirmationModal } from "./ConfirmationModal";

export interface DeleteButtonProps {
  label: string;
  onDelete: () => void;
  customText?: string;
  variant?: "icon" | "button";
  disabled?: boolean;
  showText?: boolean;
  size? : "sm" | "md" | "lg";
}

export const DeleteWithConfirmation = (props: DeleteButtonProps) => {
  const { disabled, label, onDelete, showText, variant="icon",customText,size="sm"} = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {variant === "icon" && (
        <>
          <IconButton
            aria-label={`Delete ${label}`}
            disabled={!!disabled}
            icon={<RiDeleteBin5Line />}
            size="xs"
            onClick={onOpen}
            variant="ghost"
            marginLeft={2}
          />
          {showText && (
            <Text marginLeft={1} fontSize="md" onClick={onOpen} width="100%">
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
