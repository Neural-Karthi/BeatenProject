import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Grid,
  Divider,
  Avatar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  AssignmentReturn as ReturnIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
} from "@mui/icons-material";
import { useTheme, useMediaQuery } from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepIcon from "@mui/material/StepIcon";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80x80?text=Product";

// Helper to get image URL
const getImageUrl = (img) => {
  if (!img) return PLACEHOLDER_IMAGE;
  if (img.startsWith("http")) return img;
  if (img.startsWith("photo-")) return `https://images.unsplash.com/${img}`;
  return `/images/${img}`;
};

// Define matte black colors
const matteColors = {
  900: "#1a1a1a",
  800: "#2d2d2d",
  700: "#404040",
  600: "#525252",
  100: "#f5f5f5",
};

// Status to chip color mapping
const statusChipColors = {
  pending: "warning",
  approved: "info",
  completed: "success",
  rejected: "error",
  return_rejected: "error",
};

// Status to label mapping
const statusLabels = {
  pending: "Requested",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  return_rejected: "Return Rejected",
};

// Stepper steps
const steps = ["Requested", "Approved", "Completed"];

// Map return status to Stepper index
const getStepIndex = (status, received) => {
  console.log(`Processing status: ${status}, received: ${received}`);
  if (received || status === "completed") {
    return 2; // Completed (all steps completed)
  }
  if (status === "approved") {
    return 2; // Move to Completed, mark Requested and Approved as completed
  }
  if (status === "rejected" || status === "return_rejected") {
    return 0; // Stay at Requested
  }
  if (status === "pending") {
    return 0; // Requested
  }
  console.warn(`Unrecognized status: ${status}`);
  return 0; // Default to Requested
};

// Map status to icon
const getStatusIcon = (status, received) => {
  if (received || status === "completed") return <CheckCircleIcon />;
  if (status === "approved") return <CheckCircleIcon />;
  if (status === "rejected" || status === "return_rejected")
    return <RejectedIcon />;
  return <PendingIcon />;
};

// Custom StepIcon component to show green checkmark for completed steps
const CustomStepIcon = ({ active, completed, icon, status, received }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Determine if step should show a green checkmark
  const showCheckmark =
    completed || // Steps before activeStep
    (icon === 1 && status !== "rejected" && status !== "return_rejected") || // Requested completed unless rejected
    (icon === 2 &&
      (status === "approved" || status === "completed" || received)) || // Approved completed for approved or higher
    (icon === 3 && (status === "completed" || received)); // Completed only for completed/received

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: showCheckmark
          ? isDarkMode
            ? "#4CAF50"
            : "success.main" // Green for completed
          : active
          ? isDarkMode
            ? "#FFD700"
            : "primary.main" // Yellow/Blue for active
          : isDarkMode
          ? "#cccccc"
          : matteColors[600], // Gray for inactive
        color:
          showCheckmark || active ? (isDarkMode ? "#000" : "#fff") : "#fff",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {showCheckmark ? <CheckCircleIcon sx={{ fontSize: 20 }} /> : icon}
    </Box>
  );
};

