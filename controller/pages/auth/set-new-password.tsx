import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  InputGroup,
  InputRightElement,
  Link,
  useToast,
  Progress,
  useColorModeValue,
} from "@chakra-ui/react";
import { authAxios } from "../../hooks/useAuth";

export default function SetNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formErrors, setFormErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    // Get token from query params
    const { token: resetToken } = router.query;
    if (resetToken && typeof resetToken === "string") {
      setToken(resetToken);
    } else if (router.isReady && !resetToken) {
      // No token in URL, redirect to reset password page
      setErrorMessage("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [router.query, router.isReady]);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;

    let strength = 0;

    // Length
    if (password.length >= 8) strength += 25;

    // Has lowercase
    if (/[a-z]/.test(password)) strength += 25;

    // Has uppercase
    if (/[A-Z]/.test(password)) strength += 25;

    // Has number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;

    return strength;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));

    // Clear any existing error
    if (formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: undefined }));
    }

    // If confirm password already has a value, check match
    if (confirmPassword) {
      validatePasswordMatch(newPassword, confirmPassword);
    }
  };

  const validatePasswordMatch = (pwd: string, confirmPwd: string) => {
    if (pwd !== confirmPwd) {
      setFormErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return false;
    } else {
      setFormErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      return true;
    }
  };

  const validatePassword = () => {
    const errors: { password?: string; confirmPassword?: string } = {};
    let isValid = true;

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (passwordStrength < 75) {
      errors.password =
        "Password is too weak. Include uppercase, lowercase, and numbers or symbols.";
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    if (!validatePassword()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await authAxios.post("/auth/set-new-password", {
        token,
        password,
        confirm_password: confirmPassword,
      });

      // Show success message
      setSuccessMessage("Your password has been successfully reset");
      setPassword("");
      setConfirmPassword("");

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      if (error.response?.status === 400) {
        setErrorMessage(error.response.data?.detail || "Invalid or expired token");
      } else {
        setErrorMessage("Failed to reset password. Please try again later");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "red.500";
    if (passwordStrength < 50) return "orange.500";
    if (passwordStrength < 75) return "yellow.500";
    return "green.500";
  };

  const handleBackToLogin = () => {
    router.push("/auth/signin");
  };

  return (
    <Box minH="100vh" position="relative" overflow="hidden">
      {/* Subtle background logo */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={0}
        opacity={0.03}
        pointerEvents="none"
        width="800px"
        height="800px"
        backgroundImage="url('/site_logo.svg')"
        backgroundSize="contain"
        backgroundRepeat="no-repeat"
        backgroundPosition="center"
        filter={useColorModeValue("none", "invert(1)")}
      />
      <Container maxW="lg" position="relative" zIndex={1}>
        <Center minH="100vh">
          <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" width="100%">
            <VStack spacing={6} align="stretch">
              <Center>
                <Heading mb={6}>Set New Password</Heading>
              </Center>

              {errorMessage && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{errorMessage}</AlertDescription>
                  <CloseButton
                    position="absolute"
                    right="8px"
                    top="8px"
                    onClick={() => setErrorMessage("")}
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
                    Your password has been successfully reset. You will be redirected to the sign in
                    page in a few seconds.
                  </Text>

                  <Button
                    colorScheme="teal"
                    mt={4}
                    onClick={handleBackToLogin}
                    aria-label="Back to sign in">
                    Back to Sign In
                  </Button>
                </VStack>
              ) : (
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <Text>Create a new password for your account.</Text>

                    <FormControl id="password" isRequired isInvalid={!!formErrors.password}>
                      <FormLabel>New Password</FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={handlePasswordChange}
                          placeholder="Enter new password"
                          aria-label="New password"
                        />
                        <InputRightElement width="4.5rem">
                          <Button
                            h="1.75rem"
                            size="sm"
                            onClick={toggleShowPassword}
                            aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? "Hide" : "Show"}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      {password && (
                        <Box mt={2}>
                          <Text fontSize="xs" mb={1}>
                            Password strength:
                          </Text>
                          <Progress
                            value={passwordStrength}
                            size="sm"
                            colorScheme={
                              passwordStrength < 25
                                ? "red"
                                : passwordStrength < 50
                                  ? "orange"
                                  : passwordStrength < 75
                                    ? "yellow"
                                    : "green"
                            }
                            borderRadius="md"
                          />
                        </Box>
                      )}
                      {formErrors.password && (
                        <FormErrorMessage>{formErrors.password}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl
                      id="confirmPassword"
                      isRequired
                      isInvalid={!!formErrors.confirmPassword}>
                      <FormLabel>Confirm Password</FormLabel>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          validatePasswordMatch(password, e.target.value);
                        }}
                        placeholder="Confirm new password"
                        aria-label="Confirm password"
                      />
                      {formErrors.confirmPassword && (
                        <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
                      )}
                    </FormControl>

                    <Button
                      colorScheme="teal"
                      width="100%"
                      mt={4}
                      type="submit"
                      isLoading={isSubmitting}
                      loadingText="Submitting"
                      aria-label="Set new password"
                      isDisabled={!token}>
                      Set New Password
                    </Button>

                    <Center>
                      <Text>
                        Remember your password?{" "}
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
    </Box>
  );
}
