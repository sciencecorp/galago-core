
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
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from "@chakra-ui/react";

import DatePicker from "react-datepicker";
import styled from 'styled-components';
import "react-datepicker/dist/react-datepicker.css";


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

export default function MediaExchangeLogs() {
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
    const [selectedDate, setStartDate] = useState<Date|null>(new Date());
    const [mediaExchangeLogs, setMediaExchangeLogs] = useState<any>();
    const toast = useToast();
    const rowsPerPage = 50;
    const [currentPage, setCurrentPage] = useState(0);

    const GetMediaExchangeLogs = async () : Promise<ExecuteCommandReply|undefined>  => {
        
      const toolCommand: ToolCommandInfo = {
            toolId: "toolbox",
            toolType: "toolbox" as ToolType,
            command: "get_log_media_exchange_by_date",
            params: {
                date: formatDatetime(selectedDate,'YYYY-MM-DD')
            },
        };

        const response: ExecuteCommandReply | undefined = await commandMutation.mutateAsync(
            toolCommand
        );
        return response;
    }


  const renderTable = (data: any) => {
    const start = currentPage * rowsPerPage;
    const end = start + rowsPerPage;
    const currentData = data.slice(start, end);
    return (
      <>
      <Box maxHeight="auto" width="1000px" overflowY="auto" marginLeft='-65px'>
      <TableContainer>
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>Time</Th>
            <Th>Source Barcode</Th>
            <Th>Destination Name</Th>
            <Th>Destination Barcode</Th>
            <Th>Source Wells</Th>
            <Th>Percent Exhange</Th>
            <Th>New Tips</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row: any, index: number) => (
            <Tr key={index}>
              <Td>{row.created_on}</Td>
              <Td>{row.source_barcode}</Td>
              <Td>{row.destination_name}</Td>
              <Td>{row.destination_barcode}</Td>
              <Td>{row.source_wells}</Td>
              <Td>{row.percent_exchange}</Td>
              <Td>{row.new_tips}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      </TableContainer>
    </Box>
    {/* <Flex justify="space-between" mt={2}>
          <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
            Previous
          </Button>
          <Button onClick={() => setCurrentPage((prev) => (prev + 1) * rowsPerPage < data.length ? prev + 1 : prev)} disabled={(currentPage + 1) * rowsPerPage >= data.length}>
            Next
          </Button>
    </Flex> */}
    </>
    );
  };

    useEffect(() => {
        const fetchMediaExchangeData= async () => {
            const response = await GetMediaExchangeLogs();
            console.log("Response metadata is "+ JSON.stringify(response?.meta_data));
            if(JSON.stringify(response?.meta_data) === "{}"){
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
                setMediaExchangeLogs(response);
            }
        };
        if(selectedDate){
          fetchMediaExchangeData();
        }
    },[selectedDate]);
    

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
              {mediaExchangeLogs?.meta_data?.data && renderTable(mediaExchangeLogs.meta_data.data)}
            </Box>
          </VStack>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}
