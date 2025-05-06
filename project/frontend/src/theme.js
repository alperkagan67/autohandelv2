import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#2196f3' : '#1a237e',
      light: mode === 'dark' ? '#4dabf5' : '#534bae',
      dark: mode === 'dark' ? '#1976d2' : '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'dark' ? '#f50057' : '#ff3d00',
      light: mode === 'dark' ? '#f73378' : '#ff7539',
      dark: mode === 'dark' ? '#ab003c' : '#c30000',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f7',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#000000',
      secondary: mode === 'dark' ? '#b3b3b3' : '#666666',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'dark' ? '#121212' : '#f5f5f7',
          color: mode === 'dark' ? '#ffffff' : '#000000',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1e1e1e' : '#1a237e',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          boxShadow: mode === 'dark' 
            ? '0 2px 4px rgba(0,0,0,0.4)' 
            : '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#2c2c2c' : '#ffffff',
        },
      },
    },
  },
});