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
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  Checkbox,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FaGoogle, FaGithub, FaUser } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

// Sign in component supporting multiple authentication methods
export default function SignIn({ providers, csrfToken }: { providers: any, csrfToken: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<{username?: string, password?: string}>({});
  const router = useRouter();
  const toast = useToast();
  const { callbackUrl, error } = router.query;
  const { login, socialLogin, isAuthenticated, loading } = useAuth();

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const redirectUrl = callbackUrl ? (callbackUrl as string) : '/';
      console.log(`Already authenticated, redirecting to ${redirectUrl}`);
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, loading, router, callbackUrl]);

  // Debug providers
  useEffect(() => {
    console.log("Available providers:", providers ? Object.keys(providers).join(', ') : 'none');
  }, [providers]);

  // Handle error messages with more specific details
  useEffect(() => {
    if (error) {
      let message = 'An authentication error occurred';
      
      // Map common error codes to user-friendly messages
      switch (error) {
        case 'CredentialsSignin':
          message = 'Invalid username or password. Please try again.';
          break;
        case 'OAuthSignin':
          message = 'Error starting social login. Please try another method.';
          break;
        case 'OAuthCallback':
          message = 'Error during social login callback. Please try again later.';
          break;
        case 'OAuthCreateAccount':
          message = 'Error creating account with social provider.';
          break;
        case 'EmailCreateAccount':
          message = 'Error creating account with email.';
          break;
        case 'Callback':
          message = 'Error during authentication callback.';
          break;
        case 'AccessDenied':
          message = 'Access denied. You may not have permission to sign in.';
          break;
        case 'AccountLocked':
          message = 'Your account has been locked. Please contact an administrator.';
          break;
        default:
          message = `Error: ${error}`;
      }
      
      setErrorMessage(message);
    }
  }, [error]);

  const validateForm = () => {
    const errors: {username?: string, password?: string} = {};
    let isValid = true;
    
    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }
    
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Use the custom login hook which supports both auth systems
      const result = await login(username, password, csrfToken, rememberMe);
      
      if (!result.success) {
        // Handle specific error cases from the backend
        if (result.error === 'locked') {
          setErrorMessage('Your account has been locked due to multiple failed attempts');
        } else if (result.error === 'expired') {
          setErrorMessage('Your credentials have expired. Please reset your password');
        } else if (result.error === 'inactive') {
          setErrorMessage('Your account is inactive. Please contact an administrator');
        } else {
          setErrorMessage(result.message || 'Invalid username or password');
        }
        return;
      }
      
      // If login succeeds, redirect to callback URL or home
      const redirectUrl = callbackUrl ? (callbackUrl as string) : '/';
      console.log(`Login successful, redirecting to ${redirectUrl}`);
      router.push(redirectUrl);
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    try {
      console.log(`Starting social login with ${provider}`);
      await socialLogin(provider);
    } catch (error) {
      console.error(`Error during ${provider} login:`, error);
      setErrorMessage(`Could not sign in with ${provider}. Please try again later.`);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleForgotPassword = () => {
    router.push('/auth/reset-password');
  };

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
              <Heading mb={6}>Galago Sign In</Heading>
            </Center>
            
            {errorMessage && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                <AlertDescription>{errorMessage}</AlertDescription>
                <CloseButton 
                  position="absolute" 
                  right="8px" 
                  top="8px" 
                  onClick={() => setErrorMessage('')}
                />
              </Alert>
            )}
            
            <form onSubmit={handleCredentialsSignIn}>
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <VStack spacing={4}>
                <FormControl id="username" isRequired isInvalid={!!formErrors.username}>
                  <FormLabel>Username</FormLabel>
                  <Input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Enter your username"
                    aria-label="Username"
                    onBlur={() => validateForm()}
                  />
                  {formErrors.username && (
                    <FormErrorMessage>{formErrors.username}</FormErrorMessage>
                  )}
                </FormControl>
                
                <FormControl id="password" isRequired isInvalid={!!formErrors.password}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter your password"
                      aria-label="Password"
                      onBlur={() => validateForm()}
                    />
                    <InputRightElement width="4.5rem">
                      <Button 
                        h="1.75rem" 
                        size="sm" 
                        onClick={toggleShowPassword}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {formErrors.password && (
                    <FormErrorMessage>{formErrors.password}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl>
                  <HStack justifyContent="space-between" width="100%">
                    <Checkbox 
                      isChecked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)}
                      aria-label="Remember me"
                    >
                      Remember me
                    </Checkbox>
                    {/* <Button 
                      variant="link" 
                      colorScheme="teal" 
                      size="sm"
                      onClick={handleForgotPassword}
                      aria-label="Forgot password"
                    >
                      Forgot password?
                    </Button> */}
                  </HStack>
                </FormControl>
                
                <Button 
                  colorScheme="teal" 
                  width="100%" 
                  mt={4} 
                  type="submit" 
                  isLoading={isSubmitting}
                  loadingText="Signing in"
                  aria-label="Sign in"
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
              {!providers || Object.keys(providers).length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Social login options are currently unavailable
                </Text>
              ) : (
                <>
                  {providers?.google && (
                    <Button 
                      width="100%" 
                      colorScheme="red" 
                      leftIcon={<FaGoogle />}
                      onClick={() => handleSocialSignIn('google')}
                      aria-label="Sign in with Google"
                    >
                      Sign in with Google
                    </Button>
                  )}
                  
                  {providers?.github && (
                    <Button 
                      width="100%" 
                      colorScheme="gray" 
                      leftIcon={<FaGithub />}
                      onClick={() => handleSocialSignIn('github')}
                      aria-label="Sign in with GitHub"
                    >
                      Sign in with GitHub
                    </Button>
                  )}
                </>
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
      console.log("CSRF token fetched:", csrfToken ? "success" : "null");
    } catch (csrfError) {
      console.error("Error fetching CSRF token:", csrfError);
      csrfToken = null;
    }
    
    return {
      props: { 
        providers: providers || {}, 
        csrfToken: csrfToken || "" 
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: { providers: {}, csrfToken: "" },
    };
  }
} 