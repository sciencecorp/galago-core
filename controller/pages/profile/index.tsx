import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Stack,
  Badge,
  Flex,
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react";
import { FaKey, FaUser, FaEnvelope, FaSignInAlt } from "react-icons/fa";
import { useCommonColors } from "@/components/ui/Theme";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const { user: customAuthUser, loading: customAuthLoading } = useAuth();
  const router = useRouter();
  const colors = useCommonColors();

  // Determine the active authentication system
  const isNextAuthActive = nextAuthStatus === "authenticated" && !!nextAuthSession?.user;
  const isCustomAuthActive = !!customAuthUser;
  const isAuthenticated = isNextAuthActive || isCustomAuthActive;
  const isLoading = (nextAuthStatus === "loading" || customAuthLoading) && !isAuthenticated;

  useEffect(() => {
    // If definitely not authenticated (both systems checked), redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  // Extract user information from active auth system
  const userName = isNextAuthActive
    ? nextAuthSession?.user?.name || nextAuthSession?.user?.email?.split("@")[0] || "User"
    : customAuthUser?.username || customAuthUser?.email?.split("@")[0] || "User";

  const userEmail = isNextAuthActive ? nextAuthSession?.user?.email : customAuthUser?.email;

  const userImage = isNextAuthActive ? nextAuthSession?.user?.image : undefined;

  const isAdmin = isNextAuthActive ? !!nextAuthSession?.isAdmin : !!customAuthUser?.is_admin;

  const authProvider = isNextAuthActive
    ? nextAuthSession?.provider || "NextAuth"
    : "Username/Password";

  // Loading state while checking session
  if (isLoading) {
    return (
      <Container maxW="container.md" mt={10}>
        <VStack spacing={8} align="stretch">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading as="h1" size="xl">
              User Profile
            </Heading>
          </Flex>

          <Card bg={colors.cardBg} shadow="md">
            <CardHeader>
              <HStack spacing={6}>
                <Skeleton height="96px" width="96px" borderRadius="full" />
                <VStack align="start" spacing={2} width="100%">
                  <Skeleton height="32px" width="200px" />
                  <Skeleton height="20px" width="120px" />
                </VStack>
              </HStack>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Skeleton height="24px" />
                <Skeleton height="24px" />
                <Skeleton height="24px" />
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    );
  }

  // If no authenticated user, don't render anything (will redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxW="container.md" mt={10}>
      <VStack spacing={8} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="xl">
            User Profile
          </Heading>
        </Flex>

        <Card bg={colors.cardBg} shadow="md">
          <CardHeader>
            <HStack spacing={6}>
              <Avatar size="xl" name={userName} src={userImage || undefined} bg="teal.500" />
              <VStack align="start" spacing={2}>
                <Heading size="lg">{userName}</Heading>
                <HStack>
                  <Badge colorScheme={isAdmin ? "purple" : "teal"}>
                    {isAdmin ? "Admin" : "User"}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          </CardHeader>
          <Divider />
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <Box as={FaUser} color="gray.500" />
                <Text fontWeight="bold" width="100px">
                  Username:
                </Text>
                <Text>{userName}</Text>
              </HStack>

              <HStack>
                <Box as={FaEnvelope} color="gray.500" />
                <Text fontWeight="bold" width="100px">
                  Email:
                </Text>
                <Text>{userEmail}</Text>
              </HStack>

              <HStack>
                <Box as={FaKey} color="gray.500" />
                <Text fontWeight="bold" width="100px">
                  Role:
                </Text>
                <Text>{isAdmin ? "Administrator" : "User"}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
