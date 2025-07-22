import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  TextField,
  Button,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { API_ENDPOINTS, buildApiUrl, handleApiError } from "../utils/api";

const Contact = ({ mode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define matte black colors
  const matteColors = {
    900: "#1a1a1a", // Deepest matte black
    800: "#2d2d2d", // Rich matte black
    700: "#404040", // Medium matte black
    600: "#525252", // Light matte black
    100: "#f5f5f5", // Off-white
  };

  // Define colors based on mode
  const getCardColors = () => {
    if (mode === "dark") {
      return {
        background: "linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)",
        text: "#ffffff",
        textSecondary: "#cccccc",
        icon: "#ffffff",
        border: "1px solid rgba(255,255,255,0.1)",
        shadow: "0 4px 16px rgba(0,0,0,0.3)",
      };
    }
    return {
      background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
      text: matteColors[900],
      textSecondary: matteColors[700],
      icon: matteColors[900],
      border: "none",
      shadow: "0 4px 16px rgba(0,0,0,0.08)",
    };
  };

  const cardColors = getCardColors();

  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 40, color: cardColors.icon }} />,
      title: "Email",
      content: "customersupport@beaten.in",
      link: "mailto:customersupport@beaten.in",
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40, color: cardColors.icon }} />,
      title: "Phone",
      content: "+91-7799120325",
      link: "tel:+917799120325",
    },
    {
      icon: <LocationIcon sx={{ fontSize: 40, color: cardColors.icon }} />,
      title: "Address",
      content:
        "Beaten Apparels, Plot No: 91, Block B, Siddarth Enclave, Beeramguda, Hyderabad, 5020319.",
      link: "https://maps.google.com/?q=Beeramguda,Hyderabad",
    },
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.EMAIL_SEND), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: result.message || "Thank you! We've received your message.",
          severity: "success",
        });
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(result.message || "Failed to send message.");
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      setSnackbar({
        open: true,
        message:
          errorInfo.message || "Failed to send message. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "inherit",
        minHeight: "100vh",
        width: "100%",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 4, md: 10 },
            position: "relative",
          }}
        >
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 800,
              background:
                mode === "dark"
                  ? "linear-gradient(45deg, #fff 30%, #bbb 90%)"
                  : `linear-gradient(45deg, ${matteColors[900]} 30%, ${matteColors[800]} 90%)`,
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: { xs: 1.5, md: 2 },
              fontSize: { xs: "1.6rem", md: "2.8rem" },
              letterSpacing: { xs: 0.5, md: 1 },
            }}
          >
            Contact Us
          </Typography>
          <Typography
            variant="h5"
            paragraph
            sx={{
              maxWidth: { xs: "95%", md: "800px" },
              mx: "auto",
              fontWeight: 400,
              lineHeight: 1.5,
              color: mode === "dark" ? "#fff" : "181818",
              fontSize: { xs: "1.02rem", md: "1.25rem" },
            }}
          >
            We're here to help. Get in touch with us for any questions or
            support.
          </Typography>
        </Box>

        {/* Contact Information */}
        <Grid
          container
          spacing={{ xs: 2, md: 4 }}
          sx={{ mb: { xs: 2, md: 0 } }}
        >
          {contactInfo.map((info, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: { xs: 2, md: 4 },
                  borderRadius: "16px",
                  background: cardColors.background,
                  boxShadow: cardColors.shadow,
                  border: cardColors.border,
                  mb: { xs: 1, md: 0 },
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box sx={{ mb: 0, mr: 1 }}>
                  {React.cloneElement(info.icon, {
                    fontSize: "medium",
                    sx: {
                      color: cardColors.icon,
                      fontSize: { xs: 28, md: 40 },
                    },
                  })}
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: cardColors.text,
                      fontSize: { xs: "1.08rem", md: "1.25rem" },
                      mb: 0.5,
                    }}
                  >
                    {info.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    component="a"
                    href={info.link}
                    target={info.title === "Address" ? "_blank" : undefined}
                    rel={
                      info.title === "Address"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    sx={{
                      lineHeight: 1.5,
                      color: cardColors.textSecondary,
                      textDecoration: "none",
                      display: "block",
                      fontSize: { xs: "0.98rem", md: "1.08rem" },
                      "&:hover": {
                        color: cardColors.text,
                      },
                    }}
                  >
                    {info.content}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Business Hours and Contact Form Section */}
        <Box sx={{ mt: { xs: 3, md: 6 } }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: mode === "dark" ? "#ffffff" : matteColors[900],
              mb: { xs: 2, md: 4 },
              textAlign: "center",
              fontSize: { xs: "1.18rem", md: "1.5rem" },
            }}
          >
            Get in Touch
          </Typography>
          <Grid container spacing={4}>
            {/* Business Hours - Left Side */}
            <Grid item xs={12} md={5}>
              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: "16px",
                  background: cardColors.background,
                  boxShadow: cardColors.shadow,
                  border: cardColors.border,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: cardColors.text,
                    mb: 3,
                    fontSize: { xs: "1.2rem", md: "1.4rem" },
                  }}
                >
                  Business Hours
                </Typography>

                {/* 24/7 Support */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: cardColors.text,
                      mb: 1,
                      fontSize: { xs: "1.1rem", md: "1.2rem" },
                    }}
                  >
                    Online Store
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: { xs: "1.01rem", md: "1.1rem" },
                      color: cardColors.textSecondary,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <TimeIcon sx={{ color: cardColors.icon, fontSize: 20 }} />
                    24/7 - 365 Days
                  </Typography>
                </Box>

                {/* Customer Support Hours */}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: cardColors.text,
                      mb: 1,
                      fontSize: { xs: "1.1rem", md: "1.2rem" },
                    }}
                  >
                    Customer Support
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: { xs: "1.01rem", md: "1.1rem" },
                      color: cardColors.textSecondary,
                    }}
                  >
                    <strong style={{ color: cardColors.text }}>
                      Monday - Saturday:
                    </strong>
                    <br />
                    10:00 AM - 7:00 PM
                  </Typography>
                </Box>

                {/* Support Note */}
                <Box
                  sx={{ mt: 4, pt: 3, borderTop: "1px solid rgba(0,0,0,0.1)" }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: { xs: "0.95rem", md: "1rem" },
                      color: cardColors.textSecondary,
                      fontStyle: "italic",
                    }}
                  >
                    For urgent matters, please call our customer support line.
                    We aim to respond to all emails within 24 hours during
                    business days.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Contact Form - Right Side */}
            <Grid item xs={12} md={7}>
              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: "16px",
                  background: cardColors.background,
                  boxShadow: cardColors.shadow,
                  border: cardColors.border,
                  height: "100%",
                }}
              >
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        size={isMobile ? "medium" : "small"}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontSize: { xs: "1.05rem", md: "1rem" },
                            "&:hover fieldset": {
                              borderColor: mode === "dark" ? "#ffffff" : matteColors[900],
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: mode === "dark" ? "#cccccc" : "inherit",
                          },
                          "& .MuiOutlinedInput-input": {
                            color: mode === "dark" ? "#ffffff" : "inherit",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        size={isMobile ? "medium" : "small"}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontSize: { xs: "1.05rem", md: "1rem" },
                            "&:hover fieldset": {
                              borderColor: mode === "dark" ? "#ffffff" : matteColors[900],
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: mode === "dark" ? "#cccccc" : "inherit",
                          },
                          "& .MuiOutlinedInput-input": {
                            color: mode === "dark" ? "#ffffff" : "inherit",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        size={isMobile ? "medium" : "small"}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontSize: { xs: "1.05rem", md: "1rem" },
                            "&:hover fieldset": {
                              borderColor: mode === "dark" ? "#ffffff" : matteColors[900],
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: mode === "dark" ? "#cccccc" : "inherit",
                          },
                          "& .MuiOutlinedInput-input": {
                            color: mode === "dark" ? "#ffffff" : "inherit",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={isMobile ? 5 : 4}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        size={isMobile ? "medium" : "small"}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontSize: { xs: "1.05rem", md: "1rem" },
                            "&:hover fieldset": {
                              borderColor: mode === "dark" ? "#ffffff" : matteColors[900],
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: mode === "dark" ? "#cccccc" : "inherit",
                          },
                          "& .MuiOutlinedInput-input": {
                            color: mode === "dark" ? "#ffffff" : "inherit",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          width: "100%",
                        }}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          size={isMobile ? "large" : "medium"}
                          startIcon={
                            isSubmitting ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <SendIcon />
                            )
                          }
                          disabled={isSubmitting}
                          sx={{
                            backgroundColor: matteColors[900],
                            color: "white",
                            py: isMobile ? 1.2 : 1,
                            px: isMobile ? 3 : 4,
                            fontSize: { xs: "1.04rem", md: "0.9rem" },
                            borderRadius: 10,
                            width: "auto",
                            minWidth: 0,
                            "&:hover": {
                              backgroundColor: matteColors[800],
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            },
                            "&:disabled": {
                              backgroundColor: matteColors[600],
                              transform: "none",
                              boxShadow: "none",
                            },
                            transition: "all 0.3s ease",
                            alignSelf: "center",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isSubmitting ? "SENDING..." : "SEND"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;
