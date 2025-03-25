import {
  VStack,
  Card,
  CardHeader,
  CardBody,
  Button,
  HStack,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Heading,
} from "@chakra-ui/react";
import { GripParams } from "../types";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { FaArrowsAlt, FaHandPaper } from "react-icons/fa";
import { BiUpArrow } from "react-icons/bi";

interface ControlPanelProps {
  onFree: () => void;
  onUnfree: () => void;
  onUnwind: () => void;
  onGripperOpen: () => void;
  onGripperClose: () => void;
  jogEnabled: boolean;
  jogAxis: string;
  jogDistance: number;
  setJogAxis: (axis: string) => void;
  setJogDistance: (distance: number) => void;
  onJog: () => void;
  setJogEnabled: (enabled: boolean) => void;
  toolState?: string;
  gripParams: GripParams[];
  selectedGripParamsId: number | null;
  onGripParamsChange: (id: number | null) => void;
  isFreeLoading?: boolean;
  isUnfreeLoading?: boolean;
  isUnwindLoading?: boolean;
  bgColor?: string;
  borderColor?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onFree,
  onUnfree,
  onUnwind,
  onGripperOpen,
  onGripperClose,
  jogEnabled,
  jogAxis,
  jogDistance,
  setJogAxis,
  setJogDistance,
  onJog,
  setJogEnabled,
  toolState,
  gripParams,
  selectedGripParamsId,
  onGripParamsChange,
  isFreeLoading = false,
  isUnfreeLoading = false,
  isUnwindLoading = false,
  bgColor,
  borderColor,
}) => {
  const isEnabled = toolState === ToolStatus.SIMULATED || toolState === ToolStatus.READY;
  return (
    <VStack spacing={4} width="100%" height="100%">
      <Card width="100%" borderColor={borderColor} borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <CardHeader fontWeight="semibold" fontSize="md">
          <HStack>
            <BiUpArrow />
            <Box>State Control</Box>
          </HStack>
        </CardHeader>
        <CardBody>
          <HStack width="100%" spacing={2}>
            <Button
              onClick={onFree}
              colorScheme="green"
              size="md"
              isLoading={isFreeLoading}
              isDisabled={!isEnabled}>
              Release
            </Button>
            <Button
              onClick={onUnfree}
              colorScheme="red"
              size="md"
              isLoading={isUnfreeLoading}
              isDisabled={!isEnabled}>
              Engage
            </Button>
            <Button
              onClick={onUnwind}
              colorScheme="purple"
              size="md"
              isLoading={isUnwindLoading}
              isDisabled={!isEnabled}>
              Retract
            </Button>
          </HStack>
        </CardBody>
      </Card>

      <Card width="100%" borderColor={borderColor} borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <CardHeader fontWeight="semibold" fontSize="md">
          <HStack>
            <FaArrowsAlt />
            <Box>Jog Control</Box>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <Select
              value={jogAxis}
              onChange={(e) => setJogAxis(e.target.value)}
              width="100%"
              borderColor={borderColor}>
              <option value="">Select Axis</option>
              <option value="x">X</option>
              <option value="y">Y</option>
              <option value="z">Z</option>
              <option value="pitch">Pitch</option>
              <option value="yaw">Yaw</option>
              <option value="roll">Roll</option>
            </Select>
            <NumberInput
              value={jogDistance}
              onChange={(valueString) => setJogDistance(parseFloat(valueString))}
              width="100%"
              borderColor={borderColor}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button onClick={onJog} colorScheme="teal" width="100%" isDisabled={!isEnabled}>
              Jog
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <Card width="100%" borderColor={borderColor} borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <CardHeader fontWeight="semibold" fontSize="md">
          <HStack>
            <FaHandPaper />
            <Box>Gripper Control</Box>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} width="100%">
            <Select
              value={selectedGripParamsId || ""}
              onChange={(e) => onGripParamsChange(e.target.value ? Number(e.target.value) : null)}
              placeholder="Use Default Parameters"
              borderColor={borderColor}>
              {gripParams.map((param, index) => (
                <option key={param.id || `new-${index}`} value={param.id}>
                  {param.name}
                </option>
              ))}
            </Select>
            <HStack spacing={4} width="100%">
              <Button onClick={onGripperOpen} colorScheme="green" flex={1} isDisabled={!isEnabled}>
                Open
              </Button>
              <Button onClick={onGripperClose} colorScheme="red" flex={1} isDisabled={!isEnabled}>
                Close
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};
