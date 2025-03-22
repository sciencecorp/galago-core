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
import { useRouter } from "next/router";
import { capitalizeFirst } from "@/utils/parser";
import { palette, semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";
import {
  Icon,
  SidebarIcons,
  SectionIcons,
  ThemeIcons,
  HomeIcon,
  ChaingunIcon,
  ToolsIcon,
  PathBoldIcon,
  BoxSeamIcon,
  RectangleStackIcon,
  BookIcon,
  VariableIcon,
  IntegrationInstructionsIcon,
  ChartGanttIcon,
} from "../ui/Icons";
import { useSidebarTheme } from "./Theme";

interface SidebarItem {
  name: string;
  icon: React.ElementType;
  path: string;
}

interface SidebarProps {
  children: ReactNode;
}

// Sidebar menu items
const sidebarItems: SidebarItem[] = [
  { name: "Home", icon: HomeIcon, path: "/" },
  { name: "Runs", icon: ChartGanttIcon, path: "/runs" },
  { name: "Workcells", icon: ChaingunIcon, path: "/workcells" },
  { name: "Tools", icon: ToolsIcon, path: "/tools" },
  { name: "Protocols", icon: PathBoldIcon, path: "/protocols" },
  { name: "Inventory", icon: BoxSeamIcon, path: "/inventory" },
  // { name: "Schedule", icon: SidebarIcons.Calendar, path: "/schedule" },
  { name: "Labware", icon: RectangleStackIcon, path: "/labware" },
  // { name: "Tables", icon: LuTableProperties, path: "/tables" }, //Will keep thinking about this one, not sure we want to give users so much complexity/abstraction
  { name: "Logs", icon: BookIcon, path: "/logs" },
  { name: "Variables", icon: VariableIcon, path: "/variables" },
  { name: "Scripts", icon: IntegrationInstructionsIcon, path: "/scripts" },
  // { name: "Settings", icon: FiSettings, path: "/settings" },
  // { name: "Logout", icon: FiLogOut, path: "/logout" },
];

function DarkModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      icon={colorMode === "light" ? <Icon as={ThemeIcons.Moon} /> : <Icon as={ThemeIcons.Sun} />}
      aria-label="Toggle dark mode"
      position="fixed"
      bottom={tokens.spacing.md}
      left={tokens.spacing.md}
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
      bg={semantic.background.accent.dark}
      color={semantic.text.primary.dark}
      minW={isSidebarExpanded ? "220px" : "80px"}
      sx={{
        transition: `min-width ${tokens.animation.durations.normal} ${tokens.animation.easings.easeInOut}, width ${tokens.animation.durations.normal} ${tokens.animation.easings.easeInOut}`,
        width: isSidebarExpanded ? "230px" : "80px",
      }}>
      <VStack left={0} p={1} spacing={4} align="stretch" width="100%">
        <HStack pb={10} pl={2} pt={2} width="100%" position="relative">
          <Image
            onClick={toggleSidebar}
            width="60px"
            paddingLeft="0"
            src="/site_logo.png"
            alt="logo"
            filter="invert(1)"></Image>
          {isSidebarExpanded && (
            <IconButton
              icon={<Icon as={SidebarIcons.Sidebar} />}
              aria-label="Toggle Sidebar"
              onClick={toggleSidebar}
              position="absolute"
              right="2"
              bg="transparent"
              color={semantic.text.primary.dark}
              _hover={{ bg: semantic.background.hover.dark }}
            />
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
            _hover={{ background: semantic.background.hover.dark }}
            borderRadius={tokens.borders.radii.md}
            p={2}
            display="flex"
            alignItems="center"
            justifyContent={isSidebarExpanded ? "start" : "center"}
            bg={router.pathname === item.path ? semantic.background.hover.dark : "transparent"}
            width={isMobile ? "100%" : "auto"}>
            {!isSidebarExpanded ? (
              <Tooltip label={item.name} placement="right">
                <Box>
                  <Icon as={item.icon} boxSize="26px" />
                </Box>
              </Tooltip>
            ) : (
              <>
                <Icon as={item.icon} boxSize="26px" />
                <Text
                  color={semantic.text.primary.dark}
                  ml={4}
                  fontSize={tokens.typography.fontSizes.md}>
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
          bg={semantic.background.accent.dark}
          color={semantic.text.primary.dark}
          minW={isSidebarExpanded ? "230px" : "85px"}
          sx={{
            transition: `min-width ${tokens.animation.durations.normal} ${tokens.animation.easings.easeInOut}, width ${tokens.animation.durations.normal} ${tokens.animation.easings.easeInOut}`,
            width: isSidebarExpanded ? "220px" : "85px",
          }}>
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
                src="/site_logo.png"
                alt="logo"
                filter={logoFilter}></Image>
            </Box>
            <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
              <DrawerOverlay />
              <DrawerContent
                maxW="220px"
                overflow="hidden"
                _focus={{ outline: "none" }}
                bg={semantic.background.accent.dark}
                color={semantic.text.primary.dark}>
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
