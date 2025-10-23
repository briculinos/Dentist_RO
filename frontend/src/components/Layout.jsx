import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" elevation={2}>
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Evaluare Medicală
          </Typography>

          <Button
            color="inherit"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/')}
            sx={{
              mr: 1,
              fontSize: '1.1rem',
              backgroundColor: isActive('/') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            }}
          >
            Acasă
          </Button>

          <Button
            color="inherit"
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/patients')}
            sx={{
              mr: 1,
              fontSize: '1.1rem',
              backgroundColor: isActive('/patients') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            }}
          >
            Pacienți
          </Button>

          <Button
            color="inherit"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/search')}
            sx={{
              mr: 2,
              fontSize: '1.1rem',
              backgroundColor: isActive('/search') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
            }}
          >
            Căutare
          </Button>

          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <AccountCircle sx={{ fontSize: 32 }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="body1">
                {user?.firstName} {user?.lastName}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.clinic?.name}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2 }} />
              Deconectare
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Sistem Evaluare Medicală - Conform GDPR
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
