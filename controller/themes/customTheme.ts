import { extendTheme } from "@chakra-ui/react";
import { palette, semantic } from "./colors";

// Define custom colors and styles
const customTheme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === "dark" ? semantic.background.primary.dark : semantic.background.primary.light,
        color: props.colorMode === "dark" ? semantic.text.primary.dark : semantic.text.primary.light,
      },
      table: {
        th: {
          borderColor: props.colorMode === "dark" ? semantic.border.primary.dark : semantic.border.primary.light,
        },
        td: {
          borderColor: props.colorMode === "dark" ? semantic.border.primary.dark : semantic.border.primary.light,
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
          bg: props.colorMode === "dark" ? palette.blue[600] : palette.blue[500],
          color: palette.white,
          _hover: {
            bg: props.colorMode === "dark" ? palette.blue[500] : palette.blue[600],
          },
        }),
        outline: (props: { colorMode: string }) => ({
          borderColor: props.colorMode === "dark" ? palette.blue[400] : palette.blue[500],
          color: props.colorMode === "dark" ? palette.blue[400] : palette.blue[500],
        }),
      },
    },
    Box: {
      baseStyle: (props: { colorMode: string }) => ({
        bg: props.colorMode === "dark" ? semantic.background.secondary.dark : semantic.background.secondary.light,
        color: props.colorMode === "dark" ? semantic.text.primary.dark : semantic.text.primary.light,
      }),
    },
    // Add more components here
    Input: {
      variants: {
        outline: (props: { colorMode: string }) => ({
          field: {
            borderColor: props.colorMode === "dark" ? semantic.border.primary.dark : semantic.border.primary.light,
            _hover: {
              borderColor: props.colorMode === "dark" ? semantic.border.secondary.dark : semantic.border.secondary.light,
            },
            _focus: {
              borderColor: props.colorMode === "dark" ? semantic.border.focus.dark : semantic.border.focus.light,
              boxShadow: props.colorMode === "dark" ? `0 0 0 1px ${palette.blue[400]}` : `0 0 0 1px ${palette.blue[500]}`,
            },
          },
        }),
      },
    },
    Text: {
      baseStyle: (props: { colorMode: string }) => ({
        color: props.colorMode === "dark" ? semantic.text.primary.dark : semantic.text.primary.light,
      }),
    },
    Heading: {
      baseStyle: (props: { colorMode: string }) => ({
        color: props.colorMode === "dark" ? semantic.text.primary.dark : semantic.text.primary.light,
      }),
    },
    Divider: {
      baseStyle: (props: { colorMode: string }) => ({
        borderColor: props.colorMode === "dark" ? semantic.border.primary.dark : semantic.border.primary.light,
      }),
    },
  },
});

export default customTheme;
