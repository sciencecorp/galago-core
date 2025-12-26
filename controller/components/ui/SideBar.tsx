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
  useDisclosure,
  useBreakpointValue,
  Image,
  HStack,
  useColorMode,
  DrawerOverlay,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  Home,
  Wrench,
  Variable,
  Code2,
  GitBranch,
  Book,
  GanttChart,
  Package,
  Layers,
  List,
  Moon,
  Sun,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { capitalizeFirst } from "@/utils/parser";
import { useRouter } from "next/router";
import { useSidebarTheme } from "./Theme";
import { WorkcellIcon } from "./Icons";

interface SidebarItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarProps {
  children: ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Runs", icon: GanttChart, path: "/runs" },
  { name: "Workcells", icon: WorkcellIcon, path: "/workcells" },
  { name: "Tools", icon: Wrench, path: "/tools" },
  { name: "runs", icon: GitBranch, path: "/protocols" },
  { name: "Forms", icon: List, path: "/forms" },
  { name: "Inventory", icon: Package, path: "/inventory" },
  // { name: "Schedule", icon: CalendarCheck, path: "/schedule" },
  { name: "Labware", icon: Layers, path: "/labware" },
  { name: "Logs", icon: Book, path: "/logs" },
  { name: "Variables", icon: Variable, path: "/variables" },
  { name: "Scripts", icon: Code2, path: "/scripts" },
];

function DarkModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      icon={colorMode === "light" ? <Moon size={20} /> : <Sun size={20} />}
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
        <HStack py={2} pl={2} width="100%" position="relative">
          <Image
            onClick={toggleSidebar}
            width="50px"
            paddingLeft="0"
            src="/site_logo.svg"
            alt="logo"
            filter={logoFilter}></Image>
          {isSidebarExpanded && (
            <Text fontWeight="bold" fontSize="2xl" fontFamily="monospace">
              Galago
            </Text>
          )}
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
            p={1}
            display="flex"
            alignItems="center"
            justifyContent={isSidebarExpanded ? "start" : "center"}
            bg={router.pathname === item.path ? theme.activeBg : "transparent"}
            width={isMobile ? "100%" : "auto"}>
            {!isSidebarExpanded ? (
              <Tooltip label={item.name} placement="right">
                <Box>
                  <item.icon
                    size={20}
                    color={router.pathname === item.path ? theme.activeIconColor : undefined}
                  />
                </Box>
              </Tooltip>
            ) : (
              <>
                <item.icon
                  size={20}
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
