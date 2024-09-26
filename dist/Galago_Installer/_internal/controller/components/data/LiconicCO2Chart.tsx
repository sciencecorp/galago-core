import React,{useState} from 'react';
// @ts-ignore
import CanvasJSReact from '@canvasjs/react-charts';
import {Box, VStack} from '@chakra-ui/react';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

interface TimeSeriesData {
  Time: string;
  Value: number;
}
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

interface TimeSeriesChartProps {}

export const LiconicCO2Chart: React.FC<TimeSeriesChartProps> = () => {
  const limit = 50000;
  let y = 100;
  const data: { type: string; dataPoints: { x: number; y: number }[] }[] = [];
  const dataSeries = { type: "line", dataPoints: [] as { x: number; y: number }[] };
  const [startDate, setStartDate] = useState<Date|null>(new Date());

  for (let i = 0; i < limit; i += 1) {
    y += Math.round(Math.random() * 10 - 5);
    dataSeries.dataPoints.push({
      x: i,
      y: y
    });
  }
  data.push(dataSeries);

  const spanStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    fontSize: '20px',
    fontWeight: 'bold',
    backgroundColor: '#d85757',
    padding: '0px 4px',
    color: '#ffffff'
  };

  const options = {
    zoomEnabled: true,
    animationEnabled: true,
    title: {
      text: "Try Zooming - Panning"
    },
    data: data  // random data
  };

  const styles = {
    section: {
      fontSize: "18px",
      color: "#292b2c",
      backgroundColor: "#fff",
      padding: "0 20px"
    },
    wrapper: {
      textAlign: "center",
      margin: "0 auto",
      marginTop: "50px"
    }
  }
  
  return (
    <Box>
      <VStack>
        <Box className='date-picker'>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        </Box>
        <Box>
          Hello World
        </Box>
      <CanvasJSReact options={options}/>
      </VStack>

    </Box>
  );
};
