import React, { useState, ReactNode, useEffect } from "react";
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
  HStack,
  useColorMode,
  DrawerOverlay,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiMenu, FiHome } from "react-icons/fi";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { IconType } from "react-icons";
import { useRouter } from "next/router";
import { MdOutlineTransitEnterexit } from "react-icons/md";
import { FaToolbox } from "react-icons/fa";
import { TbVariable } from "react-icons/tb";
import { MdOutlineIntegrationInstructions } from "react-icons/md";
import { RiCalendarCheckLine } from "react-icons/ri";
import { PiPathBold } from "react-icons/pi";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FiBook } from "react-icons/fi";
import { BsTools } from "react-icons/bs";
import { FaChartGantt } from "react-icons/fa6";
import { capitalizeFirst } from "@/utils/parser";
import { BsBoxSeam } from "react-icons/bs";
import { HiOutlineRectangleStack } from "react-icons/hi2";
import { GiChaingun } from "react-icons/gi";
import { useSidebarTheme } from "./Theme";
import { FaRegListAlt } from "react-icons/fa";
import { SiReacthookform } from "react-icons/si";
import { VscExtensions } from "react-icons/vsc";

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
  { name: "Tools", icon: BsTools, path: "/tools" },
  { name: "Protocols", icon: PiPathBold, path: "/protocols" },
  { name: "Forms", icon: FaRegListAlt, path: "/forms" },
  { name: "Inventory", icon: BsBoxSeam, path: "/inventory" },
  // { name: "Schedule", icon: RiCalendarCheckLine, path: "/schedule" },
  { name: "Labware", icon: HiOutlineRectangleStack, path: "/labware" },
  // { name: "Tables", icon: LuTableProperties, path: "/tables" }, //Will keep thinking about this one, not sure we want to give users so much complexity/abstraction
  { name: "Logs", icon: FiBook, path: "/logs" },
  { name: "Variables", icon: TbVariable, path: "/variables" },
  { name: "Scripts", icon: MdOutlineIntegrationInstructions, path: "/scripts" },
  { name: "Extensions", icon: VscExtensions, path: "/hub" },
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
    />
  );
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const router = useRouter();
  const theme = useSidebarTheme();

  const collapsedWidth = "80px";
  const expandedWidth = "230px";

  const toggleSidebar = () => {
    if (isMobile && !isSidebarExpanded) {
      onOpen();
    } else if (isMobile && isSidebarExpanded) {
      onClose();
    }
    setIsSidebarExpanded((prev) => !prev); // Toggle the expanded state on larger screens
  };

  // Move the hook outside of conditional rendering
  const logoFilter = useColorModeValue("none", "invert(1)");

  const transitionProps = {
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const SidebarContent = (
    <Box
      p={0}
      bg={theme.bg}
      color={theme.textColor}
      width={isSidebarExpanded ? expandedWidth : collapsedWidth}
      borderRight={isMobile ? "1px" : "none"}
      borderColor={theme.borderColor}
      height="100%"
      {...transitionProps}>
      <VStack left={0} p={1} spacing={4} align="stretch" width="100%">
        <HStack pb={10} pl={2} pt={2} width="100%" position="relative">
          <Image
            onClick={toggleSidebar}
            width="60px"
            paddingLeft="0"
            src="/site_logo.svg"
            alt="logo"
            filter={logoFilter}></Image>
        </HStack>

        {sidebarItems.map((item) => (
          <Link
            key={item.name}
            onClick={() => {
              router.push(item.path);
              document.title =
                item.path === "/"
                  ? "Home"
                  : capitalizeFirst(`${item.path.replaceAll("/", "").replaceAll("_", " ")}`);
            }}
            _hover={{ background: theme.hoverBg }}
            borderRadius="md"
            p={2}
            display="flex"
            alignItems="center"
            justifyContent={isSidebarExpanded ? "start" : "center"}
            bg={router.pathname === item.path ? theme.activeBg : "transparent"}
            width={isMobile ? "100%" : "auto"}>
            {!isSidebarExpanded ? (
              <Tooltip label={item.name} placement="right">
                <Box>
                  <item.icon
                    size="26"
                    color={router.pathname === item.path ? theme.activeIconColor : undefined}
                  />
                </Box>
              </Tooltip>
            ) : (
              <>
                <item.icon
                  size="26"
                  color={router.pathname === item.path ? theme.activeIconColor : undefined}
                />
                <Text
                  color={router.pathname === item.path ? theme.activeTextColor : theme.textColor}
                  ml={4}
                  fontSize="md">
                  {item.name}
                </Text>
              </>
            )}
          </Link>
        ))}
        <DarkModeToggle />
      </VStack>
    </Box>
  );

  return (
    <Flex>
      {!isMobile ? (
        <Box
          position="fixed"
          top="0"
          left="0"
          bottom="0"
          bg={theme.bg}
          color={theme.textColor}
          width={isSidebarExpanded ? expandedWidth : collapsedWidth}
          borderRight="1px"
          borderColor={theme.borderColor}
          height="100vh"
          boxShadow={theme.shadow}
          {...transitionProps}>
          {SidebarContent}
        </Box>
      ) : (
        <>
          <VStack>
            <Box pl={3} pt={3}>
              <Image
                onClick={toggleSidebar}
                width="55px"
                paddingLeft="0"
                src="/site_logo.svg"
                alt="logo"
                filter={logoFilter}></Image>
            </Box>
            <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
              <DrawerOverlay />
              <DrawerContent
                maxW="220px"
                overflow="hidden"
                _focus={{ outline: "none" }}
                bg={theme.bg}
                color={theme.textColor}
                borderRight="1px"
                borderColor={theme.borderColor}
                height="100%"
                boxShadow={theme.shadow}>
                {SidebarContent}
              </DrawerContent>
            </Drawer>
          </VStack>
        </>
      )}

      {/* Content Area */}
      <Box
        flex="1"
        p={4}
        ml={!isMobile ? (isSidebarExpanded ? expandedWidth : collapsedWidth) : "0"}
        {...transitionProps}>
        {children}
      </Box>
    </Flex>
  );
};

export default Sidebar;
