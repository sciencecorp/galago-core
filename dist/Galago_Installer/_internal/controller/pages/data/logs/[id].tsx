import React, { useEffect, useState } from "react";
import DataSideBar from "@/components/data/DataSideBar";
import { ToolType } from "gen-interfaces/controller";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";

import {
    VStack,
    Box,
    Flex,
    Text,
    ChakraProvider,
    useToast
  } from "@chakra-ui/react";


import { string } from "zod";
import axios, { AxiosInstance } from "axios";
import DatePicker from "react-datepicker";
import styled from 'styled-components';
import "react-datepicker/dist/react-datepicker.css";
import { HamburgerIcon } from "@chakra-ui/icons";


function formatDatetime(datetime:any, return_type:string) {
  const date = new Date(datetime);
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  if(return_type === 'HH:MM:SS'){
    return `${hours}:${minutes}:${seconds}`;
  }
  else if(return_type === "YYYY-MM-DD"){
    return `${year}-${month}-${day}`;
  }
  else if(return_type === "YYYY:MM:DD"){
    return `${year}:${month}:${day}`;
  }
}


export default function opentrons() {

    const commandMutation = trpc.tool.runCommand.useMutation();
    const [imageEncoded, SetImageEnconded] = useState("");
    const [selectedDate, setStartDate] = useState<Date|null>(new Date());
    const [availableImages, setAvailableImages] = useState<string[]>();
    const toast = useToast();

  const GetOT2Images = async () : Promise<ExecuteCommandReply | undefined>  => {
    const toolCommand: ToolCommandInfo = {
        toolId: "toolbox",
        toolType: "toolbox" as ToolType,
        command: "get_ot2_images_by_date",
        params: {
          date:"2024-07-21"
        },
      };

      const response: ExecuteCommandReply | undefined = await commandMutation.mutateAsync(
        toolCommand
      );
      return response;
}


useEffect(()=>{
  const fetchOT2ImageNames = async () =>{
    const response = await GetOT2Images();
    if(response?.meta_data){
      setAvailableImages(response.meta_data['images'])
    }
    console.log("Response data is "+ JSON.stringify(response?.meta_data));
  }
  if(selectedDate){
    fetchOT2ImageNames();
  }
},[selectedDate]);

  return (
    <Box>
      <DataSideBar/>
      <VStack>
        <Box flex="1" padding={4}>
          <VStack spacing={4}>
            <Box >
              <Text as='b'>Date: </Text>
              <DatePicker className="date-picker-custom" selected={selectedDate} onChange={(date) => setStartDate(date)} />
            </Box>
            <Box height='80vw'>
              coming soon ...
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
