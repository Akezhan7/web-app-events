import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  AccountCircle, 
  Dashboard, 
  Event, 
  ExitToApp, 
  Login, 
  Menu as MenuIcon, 
  SupervisorAccount 
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';

function Navbar() {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  // Мобильное меню для навигации
  const mobileDrawer = (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={handleDrawerToggle}
    >
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={handleDrawerToggle}
      >
        <List>
          <ListItem button component={RouterLink} to="/">
            <ListItemIcon><Event /></ListItemIcon>
            <ListItemText primary="События" />
          </ListItem>
          
          {currentUser ? (
            <>
              <ListItem button component={RouterLink} to="/dashboard">
                <ListItemIcon><Dashboard /></ListItemIcon>
                <ListItemText primary="Мой кабинет" />
              </ListItem>
              {currentUser.role === 'admin' && (
                <ListItem button component={RouterLink} to="/admin">
                  <ListItemIcon><SupervisorAccount /></ListItemIcon>
                  <ListItemText primary="Админ-панель" />
                </ListItem>
              )}
              <ListItem button onClick={handleLogout}>
                <ListItemIcon><ExitToApp /></ListItemIcon>
                <ListItemText primary="Выйти" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button component={RouterLink} to="/login">
                <ListItemIcon><Login /></ListItemIcon>
                <ListItemText primary="Войти" />
              </ListItem>
              <ListItem button component={RouterLink} to="/register">
                <ListItemIcon><AccountCircle /></ListItemIcon>
                <ListItemText primary="Регистрация" />
              </ListItem>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="меню"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            color: 'white', 
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          События
        </Typography>
        
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={RouterLink} to="/">
              Главная
            </Button>
            
            {currentUser ? (
              <>
                <Button color="inherit" component={RouterLink} to="/dashboard">
                  Мои мероприятия
                </Button>
                
                {currentUser.role === 'admin' && (
                  <Button color="inherit" component={RouterLink} to="/admin">
                    Админ-панель
                  </Button>
                )}
                
                <Box sx={{ ml: 2 }}>
                  <IconButton
                    aria-label="аккаунт пользователя"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => {
                      handleClose();
                      navigate('/dashboard');
                    }}>Профиль</MenuItem>
                    <MenuItem onClick={handleLogout}>Выйти</MenuItem>
                  </Menu>
                </Box>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login">
                  Войти
                </Button>
                <Button 
                  color="secondary" 
                  variant="contained" 
                  component={RouterLink} 
                  to="/register"
                  sx={{ ml: 1 }}
                >
                  Регистрация
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
      {mobileDrawer}
    </AppBar>
  );
}

export default Navbar;
