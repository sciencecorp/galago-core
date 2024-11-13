import { trpc } from "@/utils/trpc";
import {
  Alert,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  HStack,
  Spinner,
  VStack,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import Link from "next/link";
import { ToolConfigEditor } from "./ToolConfigEditor";
import { ToolStatusTag } from "./ToolStatusTag";
import { HamburgerIcon } from "@chakra-ui/icons";
import styled from "@emotion/styled";
import { useState } from "react";
import { PiToolbox } from "react-icons/pi";
import { DeleteWithConfirmation } from "../ui/Delete";

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 280px;
  width: 280px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: 0.3s ease-out;
  margin: 0 15px;
  margin-top: 10px;
  margin-bottom: 20px;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

export default function ToolStatusCard({
  toolId,
  style,
}: {
  toolId: string;
  style?: React.CSSProperties;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const infoQuery = trpc.tool.info.useQuery({ toolId: toolId });
  const config = infoQuery.data;
  const { description, name } = infoQuery.data || {};

  if (infoQuery.isLoading) {
    return <Spinner size="lg" />;
  }

  if (infoQuery.isError || !config) {
    return <Alert status="error">Could not load tool info</Alert>;
  }

  function renderToolImage(config: any) {
    if (!config.image_url) {
      return <Box></Box>;
    } else if (config.id === "toolbox") {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconButton
            aria-label="Tool Box"
            icon={<PiToolbox style={{ width: "100%", height: "100%" }} />} // Ensure the icon fills the button
            variant="ghost"
            colorScheme="teal"
            isRound
            boxSize="100px"
          />
        </Box>
      );
    } else {
      return (
        <Image
          src={config.image_url}
          alt={config.name}
          objectFit="contain"
          height={isHovered ? "120px" : "120px"}
          width={isHovered ? "120px" : "120px"}
          transition="all 0.3s ease-in-out"
        />
      );
    }
  }

  const isPF400 = config.type === ToolType.pf400;
  const isToolBox = config.id === ToolType.toolbox;

  return (
    <StyledCard
      p={2}
      style={{ width: "280px", ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <CardHeader pb="0px">
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Link href={`/tools/${toolId}`} passHref>
              <Heading size="md">{name}</Heading>
            </Link>
            <Text fontSize="sm">{description}</Text>
          </Box>
          <Box top={-5} right={-5} position="relative">
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="ghost"
            />
            <MenuList>
                <>
                <MenuItem>Edit</MenuItem>
                <MenuItem>
                  <DeleteWithConfirmation
                      onDelete={() => console.log("Test")}
                      label="tool"
                      showText={true}
                    />
                </MenuItem>
                </>
              {isPF400 && (
                <MenuItem as="a" href={`/tools/advanced/${toolId}`}>
                  Teach Pendant
                </MenuItem>
              )}
            </MenuList>
          </Menu>
          </Box>
        </Flex>
      </CardHeader>
      <CardBody mt="0px">
        <VStack align="stretch" spacing={4} mb={2}>
          <ToolStatusTag toolId={toolId} />
          <Flex
            justifyContent="center"
            alignItems="center"
            height={isHovered ? "auto" : "100%"}
            transition="all 0.3s ease-in-out">
            {isHovered ? (
              <Flex justifyContent="space-between" alignItems="center" width="100%">
                <Box flex="1" opacity={isHovered ? 1 : 0} transition="opacity 0.3s">
                  <ToolConfigEditor toolId={toolId} defaultConfig={config as ToolConfig} />
                </Box>
                <Box width="60px" height="60px">
                  {<Link href={`/tools/${toolId}`}>{renderToolImage(config)}</Link>}
                </Box>
              </Flex>
            ) : (
              <Box>{<Link href={`/tools/${toolId}`}>{renderToolImage(config)}</Link>}</Box>
            )}
          </Flex>
        </VStack>
      </CardBody>
    </StyledCard>
  );
}
