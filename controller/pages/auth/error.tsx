import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  VStack,
  Center,
  Container,
  Icon,
  Button,
} from '@chakra-ui/react';
import { FaExclamationTriangle, FaSignInAlt, FaHome } from 'react-icons/fa';

// Map of error codes to human-readable messages
const errorMessages: Record<string, string> = {
  'Configuration': 'There is a problem with the server configuration.',
  'AccessDenied': 'You do not have permission to sign in.',
  'Verification': 'The verification link may have been used or has expired.',
  'OAuthSignin': 'Error while trying to sign in with OAuth provider.',
  'OAuthCallback': 'Error while handling the OAuth callback.',
  'OAuthCreateAccount': 'Error creating OAuth account.',
  'EmailCreateAccount': 'Error creating email account.',
  'Callback': 'Error during callback processing.',
  'OAuthAccountNotLinked': 'Email already used with a different provider.',
  'EmailSignin': 'Error sending the verification email.',
  'CredentialsSignin': 'The username or password is incorrect.',
  'SessionRequired': 'You must be signed in to access this page.',
  'Default': 'An unknown error occurred during authentication.'
};

export default function ErrorPage() {
  const router = useRouter();
  const { error } = router.query;
  
  const errorCode = typeof error === 'string' ? error : 'Default';
  const errorMessage = errorMessages[errorCode] || errorMessages['Default'];
  
  return (
    <Container maxW="lg">
      <Center minH="100vh">
        <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" width="100%">
          <VStack spacing={8} align="center">
            <Icon as={FaExclamationTriangle} w={20} h={20} color="red.500" />
            
            <Heading size="xl" textAlign="center">Authentication Error</Heading>
            
            <Text fontSize="lg" textAlign="center" color="red.500">
              {errorMessage}
            </Text>
            
            <Text fontSize="md" textAlign="center" color="gray.500">
              Please try again or contact your administrator if the problem persists.
            </Text>
            
            <VStack spacing={4} width="100%">
              <Button
                leftIcon={<FaSignInAlt />}
                colorScheme="blue"
                width="100%"
                onClick={() => router.push('/auth/signin')}
              >
                Try Again
              </Button>
              
              <Button
                leftIcon={<FaHome />}
                variant="outline"
                width="100%"
                onClick={() => router.push('/')}
              >
                Return to Home
              </Button>
            </VStack>
          </VStack>
        </Box>
      </Center>
    </Container>
  );
} 