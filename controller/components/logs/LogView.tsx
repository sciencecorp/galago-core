import { trpc } from "@/utils/trpc";
import {
  Heading,
  HStack,
  Spinner,
  Switch,
  Table,
  Tag,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
  VStack,
  Box,
  Button,
  Select
} from "@chakra-ui/react";
import { Log, inventoryApiClient} from "@/server/utils/InventoryClient";
import { InfoOutlineIcon, CloseIcon, WarningIcon, QuestionOutlineIcon} from "@chakra-ui/icons";
import { useEffect, useState } from "react";

interface LogViewProps {
  }

function getIconFromLogType(logType:string){
  switch(logType){
    case "ERROR":
      return <CloseIcon color="red"/>
    case "WARNING":
      return <WarningIcon color="red"/>
    case "DEBUG":
      return <QuestionOutlineIcon color="red"/>
    case "INFO":
      return <InfoOutlineIcon color="blue"/>
  }
}

export const LogView: React.FC<LogViewProps> = ({}) => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [limit, setLimit] = useState<number>(25);
    const [offset, setOffset] = useState<number>(0);
    const [selectedFilter, setSelectedFilter] = useState<string|null>(null);
    const hasPrevious = offset > 0;
    const hasNext = (logs.length === limit) || false;

    const handleNext = () => {
      if (hasNext) {
        setOffset(offset + limit); 
      }
    };

    const handlePrevious = () => {
      if (hasPrevious) {
        setOffset(Math.max(offset - limit, 0));
      }
    };

    const handleLimitChange = (e:number) => {
      setLimit(e)
    }

    useEffect(() => {
      let filter = "ALL";
      const fetchData = async (filter:string) => {
        const logs = await inventoryApiClient.getLogsPaginated(filter, offset, limit);
        setLogs(logs);
      }
      if(selectedFilter){
        filter = selectedFilter.toUpperCase();
      }

      fetchData(filter)

    },[offset,limit,selectedFilter]);

  return (
    <VStack align="center" spacing={5} width="80%">
      <VStack width="100%">
        <Box>
          <Heading>Logs</Heading>
        </Box>
        <HStack margin='10px'>
          <Box>
            Per Page:
          </Box>
          <Select value={limit} width='75px' onChange={ (e)=> handleLimitChange(Number(e.target.value))}>
            <option value='25'>25</option>
            <option value='50'>50</option>
            <option value='100'>100</option>
          </Select>
          <Button disabled={!hasPrevious} onClick={handlePrevious}>
            Previous
          </Button>
          <Button disabled={!hasNext} onClick={handleNext}>
            Next
          </Button>
      </HStack>
      <HStack>
        <Button 
          onClick={() => {
            selectedFilter === "info" ? setSelectedFilter(null) : setSelectedFilter("info");
          }}
          colorScheme={selectedFilter=="info" ? "blue":"gray"}>INFO</Button>
        <Button 
          onClick={() => {
            selectedFilter === "debug" ? setSelectedFilter(null) : setSelectedFilter("debug");
          }}
          colorScheme={selectedFilter=="debug" ? "orange":"gray"}>DEBUG</Button>
        <Button   
          onClick={() => {
                selectedFilter === "error" ? setSelectedFilter(null) : setSelectedFilter("error");
          }}
          colorScheme={selectedFilter === "error" ? "red" : "gray"}>ERROR</Button>
      </HStack>
      
      <Table mt={8} fontSize='small'>
        <Thead>
          <Tr>
              <Th p={1}></Th>
              <Th p={1}>Log Type</Th>
              <Th p={1}>Tool</Th>
              <Th p={1}>Value</Th>
              <Th p={1}>Created On</Th>
          </Tr>
        </Thead>
        <Tbody>
          {logs.map((log,index)=>{
              return<Tr key={index} h="50px">
                <Td p={1}>{getIconFromLogType(log.log_type)}</Td>
                <Td p={1}>{log.log_type}</Td>
                <Td p={1}>{log.tool}</Td>
                <Td p={1}>{log.value}</Td>
                <Td p={1}>{log.created_at.toString().replace("T", " ").replace(/\.\d{6}$/, "")}

              </Td>
            </Tr>
              })
          }
        </Tbody>
      </Table>
      <HStack>
        <Box>
          Per Page:
        </Box>
        <Select value={limit} width='75px'>
          <option value='25'>25</option>
          <option value='50'>50</option>
          <option value='100'>100</option>
        </Select>
        <Button disabled={!hasPrevious} onClick={handlePrevious}>
          Previous
        </Button>
        <Button disabled={!hasNext} onClick={handleNext}>
          Next
        </Button>
      </HStack>
    </VStack>
    </VStack>
  );
}
