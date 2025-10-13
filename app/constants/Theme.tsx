export const Theme = {
  colors: {
    primary: '#163330',
    secondary: '#0b3d2e',
    white: '#FFFFFF',
    black: '#000000',
    error: '#FF0000',
    yellow: '#CDFF00',
    success: '#4CAF50', 
    blue: '#007AFF',
    green:'#32BF5B',
    lightPurple:'#7856D3',
    lightGreen:'#D4EDDA',
    text: {
      light: '#FFFFFF',
      dark: '#000000',
      gray: '#666666',
      lightGray: '#999999',  
      border: '#e1e1e1',  
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#f9f9f9', 
      border: '#f0f0f0',     
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
    xxxxl:56,
    xxxxxl:64,
    xxxxxxl:72,
    xxxxxxxl:80,
  },
  borderRadius: {
    xs:4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 50,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '500' as const,
      fontFamily: 'inter',
    },
    h2: {
      fontSize: 18,
      fontWeight: '500' as const,
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
    },
  },
  screenPadding: {
    horizontal: 30,
    vertical: 20,
  },
  components: {
    button: {
      height: 50,
    },
    input: {
      marginBottom: 12,
    },
    imageContainer: {
      height: 200,        
      borderWidth: 2,
      borderRadius: 16,
    }
  },
};

export default Theme;