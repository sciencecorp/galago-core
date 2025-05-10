import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Stack,
  Badge,
  Flex,
  SimpleGrid
} from '@chakra-ui/react';
import { FaKey, FaUser, FaEnvelope, FaSignInAlt } from 'react-icons/fa';
import { DarkModeToggle } from '@/components/ui/ProfileMenu';
import { useCommonColors } from '@/components/ui/Theme';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const colors = useCommonColors();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Loading state while checking session
  if (status === 'loading') {
    return (
      <Container maxW="container.md" mt={10}>
        <Text>Loading profile...</Text>
      </Container>
    );
  }

  // If no session, don't render anything (will redirect in useEffect)
  if (!session?.user) {
    return null;
  }
  
  const userName = session.user.name || session.user.email?.split('@')[0] || 'User';
  const userImage = session.user.image;
  const provider = session.provider || 'Username/Password';
  
  return (
    <Container maxW="container.md" mt={10}>
      <VStack spacing={8} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="xl">User Profile</Heading>
          <DarkModeToggle />
        </Flex>
        
        <Card bg={colors.cardBg} shadow="md">
          <CardHeader>
            <HStack spacing={6}>
              <Avatar 
                size="xl" 
                name={userName} 
                src={userImage || undefined} 
                bg="teal.500"
              />
              <VStack align="start" spacing={2}>
                <Heading size="lg">{userName}</Heading>
                <HStack>
                  <Badge colorScheme={session.isAdmin ? 'purple' : 'teal'}>
                    {session.isAdmin ? 'Admin' : 'User'}
                  </Badge>
                  <Badge colorScheme="blue">
                    {provider}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          </CardHeader>
          <Divider />
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Text fontWeight="bold" mb={2}>Basic Information</Text>
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Box as={FaUser} color="gray.500" />
                    <Text>Username: {userName}</Text>
                  </HStack>
                  <HStack>
                    <Box as={FaEnvelope} color="gray.500" />
                    <Text>Email: {session.user.email}</Text>
                  </HStack>
                  <HStack>
                    <Box as={FaSignInAlt} color="gray.500" />
                    <Text>Login Method: {provider}</Text>
                  </HStack>
                </VStack>
              </Box>
              
              <Box>
                <Text fontWeight="bold" mb={2}>Account Options</Text>
                <VStack align="start" spacing={4}>
                  {provider === 'Username/Password' && (
                    <Button colorScheme="teal" size="sm" leftIcon={<FaKey />}>
                      Change Password
                    </Button>
                  )}
                  <Button colorScheme="blue" size="sm">
                    Edit Profile
                  </Button>
                </VStack>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
        
        {session.isAdmin && (
          <Box mt={6}>
            <Heading size="md" mb={4}>Admin Options</Heading>
            <Button 
              colorScheme="purple" 
              onClick={() => router.push('/settings')}
            >
              Go to Admin Settings
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
} 