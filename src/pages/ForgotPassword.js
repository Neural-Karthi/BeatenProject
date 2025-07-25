import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const ForgotPassword = ({ mode }) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        await axios.post("/api/auth/forgot-password", values);
        setSuccess("Password reset link has been sent to your email");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to send reset link");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: { xs: 4, md: 8 },
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "#181818",
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            p: 4,
            width: "100%",
            bgcolor: mode === "dark" ? "#232323" : "#fafafa",
            color: mode === "dark" ? "#fff" : "#000",
          }}
          elevation={3}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{ color: mode === "dark" ? "#fff" : "#000" }}
          >
            Forgot Password
          </Typography>

          <Typography
            variant="body1"
            align="center"
            sx={{
              mb: 4,
              color: mode === "dark" ? "#ccc" : "#555",
            }}
          >
            Enter your email address and we'll send you a link to reset your
            password
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              margin="normal"
              InputLabelProps={{
                style: { color: mode === "dark" ? "#aaa" : "#555" },
              }}
              InputProps={{
                style: {
                  color: mode === "dark" ? "#fff" : "#000",
                  backgroundColor: mode === "dark" ? "#2e2e2e" : "#fff",
                },
              }}
            />

           <Button
  type="submit"
  fullWidth
  variant="contained"
  size="large"
  disabled={loading}
  sx={{
    mt: 3,
    mb: 2,
    bgcolor: mode === "dark" ? "#1e88e5" : "#1976d2",
    color: "#fff",
    "&:hover": {
      bgcolor: mode === "dark" ? "#1565c0" : "#115293",
    },
  }}
>
  {loading ? (
    "Loading.."
  ) : (
    "Send Reset Link"
  )}
</Button>

          </form>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography
              variant="body2"
              sx={{ color: mode === "dark" ? "#ccc" : "#555" }}
            >
              Remember your password?{" "}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{
                  color: mode === "dark" ? "#90caf9" : "#1976d2",
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
