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
  size?: "sm" | "md" | "lg";
}

export const DeleteWithConfirmation = (props: DeleteButtonProps) => {
  const { disabled, label, onDelete, showText, variant = "icon", customText, size = "md" } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {variant === "icon" && (
        <>
          <IconButton
            padding="2"
            margin="0"
            minWidth="0"
            borderRadius="0"
            aria-label={`Delete ${label}`}
            disabled={!!disabled}
            icon={<RiDeleteBin5Line />}
            size={size}
            bg="transparent"
            onClick={onOpen}
            _hover={{ bg: "transparent" }}
            _focus={{ boxShadow: "none" }}
            _active={{ bg: "transparent" }}
          />
          {showText && (
            <Text px={2} fontSize="md" onClick={onOpen} width="100%">
              Delete
            </Text>
          )}
        </>
      )}
      {variant === "button" && (
        <Button isDisabled={disabled} onClick={onOpen} colorScheme="red" variant="solid">
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
