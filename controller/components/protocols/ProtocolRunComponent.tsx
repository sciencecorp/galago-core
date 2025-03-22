import { trpc } from "@/utils/trpc";
import {
  Heading,
  HStack,
  Spinner,
  Switch,
  Table,
  Tag,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  Box,
  Card,
  CardBody,
} from "@chakra-ui/react";
import moment from "moment-timezone";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

import CommandComponent from "./CommandComponent";

export function ProtocolRunComponent({ id }: { id: string }) {
  const run = trpc.run.get.useQuery({ id });

  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const cardBg = useColorModeValue(semantic.background.card.light, semantic.background.card.dark);

  if (run.isLoading) return <Spinner color={accentColor} size="lg" />;
  if (run.isError)
    return <Text color={semantic.status.error.light}>Error: {run.error.message}</Text>;

  const commandList = run.data?.commands || [];
  const durationSum = commandList.reduce((acc, cur) => acc + (cur.estimatedDuration ?? 0), 0);

  return (
    <VStack align="start" spacing={tokens.spacing.lg} width="100%">
      <Card
        bg={cardBg}
        shadow={tokens.shadows.md}
        borderColor={borderColor}
        borderWidth={tokens.borders.widths.thin}
        width="100%">
        <CardBody>
          <HStack justify="space-between" width="100%">
            <Heading size="lg" color={textColor}>
              Protocol Run {id}
            </Heading>
            <HStack spacing={tokens.spacing.sm}>
              <Text color={textSecondary}>Duration:</Text>
              <Tag
                bg={accentColor}
                color="white"
                borderRadius={tokens.borders.radii.md}
                px={tokens.spacing.sm}
                py={tokens.spacing.xs}>
                {moment
                  .utc(moment.duration(durationSum, "seconds").asMilliseconds())
                  .format("H:mm:ss")}
              </Tag>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      <Card
        bg={cardBg}
        shadow={tokens.shadows.md}
        borderColor={borderColor}
        borderWidth={tokens.borders.widths.thin}
        width="100%">
        <CardBody>
          <Box overflowX="auto" width="100%">
            <Table
              mt={tokens.spacing.md}
              sx={{
                th: {
                  borderColor: borderColor,
                  color: textSecondary,
                  fontSize: tokens.typography.fontSizes.sm,
                },
                td: {
                  borderColor: borderColor,
                  color: textColor,
                  fontSize: tokens.typography.fontSizes.sm,
                },
              }}>
              <Thead>
                <Tr>
                  <Th>Tool Type</Th>
                  <Th>Command</Th>
                  <Th>Params</Th>
                  <Th>Duration</Th>
                  <Th>Execute</Th>
                  <Th>Response</Th>
                </Tr>
              </Thead>
              <Tbody>
                {commandList.map((command, i) => {
                  return <CommandComponent key={command.queueId} command={command} />;
                })}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </VStack>
  );
}
