import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  HStack,
  Tab,
  TabList,
  Tabs,
  Flex,
  Menu, 
  MenuButton,
  MenuItem,
  MenuList,
  MenuGroup,
  MenuDivider,
  IconButton,
  Image,
  useColorModeValue
} from "@chakra-ui/react";

import { HamburgerIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import SettingsModalComponent from '@/components/settings/SettingsModalComponent';
import { useState } from "react";
import { useSidebar } from "@/pages/SidebarContext"

const TabPages = [
  { href: "/inventory", title: "Inventory" },
  { href: "/runs", title: "Runs" },
  { href: "/protocols", title: "Protocols" },
  { href: "/daily_actions", title: "Daily Actions" },
  { href: "/data", title: "Data" },
] as const;

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

export default function Nav() {
  const router = useRouter();
  const breadcrumbs: { href?: string; title: string }[] = [{ href: "/", title: "Home" }];
  const tabIndex = TabPages.findIndex(({ href }) => router.route.indexOf(href) === 0);
  const selectedTab = tabIndex >= 0 ? TabPages[tabIndex] : undefined;
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const {lastClickedSubtab, setLastClickedSubtab } = useSidebar();

  const handleShowModal =() =>{
    setShowSettingsModal(!showSettingsModal);
  }

  if (selectedTab) {
    if (router.route !== selectedTab.href) {
      breadcrumbs.push(selectedTab);
      breadcrumbs.push({ title: `${router.asPath.split("/").pop()}`, href: "#" });
    } else {
      breadcrumbs.push({ title: selectedTab.title, href: "#" });
    }
  }

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <>
      <HStack 
        spacing={4} 
        width={"100%"} 
        height='45px' 
        className={process.env.appMode == "PROD"?"production-nav":"development-nav"}
        bg={bgColor}
        color={textColor}
      > 
        {showSettingsModal && 
          <SettingsModalComponent IsVisible={showSettingsModal}/>
        }
        <Image width='50px' paddingLeft="5" src="/site_logo.png"></Image>
        <Breadcrumb alignContent="left" p={1} separator={"›"} width="15%">
          {breadcrumbs.map((breadcrumb) => {
            const isCurrentPage = breadcrumb.href === "#";
            return (
              <BreadcrumbItem key={breadcrumb.href} isCurrentPage={isCurrentPage}>
                {isCurrentPage ? (
                  <BreadcrumbLink>{breadcrumb.title}</BreadcrumbLink>
                ) : (
                  <BreadcrumbLink as={Link} href={breadcrumb.href}>
                    {breadcrumb.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            );
          })}
        </Breadcrumb>
        <Flex justifyContent="center" width="100%" marginLeft='-15%'>
          <Tabs index={tabIndex} onChange={(index) => router.push(TabPages[index].href)}>
            <TabList>
              {TabPages.map(({ title, href }) => (
                <Tab key={href}>{title}</Tab>
              ))}
            </TabList>
          </Tabs>
        </Flex>
        <Menu>
            <MenuButton
              as={IconButton}
              aria-label='Options'
              icon={<HamburgerIcon />}
              variant='outline'
            />
          <MenuList>
            <MenuGroup title='General'>
              <MenuItem as='a' onClick={handleShowModal}>Settings</MenuItem>
              <MenuItem as='a' href='/logs'>Logs</MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title='Help'>
              <MenuItem>About</MenuItem>
              <MenuItem as='a' href='/docs/changelog'>Change Log</MenuItem>
            </MenuGroup>
        </MenuList>
        </Menu>
      </HStack>
      <Divider/>
    </>
  );
}
