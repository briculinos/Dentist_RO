import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// Create a theme optimized for tablets and elderly users
const theme = createTheme({
  typography: {
    fontSize: 16,
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 500 },
    h2: { fontSize: '2rem', fontWeight: 500 },
    h3: { fontSize: '1.75rem', fontWeight: 500 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1.1rem', fontWeight: 500 },
    body1: { fontSize: '1.1rem', lineHeight: 1.6 },
    body2: { fontSize: '1rem', lineHeight: 1.5 },
    button: { fontSize: '1.1rem', fontWeight: 500 },
  },
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          fontSize: '1.1rem',
          padding: '12px 24px',
          borderRadius: 8,
          textTransform: 'none',
        },
        sizeLarge: {
          minHeight: 56,
          fontSize: '1.2rem',
          padding: '16px 32px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 48,
            fontSize: '1.1rem',
          },
          '& .MuiInputLabel-root': {
            fontSize: '1.1rem',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginLeft: -4,
          marginRight: 16,
        },
        label: {
          fontSize: '1.1rem',
          lineHeight: 1.5,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 12,
          '& .MuiSvgIcon-root': {
            fontSize: 28,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: 12,
          '& .MuiSvgIcon-root': {
            fontSize: 28,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
