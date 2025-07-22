import React, { useState, useEffect, useContext } from "react";
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
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTheme, useMediaQuery } from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import InfoIcon from '@mui/icons-material/Info';

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80x80?text=Product";

// Correct placement for getImageUrl helper
const getImageUrl = (img) => {
  if (!img) return PLACEHOLDER_IMAGE;
  if (img.startsWith('http')) return img;
  if (img.startsWith('photo-')) return `https://images.unsplash.com/${img}`;
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

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    case "return_rejected":
      return "error";
    default:
      return "default";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "approved":
      return <ApprovedIcon />;
    case "pending":
      return <PendingIcon />;
    case "rejected":
      return <RejectedIcon />;
    case "return_rejected":
      return <RejectedIcon />;
    default:
      return <PendingIcon />;
  }
};

const statusColors = {
  pending: '#fffbe6', // light yellow
  approved: '#e3f2fd', // light blue
  completed: '#e8f5e9', // light green
};
const statusChipColors = {
  pending: 'warning',
  approved: 'info',
  completed: 'success',
};
const statusLabels = {
  pending: 'Requested',
  approved: 'Approved',
  completed: 'Completed',
  return_rejected: 'Return Rejected',
};
const steps = ['Requested', 'Approved', 'Completed'];

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

  // Define colors based on mode
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
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchReturns = async () => {
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/user/returns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReturns(response.data.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch returns."
      );
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
  const sortedReturns = [...returns].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  // Don't render anything if not logged in
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

  const handleReturnCardClick = async (orderId) => {
    setOrderDialogOpen(true);
    setOrderLoading(true);
    setOrderError("");
    setOrderDetails(null);
    try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("token");
      const response = await axios.get(`${apiUrl}/orders/my/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrderDetails(response.data.data);
    } catch (err) {
      setOrderError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch order details."
      );
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCloseOrderDialog = () => {
    setOrderDialogOpen(false);
    setOrderDetails(null);
    setOrderError("");
  };

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
          color: mode === "dark" ? "#fff" : "inherit"
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
              backgroundColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "inherit",
            },
          }}
        >
          Refresh Returns
        </Button>
      </Box>
      {sortedReturns.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <ReturnIcon sx={{ fontSize: 60, color: mode === "dark" ? "#666666" : "#bdbdbd", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: mode === "dark" ? "#fff" : "inherit" }}>
            No Returns Found
          </Typography>
          <Typography variant="body1" sx={{ color: mode === "dark" ? "#cccccc" : "text.secondary" }}>
            You have not requested any returns yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {sortedReturns.map((ret) => {
            // Determine status for stepper and color
            let stepIndex = 0;
            let cardBg = '#fff'; // White card like Orders
            let chipColor = statusChipColors.pending;
            let chipLabel = statusLabels.pending;
            if (ret.status === 'approved') {
              stepIndex = 1;
              chipColor = statusChipColors.approved;
              chipLabel = statusLabels.approved;
            }
            if (ret.status === 'rejected' || ret.status === 'return_rejected') {
              stepIndex = 0;
              chipColor = 'error';
              chipLabel = 'Return Rejected';
            }
            if (ret.received) {
              stepIndex = 2;
              chipColor = statusChipColors.completed;
              chipLabel = statusLabels.completed;
            }
            return (
              <Grid item xs={12} sm={12} md={10} lg={8} key={ret._id} sx={{ mx: 'auto' }}>
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
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' }, mb: { xs: 2, sm: 0 } }}>
                      <Avatar
                        src={getImageUrl(ret.productImage || ret.image)}
                        alt={ret.productName || 'Product Name'}
                        sx={{ width: { xs: 72, md: 64 }, height: { xs: 72, md: 64 }, borderRadius: 2, bgcolor: '#fafafa', border: '2px solid #e0e0e0', mr: 2 }}
                        onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1.1rem', color: cardColors.text }}>
                          {ret.productName || 'Product Name'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: cardColors.textSecondary }}>
                          Order: <b style={{ color: cardColors.text }}>{ret.orderId}</b>
                        </Typography>
                        <Typography variant="body2" sx={{ color: cardColors.textSecondary }}>
                          Return ID: <b style={{ color: cardColors.text }}>{ret._id}</b>
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={chipLabel}
                      color={chipColor}
                      icon={ret.status === 'rejected' || ret.status === 'return_rejected' ? <RejectedIcon /> : (stepIndex === 2 ? <CheckCircleIcon /> : (stepIndex === 1 ? <InfoIcon /> : <PendingIcon />))}
                      sx={{ fontWeight: 600, fontSize: 15, borderRadius: 2, px: 1.5, py: 0.5, minWidth: 120, textAlign: 'center' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon fontSize="small" sx={{ color: mode === "dark" ? "#FFD700" : "inherit" }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: cardColors.text }}>
                        Requested: {ret.date ? new Date(ret.date).toLocaleDateString() : ''}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: cardColors.textSecondary, fontWeight: 600, mb: 0.5 }}>
                    Reason: <span style={{ fontWeight: 700, color: cardColors.text }}>{ret.reason}</span>
                  </Typography>
                  { (ret.status === 'rejected' || ret.status === 'return_rejected') && ret.rejectionReason && (
                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600, mb: 0.5 }}>
                      Rejection Reason: <span style={{ fontWeight: 700 }}>{ret.rejectionReason}</span>
                    </Typography>
                  )}
                  <Box sx={{ mt: 3 }}>
                    <Stepper 
                      activeStep={stepIndex} 
                      alternativeLabel
                      sx={{
                        '& .MuiStepLabel-root': {
                          color: mode === "dark" ? "#cccccc" : cardColors.textSecondary,
                        },
                        '& .MuiStepLabel-root.Mui-active': {
                          color: mode === "dark" ? "#FFD700" : "primary.main",
                        },
                        '& .MuiStepLabel-root.Mui-completed': {
                          color: mode === "dark" ? "#4CAF50" : "success.main",
                        },
                        '& .MuiStepIcon-root': {
                          color: mode === "dark" ? "#cccccc" : cardColors.textSecondary,
                        },
                        '& .MuiStepIcon-root.Mui-active': {
                          color: mode === "dark" ? "#FFD700" : "primary.main",
                        },
                        '& .MuiStepIcon-root.Mui-completed': {
                          color: mode === "dark" ? "#4CAF50" : "success.main",
                        },
                        '& .MuiStepLabel-label': {
                          color: mode === "dark" ? "#cccccc" : cardColors.textSecondary,
                          fontWeight: 600,
                        },
                        '& .MuiStepLabel-label.Mui-active': {
                          color: mode === "dark" ? "#FFD700" : "primary.main",
                        },
                        '& .MuiStepLabel-label.Mui-completed': {
                          color: mode === "dark" ? "#4CAF50" : "success.main",
                        },
                      }}
                    >
                      {steps.map((label) => (
                        <Step key={label}>
                          <StepLabel>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : orderError ? (
            <Alert severity="error">{orderError}</Alert>
          ) : orderDetails ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: cardColors.text }}>Order #{orderDetails._id}</Typography>
              <Typography variant="body2" sx={{ mb: 1, color: cardColors.textSecondary }}>Placed on: {new Date(orderDetails.createdAt).toLocaleDateString()}</Typography>
              <Typography variant="body2" sx={{ mb: 1, color: cardColors.textSecondary }}>Total: ₹{orderDetails.totalPrice}</Typography>
              <Typography variant="body2" sx={{ mb: 1, color: cardColors.textSecondary }}>Payment Type: {orderDetails.paymentInfo?.method?.toUpperCase() || 'N/A'}</Typography>
              <Typography variant="body2" sx={{ mb: 2, color: cardColors.textSecondary }}>Status: <Chip label={orderDetails.orderStatus} color={getStatusColor(orderDetails.orderStatus)} size="small" /></Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: cardColors.text }}>Order Items:</Typography>
              <List>
                {orderDetails.orderItems.map((item, idx) => (
                  <ListItem key={idx} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={item.image || PLACEHOLDER_IMAGE} alt={item.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<span style={{ color: cardColors.text }}>{item.name}</span>}
                      secondary={<span style={{ color: cardColors.textSecondary }}>{`Qty: ${item.qty} | Price: ₹${item.price}`}</span>}
                    />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: cardColors.text }}>Delivery Address:</Typography>
              <Typography variant="body2" sx={{ color: cardColors.textSecondary }}>{orderDetails.shippingAddress?.address}, {orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.state}, {orderDetails.shippingAddress?.country}, {orderDetails.shippingAddress?.postalCode}</Typography>
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
