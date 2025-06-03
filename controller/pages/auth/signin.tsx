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
  AbsoluteCenter,
} from "@chakra-ui/react";
import { FaGithub, FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
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
    <Box bg={colors.bgColor} minH="100vh" position="relative" overflow="hidden">
      {/* Subtle background logo */}
      <Box
        position="fixed"
        top="50%"
        left="30%"
        transform="translate(-50%, -50%)"
        zIndex={0}
        opacity={0.06}
        pointerEvents="none"
        width="80vw"
        height="80vh"
        maxWidth="1000px"
        maxHeight="1000px"
        minWidth="600px"
        minHeight="600px"
        color={useColorModeValue("gray.400", "gray.600")}
        filter={useColorModeValue(
          "drop-shadow(0 0 20px rgba(0,0,0,0.1))",
          "drop-shadow(0 0 30px rgba(255,255,255,0.1))",
        )}>
        <svg
          width="100%"
          height="100%"
          viewBox="0, 0, 400,400"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: "100%",
            height: "100%",
          }}>
          <g>
            <path
              d="M177.344 34.209 C 110.220 41.471,50.345 94.627,34.598 160.938 C 11.209 259.431,80.695 347.876,181.445 347.848 C 252.828 347.829,314.655 305.459,348.256 233.534 C 367.701 191.913,374.579 135.505,362.461 117.047 C 350.916 99.460,328.082 101.793,320.435 121.340 L 319.385 124.023 319.104 138.672 C 318.751 157.115,317.865 164.729,314.580 177.539 C 304.928 215.172,280.153 246.887,250.062 260.129 C 242.251 263.566,241.745 262.226,247.346 252.930 C 265.230 223.244,275.078 194.949,278.307 163.976 C 279.091 156.455,279.097 143.805,278.318 139.211 C 275.013 119.705,251.964 112.136,238.871 126.259 C 233.763 131.768,232.579 135.357,231.811 147.656 C 230.122 174.717,224.675 193.235,212.847 212.127 C 205.169 224.391,192.528 238.337,183.938 244.022 L 182.329 245.087 181.541 244.126 C 180.785 243.204,180.763 242.807,181.003 234.570 C 182.086 197.316,181.905 193.312,178.859 187.135 C 171.543 172.298,152.726 169.054,141.209 180.644 C 134.847 187.046,134.388 188.999,133.984 211.431 C 133.419 242.747,133.043 245.301,128.239 250.437 C 121.267 257.891,107.289 255.426,98.798 245.244 C 81.674 224.711,78.112 189.627,90.022 158.811 C 106.113 117.179,144.605 87.983,187.638 84.770 C 208.720 83.196,220.149 64.886,211.279 46.898 C 205.861 35.908,195.936 32.197,177.344 34.209"
              stroke="none"
              fill="currentColor"
              fillRule="evenodd"
            />
          </g>
        </svg>
      </Box>
      <Container maxW="6xl" pt={10} position="relative" zIndex={1}>
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

                <Center my={3} position="relative">
                  <Divider />
                  <Text
                    fontSize="sm"
                    px={2}
                    position="absolute"
                    left="50%"
                    transform="translateX(-50%)">
                    or
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
                          bg="gray.50"
                          color="gray.800"
                          border="1px"
                          borderColor="gray.200"
                          leftIcon={<FcGoogle color="#DB4437" />}
                          onClick={() => handleSocialSignIn("google")}
                          aria-label="Sign in with Google"
                          size="md"
                          _hover={{ bg: "gray.200" }}>
                          Sign in with Google
                        </Button>
                      )}

                      {providers?.github && (
                        <Button
                          width="100%"
                          bg="black"
                          color="white"
                          leftIcon={<FaGithub />}
                          onClick={() => handleSocialSignIn("github")}
                          aria-label="Sign in with GitHub"
                          size="md"
                          _hover={{ bg: "gray.800" }}>
                          Sign in with GitHub
                        </Button>
                      )}
                    </>
                  )}
                </VStack>

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
