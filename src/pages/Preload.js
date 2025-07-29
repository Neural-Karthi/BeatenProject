import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Logo from "../assets/logo.png";
import DarkLogo from "../assets/DarkLogo.png";

const matteColors = {
  900: "#1a1a1a",
  800: "#2d2d2d",
  700: "#404040",
  600: "#525252",
  100: "#f5f5f5",
};

const Preload = ({ mode = "light" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        transition: "background 0.3s",
      }}
    >
      <Box
        component="img"
        src={mode === "dark" ? Logo : DarkLogo}
        alt="App Logo"
        sx={{
          width: { xs: "150px", md: "200px" },
          height: { xs: "150px", md: "200px" },
          objectFit: "contain",
          animation: "fadeIn 1s ease-in-out, pulse 1.5s infinite ease-in-out",
          "@keyframes fadeIn": {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          "@keyframes pulse": {
            "0%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.1)" },
            "100%": { transform: "scale(1)" },
          },
        }}
      />
    </Box>
  );
};

export default Preload;