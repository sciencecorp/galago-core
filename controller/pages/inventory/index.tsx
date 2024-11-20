import React, { useEffect, useState } from "react";
import axios from "axios";
import { Progress, Spinner } from "@chakra-ui/react";
import {
  inventoryApiClient,
  Inventory,
  Plate,
  Nest,
  PlateUpdate,
  Well,
  Reagent,
} from "@/server/utils/InventoryClient";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  InputRightElement,
  List,
  ListItem,
  Select,
  Switch,
  Text,
  Tooltip,
  useColorMode,
  VStack,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import InventoryVisualizer from "@/components/inventory/InventoryVisualizer";
import { ToolType } from "gen-interfaces/controller";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import Fuse from "fuse.js";
import { CloseIcon, SearchIcon } from "@chakra-ui/icons";

export default function Page() {
  return <Box></Box>;
}
