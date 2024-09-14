import React,{useEffect, useState} from 'react';
import {Box, VStack, useToast, FormControl,Input, InputGroup, InputLeftElement,InputRightElement,Text, Button, HStack, useSafeLayoutEffect} from '@chakra-ui/react';
import { CloseIcon, SearchIcon } from '@chakra-ui/icons';
import HelixClient, { helixClient , WellPlateResponse} from '@/server/utils/HelixClient';
import ConfluencePlateHeatMap from '@/components/data/ConfluencePlateHeatMap';
import ConfluenceTimeSeries from '@/components/data/ConfluenceTimeSeries';
import { Plate} from "@/server/utils/InventoryClient";
import Fuse from 'fuse.js';

interface ConfluenceDataProps {

}

const ConfluenceData: React.FC<ConfluenceDataProps> = ({}) => {
  const [searchPlateQuery, setSearchPlateQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<WellPlateResponse|null>(null);
  const [search, setSearch] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cachedWellPlates, setCachedWellPlates] = useState<string[]>([]);
  const [selectedPlotType, setSelectedPlotType] = useState<string>("heatmap");

  const toast = useToast();

  const getLastHelixWellPlates = async () => {
    const wellPlates =  await helixClient.getPaginatedWellPlates(40);
    if(wellPlates.length > 0 ){
      const wellPlatesIdArray = wellPlates.map(plate => String(plate.id));
      setCachedWellPlates(wellPlatesIdArray);
    }
  }

  useEffect(()=>{
    getLastHelixWellPlates();
  },[])
  
  const searchWellPlate = async (wellPlate:string) => {
    if(!wellPlate){
      toast({
        title: "Empty Search Value",
        description: "Input is invalid!",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top"
      });      
      return;
    }
    setErrorMessage(null);
    try{
      const response = await helixClient.getWellPlate(parseInt(wellPlate));
      setQueryResult(response);
      if(Object.keys(response).length === 0){
        setErrorMessage(`Failed to fetch well plate data for plate for WP-${wellPlate}`);
      }
    }
    catch(e){
      setErrorMessage(`Failed to fetch well plate data for plate for WP-${wellPlate}`);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        setErrorMessage(null);
        searchWellPlate(searchPlateQuery);
    }
  };

  return (
    <Box>
      <VStack>
      <Box>
        <HStack>
          <Button 
            colorScheme={selectedPlotType=="heatmap" ? "blue":"gray"} 
            onClick={()=>setSelectedPlotType("heatmap")}>Heat Map</Button>
          <Button 
            colorScheme={selectedPlotType=="time_series" ? "blue":"gray"} 
            onClick={()=>setSelectedPlotType("time_series")}>Time Series</Button>
        </HStack>
        </Box>
        <HStack>
          <InputGroup>
              <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
              <Input
                  type="text"
                  placeholder="Search Well Plate ID"
                  value={searchPlateQuery}
                  onChange={(e)=>setSearchPlateQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
              />
              <InputRightElement>
                  <CloseIcon
                      cursor="pointer"
                      color="gray.300"
                      onClick={()=>{setSearchPlateQuery("")}}
                  />
              </InputRightElement>
          </InputGroup>
          <Button onClick={()=>{
              setErrorMessage(null);
              searchWellPlate(searchPlateQuery);}
            }>Search</Button>
        </HStack>
        {errorMessage && 
        <Box>
          <Text color="red.500" mt={2}>{errorMessage}</Text>
        </Box>
        }
        {queryResult && (
          <Box>
            {selectedPlotType === "heatmap" && (<ConfluencePlateHeatMap plate={queryResult}/>)}
            {selectedPlotType === "time_series" && (<ConfluenceTimeSeries plate={queryResult}/>)}
          </Box>
        )}
      </VStack>
    </Box>
  );
};


export default ConfluenceData;