import { extendTheme } from "@chakra-ui/react";

// Chakra's default gray palette is slightly cool/blue. Use explicit surface colors
// so dark mode reads as a darker, cooler graphite gray.
const DARK_BG = "#15171c";
const DARK_PANEL = "#1d2027";
const DARK_SECTION = "#23252b";
const DARK_CARD = "#2b2e35";
const DARK_HOVER = "#2a2d34";

// Define custom colors and styles
const customTheme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
  colors: {
    // Replace Chakra's default teal palette with a custom accent:
    // requested primary: #44518e
    teal: {
      50: "#EEF0FA",
      100: "#D6DBF3",
      200: "#B1B9E6",
      300: "#8B96D8",
      400: "#6572C3",
      500: "#44518E",
      600: "#3B467D",
      700: "#323C6C",
      800: "#293159",
      900: "#202646",
    },
  },
  semanticTokens: {
    colors: {
      // Surfaces
      "surface.canvas": { default: "white", _dark: DARK_BG },
      "surface.panel": { default: "gray.50", _dark: DARK_PANEL },
      "surface.section": { default: "white", _dark: DARK_SECTION },
      "surface.card": { default: "white", _dark: DARK_CARD },
      "surface.hover": { default: "gray.100", _dark: DARK_HOVER },

      // Borders
      "border.subtle": { default: "gray.200", _dark: "whiteAlpha.200" },
    },
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: "surface.canvas",
        color: props.colorMode === "dark" ? "whiteAlpha.900" : "gray.800",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
    },
    // NOTE: Do not set a global `Box` background; it causes the entire app to look like one slab.
    Input: {
      variants: {
        outline: (props: { colorMode: string }) => ({
          field: {
            bg: props.colorMode === "dark" ? "surface.panel" : undefined,
            borderColor: props.colorMode === "dark" ? "border.subtle" : "gray.300",
            _hover: {
              borderColor: props.colorMode === "dark" ? "whiteAlpha.300" : "gray.400",
            },
            _focus: {
              borderColor: props.colorMode === "dark" ? "blue.400" : "blue.500",
              boxShadow: props.colorMode === "dark" ? "0 0 0 1px #4299E1" : "0 0 0 1px #3182CE",
            },
          },
        }),
      },
    },
    Select: {
      variants: {
        outline: (props: { colorMode: string }) => ({
          field: {
            bg: props.colorMode === "dark" ? "surface.panel" : undefined,
            borderColor: props.colorMode === "dark" ? "border.subtle" : "gray.300",
            _hover: {
              borderColor: props.colorMode === "dark" ? "whiteAlpha.300" : "gray.400",
            },
            _focus: {
              borderColor: props.colorMode === "dark" ? "blue.400" : "blue.500",
              boxShadow: props.colorMode === "dark" ? "0 0 0 1px #4299E1" : "0 0 0 1px #3182CE",
            },
          },
        }),
      },
    },
    Textarea: {
      variants: {
        outline: (props: { colorMode: string }) => ({
          bg: props.colorMode === "dark" ? "surface.panel" : undefined,
          borderColor: props.colorMode === "dark" ? "border.subtle" : "gray.300",
          _hover: {
            borderColor: props.colorMode === "dark" ? "whiteAlpha.300" : "gray.400",
          },
          _focus: {
            borderColor: props.colorMode === "dark" ? "blue.400" : "blue.500",
            boxShadow: props.colorMode === "dark" ? "0 0 0 1px #4299E1" : "0 0 0 1px #3182CE",
          },
        }),
      },
    },
    Card: {
      baseStyle: (props: { colorMode: string }) => ({
        container: {
          bg: props.colorMode === "dark" ? "surface.section" : "white",
          borderWidth: "1px",
          borderColor: props.colorMode === "dark" ? "border.subtle" : "gray.200",
        },
      }),
    },
    Modal: {
      baseStyle: (props: { colorMode: string }) => ({
        dialog: {
          bg: props.colorMode === "dark" ? "surface.section" : "white",
          borderWidth: "1px",
          borderColor: props.colorMode === "dark" ? "border.subtle" : "gray.200",
        },
      }),
    },
    Drawer: {
      baseStyle: (props: { colorMode: string }) => ({
        dialog: {
          bg: props.colorMode === "dark" ? "surface.section" : "white",
          borderWidth: "1px",
          borderColor: props.colorMode === "dark" ? "border.subtle" : "gray.200",
        },
      }),
    },
    Menu: {
      baseStyle: (props: { colorMode: string }) => ({
        list: {
          bg: props.colorMode === "dark" ? "surface.section" : "white",
          borderColor: props.colorMode === "dark" ? "border.subtle" : "gray.200",
        },
      }),
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
        borderColor: props.colorMode === "dark" ? "border.subtle" : "gray.200",
      }),
    },
    Table: {
      baseStyle: (props: { colorMode: string }) => ({
        th: {
          borderColor: props.colorMode === "dark" ? "border.subtle" : "gray.200",
        },
        td: {
          borderColor: props.colorMode === "dark" ? "border.subtle" : "gray.200",
        },
      }),
    },
  },
});

export default customTheme;
