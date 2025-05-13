import { useEffect } from "react";
import { useRouter } from "next/router";
import { Center, Spinner, Container } from "@chakra-ui/react";

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Get any query parameters to preserve them in redirect
    const query = router.query;
    const callbackUrl = (query.callbackUrl as string) || (query.redirectUrl as string);

    // Construct the redirect URL
    const redirectTo = callbackUrl
      ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/auth/signin";

    // Redirect to the consolidated signin page
    router.replace(redirectTo);
  }, [router]);

  // Show a minimal loading UI while redirect happens
  return (
    <Container maxW="lg">
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    </Container>
  );
}
