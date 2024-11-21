import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spinner,
  Alert,
  Text,
  Flex,
  Image,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { Tool, Nest, Plate, Reagent, Well } from "@/types/api";
import NestModal from "./NestModal";
import styled from "@emotion/styled";
import { trpc } from "@/utils/trpc";
import { PiToolbox } from "react-icons/pi";
import { IconButton } from "@chakra-ui/react";
import { ToolConfigEditor } from "../tools/ToolConfigEditor";

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 280px;
  width: 280px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: 0.3s ease-out;
  margin: 0;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

interface InventoryToolCardProps {
  toolId: string;
  nests: Nest[];
  plates: Plate[];
  onCreateNest: (
    toolId: string,
    nestName: string,
    nestRow: number,
    nestColumn: number,
  ) => Promise<void>;
  onCreatePlate: (
    nestId: number,
    plateData: { name: string; barcode: string; plate_type: string },
  ) => void;
  onCreateReagent: (nestId: number, reagentData: Omit<Reagent, "id" | "well_id">) => void;
  onNestClick: (nest: Nest) => void;
  onDeleteNest: (nestId: number) => Promise<void>;
}

export const InventoryToolCard: React.FC<InventoryToolCardProps> = ({
  toolId,
  nests,
  plates,
  onCreateNest,
  onCreatePlate,
  onCreateReagent,
  onNestClick,
  onDeleteNest,
}) => {
  const [isCreateNestModalOpen, setIsCreateNestModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const infoQuery = trpc.tool.info.useQuery({ toolId });
  const toolData = infoQuery.data;
  const { name } = toolData || {};

  const toolNests = nests.filter((nest) => nest.name?.toString() === name?.toString());
  const toolPlates = plates.filter((plate) => toolNests.some((nest) => nest.id === plate.nest_id));

  const [isHovered, setIsHovered] = useState(false);

  function renderToolImage(config: any) {
    if (!config?.image_url) {
      console.log("No image URL");
      return <Box></Box>;
    } else if (config.name === "Tool Box") {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconButton
            aria-label="Tool Box"
            icon={<PiToolbox style={{ width: "100%", height: "100%" }} />}
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
          src={`/tool_icons/${config.type}.png`}
          alt={name}
          objectFit="contain"
          height="120px"
          width="120px"
        />
      );
    }
  }

  return (
    <>
      <StyledCard onClick={onOpen}>
        <CardHeader pb="0px">
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="md">{name}</Heading>
              <Text fontSize="sm" color="gray.500">
                {toolNests.length} Nests | {toolPlates.length} Plates
              </Text>
            </Box>
          </Flex>
        </CardHeader>

        <CardBody>
          <Flex justifyContent="center" alignItems="center" height="100%">
            {infoQuery.isLoading ? <Spinner size="lg" /> : renderToolImage(toolData)}
          </Flex>
        </CardBody>
      </StyledCard>

      <NestModal
        isOpen={isOpen}
        onClose={onClose}
        toolName={name || ""}
        nests={toolNests}
        plates={plates}
        onCreatePlate={(nestId, plateData) =>
          onCreatePlate(nestId, {
            ...plateData,
            plate_type: plateData.plateType,
          })
        }
        onDeleteNest={onDeleteNest}
        onCreateReagent={onCreateReagent}
        onNestClick={onNestClick}
        onCreateNest={(row, column) => onCreateNest(toolId, `${name}`, row, column)}
      />
    </>
  );
};
