import { useState } from 'react';
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
  Container,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  FormErrorMessage,
  Link,
  useToast,
} from '@chakra-ui/react';
import { authAxios } from '../../hooks/useAuth';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();
  const toast = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!validateEmail(email)) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      await authAxios.post('/auth/reset-password', { email });
      
      // Show success message
      setSuccessMessage('Password reset instructions have been sent to your email');
      setEmail(''); // Clear the form
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.response?.status === 404) {
        setErrorMessage('No account found with that email address');
      } else {
        setErrorMessage('Failed to request password reset. Please try again later');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/signin');
  };

  return (
    <Container maxW="lg">
      <Center minH="100vh">
        <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" width="100%">
          <VStack spacing={6} align="stretch">
            <Center>
              <Heading mb={6}>Reset Password</Heading>
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
            
            {successMessage ? (
              <VStack spacing={6} align="stretch">
                <Alert status="success" mb={4} borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
                
                <Text textAlign="center">
                  Please check your email for instructions to reset your password.
                  The link in the email will expire in 1 hour.
                </Text>
                
                <Button 
                  colorScheme="teal" 
                  mt={4} 
                  onClick={handleBackToLogin}
                  aria-label="Back to sign in"
                >
                  Back to Sign In
                </Button>
              </VStack>
            ) : (
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <Text>
                    Enter your email address and we'll send you instructions to reset your password.
                  </Text>
                  
                  <FormControl id="email" isRequired isInvalid={!!emailError}>
                    <FormLabel>Email</FormLabel>
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Enter your email address"
                      aria-label="Email"
                      onBlur={() => validateEmail(email)}
                    />
                    {emailError && (
                      <FormErrorMessage>{emailError}</FormErrorMessage>
                    )}
                  </FormControl>
                  
                  <Button 
                    colorScheme="teal" 
                    width="100%" 
                    mt={4} 
                    type="submit" 
                    isLoading={isSubmitting}
                    loadingText="Submitting"
                    aria-label="Reset password"
                  >
                    Request Password Reset
                  </Button>
                  
                  <Center>
                    <Text>
                      Remember your password?{' '}
                      <Link color="teal.500" onClick={handleBackToLogin}>
                        Sign In
                      </Link>
                    </Text>
                  </Center>
                </VStack>
              </form>
            )}
          </VStack>
        </Box>
      </Center>
    </Container>
  );
} 