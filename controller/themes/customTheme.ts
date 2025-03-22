import { extendTheme } from "@chakra-ui/react";
import { palette, semantic } from "./colors";
import tokens from "./tokens";

// Define custom colors and styles
const customTheme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },

  // Add design tokens to the theme
  colors: {
    // Add palette colors to the theme
    ...Object.entries(palette).reduce(
      (acc, [key, value]) => {
        if (typeof value === "object") {
          acc[key] = value;
        } else {
          acc[key] = { 500: value };
        }
        return acc;
      },
      {} as Record<string, any>,
    ),
  },

  // Add typography tokens
  fonts: tokens.typography.fonts,
  fontSizes: tokens.typography.fontSizes,
  fontWeights: tokens.typography.fontWeights,
  lineHeights: tokens.typography.lineHeights,
  letterSpacings: tokens.typography.letterSpacings,

  // Add border tokens
  borders: tokens.borders.styles,
  borderWidths: tokens.borders.widths,
  radii: tokens.borders.radii,

  // Add other tokens
  shadows: tokens.shadows,
  space: tokens.spacing,
  sizes: tokens.spacing,
  zIndices: tokens.zIndices,
  breakpoints: tokens.breakpoints,

  // Global styles
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg:
          props.colorMode === "dark"
            ? semantic.background.primary.dark
            : semantic.background.primary.light,
        color:
          props.colorMode === "dark" ? semantic.text.primary.dark : semantic.text.primary.light,
        fontFamily: tokens.typography.fonts.body,
        lineHeight: tokens.typography.lineHeights.base,
        transition: `background-color ${tokens.animation.durations.normal} ${tokens.animation.easings.easeInOut}`,
      },
      "*::placeholder": {
        color:
          props.colorMode === "dark" ? semantic.text.secondary.dark : semantic.text.secondary.light,
        opacity: 0.7,
      },
      "*, *::before, *::after": {
        borderColor:
          props.colorMode === "dark" ? semantic.border.primary.dark : semantic.border.primary.light,
      },
      table: {
        th: {
          borderColor:
            props.colorMode === "dark"
              ? semantic.border.primary.dark
              : semantic.border.primary.light,
        },
        td: {
          borderColor:
            props.colorMode === "dark"
              ? semantic.border.primary.dark
              : semantic.border.primary.light,
        },
      },
      // Add smooth scrolling
      html: {
        scrollBehavior: "smooth",
      },
    }),
  },

  // Component-specific styles
  components: {
    Button: {
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "md",
        _focus: {
          boxShadow: "outline",
        },
        transition: `all ${tokens.animation.durations.normal} ${tokens.animation.easings.easeInOut}`,
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
          _hover: {
            bg: props.colorMode === "dark" ? `${palette.blue[400]}20` : `${palette.blue[500]}20`,
          },
        }),
        ghost: (props: { colorMode: string }) => ({
          color:
            props.colorMode === "dark" ? semantic.text.primary.dark : semantic.text.primary.light,
          _hover: {
            bg:
              props.colorMode === "dark"
                ? semantic.background.hover.dark
                : semantic.background.hover.light,
          },
        }),
        link: (props: { colorMode: string }) => ({
          color: props.colorMode === "dark" ? palette.blue[400] : palette.blue[500],
          _hover: {
            textDecoration: "underline",
          },
        }),
      },
      sizes: {
        xs: {
          h: "1.5rem",
          minW: "1.5rem",
          fontSize: "xs",
          px: 2,
        },
        sm: {
          h: "2rem",
          minW: "2rem",
          fontSize: "sm",
          px: 3,
        },
        md: {
          h: "2.5rem",
          minW: "2.5rem",
          fontSize: "md",
          px: 4,
        },
        lg: {
          h: "3rem",
          minW: "3rem",
          fontSize: "lg",
          px: 6,
        },
      },
    },

    Box: {
      baseStyle: (props: { colorMode: string }) => ({
        transition: `all ${tokens.animation.durations.normal} ${tokens.animation.easings.easeInOut}`,
      }),
    },

    Card: {
      baseStyle: (props: { colorMode: string }) => ({
        bg:
          props.colorMode === "dark"
            ? semantic.background.card.dark
            : semantic.background.card.light,
        borderRadius: tokens.borders.radii.md,
        boxShadow: props.colorMode === "dark" ? tokens.shadows.dark.md : tokens.shadows.md,
        overflow: "hidden",
        transition: `all ${tokens.animation.durations.normal} ${tokens.animation.easings.easeInOut}`,
      }),
    },

    Input: {
      variants: {
        outline: (props: { colorMode: string }) => ({
          field: {
            borderColor:
              props.colorMode === "dark"
                ? semantic.border.primary.dark
                : semantic.border.primary.light,
            _hover: {
              borderColor:
                props.colorMode === "dark"
                  ? semantic.border.secondary.dark
                  : semantic.border.secondary.light,
            },
            _focus: {
              borderColor:
                props.colorMode === "dark"
                  ? semantic.border.focus.dark
                  : semantic.border.focus.light,
              boxShadow:
                props.colorMode === "dark"
                  ? `0 0 0 1px ${palette.blue[400]}`
                  : `0 0 0 1px ${palette.blue[500]}`,
            },
          },
        }),
        filled: (props: { colorMode: string }) => ({
          field: {
            bg:
              props.colorMode === "dark"
                ? semantic.background.secondary.dark
                : semantic.background.secondary.light,
            _hover: {
              bg:
                props.colorMode === "dark"
                  ? `${semantic.background.secondary.dark}90`
                  : `${semantic.background.secondary.light}90`,
            },
            _focus: {
              bg:
                props.colorMode === "dark"
                  ? semantic.background.secondary.dark
                  : semantic.background.secondary.light,
              borderColor:
                props.colorMode === "dark"
                  ? semantic.border.focus.dark
                  : semantic.border.focus.light,
            },
          },
        }),
      },
    },

    Textarea: {
      variants: {
        outline: (props: { colorMode: string }) => ({
          borderColor:
            props.colorMode === "dark"
              ? semantic.border.primary.dark
              : semantic.border.primary.light,
          _hover: {
            borderColor:
              props.colorMode === "dark"
                ? semantic.border.secondary.dark
                : semantic.border.secondary.light,
          },
          _focus: {
            borderColor:
              props.colorMode === "dark" ? semantic.border.focus.dark : semantic.border.focus.light,
            boxShadow:
              props.colorMode === "dark"
                ? `0 0 0 1px ${palette.blue[400]}`
                : `0 0 0 1px ${palette.blue[500]}`,
          },
        }),
      },
    },

    Text: {
      baseStyle: (props: { colorMode: string }) => ({
        color:
          props.colorMode === "dark" ? semantic.text.primary.dark : semantic.text.primary.light,
      }),
      variants: {
        secondary: (props: { colorMode: string }) => ({
          color:
            props.colorMode === "dark"
              ? semantic.text.secondary.dark
              : semantic.text.secondary.light,
        }),
        accent: (props: { colorMode: string }) => ({
          color:
            props.colorMode === "dark" ? semantic.text.accent.dark : semantic.text.accent.light,
        }),
      },
    },

    Heading: {
      baseStyle: (props: { colorMode: string }) => ({
        color:
          props.colorMode === "dark" ? semantic.text.primary.dark : semantic.text.primary.light,
        fontWeight: "semibold",
      }),
    },

    Divider: {
      baseStyle: (props: { colorMode: string }) => ({
        borderColor:
          props.colorMode === "dark" ? semantic.border.primary.dark : semantic.border.primary.light,
        opacity: 0.6,
      }),
    },

    Modal: {
      baseStyle: (props: { colorMode: string }) => ({
        dialog: {
          bg:
            props.colorMode === "dark"
              ? semantic.background.card.dark
              : semantic.background.card.light,
          boxShadow: props.colorMode === "dark" ? tokens.shadows.dark.xl : tokens.shadows.xl,
        },
        header: {
          paddingBottom: tokens.spacing.sm,
        },
        footer: {
          paddingTop: tokens.spacing.sm,
        },
      }),
    },

    Tooltip: {
      baseStyle: (props: { colorMode: string }) => ({
        bg:
          props.colorMode === "dark"
            ? semantic.background.secondary.dark
            : semantic.background.secondary.light,
        color:
          props.colorMode === "dark" ? semantic.text.primary.dark : semantic.text.primary.light,
        borderRadius: tokens.borders.radii.md,
        boxShadow: props.colorMode === "dark" ? tokens.shadows.dark.md : tokens.shadows.md,
        padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
        fontSize: tokens.typography.fontSizes.sm,
      }),
    },

    Badge: {
      baseStyle: {
        borderRadius: tokens.borders.radii.md,
        textTransform: "none",
        fontWeight: "medium",
      },
      variants: {
        solid: (props: { colorMode: string }) => ({
          bg: props.colorMode === "dark" ? palette.blue[600] : palette.blue[500],
          color: palette.white,
        }),
        outline: (props: { colorMode: string }) => ({
          borderColor: props.colorMode === "dark" ? palette.blue[400] : palette.blue[500],
          color: props.colorMode === "dark" ? palette.blue[400] : palette.blue[500],
        }),
        subtle: (props: { colorMode: string }) => ({
          bg: props.colorMode === "dark" ? `${palette.blue[400]}20` : `${palette.blue[500]}20`,
          color: props.colorMode === "dark" ? palette.blue[400] : palette.blue[500],
        }),
      },
    },

    Table: {
      variants: {
        simple: (props: { colorMode: string }) => ({
          th: {
            borderColor:
              props.colorMode === "dark"
                ? semantic.border.primary.dark
                : semantic.border.primary.light,
            color:
              props.colorMode === "dark"
                ? semantic.text.secondary.dark
                : semantic.text.secondary.light,
            fontWeight: "semibold",
          },
          td: {
            borderColor:
              props.colorMode === "dark"
                ? semantic.border.primary.dark
                : semantic.border.primary.light,
          },
          tr: {
            _hover: {
              bg:
                props.colorMode === "dark"
                  ? semantic.background.hover.dark
                  : semantic.background.hover.light,
            },
          },
        }),
      },
    },
  },
});

export default customTheme;
