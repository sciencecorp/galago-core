import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Flex,
  Image,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { Tool, Nest, Plate, Reagent, Well } from "@/types/api";
import NestModal from "./NestModal";
import styled from "@emotion/styled";

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
`;

interface InventoryToolCardProps {
  tool: Tool;
  nests: Nest[];
  plates: Plate[];
  wells: Well[];
  reagents: Reagent[];
  onCreateNest: (toolId: string, nestName: string, nestRow: number, nestColumn: number) => Promise<void>;
  onCreatePlate: (nestId: number) => void;
  onCreateReagent: (nestId: number) => void;
  onNestClick: (nest: Nest) => void;
  onDeleteNest: (nestId: number) => Promise<void>;
}

export const InventoryToolCard: React.FC<InventoryToolCardProps> = ({
  tool,
  nests,
  plates,
  wells,
  reagents,
  onCreateNest,
  onCreatePlate,
  onCreateReagent,
  onNestClick,
  onDeleteNest,
}) => {
  const [isCreateNestModalOpen, setIsCreateNestModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toolNests = nests.filter((nest) => nest.name?.toString() === tool.id.toString());

  return (
    <>
      <StyledCard onClick={onOpen}>
        <CardHeader pb="0px">
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="md">{tool.name}</Heading>
              <Text fontSize="sm" color="gray.500">
                {toolNests.length} Nests | {plates.length} Plates
              </Text>
            </Box>
          </Flex>
        </CardHeader>

        <CardBody>
          <Flex justifyContent="center" alignItems="center" height="100%">
            <Image
              src={`/tool_icons/${tool.name}.png`}
              alt={tool.name}
              boxSize="120px"
              objectFit="contain"
            />
          </Flex>
        </CardBody>
      </StyledCard>

      <NestModal
        isOpen={isOpen}
        onClose={onClose}
        toolName={tool.name}
        nests={toolNests}
        plates={plates}
        wells={wells}
        reagents={reagents}
        onCreatePlate={onCreatePlate}
        onDeleteNest={onDeleteNest}
        onNestClick={onNestClick}
        onCreateNest={(row, column) => onCreateNest(tool.id, `${tool.name}`, row, column)} // Adjusted to match the signature
        />
{/* 
      <CreateNestModal
        isOpen={isCreateNestModalOpen}
        onClose={() => setIsCreateNestModalOpen(false)}
        toolId={tool.id}
        toolName={tool.name}
        onCreateNest={onCreateNest}
      /> */}
    </>
  );
};