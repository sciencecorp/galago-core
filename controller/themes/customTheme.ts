import { extendTheme } from "@chakra-ui/react";

// Define custom colors and styles
const customTheme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "white",
        color: props.colorMode === "dark" ? "whiteAlpha.900" : "gray.800",
      },
      table: {
        th: {
          borderColor: props.colorMode === "dark" ? "gray.500" : "gray.200",
        },
        td: {
          borderColor: props.colorMode === "dark" ? "gray.500" : "gray.200",
        },
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      variants: {
        solid: (props: { colorMode: string }) => ({
          bg: props.colorMode === "dark" ? "blue.600" : "blue.500",
          color: "white",
          _hover: {
            bg: props.colorMode === "dark" ? "blue.500" : "blue.600",
          },
        }),
        outline: (props: { colorMode: string }) => ({
          borderColor: props.colorMode === "dark" ? "blue.400" : "blue.500",
          color: props.colorMode === "dark" ? "blue.400" : "blue.500",
        }),
      },
    },
    Box: {
      baseStyle: (props: { colorMode: string }) => ({
        bg: props.colorMode === "dark" ? "gray.800" : "gray.100",
        color: props.colorMode === "dark" ? "whiteAlpha.900" : "gray.800",
      }),
    },
    // Add more components here
    Input: {
      variants: {
        outline: (props: { colorMode: string }) => ({
          field: {
            borderColor: props.colorMode === "dark" ? "gray.600" : "gray.300",
            _hover: {
              borderColor: props.colorMode === "dark" ? "gray.500" : "gray.400",
            },
            _focus: {
              borderColor: props.colorMode === "dark" ? "blue.400" : "blue.500",
              boxShadow: props.colorMode === "dark" ? "0 0 0 1px #4299E1" : "0 0 0 1px #3182CE",
            },
          },
        }),
      },
    },
    Text: {
      baseStyle: (props: { colorMode: string }) => ({
        color: props.colorMode === "dark" ? "whiteAlpha.900" : "gray.800",
      }),
    },
    Heading: {
      baseStyle: (props: { colorMode: string }) => ({
        color: props.colorMode === "dark" ? "whiteAlpha.900" : "gray.800",
      }),
    },
    Divider: {
      baseStyle: (props: { colorMode: string }) => ({
        borderColor: props.colorMode === "dark" ? "gray.500" : "gray.200",
      }),
    },
  },
});

export default customTheme;
