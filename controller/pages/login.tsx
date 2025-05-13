import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Center,
  useToast,
  Container,
  InputGroup,
  InputRightElement,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { login, isAuthenticated, loading } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('Already authenticated, redirecting to home');
      router.replace('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Use the custom login hook
      await login(username, password);
      
      // If login succeeds, redirect to home
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid username or password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    try {
      console.log(`Initiating ${provider} login`);
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error(`Error during ${provider} login:`, error);
      toast({
        title: 'Authentication Error',
        description: `Error signing in with ${provider}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  // If already loading auth state or authenticated, show minimal UI
  if (loading || isAuthenticated) {
    return (
      <Container maxW="lg">
        <Center minH="100vh">
          <Spinner size="xl" />
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="lg">
      <Center minH="100vh">
        <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" width="100%">
          <VStack spacing={6} align="stretch">
            <Center>
              <Heading mb={6}>Galago Login</Heading>
            </Center>
            
            <form onSubmit={handleCredentialsSignIn}>
              <VStack spacing={4}>
                <FormControl id="username" isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Enter your username"
                  />
                </FormControl>
                
                <FormControl id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter your password"
                    />
                    <InputRightElement width="4.5rem">
                      <Button h="1.75rem" size="sm" onClick={toggleShowPassword}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                
                <Button 
                  colorScheme="teal" 
                  width="100%" 
                  mt={4} 
                  type="submit" 
                  isLoading={isSubmitting}
                  loadingText="Signing in"
                >
                  Sign In
                </Button>
              </VStack>
            </form>
            
            <Divider my={4} />
            
            <Center>
              <Text mb={2}>Or continue with</Text>
            </Center>
            
            <VStack spacing={4}>
              <Button 
                width="100%" 
                colorScheme="red" 
                leftIcon={<FaGoogle />}
                onClick={() => handleSocialSignIn('google')}
              >
                Sign in with Google
              </Button>
              
              <Button 
                width="100%" 
                colorScheme="gray" 
                leftIcon={<FaGithub />}
                onClick={() => handleSocialSignIn('github')}
              >
                Sign in with GitHub
              </Button>
            </VStack>
          </VStack>
        </Box>
      </Center>
    </Container>
  );
} 