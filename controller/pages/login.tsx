import { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { login, error, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to the home page
    if (isAuthenticated) {
      router.push('/');
    }

    document.title = "Login";
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both username and password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    await login(username, password);
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <Container maxW="lg">
      <Center minH="100vh">
        <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" width="100%">
          <VStack spacing={6} align="stretch">
            <Center>
              <Heading mb={6}>Galago Login</Heading>
            </Center>
            
            <form onSubmit={handleSubmit}>
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
                  isLoading={loading}
                  loadingText="Logging in"
                >
                  Login
                </Button>
              </VStack>
            </form>
            
            <Center>
              <Text fontSize="sm" color="gray.500">
                Contact your administrator if you need an account
              </Text>
            </Center>
          </VStack>
        </Box>
      </Center>
    </Container>
  );
} 