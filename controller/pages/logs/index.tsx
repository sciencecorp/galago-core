import { VStack, Box, Button, HStack, Heading, Select } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import React from "react";
import { inventoryApiClient, Log, LogType, LogTypesEnum } from "@/server/utils/InventoryClient";
import { LogView } from "@/components/logs/LogView";
import { useRouter } from "next/router";
import { off } from "process";

export default function Page() {
  return (
    <Box>
      <LogView />
    </Box>
  );
}
