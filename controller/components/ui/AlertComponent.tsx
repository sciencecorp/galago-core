import React from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";

type AlertComponentProps = {
  showAlert: boolean;
  status: "error" | "info" | "warning" | "success" | "loading";
  title: string;
  description: string;
  onClose: () => void;
};

const AlertComponent: React.FC<AlertComponentProps> = ({
  showAlert,
  status,
  title,
  description,
  onClose,
}) => {
  if (!showAlert) return null;

  return (
    <Alert status={status}>
      <AlertIcon />
      <AlertTitle mr={2}>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <CloseButton
        position="absolute"
        right="8px"
        top="8px"
        onClick={onClose}
      />
    </Alert>
  );
};

export default AlertComponent;
