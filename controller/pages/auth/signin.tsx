import { useState, useEffect } from 'react';
import { signIn, getProviders, getCsrfToken } from 'next-auth/react';
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
  HStack,
  Link,
} from '@chakra-ui/react';
import { FaGoogle, FaGithub, FaUser } from 'react-icons/fa';

// Sign in component supporting multiple authentication methods
export default function SignIn({ providers, csrfToken }: { providers: any, csrfToken: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { callbackUrl, error } = router.query;

  useEffect(() => {
    if (error) {
      toast({
        title: 'Authentication Error',
        description: error === 'CredentialsSignin' 
          ? 'Invalid username or password' 
          : `Error: ${error}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
        callbackUrl: callbackUrl as string || '/'
      });
      
      if (result?.error) {
        toast({
          title: 'Error',
          description: 'Invalid username or password',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during sign-in',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <Container maxW="lg">
      <Center minH="100vh">
        <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" width="100%">
          <VStack spacing={6} align="stretch">
            <Center>
              <Heading mb={6}>Galago Sign In</Heading>
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
              {providers?.google && (
                <Button 
                  width="100%" 
                  colorScheme="red" 
                  leftIcon={<FaGoogle />}
                  onClick={() => signIn('google', { callbackUrl: callbackUrl as string || '/' })}
                >
                  Sign in with Google
                </Button>
              )}
              
              {providers?.github && (
                <Button 
                  width="100%" 
                  colorScheme="gray" 
                  leftIcon={<FaGithub />}
                  onClick={() => signIn('github', { callbackUrl: callbackUrl as string || '/' })}
                >
                  Sign in with GitHub
                </Button>
              )}
            </VStack>
            
            <Center>
              <Text fontSize="sm" color="gray.500">
                Contact your administrator if you need an account
              </Text>
            </Center>
            
            <Center mt={4}>
              <Text>
                Don't have an account?{' '}
                <Link color="teal.500" onClick={() => router.push('/auth/signup')}>
                  Sign Up
                </Link>
              </Text>
            </Center>
          </VStack>
        </Box>
      </Center>
    </Container>
  );
}

// Server-side rendering to get available providers
export async function getServerSideProps(context: any) {
  try {
    console.log("Fetching providers for signin page...");
    
    let providers;
    try {
      providers = await getProviders();
      console.log("Providers loaded:", providers ? Object.keys(providers || {}).join(", ") : "none");
    } catch (providerError) {
      console.error("Error fetching providers:", providerError);
      providers = {};
    }
    
    let csrfToken;
    try {
      csrfToken = await getCsrfToken(context);
    } catch (csrfError) {
      console.error("Error fetching CSRF token:", csrfError);
      csrfToken = null;
    }
    
    return {
      props: { 
        providers: providers || {}, 
        csrfToken: csrfToken || null 
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: { providers: {}, csrfToken: null },
    };
  }
} 