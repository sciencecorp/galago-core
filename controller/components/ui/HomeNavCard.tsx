import { Box, Card, CardBody, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import { PageProps } from "@/types";
import { useRouter } from "next/router";
import { useState } from "react";
import { SystemStyleObject } from "@chakra-ui/react"; // Import this for the type
import { useColorModeValue } from "@chakra-ui/react";

interface HomeNavCardProps {
  pageProps: PageProps;
  titleSx?: SystemStyleObject; // Change to SystemStyleObject
}

export default function HomeNavCard({ pageProps, titleSx }: HomeNavCardProps): JSX.Element {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const bgColor = useColorModeValue("white", "surface.section");
  const hoverBg = useColorModeValue("#cee0f0", "surface.hover");
  const handleClick = (route: string) => {
    router.push(`${route}`);
  };

  return (
    <Card
      width="400px"
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="elevated"
      onClick={() => {
        handleClick(pageProps.link);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      boxShadow={isHovered ? "xl" : "sm"}
      transform={isHovered ? "translateY(-5px)" : "none"}
      transition="all 0.2s ease-in-out"
      backgroundColor={isHovered ? hoverBg : bgColor}
      cursor="pointer"
      bg={bgColor}>
      <HStack>
        <Box width="12%" height="auto" padding="2%" paddingTop="6%">
          {pageProps.icon}
        </Box>
        <Box>
          <VStack>
            <CardBody>
              <Heading size="md" sx={pageProps.title === "Tools" ? titleSx : {}}>
                {pageProps.title}
              </Heading>
              <Text py="2">{pageProps.description}</Text>
            </CardBody>
          </VStack>
        </Box>
      </HStack>
    </Card>
  );
}
