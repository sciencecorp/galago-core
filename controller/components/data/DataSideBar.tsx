import React, { useEffect, useState } from 'react';
import { Box, VStack, Button, IconButton, Collapse, Divider } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useSidebar } from "@/pages/SidebarContext"
type SidebarProps = {};

type MenuItem = {
  title: string;
  subItems?: string[];
};

const DataSideBar: React.FC<SidebarProps> = () => {
  const router = useRouter()
  const { lastClickedSubtab, setLastClickedSubtab } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navbarHeight = '45px';
  const menuItems: MenuItem[] = [
    { title: 'Measurement', subItems: ['Confluence'] },
    { title: 'Images', subItems: ['Cell Imaging', 'Opentrons', 'Uploader'] },
    { title: 'Sensors', subItems: ['Liconic'] },
    { title: 'Logs', subItems: ['Media Exchange', 'Tool Logs', 'Variables'] },
  ];

  useEffect(()=>{
    console.log("This should reset the tabs!")
    if(router.pathname === '/data'){
      console.log("Setting to null");
      setLastClickedSubtab(null);
    }
  },[]);

  const initialExpandedItems = menuItems.reduce((acc, _, index) => {
    acc[index] = true;
    return acc;
  }, {} as Record<number, boolean>);

  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(initialExpandedItems);

  const toggleSubItems = (index: number) => {
    setExpandedItems(prevState => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleSubtabClick = (path: string) => {
    setLastClickedSubtab(path);
    router.replace(path);
  };

  console.log(`Current route is ${router.pathname}`);
  console.log(``);

  return (
    <Box
      width={{ base: isCollapsed ? '60px' : '100%', md: isCollapsed ? '60px' : '150px' }}
      bg="white"
      p={0}
      height="auto"
      position="fixed"
      left={0}
      top={navbarHeight}
      zIndex={1}
      borderRadius={5}
      border="1px solid lightgray"
    >
      <IconButton
        aria-label="Toggle sidebar"
        icon={<HamburgerIcon />}
        onClick={() => setIsCollapsed(!isCollapsed)}
        position="absolute"
        top="10px"
        size="sm"
        bg="blue.500"
        zIndex={1}
        right="4px"
      />
      {!isCollapsed && (
        <VStack position="absolute" top="45px" spacing={0} align={isCollapsed ? 'center' : 'stretch'}>
          {menuItems.map((item, index) => (
            <Box key={index} width="100%">
              <Button
                key={index}
                width="180px"
                justifyContent={isCollapsed ? 'center' : 'flex-start'}
                variant="ghost"
                onClick={() => toggleSubItems(index)}
              >
                {item.title}
              </Button>
              {item.subItems && (
                <Collapse in={expandedItems[index]} animateOpacity>
                  <VStack align="start" spacing={0}>
                    {!isCollapsed &&
                      item.subItems.map((subItem, subIndex) => {
                        const path = `/data/${item.title.toLowerCase()}/${subItem.toLowerCase().replace(' ', '_')}`;
                        return (
                          <Button
                            left={3}
                            key={subIndex}
                            width="150px"
                            variant="ghost"
                            justifyContent="flex-start"
                            color={lastClickedSubtab === path ? 'blue.500' : 'gray.500'}
                            onClick={() => handleSubtabClick(path)}
                          >
                            {subItem}
                          </Button>
                        );
                      })}
                    <Divider />
                  </VStack>
                </Collapse>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default DataSideBar;
