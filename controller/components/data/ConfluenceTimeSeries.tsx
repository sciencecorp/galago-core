import React, { useState, useEffect } from "react";
import { Toast, useToast, Select } from "@chakra-ui/react";
import HelixClient, { helixClient , WellPlateResponse,Well, DataObject} from '@/server/utils/HelixClient';
import axios from "axios";
import {
  Box,
  VStack,
  HStack,
} from "@chakra-ui/react";
import Barcode from "../../components/barcode";
import { Line } from "react-chartjs-2";
import { Group } from "@slack/web-api/dist/response/GroupsCreateResponse";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Legend,
    Tooltip
  } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Legend,
    Tooltip
  );

type PlateProps = {
  plate: WellPlateResponse;
}

interface WellGridParams  {
  shape:string,
  size:number,
  spacing:number,
}

interface GroupedWellData {
    label:string|undefined,
    data: number[],
    fill:boolean,
    backgroundColor:string,
    borderColor:string,
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

const ConfluenceTimeSeries: React.FC<PlateProps> = ({
  plate
}) => {
  
  const [confluenceDataObjects,setConfluenceDataObjects] = useState<DataObject[]|null>(null);
  const [dataSets, setDataSets] = useState<GroupedWellData[]>();
  const [currentPlate, setCurrentPlate] = useState<WellPlateResponse|null>(plate);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);

  useEffect(()=>{
    setConfluenceDataObjects(null);
    setCurrentPlate(plate);
  },[plate])

  useEffect(()=>{
    setConfluenceDataObjects(null);
    let dataObjects: DataObject[] = []
    if(currentPlate){
      if(plate.data_objects && plate.data_objects.length>0){
        plate.data_objects.forEach((obj)=>{
          if(obj.data_type == "Cytation" && obj.object_data["cytation_protocol"].includes("_confluence") && obj.object_data["stats"]){
            dataObjects.push(obj)
          }
        })
        setConfluenceDataObjects(dataObjects);
      }
    }
  },[currentPlate])

  function generateColor(index: number, total: number) {
    const hue = Math.floor((360 / total) * index); // Distribute hues evenly
    const saturation = 70; 
    const lightness = 50;  
    return {
        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        borderColor: `hsl(${hue}, ${saturation}%, ${lightness + 20}%)`,
    };
  }

  useEffect(()=>{
    if(!confluenceDataObjects){return;}
    const dataSets : GroupedWellData[]= [];
    let timeLabels: string[] = [];
    let dataPerWell : Record<string,number[]> = {};
    confluenceDataObjects.forEach((obj)=>{
        let timeStamp = obj.created_at
        timeLabels.push(timeStamp);
        let stats = obj.object_data["stats"] as Data; 
        const entries = Object.entries(stats);
        //Build array of confluence values per well
        entries.forEach(([key, value]) => {
            let percentConfluence = parseFloat(value['%Confluence from Cellular Analysis']);
            if(!dataPerWell[key]){
                dataPerWell[key] = [];
            }
            dataPerWell[key].push(percentConfluence);
        });
    });
    let index = 0;
    //Build data sets for each well
    for(const [key, value] of Object.entries(dataPerWell)){
        const color = generateColor(index, Object.keys(dataPerWell).length);
        dataSets.push({
            label: key,
            data: value,
            fill: false,
            backgroundColor: color.backgroundColor,
            borderColor: color.borderColor,
        });
        index++;
    }
    setDataSets(dataSets);
    setTimeLabels(timeLabels);
  },[confluenceDataObjects])

  const plotOptions = () => {
    const data = {
      labels: timeLabels,
      datasets: dataSets || [] 
    };
    return data;
  };
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Confluence % Over Time',
      },
      legend: {
        display: dataSets && dataSets.length <= 12, // Hide legend if more than 12 datasets
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Confluence %',
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

  return (
    <HStack>
      <VStack>
        <HStack>
        </HStack>
        {timeLabels && dataSets && (
            <Box width='80em'>
                <Line data={plotOptions()} options={options} />
            </Box>
        )
        }
            <Box paddingTop={10}>
            {plate.barcode && (
                <Barcode value={plate.barcode.code} /> 
            )
            }
          </Box>
      </VStack>
    </HStack>
  );
};

export default ConfluenceTimeSeries;