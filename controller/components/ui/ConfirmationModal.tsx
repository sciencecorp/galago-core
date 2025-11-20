import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import React from "react";

export interface ConfirmationModalProps {
  colorScheme: string;
  children: string | JSX.Element | JSX.Element[];
  header: string | JSX.Element | JSX.Element[];
  confirmText?: string;
  isOpen: boolean;
  onClick(): void;
  onClose(): void;
}

export const ConfirmationModal = (props: ConfirmationModalProps) => {
  const {
    children,
    confirmText = "Ok",
    colorScheme,
    header,
    isOpen,
    onClose,
    onClick,
  } = props;

  const cancelRef = React.useRef(null);

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>{header}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>{children}</AlertDialogBody>
        <AlertDialogFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            colorScheme={colorScheme}
            ml={3}
            onClick={() => {
              onClick();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
