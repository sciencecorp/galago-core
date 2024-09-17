import { ToolStatusCardsComponent } from "@/components/tools/ToolStatusCardsComponent";
import HomeNavCard from "@/components/HomeNavCard"

import {Card, Grid, Icon, Box,GridItem, Heading,Flex}  from "@chakra-ui/react"
import { PageProps } from "@/types";
import { FaTools } from "react-icons/fa";
import { LuCalendarRange } from "react-icons/lu";
import { PiGridNineDuotone } from "react-icons/pi";
import { SiGithubactions } from "react-icons/si";
import { MdOutlineIntegrationInstructions } from "react-icons/md";
import { AiFillDatabase } from "react-icons/ai";
import { TbLogs } from "react-icons/tb";
import { MdBiotech } from "react-icons/md";

export default function Page() {

  const pages : PageProps[] = [
    {title:"Tools",
     subtitle:"tools",
     link:"/tools",
     icon: <Icon as ={FaTools} boxSize={12}/>,
     color:"blue",
     description:"All Instruments available on this workcell. Select an instrument to execute commands. Some instruments have an advanced page. For example the PF400 arm has an advanced teaching GUI."
    },
    {title:"Inventory",
    subtitle:"tools",
    link:"/inventory",
    icon: <Icon as ={PiGridNineDuotone} boxSize={12}/>,
    color:"blue",
    description:"Manages the state of plates, reagents, tips and other consumables within the workcell. Requirements to use the Queueing feature in the Daily Actions tab."
   },
    {title:"Runs",
    subtitle:"tools",
    link:"/runs",
    icon: <Icon as ={SiGithubactions} boxSize={12}/>,
    color:"blue",
    description:"Shows all runs in the queue. Runs execute in order from top to bottom, left to right. Each run component displays the run type and culture well plate id associated with the run."
   },
   {title:"Protocols",
   subtitle:"tools",
   link:"/protocols",
   icon: <Icon as ={MdOutlineIntegrationInstructions} boxSize={12}/>,
   color:"blue",
   description:"All protocols for this workcell. A protocol can be executed manually by entering inputs your self."
  },
  {
    title: "Images",
    subtitle: "tools",
    link: "/data/images/cell_imaging",
    icon: <Icon as={MdBiotech} boxSize={12} />,
    color: "blue",
    description:
      "Image Data Visualizer. Shows images of the culture plate and the well locations of the culture plate."
  },
  {title:"Daily Actions",
  subtitle:"tools",
  link:"/daily_actions",
  icon: <Icon as ={LuCalendarRange} boxSize={12}/>,
  color:"blue",
  description:"Page that allows users to easily queue workflows to be execute by the workcell. Users can filter by run type and bulk queue workflows."
 },    
 {title:"Data",
  subtitle:"data",
  link:"/data",
  icon: <Icon as ={AiFillDatabase} boxSize={12}/>,
  color:"blue",
  description:"Data management and visualization tools. Includes cell images, camera images, logs, sensor data, etc."
 }
  ]

  return (
    <Box paddingTop="2%">
      <Heading
        as="h1"
        fontSize="6xl"
        mb={6}
        sx={{
          fontFamily: `'Bungee Shade', cursive`,
        }}
        textAlign={"center"}
      >
        Galago
      </Heading>
      <Flex>
      <Grid 
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          }}
        gap={2}>
        {pages.map((page, index) => (
            <HomeNavCard
              key={index}
              pageProps={page}
              titleSx={page.title === "Tools" ? { fontFamily: `'system-ui', sans-serif` } : {}}
            />
        ))}
      </Grid>
      </Flex>

    </Box>
  );
}