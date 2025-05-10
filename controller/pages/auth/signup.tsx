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
  Link,
  FormHelperText,
} from '@chakra-ui/react';
import { FaUser, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { authAxios } from '@/hooks/useAuth';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { callbackUrl } = router.query;

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create user account
      const response = await authAxios.post('/users', {
        username,
        email,
        password,
        is_admin: false, // Regular users are not admins by default
      });
      
      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Account created',
          description: 'Your account has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Auto sign-in after account creation
        const signInResult = await signIn('credentials', {
          username,
          password,
          redirect: false,
          callbackUrl: callbackUrl as string || '/'
        });
        
        if (signInResult?.error) {
          toast({
            title: 'Error',
            description: 'Account created but unable to sign in automatically',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          router.push('/auth/signin');
        } else if (signInResult?.url) {
          router.push(signInResult.url);
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to create account';
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="lg">
      <Center minH="100vh">
        <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" width="100%">
          <VStack spacing={6} align="stretch">
            <Center>
              <Heading mb={6}>Create Your Galago Account</Heading>
            </Center>
            
            <form onSubmit={handleSignUp}>
              <VStack spacing={4}>
                <FormControl id="username" isRequired>
                  <FormLabel>Username</FormLabel>
                  <InputGroup>
                    <Input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder="Choose a username"
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl id="email" isRequired>
                  <FormLabel>Email</FormLabel>
                  <InputGroup>
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Enter your email"
                    />
                  </InputGroup>
                </FormControl>
                
                <FormControl id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Create a password"
                    />
                    <InputRightElement width="4.5rem">
                      <Button h="1.75rem" size="sm" onClick={toggleShowPassword}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormHelperText>Password must be at least 8 characters long</FormHelperText>
                </FormControl>
                
                <FormControl id="confirmPassword" isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Confirm your password"
                  />
                </FormControl>
                
                <Button 
                  colorScheme="teal" 
                  width="100%" 
                  mt={6} 
                  type="submit" 
                  isLoading={isSubmitting}
                  loadingText="Creating Account"
                >
                  Sign Up
                </Button>
              </VStack>
            </form>
            
            <Center>
              <Text>
                Already have an account?{' '}
                <Link color="teal.500" onClick={() => router.push('/auth/signin')}>
                  Sign In
                </Link>
              </Text>
            </Center>
          </VStack>
        </Box>
      </Center>
    </Container>
  );
} 