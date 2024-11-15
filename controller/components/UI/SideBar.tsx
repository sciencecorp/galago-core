// src/components/Sidebar/Sidebar.tsx

import React, { useState, ReactNode } from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Link,
  VStack,
  Drawer,
  DrawerContent,
  Spacer,
  useDisclosure,
  useBreakpointValue,
  Image,
  Icon,
  HStack,
  useColorMode,
  DrawerOverlay,
} from "@chakra-ui/react";
import { FiMenu, FiHome, FiCompass, FiSettings, FiLogOut } from "react-icons/fi";
import { IconType } from "react-icons";
import { useRouter } from "next/router"; // Use Next.js router
import { GiHamburgerMenu } from "react-icons/gi";
import { MdOutlineTransitEnterexit } from "react-icons/md";
import { FaTools } from "react-icons/fa";
import { RiRobot2Line } from "react-icons/ri";
import { BsFillGrid3X2GapFill } from "react-icons/bs";
import { TbVariable } from "react-icons/tb";
import { RiInformationLine } from "react-icons/ri";
import { MdOutlineIntegrationInstructions } from "react-icons/md";
import { RiCalendarCheckLine } from "react-icons/ri";
import { PiPathBold } from "react-icons/pi";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FiBook } from "react-icons/fi";
import { FaChartGantt } from "react-icons/fa6";
import { capitalizeFirst } from "@/utils/parser";
import { PiCodeSimpleBold } from "react-icons/pi";
import { LuTableProperties } from "react-icons/lu";
import { GoContainer } from "react-icons/go";
import { CgMenuGridR } from "react-icons/cg";
import { GiChaingun } from "react-icons/gi";

// Define the structure for sidebar items
interface SidebarItem {
  name: string;
  icon: IconType;
  path: string;
}

interface SidebarProps {
  children: ReactNode;
}

// Sidebar menu items
const sidebarItems: SidebarItem[] = [
  { name: "Home", icon: FiHome, path: "/" },
  { name: "Runs", icon: FaChartGantt, path: "/runs" },
  { name: "Workcells", icon: GiChaingun, path: "/workcells" },
  { name: "Tools", icon: RiRobot2Line, path: "/tools" },
  { name: "Protocols", icon: PiPathBold, path: "/protocols" },
  { name: "Inventory", icon: GoContainer, path: "/inventory" },
  { name: "Schedule", icon: RiCalendarCheckLine, path: "/schedule" },
  { name: "Labware", icon: CgMenuGridR, path: "/labware" },
  // { name: "Tables", icon: LuTableProperties, path: "/tables" }, //Will keep thinking about this one, not sure we want to give users so much complexity/abstraction
  { name: "Logs", icon: FiBook, path: "/logs" },
  { name: "Variables", icon: TbVariable, path: "/variables" },
  { name: "Scripts", icon: MdOutlineIntegrationInstructions, path: "/scripts" },
 // { name: "Settings", icon: FiSettings, path: "/settings" },
 // { name: "Logout", icon: FiLogOut, path: "/logout" },
];

function DarkModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
      aria-label="Toggle dark mode"
      position="fixed"
      bottom="20px"
      left="20px"
      bg="transparent"
      variant="outline"
    />
  );
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const router = useRouter(); // Use Next.js router for navigation and active route detection

  const toggleSidebar = () => {
    console.log("IsMobile", isMobile);
    if (isMobile) {
      onClose();
    } else {
      setIsSidebarExpanded((prev) => !prev);
    }
  };

  const SidebarContent = (
    <Box
      bg="teal.800"
      color="white"
      minW={isSidebarExpanded ? "320px" : "80px"}
      minH="100%"
      position="sticky"
      top="0"
      p={2}
      sx={{
        transition: "min-width 0.3s ease, width 0.3s ease",
        width: isSidebarExpanded ? "290px" : "80px",
      }}>
      <VStack spacing={4} align="stretch">
        <HStack pb={10}>
        <Image onClick={toggleSidebar} width="58px" paddingLeft="0" src="/site_logo.png" filter="brightness(1)"></Image>
        {isSidebarExpanded && (
            <Text as="b" pt={2} pl={2} fontSize="4xl" color="white" sx={{
                fontFamily: `'Bungee Shade', cursive`,
              }}>
              Galago
            </Text>
          )}
          <Spacer />
          {isSidebarExpanded && (
            <IconButton
              variant="ghost"
              aria-label="Open Menu"
              bg="transparent"
              color="white"
              _hover={{ background: "teal.600" }}
              icon={<MdOutlineTransitEnterexit />}
              onClick={toggleSidebar}
            />
          )}
        </HStack>
        {sidebarItems.map((item) => (
          <Link
            key={item.name}
            onClick={() => {
              router.push(item.path);
              document.title =
                item.path == "/"
                  ? "Home"
                  : capitalizeFirst(`${item.path.replaceAll("/", "").replaceAll("_", " ")}`);
            }}
            _hover={{ background: "teal.600" }}
            borderRadius="md"
            p={2}
            display="flex"
            alignItems="center"
            justifyContent={isSidebarExpanded ? "start" : "center"}
            bg={router.pathname === item.path ? "teal.600" : "transparent"}>
            <item.icon size="26" />
            {isSidebarExpanded && (
              <Text color="white" ml={4} fontSize="md">
                {item.name}
              </Text>
            )}
          </Link>
        ))}
        <DarkModeToggle />
      </VStack>
    </Box>
  );
  return (
    <Flex>
      {isMobile ? (
        <>
          <IconButton
            bg="teal.500"
            aria-label="Open Menu"
            icon={<FiMenu />}
            onClick={onOpen}
            m={2}
            position="fixed"
            top="0rem"
            left="0rem"
          />
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>{SidebarContent}</DrawerContent>
          </Drawer>
        </>
      ) : (
        <Flex>
          <Box>{SidebarContent}</Box>
        </Flex>
      )}
      <Box flex="1" p={4}>
        {children}
      </Box>
    </Flex>
  );
};

export default Sidebar;
