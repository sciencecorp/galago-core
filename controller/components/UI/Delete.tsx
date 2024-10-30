import { useDisclosure , IconButton} from "@chakra-ui/react";
import React from "react";
import { RiDeleteBinLine } from "react-icons/ri";

import { ConfirmationModal } from "./ConfirmationModal";

export interface DeleteButtonProps {
  label: string;
  onDelete: () => void;
  disabled?: boolean;
}

export const DeleteWithConfirmation = (props: DeleteButtonProps) => {
  const { disabled, label, onDelete } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();


  return (
    <>
      <IconButton
        aria-label={`Delete ${label}`}
        disabled={!!disabled}
        icon={<RiDeleteBinLine />}
        size="xs"
        onClick={onOpen}
      />

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
