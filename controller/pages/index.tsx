import { useEffect } from "react";
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { BsTools } from "react-icons/bs";
import { HiOutlineRectangleStack } from "react-icons/hi2";
import { BsBoxSeam } from "react-icons/bs";
import { PiPathBold } from "react-icons/pi";
import { GiChaingun } from "react-icons/gi";
import { TbVariable } from "react-icons/tb";
import { FiBook } from "react-icons/fi";
import { FaBookOpen } from "react-icons/fa6";
import { BsCalendarWeek } from "react-icons/bs";
import { VscCode } from "react-icons/vsc";
import { FaChartGantt } from "react-icons/fa6";
import Link from "next/link";
import { Plate } from "@/types/api";
import { Calendar } from "@/components/calendar/Calendar";
import { palette, semantic } from "../themes/colors";

export default function Page() {
  useEffect(() => {
    document.title = "Home";
  }, []);

  const headerBg = useColorModeValue(semantic.background.card.light, semantic.background.card.dark);
  const iconColor = palette.teal[500];
  const hoverBg = useColorModeValue(semantic.background.hover.light, semantic.background.hover.dark);

  // Fetch data from different sections
  const { data: tools } = trpc.tool.availableIDs.useQuery();
  const { data: workcells } = trpc.workcell.getAll.useQuery();
  const { data: protocols } = trpc.protocol.allNames.useQuery({ workcellName: "" });
  const { data: labware } = trpc.labware.getAll.useQuery();
  const { data: variables } = trpc.variable.getAll.useQuery();
  const { data: logs } = trpc.logging.getPaginated.useQuery({
    limit: 5,
    skip: 0,
    descending: true,
  });
  const { data: plates } = trpc.inventory.getPlates.useQuery<Plate[]>("");
  const { data: scripts } = trpc.script.getAll.useQuery();
  const { data: runs } = trpc.run.all.useQuery({ workcellName: "" });

  // Calculate stats with proper type assertions
  const toolCount = Array.isArray(tools) ? tools.length : 0;
  const workcellCount = Array.isArray(workcells) ? workcells.length : 0;
  const protocolCount = Array.isArray(protocols) ? protocols.length : 0;
  const labwareCount = Array.isArray(labware) ? labware.length : 0;
  const variableCount = Array.isArray(variables) ? variables.length : 0;
  const logCount = Array.isArray(logs) ? logs.length : 0;
  const plateCount = Array.isArray(plates) ? plates.length : 0;
  const scriptCount = Array.isArray(scripts) ? scripts.length : 0;
  const runCount = Array.isArray(runs) ? runs.length : 0;

  // Calculate active runs
  const activeRuns = Array.isArray(runs)
    ? runs.filter((run) => run.status === "CREATED" || run.status === "STARTED").length
    : 0;

  return (
    <Box maxW="100%" p={4}>
      <VStack spacing={6} align="stretch">
        <HStack align="start" spacing={6}>
          {/* Left Side Cards */}
          <VStack spacing={6} display={{ base: "none", md: "flex" }}>
            {/* Calendar Card */}
            <Card
              bg={headerBg}
              shadow="md"
              // maxH="400px"
              h="440px"
              maxW="300px"
              minW="300px"
              overflow="hidden">
              <CardBody>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Heading size="md">Calendar</Heading>
                      <Text color={semantic.text.secondary.light}>Schedule overview</Text>
                    </VStack>
                    <Icon as={BsCalendarWeek} boxSize={8} color={iconColor} />
                  </HStack>
                  <Divider />
                  <Box display="flex" justifyContent="center">
                    <Calendar />
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Documentation Card */}
            <Link href="https://sciencecorp.github.io/galago-docs/" target="_blank">
              <Card
                bg={headerBg}
                shadow="md"
                maxW="300px"
                minW="300px"
                h="205px"
                overflow="hidden"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: hoverBg }}
                transition="all 0.2s"
                cursor="pointer">
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Documentation</Heading>
                        <Text color={semantic.text.secondary.light}>Learn more about Galago</Text>
                      </VStack>
                      <Icon as={FaBookOpen} boxSize={8} color={iconColor} />
                    </HStack>
                    <Divider />
                    <Text fontSize="sm">
                      Explore our comprehensive documentation to learn about Galago&apos;s features,
                      best practices, and get started with automation.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </Link>
          </VStack>

          {/* Dashboard Cards Grid */}
          <SimpleGrid flex="1" columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {/* Tools Card */}
            <Link href="/tools">
              <Card
                bg={headerBg}
                shadow="md"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: hoverBg }}
                transition="all 0.2s"
                cursor="pointer">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Tools</Heading>
                        <Text color={semantic.text.secondary.light}>Connected devices</Text>
                      </VStack>
                      <Icon as={BsTools} boxSize={8} color={iconColor} />
                    </HStack>
                    <Divider />
                    <Stat>
                      <StatLabel>Total Tools</StatLabel>
                      <StatNumber>{toolCount}</StatNumber>
                      <StatHelpText>Active automation tools</StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            </Link>

            {/* Runs Card */}
            <Link href="/runs">
              <Card
                bg={headerBg}
                shadow="md"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: hoverBg }}
                transition="all 0.2s"
                cursor="pointer">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Runs</Heading>
                        <Text color={semantic.text.secondary.light}>Protocol executions</Text>
                      </VStack>
                      <Icon as={FaChartGantt} boxSize={8} color={iconColor} />
                    </HStack>
                    <Divider />
                    <Stat>
                      <StatLabel>Active Runs</StatLabel>
                      <StatNumber>{activeRuns}</StatNumber>
                      <StatHelpText>Total runs: {runCount}</StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            </Link>

            {/* Scripts Card */}
            <Link href="/scripts">
              <Card
                bg={headerBg}
                shadow="md"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: hoverBg }}
                transition="all 0.2s"
                cursor="pointer">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Scripts</Heading>
                        <Text color={semantic.text.secondary.light}>Python automation</Text>
                      </VStack>
                      <Icon as={VscCode} boxSize={8} color={iconColor} />
                    </HStack>
                    <Divider />
                    <Stat>
                      <StatLabel>Total Scripts</StatLabel>
                      <StatNumber>{scriptCount}</StatNumber>
                      <StatHelpText>Python scripts</StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            </Link>

            {/* Workcells Card */}
            <Link href="/workcells">
              <Card
                bg={headerBg}
                shadow="md"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: hoverBg }}
                transition="all 0.2s"
                cursor="pointer">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Workcells</Heading>
                        <Text color={semantic.text.secondary.light}>Automation cells</Text>
                      </VStack>
                      <Icon as={GiChaingun} boxSize={8} color={iconColor} />
                    </HStack>
                    <Divider />
                    <Stat>
                      <StatLabel>Active Workcells</StatLabel>
                      <StatNumber>{workcellCount}</StatNumber>
                      <StatHelpText>Configured automation cells</StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            </Link>

            {/* Protocols Card */}
            <Link href="/protocols">
              <Card
                bg={headerBg}
                shadow="md"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: hoverBg }}
                transition="all 0.2s"
                cursor="pointer">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Protocols</Heading>
                        <Text color={semantic.text.secondary.light}>Automation sequences</Text>
                      </VStack>
                      <Icon as={PiPathBold} boxSize={8} color={iconColor} />
                    </HStack>
                    <Divider />
                    <Stat>
                      <StatLabel>Total Protocols</StatLabel>
                      <StatNumber>{protocolCount}</StatNumber>
                      <StatHelpText>Automation workflows</StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            </Link>

            {/* Inventory Card */}
            <Link href="/inventory">
              <Card
                bg={headerBg}
                shadow="md"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: hoverBg }}
                transition="all 0.2s"
                cursor="pointer">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Inventory</Heading>
                        <Text color={semantic.text.secondary.light}>Lab materials</Text>
                      </VStack>
                      <Icon as={BsBoxSeam} boxSize={8} color={iconColor} />
                    </HStack>
                    <Divider />
                    <Stat>
                      <StatLabel>Total Plates</StatLabel>
                      <StatNumber>{plateCount}</StatNumber>
                      <StatHelpText>Managed lab materials</StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            </Link>

            {/* Labware Card */}
            <Link href="/labware">
              <Card
                bg={headerBg}
                shadow="md"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: hoverBg }}
                transition="all 0.2s"
                cursor="pointer">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Labware</Heading>
                        <Text color={semantic.text.secondary.light}>Lab equipment</Text>
                      </VStack>
                      <Icon as={HiOutlineRectangleStack} boxSize={8} color={iconColor} />
                    </HStack>
                    <Divider />
                    <Stat>
                      <StatLabel>Total Labware</StatLabel>
                      <StatNumber>{labwareCount}</StatNumber>
                      <StatHelpText>Configured equipment</StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            </Link>

            {/* Variables Card */}
            <Link href="/variables">
              <Card
                bg={headerBg}
                shadow="md"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: hoverBg }}
                transition="all 0.2s"
                cursor="pointer">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Variables</Heading>
                        <Text color={semantic.text.secondary.light}>System configuration</Text>
                      </VStack>
                      <Icon as={TbVariable} boxSize={8} color={iconColor} />
                    </HStack>
                    <Divider />
                    <Stat>
                      <StatLabel>Total Variables</StatLabel>
                      <StatNumber>{variableCount}</StatNumber>
                      <StatHelpText>System variables</StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            </Link>

            {/* Logs Card */}
            <Link href="/logs">
              <Card
                bg={headerBg}
                shadow="md"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: hoverBg }}
                transition="all 0.2s"
                cursor="pointer">
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Heading size="md">Logs</Heading>
                        <Text color={semantic.text.secondary.light}>System activity</Text>
                      </VStack>
                      <Icon as={FiBook} boxSize={8} color={iconColor} />
                    </HStack>
                    <Divider />
                    <Stat>
                      <StatLabel>Recent Logs</StatLabel>
                      <StatNumber>{logCount}</StatNumber>
                      <StatHelpText>Latest system events</StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>
            </Link>
          </SimpleGrid>
        </HStack>
      </VStack>
    </Box>
  );
}
