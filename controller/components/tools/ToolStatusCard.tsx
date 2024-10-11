import { trpc } from "@/utils/trpc";
import { Alert, Box, Card, CardBody, CardHeader, Heading, Text, HStack, Spinner,VStack,Flex,Avatar, Image,Menu, MenuButton, MenuItem, MenuList, IconButton} from "@chakra-ui/react";
//import Image from "next/image";
import { ToolConfig } from "gen-interfaces/controller";
import Link from "next/link";
import { ToolConfigEditor } from "./ToolConfigEditor";
import { ToolStatusTag } from "./ToolStatusTag";
import { DragHandleIcon, HamburgerIcon} from "@chakra-ui/icons";
import styled from '@emotion/styled';

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 280px;
  width: 200px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: 0.3s ease-out;
  margin: 0 10px;
  margin-bottom: 20px; // Added spacing below the card

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

export default function ToolStatusCard({ toolId, style }: { toolId: string, style?: React.CSSProperties }): JSX.Element {
  const infoQuery = trpc.tool.info.useQuery({ toolId: toolId });
 // console.log("Query info is"+ infoQuery)
  const config = infoQuery.data;
  const { description, name } = infoQuery.data || {};

  if (infoQuery.isLoading) {
    return <Spinner size="lg" />;
  }

  if (infoQuery.isError || !config) {
    return <Alert status="error">Could not load tool info</Alert>;
  }
  
  function renderToolImage(config:any){
    //console.log("Config here is "+JSON.stringify(config))
    if(!config.image_url){
      return <Box></Box>
    }
    else{
      return  <Image src={config.image_url} alt={config.name} sizes="50vw" style={{ width: '100%', height: '60px' }}/>
    }
  }


  return (
    <StyledCard style={style}>
      <CardHeader pb = '0px'>
          <Flex>
            <Flex flex='2' gap='1' alignItems='left' flexWrap='wrap'>
              <Box>
                <Link href={`/tools/${toolId}`} passHref>
                  <Heading size="md">{name}</Heading>
                </Link>
                <Text fontSize='sm'>{description}</Text>
              </Box>
            </Flex>
            <Menu>
              <MenuButton
                  as={IconButton}
                  aria-label='Options'
                  icon={<HamburgerIcon />}
                  variant='ghost'
                />
                <MenuList>
                    <MenuItem >Edit</MenuItem>
                    <MenuItem as='a' href={`/tools/advanced/${toolId}`}>Advanced</MenuItem>
                </MenuList>
              </Menu>
        </Flex>
      </CardHeader>
      <CardBody mt = '0px'>
        <VStack align="left" spacing={4} mb={2}>
          <ToolStatusTag toolId={toolId} />
          <Flex>
            <Flex flex='2' gap='1' alignItems='left' flexWrap='wrap'>
              <Box>
                <ToolConfigEditor toolId={toolId} defaultConfig={config as ToolConfig} />
              </Box>
            </Flex>
            <Box>
              {renderToolImage(config)}
            </Box>
          </Flex>
        </VStack>
      </CardBody>
    </StyledCard>
  );
}