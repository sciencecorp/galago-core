import { createStandaloneToast } from "@chakra-ui/react";
import React from "react";

const { ToastContainer, toast } = createStandaloneToast({});

export const CustomToaster = () => <ToastContainer />;

export const toastIsActive = (id: string) => toast.isActive(id);

export const successToast = (title: string, description: string) => {
  toast({
    title,
    description,
    status: "success",
    duration: 3000,
    variant: "left-accent",
    position: "bottom-left",
    isClosable: true,
  });
};

export const warningToast = (title: string, description: string) => {
  toast({
    title,
    description,
    status: "warning",
    duration: 3000,
    variant: "left-accent",
    position: "bottom-left",
    isClosable: true,
  });
};

export const errorToast = (title: string, description: string) => {
  toast({
    title,
    description,
    status: "error",
    duration: 10000,
    variant: "left-accent",
    position: "bottom-left",
    isClosable: true,
  });
};
