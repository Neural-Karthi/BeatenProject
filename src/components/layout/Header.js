import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Switch,
} from "@mui/material";
import {
  ShoppingCart as CartIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const pages = [
  { name: "HOME", path: "/" },
  { name: "PRODUCTS", path: "/products" },
  { name: "PREMIUM", path: "/premium" },
  { name: "ABOUT", path: "/about" },
  { name: "CONTACT", path: "/contact" },
];

const mobilePages = {
  main: [
    { name: "HOME", path: "/" },
    {
      name: "BEATEN EXCLUSIVE",
      path: "/products?collection=Beaten%20Exclusive%20Collection",
    },
    {
      name: "BEATEN SINGNATURE",
      path: "/products?collection=Beaten%20Signature%20Collection",
    },
    { name: "PREMIUM", path: "/premium" },
  ],
  account: [
    { name: "MY ACCOUNT", path: "/profile" },
    { name: "MY ORDERS", path: "/orders" },
    { name: "WISHLIST", path: "/wishlist" },
    { name: "RETURN / EXCHANGE", path: "/return-exchange" },
  ],
  support: [
    { name: "ABOUT", path: "/about" },
    { name: "CONTACT", path: "/contact" },
    { name: "NOTIFICATIONS", path: "/alerts" },
  ],
};

const Header = ({ mode, toggleColorMode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const bgColor = mode === "dark" ? "#fff" : "#000000";
  const textColor = mode === "dark" ? "#000" : "#fff";

  const handleCloseNavMenu = () => {
    window.scrollTo(0, 0);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

const drawer = (
  <Box
    disablePadding
    sx={{
      position: "relative",
      textAlign: "center",
      bgcolor: bgColor,
      color: textColor,
      height: "100%",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      overflowY: "auto", // ✅ enable scroll
    }}
    onClick={handleDrawerClose}
  >
    <IconButton
      aria-label="close drawer"
      onClick={(e) => {
        e.stopPropagation();
        handleDrawerClose();
      }}
      sx={{
        position: "absolute",
        top: 8,
        right: 8,
        color: textColor,
        zIndex: 10,
        display: { xs: "flex", md: "none" },
      }}
    >
      <CloseIcon sx={{ fontSize: 32 }} />
    </IconButton>

    <Divider sx={{ mt: 7, borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />

    <List>
      {mobilePages.main.map((page) => (
        <ListItem
          key={page.name}
          component={RouterLink}
          to={page.path}
          onClick={handleDrawerClose}
          sx={{
            py: 0.25,
            px: 2,
            color: textColor,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <ListItemText
            primary={page.name}
            sx={{
              textAlign: "left",
              pl: 1,
              "& .MuiListItemText-primary": {
                fontWeight: location.pathname === page.path ? 600 : 400,
                letterSpacing: "0.1em",
                fontSize: "0.95rem",
                color: textColor, // ✅ ensure text follows mode
              },
            }}
          />
        </ListItem>
      ))}

      <Divider sx={{ borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", my: 1 }} />

      <ListItem>
       <ListItemText
  primary="ACCOUNT"
  sx={{
    textAlign: "left",
    pl: 1,
    "& .MuiListItemText-primary": {
      fontSize: "0.7rem",
      letterSpacing: "0.2em",
        color: mode === "dark" ?  "rgba(0, 0, 0, 0.5)" :"rgba(255, 255, 255, 0.5)",
      textTransform: "uppercase",
    },
  }}
/>

      </ListItem>
      {mobilePages.account.map((page) => (
        <ListItem
          key={page.name}
          component={RouterLink}
          to={page.path}
          onClick={handleDrawerClose}
          sx={{
            py: 0.25,
            px: 2,
            color: textColor,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <ListItemText
            primary={page.name}
            sx={{
              textAlign: "left",
              pl: 1,
              "& .MuiListItemText-primary": {
                fontWeight: location.pathname === page.path ? 600 : 400,
                letterSpacing: "0.1em",
                fontSize: "0.95rem",
                color: textColor,
              },
            }}
          />
        </ListItem>
      ))}

      <Divider sx={{ borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", my: 1 }} />

      <ListItem>
        <ListItemText
  primary="SUPPORT"
  sx={{
    textAlign: "left",
    pl: 1,
    "& .MuiListItemText-primary": {
      fontSize: "0.7rem",
      letterSpacing: "0.2em",
      color: mode === "dark" ?  "rgba(0, 0, 0, 0.5)" :"rgba(255, 255, 255, 0.5)",
      textTransform: "uppercase",
    },
  }}
/>

      </ListItem>
      {mobilePages.support.map((page) => (
        <ListItem
          key={page.name}
          component={RouterLink}
          to={page.path}
          onClick={handleDrawerClose}
          sx={{
            py: 0.25,
            px: 2,
            color: textColor,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <ListItemText
            primary={page.name}
            sx={{
              textAlign: "left",
              pl: 1,
              "& .MuiListItemText-primary": {
                fontWeight: location.pathname === page.path ? 600 : 400,
                letterSpacing: "0.1em",
                fontSize: "0.95rem",
                color: textColor,
              },
            }}
          />
        </ListItem>
      ))}

      <Divider sx={{ borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", my: 1 }} />
    </List>

    {/* Mode Switch */}
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        px: 1,
        ml: 2,
        py: 0.5,
        color: textColor,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Typography sx={{ fontSize: "0.9rem", fontWeight: 500, mr: 1, color: textColor }}>
        Mode:
      </Typography>
      <Typography sx={{ fontSize: "0.9rem", mr: 1, color: textColor }}>
        {mode === "dark" ? "ON" : "OFF"}
      </Typography>
      <Switch
        checked={mode === "dark"}
        onChange={toggleColorMode}
        color="default"
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: '#4caf50',
            },
          },
          '& .MuiSwitch-switchBase': {
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: '#ccc',
            },
          },
        }}
      />
    </Box>
  </Box>
);

console.log(mode)
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: bgColor,
        color: textColor,
        backdropFilter: "blur(10px)",
        boxShadow: "none",
        borderBottom: "none",
        transition: "all 0.3s ease-in-out",
        zIndex: 9999,
        top: 0,
        height: { xs: "44px", md: "64px" },
        width: { xs: "100vw", md: "auto" },
        left: 0,
      }}
    >
<Container
        maxWidth="xl"
        sx={{
          px: { xs: 0, md: 2 },
          width: { xs: "100vw", md: "100%" },
          minWidth: { xs: "100vw", md: "0" },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: "44px", md: "64px" },
         
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Mobile Menu Button */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              flex: "0 0 auto",
              zIndex: 2,
              pl: { xs: 0.5, md: 0 },
            }}
          >
            <IconButton
              size="large"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              color="inherit"
              sx={{ mr: 0, ml: 0, p: "8px" }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo - Mobile (centered absolutely) */}
          <Box
            sx={{
              position: { xs: "absolute", md: "static" },
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 1,
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                color: "white",
                textDecoration: "none",
                letterSpacing: "0.2em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                pointerEvents: "auto",
              }}
            >
              <img
                src={mode === "dark"? '/Beaten/DarkLogo.png': '/Beaten/logo.png'}
                alt="Beaten Logo"
                style={{
                  width: "6em",
                  height: "auto",
                  padding: 0,
                  margin: 0,
                  display: "block",
                }}
              />
            </Typography>
          </Box>

          {/* Logo - Desktop */}
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              color: "white",
              textDecoration: "none",
              letterSpacing: "0.2em",
              fontSize: "1.5rem",
            }}
          >
            <img
              src="/Beaten/logo.png"
              alt="Beaten Logo"
              style={{ width: "6em", height: "auto", padding: 0, margin: 0 }}
            />
          </Typography>

          {/* Desktop Menu */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{
                  my: 2,
                  color: "white",
                  display: "block",
                  mx: 2,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    width: location.pathname === page.path ? "100%" : "0%",
                    height: "2px",
                    bottom: 0,
                    left: 0,
                    backgroundColor: "white",
                    transition: "width 0.3s ease-in-out",
                  },
                  "&:hover::after": {
                    width: "100%",
                  },
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Right Icons - Desktop & Mobile (always far right) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              ml: "auto",
              flexShrink: 0,
              pr: { xs: 0.5, md: 0 },
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Wishlist Icon - only show on md and up */}
            <IconButton
              color="inherit"
              onClick={() => navigate("/wishlist")}
              sx={{ p: 1, display: { xs: "none", md: "flex" } }}
            >
              <FavoriteBorderIcon sx={{ fontSize: 26 }} />
            </IconButton>

<IconButton
  color="inherit"
  onClick={() => navigate("/alerts")}
  sx={{ p: 1 }}
>
  <Badge  color="error">
    <NotificationsOutlinedIcon sx={{ fontSize: 26 }} />
  </Badge>
</IconButton>



            {/* Cart Icon - always show */}
            <IconButton
              color="inherit"
              onClick={() => navigate("/cart")}
              sx={{p: 1 }}
            >
              <Badge badgeContent={getCartCount()} color="error">
                <CartIcon sx={{ fontSize: 26 }} />
              </Badge>
            </IconButton>
            {/* Profile Icon - only show on md and up */}
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "scale(1.1)",
                  },
                  p: 1,
                  mr: 0,
                  pr: 0,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                    },
                    ml: 0,
                    mr: 0,
                    pr: 0,
                  }}
                >
                  <PersonIcon />
                </Avatar>
              </IconButton>
              {/* Logout Button - only show if user is logged in */}
              {user && (
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    ml: 2,
                    color: "white",
                    border: "1px solid #fff",
                    borderRadius: 2,
                    px: 2,
                    fontWeight: 600,
                  }}
                >
                  Logout
                </Button>
              )}
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    bgcolor: "black",
                    color: "white",
                    "& .MuiMenuItem-root": {
                      px: 2,
                      py: 1.5,
                      fontSize: "0.875rem",
                      letterSpacing: "0.05em",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                    "& .MuiDivider-root": {
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      my: 1,
                    },
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "black",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                {user ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleProfileMenuClose();
                        navigate("/profile");
                      }}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleProfileMenuClose();
                        navigate("/orders");
                      }}
                    >
                      Orders
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleProfileMenuClose();
                        navigate("/login");
                      }}
                    >
                      Login
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleProfileMenuClose();
                        navigate("/register");
                      }}
                    >
                      Register
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </Container>

     <Drawer
  anchor="left"
  open={mobileOpen}
  onClose={handleDrawerClose}
  variant="temporary"
  sx={{
    display: { xs: "block", md: "none" },
    zIndex: 10000,
    "& .MuiDrawer-paper": {
      width: "80vw",
      height: "100%",             // ensure it takes full height
      backgroundColor: bgColor,
      color: textColor,
      overflowY: "hidden",          // ✅ enable vertical scroll
      overflowX: "hidden",          // ✅ enable vertical scroll
    },
  }}
>
  {drawer}
</Drawer>

    </AppBar>
  );
};

export default Header;
