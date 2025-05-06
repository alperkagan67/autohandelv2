import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import VehicleList from './pages/VehicleList';
import VehicleDetail from './pages/VehicleDetail';
import VerkaufenKFormu from './pages/VerkaufenKFormu';
import AdminLogin from './components/AdminLogin';  
import AdminDashboard from './pages/AdminDashboard';
import { getTheme } from './theme';

function App() {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const theme = getTheme(mode ? 'dark' : 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (mode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  const toggleColorMode = () => {
    setMode(!mode);
    localStorage.setItem('darkMode', JSON.stringify(!mode));
  };

  return (
    <ThemeProvider theme={{ ...theme, toggleColorMode }}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicles/:id" element={<VehicleDetail />} />
          <Route path="sell" element={<VerkaufenKFormu />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;