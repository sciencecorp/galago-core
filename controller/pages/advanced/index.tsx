import React, { useEffect, useState } from "react";
import DataSideBar from "@/components/data/DataSideBar";
import {
  VStack,
  Box,
  Button,
  Flex,
  Heading,
  Select,
  Image,
  Text,
  border,
  HStack,
  ChakraProvider,
  MenuList,
  MenuGroup,
  MenuItem,
  MenuDivider,
  Menu,
  MenuButton,
  IconButton,
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
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { string } from "zod";
import axios, { AxiosInstance } from "axios";
import DatePicker from "react-datepicker";
import styled from "styled-components";
import "react-datepicker/dist/react-datepicker.css";
import { HamburgerIcon } from "@chakra-ui/icons";

import { InventoryApiClient } from "@/server/utils/InventoryClient";
import { useRouter } from "next/router";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function formatDatetime(datetime: any) {
  const date = new Date(datetime);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

let data2 = [
  { Time: "2024-02-14 14:14:56.503255", Value: 0.509 },
  { Time: "2024-02-14 14:15:06.547182", Value: 0.508 },
  { Time: "2024-02-14 14:15:16.579773", Value: 0.508 },
  { Time: "2024-02-14 14:15:26.626236", Value: 0.508 },
  { Time: "2024-02-14 14:15:36.662208", Value: 0.508 },
  { Time: "2024-02-14 14:15:46.706414", Value: 0.508 },
  { Time: "2024-02-14 14:15:56.740608", Value: 0.508 },
  { Time: "2024-02-14 14:16:06.775756", Value: 0.508 },
  { Time: "2024-02-14 14:16:16.808348", Value: 0.508 },
  { Time: "2024-02-14 14:16:26.854263", Value: 0.508 },
  { Time: "2024-02-14 14:16:36.889612", Value: 0.508 },
  { Time: "2024-02-14 14:16:46.933393", Value: 0.507 },
  { Time: "2024-02-14 14:16:56.980647", Value: 0.507 },
  { Time: "2024-02-14 14:17:07.015975", Value: 0.507 },
  { Time: "2024-02-14 14:17:17.046775", Value: 0.507 },
  { Time: "2024-02-14 14:17:27.081753", Value: 0.506 },
  { Time: "2024-02-14 14:17:37.129129", Value: 0.506 },
];
let data_labels = [];
for (var i = 0; i < data2.length; i++) {
  let time = data2[i]["Time"];
  let timeParsed = formatDatetime(time);
  data_labels.push(timeParsed);
}

let data_values = [];
for (var i = 0; i < data2.length; i++) {
  let value = data2[i]["Value"];
  data_values.push(value);
}

const data = {
  labels: data_labels,
  datasets: [
    {
      label: "CO2",
      data: data_values,
      fill: true,
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
    },
  ],
};
const options = {
  scales: {
    y: {
      min: 0,
      max: 1,
    },
  },
};

const StyledDatePicker = styled(DatePicker)`
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: none; /* Optional: to remove the default border */
  padding: 10px; /* Optional: to add some padding */
  outline: none; /* Optional: to remove the default focus outline */
`;

const styles = {
  section: {
    fontSize: "18px",
    border: "1px solid gray",
  },
  wrapper: {
    textAlign: "center",
    margin: "0 auto",
    marginTop: "50px",
  },
};

export default function Page() {
  return (
    <Box height="500px">
      <DataSideBar />
      <VStack>
        <Box flex="1" padding={4}></Box>
      </VStack>
    </Box>
  );
}
