import { extendTheme } from '@chakra-ui/react';

// Define the theme configuration
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f6f7',
      100: '#c3e8e9',
      200: '#9fd9db',
      300: '#7bcbcd',
      400: '#57bcbf',
      500: '#38B2AC', // teal.500 - primary brand color
      600: '#2c8f89',
      700: '#216c67',
      800: '#164844',
      900: '#0b2422',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

export default theme; 