import React, { useEffect, useState, useCallback } from "react";
import {
    VStack,
    Box,
    Flex,
    Text,
    useToast,
} from "@chakra-ui/react";
import DataSideBar from "@/components/data/DataSideBar";
import ImageSlider from "@/components/data/ImageSlider";
import { ToolType } from "gen-interfaces/controller";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import axios, { AxiosInstance } from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HamburgerIcon } from "@chakra-ui/icons";

function formatDatetime(datetime:any, return_type:string) : string {
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
    else {
        return "";
    }
}
// Define the delay function
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export default function Opentrons() {
    const commandMutation = trpc.tool.runCommand.useMutation({});
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedDate, setStartDate] = useState<Date|null>(new Date());
    const [availableImages, setAvailableImages] = useState<any>({});
    const toast = useToast();

    const GetImageNames = async () : Promise<ExecuteCommandReply|undefined>  => {
        if(!selectedDate){
            return;
        }
        const toolCommand: ToolCommandInfo = {
            toolId: "toolbox",
            toolType: "toolbox" as ToolType,
            command: "get_ot2_images_by_date",
            params: {
                date: formatDatetime(selectedDate,'YYYY-MM-DD')
            },
        };

        const response: ExecuteCommandReply | undefined = await commandMutation.mutateAsync(
            toolCommand
        );

        return response;
    }

    const fetchOT2ImageNames = async () => {
          const response = await GetImageNames();
          if(response?.meta_data){
              setAvailableImages(response.meta_data["images"]);
          }
    }

    useEffect(() => {
        if (selectedDate) {
            fetchOT2ImageNames();
        }
    }, [selectedDate]);

    return (
        <Box>
            <Flex left={0} top={0}>
                <DataSideBar/>
                <Box flex="1" p={4}>
                </Box>
            </Flex>
            <VStack>
                <Box flex="1" padding={4}>
                    <VStack spacing={4}>
                        <Box>
                            <Text as='b'>Date: </Text>
                            <DatePicker className="date-picker-custom" selected={selectedDate} onChange={(date:any) => setStartDate(date)} />
                        </Box>
                        <Box height='80vw'>
                            <Box width="100%">
                                <Box>
                                    {availableImages.length == 0 && (
                                        <Box bg='orange' padding={2} borderRadius={4}>{'No images available for selected date'}</Box>
                                    )}
                                </Box>
                                {selectedDate && availableImages.length > 0 && (
                                    <ImageSlider date={formatDatetime(selectedDate,'YYYY-MM-DD')} images={availableImages}></ImageSlider>
                                )}
                            </Box>
                        </Box>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
}
