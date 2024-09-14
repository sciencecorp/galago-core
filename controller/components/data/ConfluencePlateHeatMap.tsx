import React, { useState, useEffect } from "react";
import { Toast, useToast, Select } from "@chakra-ui/react";
import HelixClient, { helixClient , WellPlateResponse,Well, DataObject} from '@/server/utils/HelixClient';
import axios from "axios";
import {
  Box,
  Text,
  SimpleGrid,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import Barcode from "../../components/barcode";



type PlateProps = {
  plate: WellPlateResponse;
}

interface WellGridParams  {
  shape:string,
  size:number,
  spacing:number,
}

interface ConfluenceStat {
  sumArea:number,
  imageArea:number,
  percentConfluence:number,
}

interface WellData {
  "Object Sum Area": string;
  "Image_Area: Mean [Tsf[Phase Contrast]]": string;
  "%Confluence from Cellular Analysis": string;
}

interface Data {
  [key: string]: WellData;
}

const ConfluencePlateHeatMap: React.FC<PlateProps> = ({
  plate
}) => {
  
  const [confluenceDataObjects,setConfluenceDataObjects] = useState<DataObject[]|null>(null);
  const [confluenceDataObjectsIds, setConfluenceDataObjectsIds] = useState<number[]|null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<number|null>(null);
  const [currentConfluenceValues, setCurrentConfluenceValues] = useState<Record<string,ConfluenceStat>|null>(null);
  const [currentPlate, setCurrentPlate] = useState<WellPlateResponse|null>(plate);

  const wellGridParamsMap :Record<number,WellGridParams> = {
    6:{shape:"circle",size:120,spacing:1} as WellGridParams,
    12:{shape:"circle",size:100,spacing:1} as WellGridParams,
    24:{shape:"circle",size:100,spacing:0} as WellGridParams,
    96:{shape:"circle",size:50,spacing:0} as WellGridParams,
    384:{shape:"square",size:35,spacing:0} as WellGridParams,
  }

  useEffect(()=>{
    console.log("Current Confluence Values",currentConfluenceValues);
    setConfluenceDataObjects(null);
    setConfluenceDataObjectsIds(null);
    setSelectedObjectId(null);
    setCurrentConfluenceValues(null);
    setCurrentPlate(plate);
  },[plate])

  useEffect(()=>{
    if(!selectedObjectId){return;}
    console.log("Selected Object Id: "+selectedObjectId);
    setCurrentConfluenceValues(null);
    console.log("Data Objects",confluenceDataObjects);
    let filteredData = confluenceDataObjects?.filter(obj => obj.id === selectedObjectId);
    if(filteredData){
      let confluenceMap : Record<string,ConfluenceStat> = {};
      let isValid =  filteredData[0].object_data["stats"];
      if(!isValid){
        return;
      }
      let stats = filteredData[0].object_data["stats"] as Data;
      const entries = Object.entries(stats);
      entries.forEach(([key, value]) => {
        const confluenceStat = {
          sumArea : parseFloat(value['Object Sum Area']),
          imageArea: parseFloat(value['Image_Area: Mean [Tsf[Phase Contrast]]']),
          percentConfluence: parseFloat(value['%Confluence from Cellular Analysis']),
        } as ConfluenceStat;
        confluenceMap[key] = confluenceStat;
    });
    if(Object.keys(confluenceMap).length>0){
      setCurrentConfluenceValues(confluenceMap)

    }
  };
    
  },[selectedObjectId])

  useEffect(()=>{
    setCurrentConfluenceValues(null);
    setSelectedObjectId(null);
    setConfluenceDataObjects(null);
    let dataObjects: DataObject[] = []
    let dataIds:number[] = []
    if(currentPlate){
      if(plate.data_objects && plate.data_objects.length>0){
        plate.data_objects.forEach((obj)=>{
          if(obj.data_type == "Cytation" && obj.object_data["cytation_protocol"].includes("_confluence") && obj.object_data["stats"]){
            dataObjects.push(obj)
            dataIds.push(obj.id);
          }
          setConfluenceDataObjectsIds(dataIds);
          setConfluenceDataObjects(dataObjects);
        })
      }
    }
  },[currentPlate])

  const createConfluenceIdFilters = () => {
    if(confluenceDataObjectsIds && confluenceDataObjectsIds?.length>0){
      return(confluenceDataObjectsIds.map((id, index) => {
        return (
          <Button key={index} margin={1} fontSize='sm' height='30px' colorScheme={selectedObjectId==id ? "blue":"gray"} onClick={()=>{setSelectedObjectId(id)}}>{id}</Button>
        )
      }
    ))
  }
  }

  const createRunMetadateBox = () =>{
    let filteredData = confluenceDataObjects?.filter(obj => obj.id === selectedObjectId);
    if(currentPlate){
      if(filteredData && filteredData?.length >0){
        return(
          <Box >
          <VStack>
            <Text as ='u'>Run Data:</Text>
            <Text>Data Type: {filteredData[0].data_type}</Text>
            <Text>Time: {filteredData[0].object_data["Date"] + " " + filteredData[0].object_data["Time"] }</Text>
            <Text>Liconic Location: {"Stack:"+filteredData[0].object_data["liconic_cassette"] + ", Level:"+ filteredData[0].object_data["liconic_level"] }</Text>
            <Text>Cytation Protocol: {filteredData[0].object_data["cytation_protocol"]}</Text>
            <Text>Objective: {filteredData[0].object_data["Objective"]}</Text>
          </VStack>
          </Box>
        )
      }
    }
  }

  const getHeatmapColor = (value: number): string => {
    // Ensure the value is within the range of 1 to 100
    const clampedValue = Math.min(100, Math.max(1, value));
    
    // Calculate the intensity based on the value, normalized to the range 0 to 1
    const intensity = (clampedValue - 1) / 99;
    const baseColor = { r: 170, g: 200, b: 210 };
    const endColor = { r: 50, g: 100, b: 255 };
    
    const r = Math.round(baseColor.r + (endColor.r - baseColor.r) * intensity);
    const g = Math.round(baseColor.g + (endColor.g - baseColor.g) * intensity);
    const b = Math.round(baseColor.b + (endColor.b - baseColor.b) * intensity);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const createPlateGrid = (plate:WellPlateResponse) =>{
    if(!plate.wells || plate.wells.length === 0){
      return(<Box></Box>)
    }
    else{
      const columns : number = plate.well_plate_type.columns;
      const rows : number = plate.well_plate_type.rows;
      const wells_number = columns*rows;
      let shape = "circle";
      let size = 100;
      if(wellGridParamsMap[wells_number].shape){
        shape  = wellGridParamsMap[wells_number].shape;
      }
      if(wellGridParamsMap[wells_number].size){
        size  = wellGridParamsMap[wells_number].size;
      }
      let borderRadius = 1;

      return (
        <Box>
          <SimpleGrid
            columns={columns}
            spacing={0.5}
            border="1px solid #ccc" 
            padding={3}
            borderRadius={12}
            shadow="xl"
          >
            {plate.wells.map((well,index)=>{
             const wellName = `${String.fromCharCode(65+well.row_index)+(well.column_index+1)}`
              return <Button 
                      key={index}
                      colorScheme="gray"
                      variant="outline"
                      padding={0}
                      bg = {  currentConfluenceValues && currentConfluenceValues[wellName]
                        ? getHeatmapColor(currentConfluenceValues[wellName].percentConfluence)
                        : "transparent"}
                      borderRadius={ shape == "circle"? "50%" : 2}
                      width={`${size}px !important`}
                      height={`${size}px`}
                      fontSize={size >= 100 ?'md':'x-small'}
                    >
                      <VStack>
                      <Box>
                        {wellName}
                      </Box>
                      {currentConfluenceValues && currentConfluenceValues[wellName] && (
                      <Box color='white'>
                        {currentConfluenceValues[wellName].percentConfluence}
                      </Box>
                      )}
                      </VStack>
                    </Button>
            })
            }
          </SimpleGrid>
        </Box>
      )
    }
  }

  return (
    <HStack>
      <VStack>
        <HStack>
          </HStack>
          <Box>
            {confluenceDataObjectsIds && confluenceDataObjectsIds?.length>0 && (
              <Box>
                <Text as='b'>Data Objects:</Text>{createConfluenceIdFilters()}
              </Box>
            )}
          </Box>
          {createPlateGrid(plate)}
          <Box paddingTop={10}>
          {plate.barcode && (
            <Barcode value={plate.barcode.code} /> 
          )
          }
          </Box>
          {createRunMetadateBox()}

      </VStack>
    </HStack>
  );
};

export default ConfluencePlateHeatMap;