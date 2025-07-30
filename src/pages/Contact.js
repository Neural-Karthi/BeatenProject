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

  const matteColors = {
    900: "#1a1a1a",
    800: "#2d2d2d",
    700: "#404040",
    600: "#525252",
    100: "#f5f5f5",
  };

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
      content: "support@beaten.in",
      link: "mailto:support@beaten.in",
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
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 6, md: 8 },
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
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
              letterSpacing: { xs: 0.5, md: 1 },
            }}
          >
            Contact Us
          </Typography>
          <Typography
            variant="h5"
            paragraph
            sx={{
              maxWidth: 600,
              mx: "auto",
              fontWeight: 400,
              lineHeight: 1.6,
              color: mode === "dark" ? "#cccccc" : matteColors[700],
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            We're here to help. Get in touch with us for any questions or support.
          </Typography>
        </Box>

        {/* Contact Information */}
        <Grid container spacing={3} sx={{ mb: { xs: 6, md: 8 } }}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: "16px",
                  background: cardColors.background,
                  boxShadow: cardColors.shadow,
                  border: cardColors.border,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Box sx={{ mt: 0.5 }}>{info.icon}</Box>
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: cardColors.text,
                      fontSize: { xs: "1.1rem", md: "1.25rem" },
                      mb: 1,
                    }}
                  >
                    {info.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    component="a"
                    href={info.link}
                    target={info.title === "Address" ? "_blank" : undefined}
                    rel={info.title === "Address" ? "noopener noreferrer" : undefined}
                    sx={{
                      lineHeight: 1.6,
                      color: cardColors.textSecondary,
                      textDecoration: "none",
                      display: "block",
                      fontSize: { xs: "0.95rem", md: "1rem" },
                      "&:hover": {
                        color: cardColors.text,
                        textDecoration: "underline",
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
        <Box sx={{ mt: { xs: 4, md: 6 } }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: mode === "dark" ? "#ffffff" : matteColors[900],
              mb: { xs: 3, md: 4 },
              textAlign: "center",
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            Get in Touch
          </Typography>
          <Grid container spacing={4}>
            {/* Business Hours */}
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
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: cardColors.text,
                    mb: 3,
                    fontSize: { xs: "1.25rem", md: "1.5rem" },
                  }}
                >
                  Business Hours
                </Typography>
                <Box sx={{ mb: 3 }}>
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
                      lineHeight: 1.6,
                      fontSize: { xs: "0.95rem", md: "1rem" },
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
                      lineHeight: 1.6,
                      fontSize: { xs: "0.95rem", md: "1rem" },
                      color: cardColors.textSecondary,
                    }}
                  >
                    <strong style={{ color: cardColors.text }}>Monday - Saturday:</strong>
                    <br />
                    10:00 AM - 7:00 PM
                  </Typography>
                </Box>
                <Box
                  sx={{ mt: "auto", pt: 3, borderTop: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.6,
                      fontSize: { xs: "0.875rem", md: "0.95rem" },
                      color: cardColors.textSecondary,
                      fontStyle: "italic",
                    }}
                  >
                    For urgent matters, please call our customer support line. We aim to respond to all emails within 24 hours during business days.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} md={7}>
              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: "16px",
                  background: cardColors.background,
                  boxShadow: cardColors.shadow,
                  border: cardColors.border,
                  height: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
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
                            fontSize: { xs: "1rem", md: "0.95rem" },
                            "& fieldset": {
                              borderColor: mode === "dark" ? "#888" : matteColors[600],
                            },
                            "&:hover fieldset": {
                              borderColor: mode === "dark" ? "#fff" : matteColors[900],
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: mode === "dark" ? "#ffffff" : matteColors[800],
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: mode === "dark" ? "#cccccc" : matteColors[700],
                            fontSize: { xs: "1rem", md: "0.95rem" },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: mode === "dark" ? "#ffffff" : "#181818",
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
                            fontSize: { xs: "1rem", md: "0.95rem" },
                            "& fieldset": {
                              borderColor: mode === "dark" ? "#888" : matteColors[600],
                            },
                            "&:hover fieldset": {
                              borderColor: mode === "dark" ? "#fff" : matteColors[900],
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: mode === "dark" ? "#ffffff" : matteColors[800],
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: mode === "dark" ? "#cccccc" : matteColors[700],
                            fontSize: { xs: "1rem", md: "0.95rem" },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: mode === "dark" ? "#ffffff" : "#181818",
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
                            fontSize: { xs: "1rem", md: "0.95rem" },
                            "& fieldset": {
                              borderColor: mode === "dark" ? "#888" : matteColors[600],
                            },
                            "&:hover fieldset": {
                              borderColor: mode === "dark" ? "#fff" : matteColors[900],
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: mode === "dark" ? "#ffffff" : matteColors[800],
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: mode === "dark" ? "#cccccc" : matteColors[700],
                            fontSize: { xs: "1rem", md: "0.95rem" },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: mode === "dark" ? "#ffffff" : "#181818",
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
                            fontSize: { xs: "1rem", md: "0.95rem" },
                            "& fieldset": {
                              borderColor: mode === "dark" ? "#888" : matteColors[600],
                            },
                            "&:hover fieldset": {
                              borderColor: mode === "dark" ? "#fff" : matteColors[900],
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: mode === "dark" ? "#ffffff" : matteColors[800],
                              borderWidth: "2px",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: mode === "dark" ? "#cccccc" : matteColors[700],
                            fontSize: { xs: "1rem", md: "0.95rem" },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: mode === "dark" ? "#ffffff" : "#181818",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size={isMobile ? "large" : "medium"}
                          disabled={isSubmitting}
                          sx={{
                            backgroundColor: mode === "dark" ? "#ffffff" : matteColors[900],
                            color: mode === "dark" ? matteColors[900] : "#ffffff",
                            py: { xs: 1.5, md: 1 },
                            px: { xs: 4, md: 6 },
                            fontSize: { xs: "1rem", md: "0.95rem" },
                            fontWeight: 600,
                            borderRadius: "12px",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: mode === "dark" ? "#f0f0f0" : matteColors[800],
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            },
                            "&:disabled": {
                              backgroundColor: mode === "dark" ? "#555" : "#ddd",
                              color: "#aaa",
                              transform: "none",
                              boxShadow: "none",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          {isSubmitting ? "Sending..." : "Send Message"}
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
          sx={{
            width: "100%",
            bgcolor: mode === "dark" ? "#333" : "#fff",
            color: mode === "dark" ? "#fff" : "#000",
            "& .MuiAlert-icon": {
              color: snackbar.severity === "success" ? "#4caf50" : "#f44336",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;