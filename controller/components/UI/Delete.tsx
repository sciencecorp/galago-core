import { useDisclosure, IconButton,Text } from "@chakra-ui/react";
import React from "react";
import { RiDeleteBinLine } from "react-icons/ri";

import { ConfirmationModal } from "./ConfirmationModal";

export interface DeleteButtonProps {
  label: string;
  onDelete: () => void;
  disabled?: boolean;
  showText?: boolean;
}

export const DeleteWithConfirmation = (props: DeleteButtonProps) => {
  const { disabled, label, onDelete, showText} = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
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
        {`Are you sure you want to delete this ${label}?`}
      </ConfirmationModal>
    </>
  );
};
