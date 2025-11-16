import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Button,
  HStack,
  VStack,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  useToast,
  Spinner,
  Center,
  Icon,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { Search, Download, FileText, Workflow, Grid, Layers } from 'lucide-react';
import { trpc } from '@/utils/trpc';

const typeIcons = {
  script: FileText,
  template: Layers,
  workcell: Grid,
  workflow: Workflow
};

const typeColors = {
  script: "blue",
  template: "green",
  workcell: "purple",
  workflow: "orange"
};

export default function GalagoRegistryBrowser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const toast = useToast();

  const { data: registry, isLoading, error, refetch } = trpc.registry.getRegistry.useQuery();
  const { data: allTags = [] } = trpc.registry.getTags.useQuery();

  const downloadMutation = trpc.registry.downloadItem.useMutation({
    onSuccess: (data) => {
      let blob;
      let filename;
      
      if (data.contentType === 'json') {
        blob = new Blob([JSON.stringify(data.content, null, 2)], { 
          type: 'application/json' 
        });
        filename = `${data.item.name}.json`;
      } else {
        // Text content (Python, JavaScript, C#, etc.)
        blob = new Blob([data.content], { 
          type: 'text/plain' 
        });
        // Get file extension from download URL
        const ext = data.item.downloadUrl.split('.').pop() || 'txt';
        filename = `${data.item.name}.${ext}`;
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `Downloading ${data.item.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error.message || "Could not download the file. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleDownload = async (itemId: string) => {
    downloadMutation.mutate(itemId);
  };

  // Client-side filtering (could also use the searchRegistry endpoint)
  const filteredItems = useMemo(() => {
    if (!registry?.items) return [];
    
    return registry.items.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesTag = tagFilter === "all" || item.tags.includes(tagFilter);
      
      return matchesSearch && matchesType && matchesTag;
    });
  }, [registry, searchTerm, typeFilter, tagFilter]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Loading Galago Registry...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Text fontSize="xl" color="red.500">Error loading registry</Text>
          <Text color="gray.600">{error.message}</Text>
          <Button onClick={() => refetch()}>Retry</Button>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="2xl" mb={2}>
              Galago Registry
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Discover and download scripts, workflows, templates, and workcells for your lab automation
            </Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Last updated: {registry?.lastUpdated ? new Date(registry.lastUpdated).toLocaleDateString() : 'N/A'}
            </Text>
          </Box>

          {/* Filters */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={Search} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search scripts, workflows, templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <HStack spacing={4}>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    flex={1}
                  >
                    <option value="all">All Types</option>
                    <option value="script">Scripts</option>
                    <option value="workflow">Workflows</option>
                    <option value="template">Templates</option>
                    <option value="workcell">Workcells</option>
                  </Select>

                  <Select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    flex={1}
                  >
                    <option value="all">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </Select>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Results count */}
          <Flex justify="space-between" align="center">
            <Text color="gray.600">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
            </Text>
            {(searchTerm || typeFilter !== "all" || tagFilter !== "all") && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setTagFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </Flex>

          {/* Items grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredItems.map((item) => {
              const TypeIcon = typeIcons[item.type];
              return (
                <Card
                  key={item.id}
                  variant="outline"
                  _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                >
                  <CardHeader pb={2}>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={TypeIcon} color={`${typeColors[item.type]}.500`} boxSize={5} />
                          <Badge colorScheme={typeColors[item.type]} fontSize="xs">
                            {item.type}
                          </Badge>
                        </HStack>
                        {item.featured && (
                          <Badge colorScheme="yellow" fontSize="xs">Featured</Badge>
                        )}
                      </HStack>
                      <Heading size="md" color="gray.800">
                        {item.name}
                      </Heading>
                    </VStack>
                  </CardHeader>

                  <CardBody pt={2}>
                    <VStack align="stretch" spacing={3}>
                      <Text fontSize="sm" color="gray.600" noOfLines={3}>
                        {item.description}
                      </Text>

                      <Divider />

                      <HStack justify="space-between" fontSize="xs" color="gray.500">
                        <Text>v{item.version}</Text>
                        <Text>{item.compatibility}</Text>
                      </HStack>

                      <Wrap>
                        {item.tags.map(tag => (
                          <WrapItem key={tag}>
                            <Tag size="sm" colorScheme="gray" variant="subtle">
                              <TagLabel>{tag}</TagLabel>
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>

                      <Text fontSize="xs" color="gray.500">
                        By {item.author}
                      </Text>
                    </VStack>
                  </CardBody>

                  <CardFooter pt={0}>
                    <Button
                      leftIcon={<Icon as={Download} />}
                      colorScheme="blue"
                      size="sm"
                      width="full"
                      onClick={() => handleDownload(item.id)}
                      isLoading={downloadMutation.isLoading}
                    >
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </SimpleGrid>

          {filteredItems.length === 0 && (
            <Center py={12}>
              <VStack spacing={3}>
                <Text fontSize="xl">
                  No items found
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Try adjusting your filters or search term
                </Text>
              </VStack>
            </Center>
          )}
        </VStack>
      </Container>
    </Box>
  );
}