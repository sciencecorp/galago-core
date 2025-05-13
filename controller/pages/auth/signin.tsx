import { useState, useEffect } from "react";
import { signIn, getProviders, getCsrfToken } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
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
  Grid,
  GridItem,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaGoogle, FaGithub, FaUser } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useCommonColors, useTextColors } from "../../components/ui/Theme";

// Sign in component supporting multiple authentication methods
export default function SignIn({ providers, csrfToken }: { providers: any; csrfToken: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<{ username?: string; password?: string }>({});
  const router = useRouter();
  const toast = useToast();
  const { callbackUrl, error } = router.query;
  const { login, socialLogin, isAuthenticated, loading } = useAuth();

  // Use theme hooks instead of local color definitions
  const colors = useCommonColors();
  const textColors = useTextColors();
  const logoFilter = useColorModeValue("none", "invert(1)");

  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const redirectUrl = callbackUrl ? (callbackUrl as string) : "/";
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, loading, router, callbackUrl]);

  // Handle error messages with more specific details
  useEffect(() => {
    if (error) {
      let message = "An authentication error occurred";

      // Map common error codes to user-friendly messages
      switch (error) {
        case "CredentialsSignin":
          message = "Invalid username or password. Please try again.";
          break;
        case "OAuthSignin":
          message = "Error starting social login. Please try another method.";
          break;
        case "OAuthCallback":
          message = "Error during social login callback. Please try again later.";
          break;
        case "OAuthCreateAccount":
          message = "Error creating account with social provider.";
          break;
        case "EmailCreateAccount":
          message = "Error creating account with email.";
          break;
        case "Callback":
          message = "Error during authentication callback.";
          break;
        case "AccessDenied":
          message = "Access denied. You may not have permission to sign in.";
          break;
        case "AccountLocked":
          message = "Your account has been locked. Please contact an administrator.";
          break;
        default:
          message = `Error: ${error}`;
      }

      setErrorMessage(message);
    }
  }, [error]);

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    let isValid = true;

    if (!username.trim()) {
      errors.username = "Username is required";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Use the custom login hook which supports both auth systems
      const result = await login(username, password, csrfToken, rememberMe);

      if (!result.success) {
        // Handle specific error cases from the backend
        if (result.error === "locked") {
          setErrorMessage("Your account has been locked due to multiple failed attempts");
        } else if (result.error === "expired") {
          setErrorMessage("Your credentials have expired. Please reset your password");
        } else if (result.error === "inactive") {
          setErrorMessage("Your account is inactive. Please contact an administrator");
        } else {
          setErrorMessage(result.message || "Invalid username or password");
        }
        return;
      }

      // If login succeeds, redirect to callback URL or home
      const redirectUrl = callbackUrl ? (callbackUrl as string) : "/";
      router.push(redirectUrl);
    } catch (error) {
      setErrorMessage("Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    try {
      await socialLogin(provider);
    } catch (error) {
      setErrorMessage(`Could not sign in with ${provider}. Please try again later.`);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleForgotPassword = () => {
    router.push("/auth/reset-password");
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
    <Box bg={colors.bgColor} minH="100vh">
      <Container maxW="6xl" pt={10}>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1.5fr" }} gap={10}>
          <GridItem
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems={{ base: "center", md: "flex-start" }}>
            <VStack spacing={6} align={{ base: "center", md: "flex-start" }} mb={8}>
              <Flex direction="column" align={{ base: "center", md: "flex-start" }}>
                <Heading
                  size="4xl"
                  mt={6}
                  color={textColors.accent}
                  lineHeight="1.1"
                  fontWeight="extrabold"
                  fontFamily="'Inter', 'Montserrat', sans-serif"
                  letterSpacing="-0.05em">
                  Galago
                </Heading>
                <VStack mt={4} spacing={1} align={{ base: "center", md: "flex-start" }}>
                  <Text
                    style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                    color={textColors.secondary}>
                    Connect your tools
                  </Text>
                  <Text
                    style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                    color={textColors.secondary}>
                    and start automating
                  </Text>
                </VStack>
              </Flex>
            </VStack>
          </GridItem>

          <GridItem
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            pt={{ base: 6, md: 10 }}>
            <Box
              p={4}
              borderWidth={1}
              borderRadius="xl"
              boxShadow="xl"
              bg={colors.cardBg}
              borderColor={colors.borderColor}
              width="100%"
              maxW="500px"
              mt={{ base: 4, md: 100 }}
              mr={{ base: 0, md: 6 }}>
              <VStack spacing={3} align="stretch">
                {errorMessage && (
                  <Alert status="error" mb={2} borderRadius="md" size="sm">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">{errorMessage}</AlertDescription>
                    <CloseButton
                      position="absolute"
                      right="8px"
                      top="8px"
                      onClick={() => setErrorMessage("")}
                    />
                  </Alert>
                )}

                <form onSubmit={handleCredentialsSignIn}>
                  <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
                  <VStack spacing={2}>
                    <FormControl id="username" isRequired isInvalid={!!formErrors.username}>
                      <FormLabel fontSize="sm">Username</FormLabel>
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        aria-label="Username"
                        onBlur={() => validateForm()}
                        size="md"
                        _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
                      />
                      {formErrors.username && (
                        <FormErrorMessage fontSize="xs">{formErrors.username}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl id="password" isRequired isInvalid={!!formErrors.password}>
                      <FormLabel fontSize="sm">Password</FormLabel>
                      <InputGroup size="md">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          aria-label="Password"
                          onBlur={() => validateForm()}
                          _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
                        />
                        <InputRightElement width="4.5rem">
                          <Button
                            h="1.5rem"
                            size="xs"
                            onClick={toggleShowPassword}
                            aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? "Hide" : "Show"}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      {formErrors.password && (
                        <FormErrorMessage fontSize="xs">{formErrors.password}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl>
                      <HStack justifyContent="space-between" width="100%" mt={1}>
                        <Checkbox
                          isChecked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          aria-label="Remember me"
                          colorScheme="teal"
                          size="sm">
                          <Text fontSize="sm">Remember me</Text>
                        </Checkbox>
                      </HStack>
                    </FormControl>

                    <Button
                      colorScheme="teal"
                      width="100%"
                      mt={3}
                      type="submit"
                      isLoading={isSubmitting}
                      loadingText="Signing in"
                      aria-label="Sign in"
                      size="md"
                      _hover={{ bg: "teal.500" }}
                      _active={{ bg: "teal.600" }}>
                      Sign In
                    </Button>
                  </VStack>
                </form>

                <Divider my={3} />

                <Center>
                  <Text mb={1} fontSize="sm">
                    Or continue with
                  </Text>
                </Center>

                <VStack spacing={2}>
                  {!providers || Object.keys(providers).length === 0 ? (
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      Social login options are currently unavailable
                    </Text>
                  ) : (
                    <>
                      {providers?.google && (
                        <Button
                          width="100%"
                          colorScheme="red"
                          leftIcon={<FaGoogle />}
                          onClick={() => handleSocialSignIn("google")}
                          aria-label="Sign in with Google"
                          size="md">
                          Sign in with Google
                        </Button>
                      )}

                      {providers?.github && (
                        <Button
                          width="100%"
                          colorScheme="gray"
                          leftIcon={<FaGithub />}
                          onClick={() => handleSocialSignIn("github")}
                          aria-label="Sign in with GitHub"
                          size="md">
                          Sign in with GitHub
                        </Button>
                      )}
                    </>
                  )}
                </VStack>

                <Center mt={1}>
                  <Text fontSize="xs" color="gray.500">
                    Contact your administrator if you need an account
                  </Text>
                </Center>

                <Center mt={1}>
                  <Text fontSize="sm">
                    Don&apos;t have an account?{" "}
                    <Link color="teal.500" onClick={() => router.push("/auth/signup")}>
                      Sign Up
                    </Link>
                  </Text>
                </Center>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
}

// Server-side rendering to get available providers
export async function getServerSideProps(context: any) {
  try {
    let providers;
    try {
      providers = await getProviders();
    } catch (providerError) {
      providers = {};
    }

    let csrfToken;
    try {
      csrfToken = await getCsrfToken(context);
    } catch (csrfError) {
      csrfToken = null;
    }

    return {
      props: {
        providers: providers || {},
        csrfToken: csrfToken || "",
      },
    };
  } catch (error) {
    return {
      props: { providers: {}, csrfToken: "" },
    };
  }
}