const Returns = ({ mode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Define card colors based on mode
  const getCardColors = () => {
    if (mode === "dark") {
      return {
        background: "linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)",
        text: "#ffffff",
        textSecondary: "#cccccc",
        cardBackground: "#2d2d2d",
        border: "1px solid rgba(255,255,255,0.1)",
        shadow: "0 4px 16px rgba(0,0,0,0.3)",
      };
    }
    return {
      background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
      text: "#1a1a1a",
      textSecondary: "#666666",
      cardBackground: "#ffffff",
      border: "none",
      shadow: "0 4px 16px rgba(0,0,0,0.08)",
    };
  };

  const cardColors = getCardColors();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch returns
  const fetchReturns = async () => {
    setLoading(true);
    setError("");
    try {
      const apiUrl =
        process.env.REACT_APP_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.get(`${apiUrl}/user/returns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const returnsData = response.data.data || [];
      // Normalize status to lowercase
      const normalizedReturns = returnsData.map((ret) => ({
        ...ret,
        status: ret.status ? ret.status.toLowerCase() : "pending",
      }));
      setReturns(normalizedReturns);
      console.log("Fetched returns:", normalizedReturns);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch returns.";
      setError(errorMsg);
      console.error("Error fetching returns:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReturns();
    }
  }, [user]);

  // Sort returns by date descending (newest first)
  const sortedReturns = [...returns].sort(
    (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  );

  // Handle clicking on return card to fetch order details
  const handleReturnCardClick = async (orderId) => {
    setOrderDialogOpen(true);
    setOrderLoading(true);
    setOrderError("");
    setOrderDetails(null);
    try {
      const apiUrl =
        process.env.REACT_APP_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const response = await axios.get(`${apiUrl}/orders/my/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrderDetails(response.data.data);
      console.log("Fetched order details:", response.data.data);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch order details.";
      setOrderError(errorMsg);
      console.error("Error fetching order details:", errorMsg);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCloseOrderDialog = () => {
    setOrderDialogOpen(false);
    setOrderDetails(null);
    setOrderError("");
  };

  // Don't render if not logged in
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Container
        sx={{
          py: { xs: 4, md: 8 },
          bgcolor: mode === "dark" ? "#181818" : "#fff",
          color: mode === "dark" ? "#fff" : "#181818",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 4, md: 8 },
        bgcolor: mode === "dark" ? "#181818" : "#f7f9fa",
        color: mode === "dark" ? "#fff" : "#181818",
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 900,
          mb: 4,
          textAlign: "center",
          letterSpacing: 1,
          color: mode === "dark" ? "#fff" : "inherit",
        }}
      >
        My Returns
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="outlined"
          onClick={fetchReturns}
          startIcon={<RefreshIcon />}
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            px: 3,
            borderColor: mode === "dark" ? "#fff" : "inherit",
            color: mode === "dark" ? "#fff" : "inherit",
            "&:hover": {
              backgroundColor:
                mode === "dark" ? "rgba(255,255,255,0.1)" : "inherit",
            },
          }}
        >
          Refresh Returns
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {sortedReturns.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <ReturnIcon
            sx={{
              fontSize: 60,
              color: mode === "dark" ? "#666666" : "#bdbdbd",
              mb: 2,
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: mode === "dark" ? "#fff" : "inherit",
            }}
          >
            No Returns Found
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: mode === "dark" ? "#cccccc" : "text.secondary" }}
          >
            You have not requested any returns yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {sortedReturns.map((ret) => {
            const stepIndex = getStepIndex(ret.status, ret.received);
            const chipLabel = statusLabels[ret.status] || statusLabels.pending;
            const chipColor =
              statusChipColors[ret.status] || statusChipColors.pending;

            return (
              <Grid
                item
                xs={12}
                sm={12}
                md={10}
                lg={8}
                key={ret._id}
                sx={{ mx: "auto" }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    p: { xs: 2.5, sm: 4 },
                    boxShadow: cardColors.shadow,
                    background: cardColors.cardBackground,
                    border: cardColors.border,
                    minHeight: 220,
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    cursor: "pointer",
                  }}
                  onClick={() => handleReturnCardClick(ret.orderId)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between",
                      mb: 1,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: { xs: "100%", sm: "auto" },
                        mb: { xs: 2, sm: 0 },
                      }}
                    >
                      <Avatar
                        src={getImageUrl(ret.productImage || ret.image)}
                        alt={ret.productName || "Product Name"}
                        sx={{
                          width: { xs: 72, md: 64 },
                          height: { xs: 72, md: 64 },
                          borderRadius: 2,
                          bgcolor: "#fafafa",
                          border: "2px solid #e0e0e0",
                          mr: 2,
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: "1.1rem",
                            color: cardColors.text,
                          }}
                        >
                          {ret.productName || "Product Name"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: cardColors.textSecondary }}
                        >
                          Order:{" "}
                          <b style={{ color: cardColors.text }}>
                            {ret.orderId}
                          </b>
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: cardColors.textSecondary }}
                        >
                          Return ID:{" "}
                          <b style={{ color: cardColors.text }}>{ret._id}</b>
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={chipLabel}
                      color={chipColor}
                      icon={getStatusIcon(ret.status, ret.received)}
                      sx={{
                        fontWeight: 600,
                        fontSize: 15,
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                        minWidth: 120,
                        textAlign: "center",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      flexWrap: "wrap",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: cardColors.text }}
                      >
                        Requested:{" "}
                        {ret.date
                          ? new Date(ret.date).toLocaleDateString()
                          : "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: cardColors.textSecondary,
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    Reason:{" "}
                    <span style={{ fontWeight: 700, color: cardColors.text }}>
                      {ret.reason || "N/A"}
                    </span>
                  </Typography>
                  {(ret.status === "rejected" ||
                    ret.status === "return_rejected") &&
                    ret.rejectionReason && (
                      <Typography
                        variant="body2"
                        sx={{ color: "error.main", fontWeight: 600, mb: 0.5 }}
                      >
                        Rejection Reason:{" "}
                        <span style={{ fontWeight: 700 }}>
                          {ret.rejectionReason}
                        </span>
                      </Typography>
                    )}
                  {ret.status &&
                    !Object.keys(statusLabels).includes(ret.status) && (
                      <Typography
                        variant="body2"
                        sx={{ color: "warning.main", fontWeight: 600, mb: 0.5 }}
                      >
                        Warning: Unrecognized status "{ret.status}"
                      </Typography>
                    )}
                  <Box sx={{ mt: 3 }}>
                    <Stepper
                      activeStep={stepIndex}
                      alternativeLabel
                      sx={{
                        "& .MuiStepLabel-label": {
                          color:
                            mode === "dark"
                              ? "#cccccc"
                              : cardColors.textSecondary,
                          fontWeight: 600,
                        },
                        "& .MuiStepLabel-label.Mui-active": {
                          color: mode === "dark" ? "#FFD700" : "primary.main",
                        },
                        "& .MuiStepLabel-label.Mui-completed": {
                          color:
                            mode === "dark"
                              ? "#FFD700"
                              : cardColors.textSecondary, 
                        },
                        "& .MuiStepIcon-root": {
                          color: mode === "dark" ? "#888" : "#ccc", 
                        },
                        "& .MuiStepIcon-root.Mui-active": {
                          color: mode === "dark" ? "#FFD700" : "primary.main",
                        },
                        "& .MuiStepIcon-root.Mui-completed": {
                          color: "#4CAF50", 
                        },
                      }}
                    >
                      {steps.map((label, index) => (
                        <Step key={label}>
                          <StepLabel
                            StepIconComponent={(props) => (
                              <CustomStepIcon
                                {...props}
                                status={ret.status}
                                received={ret.received}
                                icon={index + 1}
                              />
                            )}
                          >
                            {label}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={orderDialogOpen}
        onClose={handleCloseOrderDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: cardColors.cardBackground,
            border: cardColors.border,
            boxShadow: cardColors.shadow,
          },
        }}
      >
        <DialogTitle sx={{ color: cardColors.text }}>Order Details</DialogTitle>
        <DialogContent dividers>
          {orderLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : orderError ? (
            <Alert severity="error">{orderError}</Alert>
          ) : orderDetails ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: cardColors.text }}>
                Order #{orderDetails._id}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: cardColors.textSecondary }}
              >
                Placed on:{" "}
                {new Date(orderDetails.createdAt).toLocaleDateString()}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: cardColors.textSecondary }}
              >
                Total: ₹{orderDetails.totalPrice}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 1, color: cardColors.textSecondary }}
              >
                Payment Type:{" "}
                {orderDetails.paymentInfo?.method?.toUpperCase() || "N/A"}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 1, color: cardColors.text }}
              >
                Order Items:
              </Typography>
              <List>
                {orderDetails.orderItems.map((item, idx) => (
                  <ListItem key={idx} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar
                        src={item.image || PLACEHOLDER_IMAGE}
                        alt={item.name}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <span style={{ color: cardColors.text }}>
                          {item.name}
                        </span>
                      }
                      secondary={
                        <span style={{ color: cardColors.textSecondary }}>
                          Qty: {item.qty} | Price: ₹{item.price}
                        </span>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 1, color: cardColors.text }}
              >
                Delivery Address:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: cardColors.textSecondary }}
              >
                {orderDetails.shippingAddress?.address},{" "}
                {orderDetails.shippingAddress?.city},{" "}
                {orderDetails.shippingAddress?.state},{" "}
                {orderDetails.shippingAddress?.country},{" "}
                {orderDetails.shippingAddress?.postalCode}
              </Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseOrderDialog}
            color="primary"
            variant="contained"
            sx={{
              backgroundColor: mode === "dark" ? "#FFD700" : "primary.main",
              color: mode === "dark" ? "#000" : "white",
              "&:hover": {
                backgroundColor: mode === "dark" ? "#FFC700" : "primary.dark",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Returns;
