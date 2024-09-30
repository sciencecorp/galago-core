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

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import DatePicker from "react-datepicker";
import styled from 'styled-components';
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Liconic CO2 Levels Over Time',
      },
    },
    scales: {
      y: {
        min: 1,
        max: 8,
        title: {
          display: true,
          text: 'CO2 Level',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };



export default function liconic() {
    const commandMutation = trpc.tool.runCommand.useMutation({
        onError: (error) => {
            toast({
              title: "Failed to fetch data",
              description: error.message,
              status: "error",
              duration: 2000,
              isClosable: true,
              position: "top"
            });
        },
    });
    const [imageEncoded, SetImageEnconded] = useState("");
    const [selectedDate, setStartDate] = useState<Date|null>(new Date());
    const [sensorData, setSensorData] = useState<any>();
    const toast = useToast();


    const GetLiconicData = async () : Promise<ExecuteCommandReply|undefined>  => {
        
      const toolCommand: ToolCommandInfo = {
            toolId: "toolbox",
            toolType: "toolbox" as ToolType,
            command: "get_liconic_sensor_data",
            params: {
                instrument_id:"liconic",
                date: formatDatetime(selectedDate,'YYYY-MM-DD')
            },
        };

        const response: ExecuteCommandReply | undefined = await commandMutation.mutateAsync(
            toolCommand
        );
        return response;
    }

    useEffect(() => {
        const fetchLiconicData = async () => {
            const response = await GetLiconicData();
            if(response?.meta_data && response.meta_data["times"].length == 0){
                toast.closeAll()
                toast({
                    title: "Data Not Found",
                    description: "No Data Available for this date.",
                    status: "warning",
                    duration: 2000,
                    isClosable: true,
                    position: "top"
                  });
            }
            if(response){
                setSensorData(response);
            }
        };
        if(selectedDate){
            fetchLiconicData();
        }
    },[selectedDate]);
    
  const plotOptions = (sensorData:any) =>{
    const data = {
        labels: sensorData.meta_data["times"],
        datasets: [
        {
            label: "CO2",
            data: sensorData.meta_data["co2_values"],
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)"
        },
        ]
    };
    return data;
  }
  return (
    <ChakraProvider>
      <Flex left={0} top={0}>
        <DataSideBar/>
        <Box flex="1" p={4}>
        </Box>
      </Flex>
      <VStack>
        <Box flex="1" padding={4}>
          <VStack spacing={4}>
            <Box >
              <Text as='b'>Date: </Text>
              <DatePicker className="date-picker-custom" selected={selectedDate} onChange={(date) => setStartDate(date)} />
            </Box>
            <Box width='50em'>
                {sensorData?.meta_data && (
                    <Line data={plotOptions(sensorData)} options={options} />
                )}
              </Box>
          </VStack>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}
