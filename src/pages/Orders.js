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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
  CircularProgress, // Added for loading spinner
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon,
  RemoveRedEye as ViewIcon,
  ShoppingCart as ShoppingCartIcon,
  Autorenew as ExchangeIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useTheme, useMediaQuery } from "@mui/material";
import axios from "axios";
import PendingTimeIcon from "@mui/icons-material/AccessTime";
import ProcessingInventoryIcon from "@mui/icons-material/Inventory";
import MuiAlert from "@mui/material/Alert";
import { API_ENDPOINTS, buildApiUrl, handleApiError } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/80x80?text=Product";

const trackingSteps = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

// Define matte black colors
const matteColors = {
  900: "#1a1a1a",
  800: "#2d2d2d",
  700: "#404040",
  600: "#525252",
  100: "#f5f5f5",
};

// Updated statusStyles to include all relevant statuses
const statusStyles = {
  pending: { bg: "#ff9800", color: "#fff", icon: <PendingTimeIcon /> }, // Orange
  processing: { bg: "#0288d1", color: "#fff", icon: <ProcessingInventoryIcon /> }, // Blue
  shipped: { bg: "#181818", color: "#fff", icon: <ShippingIcon /> }, // Black
  "out for delivery": { bg: "#7b1fa2", color: "#fff", icon: <ShippingIcon /> }, // Purple
  delivered: { bg: "#388e3c", color: "#fff", icon: <DeliveredIcon /> }, // Green
  cancelled: { bg: "#d32f2f", color: "#fff", icon: <CancelledIcon /> }, // Red
};

const getImageUrl = (img) => {
  if (!img) return PLACEHOLDER_IMAGE;
  if (img.startsWith("http")) return img;
  if (img.startsWith("photo-")) return `https://images.unsplash.com/${img}`;
  return `/images/${img}`;
};

// Normalize and validate order status
const normalizeStatus = (status) => {
  if (!status) {
    console.warn("Order status is undefined or null, defaulting to 'pending'");
    return "pending";
  }
  const normalized = status.toLowerCase().replace(/[\s_]+/g, " ").trim();
  const validStatuses = [
    "pending",
    "processing",
    "shipped",
    "out for delivery",
    "delivered",
    "cancelled",
  ];
  // Map "confirmed" to "processing" for backward compatibility
  if (normalized === "confirmed") return "processing";
  if (!validStatuses.includes(normalized)) {
    console.warn(`Invalid order status "${status}", defaulting to 'pending'`);
    return "pending";
  }
  return normalized;
};

// Get display status for UI
const getDisplayStatus = (status) => {
  const normalized = normalizeStatus(status);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

// Get stepper index for status
const getStepperIndex = (status) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "delivered":
      return 4;
    case "out for delivery":
      return 3;
    case "shipped":
      return 2;
    case "processing":
      return 1;
    case "pending":
    default:
      return 0;
  }
};

const Orders = ({ mode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnItem, setReturnItem] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnComment, setReturnComment] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
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

  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrdersAndReturns = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const [ordersRes, returnsRes] = await Promise.all([
        axios.get(buildApiUrl(API_ENDPOINTS.ORDERS_MY_ORDERS), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(
          `${process.env.REACT_APP_API_URL || "http://localhost:8000/api"}/user/returns`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);
      const ordersData = ordersRes.data.data || [];
      const returnsData = returnsRes.data.data || [];
      // Create a Map for faster return lookup
      const returnsMap = new Map(
        returnsData.map((r) => [`${r.orderId}-${r.productId}`, r.status])
      );
      // Attach returnStatus to each order item
      ordersData.forEach((order) => {
        order.orderItems.forEach((item) => {
          item.returnStatus = returnsMap.get(
            `${order._id}-${item.product || item._id}`
          );
        });
      });
      setOrders(ordersData);
      setReturns(returnsData);
    } catch (err) {
      const error = handleApiError(err);
      setError(error.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndReturns();
  }, []);

  // Replaced loading text with spinner
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 }, minHeight: "100vh" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <CircularProgress
            sx={{
              color: mode === "dark" ? "#FFD700" : matteColors[900],
            }}
          />
        </Box>
      </Container>
    );
  }

  const handleExpandToggle = (orderId) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setTrackOpen(true);
  };

  const handleClose = () => {
    setDetailsOpen(false);
    setTrackOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenReturnDialog = (orderId, item, idx) => {
    console.log("Opening return dialog for:", { orderId, item, idx });
    setReturnItem({ orderId, item, idx });
    setReturnReason("");
    setReturnComment("");
    setReturnDialogOpen(true);
  };

  const handleCloseReturnDialog = () => {
    console.log("Closing return dialog");
    setReturnDialogOpen(false);
    setReturnItem(null);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        buildApiUrl(API_ENDPOINTS.USER_RETURN_SUBMIT),
        {
          orderId: returnItem.orderId,
          productId: returnItem.item.product || returnItem.item._id,
          reason: returnReason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSnackbarMsg("Return request submitted!");
      setSnackbarSeverity("success");
    } catch (err) {
      let msg = "Failed to submit return request.";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setSnackbarMsg(msg);
      setSnackbarSeverity("error");
    } finally {
      setReturnDialogOpen(false);
      setSnackbarOpen(true);
      setReturnItem(null);
      console.log("Snackbar should open now");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000/api"}/orders/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSnackbarMsg("Order cancelled successfully!");
        setSnackbarSeverity("success");
        fetchOrdersAndReturns();
      } else {
        setSnackbarMsg(response.data.message || "Failed to cancel order.");
        setSnackbarSeverity("error");
      }
    } catch (err) {
      let msg = "Failed to cancel order.";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setSnackbarMsg(msg);
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 3, textAlign: "center" }}
        >
          My Orders
        </Typography>
        <Divider sx={{ mb: 4 }} />
        <Box sx={{ textAlign: "center", py: 8 }}>
          <ShoppingCartIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            You have no orders yet.
          </Typography>
          <Button variant="contained" color="primary" href="/products">
            Shop Now
          </Button>
        </Box>
      </Container>
    );
  }

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 4, md: 8 },
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "#181818",
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 2 }}>
        <Button
          variant="outlined"
          onClick={fetchOrdersAndReturns}
          sx={{
            borderColor: mode === "dark" ? "#fff" : "inherit",
            color: mode === "dark" ? "#fff" : "inherit",
            "&:hover": {
              backgroundColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "inherit",
            },
          }}
        >
          Refresh Orders
        </Button>
        <Button
           variant="outlined"
          onClick={() => navigate("/returns")}
          sx={{
            borderColor: mode === "dark" ? "#fff" : "inherit",
            color: mode === "dark" ? "#fff" : "inherit",
            "&:hover": {
              backgroundColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "inherit",
            },
          }}
        >
          My Returns
        </Button>
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          mb: 3,
          textAlign: "center",
          color: mode === "dark" ? "#fff" : "inherit",
        }}
      >
        My Orders
      </Typography>
      <Divider sx={{ mb: 4 }} />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3}>
        {sortedOrders.map((order) => (
          <Grid item xs={12} key={order._id}>
            {isMobile ? (
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  boxShadow: cardColors.shadow,
                  background: cardColors.cardBackground,
                  border: cardColors.border,
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  position: "relative",
                }}
              >
                <Button
                  onClick={() => handleExpandToggle(order._id)}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    minWidth: 0,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    color: matteColors[900],
                    backgroundColor: matteColors[100],
                    boxShadow: "none",
                    zIndex: 2,
                    "&:hover": {
                      backgroundColor: matteColors[800],
                      color: "white",
                      boxShadow: "none",
                    },
                  }}
                >
                  {expandedOrders.includes(order._id) ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Button>
                <Typography
                  variant="body2"
                  sx={{ color: cardColors.textSecondary, fontWeight: 600, mb: 1 }}
                >
                  Placed on: {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    flex: 1,
                    mb: 2,
                  }}
                >
                  {(expandedOrders.includes(order._id)
                    ? order.orderItems
                    : order.orderItems.slice(0, 2)
                  ).map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Avatar
                        src={getImageUrl(
                          item.image || (item.product && item.product.image)
                        )}
                        alt={item.name}
                        sx={{
                          width: { xs: 72, md: 64 },
                          height: { xs: 72, md: 64 },
                          borderRadius: 2,
                          bgcolor: "#fafafa",
                          border: "2px solid #e0e0e0",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: cardColors.text,
                          flex: 1,
                          minWidth: 0,
                          pr: 1,
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                          fontSize: "0.9rem",
                        }}
                      >
                        {item.name}
                      </Typography>
                      {expandedOrders.includes(order._id) &&
                        normalizeStatus(order.status) === "delivered" && (
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              ml: 1,
                              mr: 1,
                              borderRadius: 8,
                              fontSize: "0.82rem",
                              px: 1.2,
                              py: 0.4,
                              minWidth: 0,
                              minHeight: 32,
                              color: mode === "dark" ? "#fff" : matteColors[900],
                              borderColor: mode === "dark" ? "#fff" : matteColors[900],
                              backgroundColor: mode === "dark" ? "transparent" : "white",
                              textTransform: "none",
                              boxShadow: "none",
                              whiteSpace: "nowrap",
                              "&:hover": {
                                backgroundColor: mode === "dark" ? "rgba(255,255,255,0.1)" : matteColors[100],
                                borderColor: mode === "dark" ? "#FFD700" : matteColors[800],
                                color: mode === "dark" ? "#FFD700" : matteColors[800],
                                boxShadow: "none",
                              },
                            }}
                            onClick={() =>
                              handleOpenReturnDialog(order._id, item, idx)
                            }
                            disabled={item.returnStatus}
                          >
                            Return/Exchange
                          </Button>
                        )}
                      {item.returnStatus === "return_rejected" && (
                        <Chip
                          label="Return Rejected"
                          color="error"
                          size="small"
                          sx={{ ml: 1, fontWeight: 600 }}
                        />
                      )}
                      {item.returnStatus === "approved" && (
                        <Chip
                          label="Return Accepted"
                          color="success"
                          size="small"
                          sx={{ ml: 1, fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
                {expandedOrders.includes(order._id) && (
                  <>
                    <Box sx={{ mb: 2, mt: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: cardColors.textSecondary,
                          mb: 0.5,
                        }}
                      >
                        Order #{order._id}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: cardColors.textSecondary, mb: 0.5 }}
                      >
                        Total: <b style={{ color: cardColors.text }}>₹{order.totalPrice}</b>
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: cardColors.textSecondary, mb: 0.5 }}
                      >
                        Payment Type:{" "}
                        {order.paymentInfo?.method
                          ? order.paymentInfo.method.toUpperCase()
                          : "N/A"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: cardColors.textSecondary, mb: 0.5 }}
                      >
                        Delivery Address:{" "}
                        {order.shippingAddress ? (
                          <>
                            {order.shippingAddress.name && (
                              <>{order.shippingAddress.name}, </>
                            )}
                            {order.shippingAddress.address && (
                              <>{order.shippingAddress.address}, </>
                            )}
                            {order.shippingAddress.city && (
                              <>{order.shippingAddress.city}, </>
                            )}
                            {order.shippingAddress.state && (
                              <>{order.shippingAddress.state}, </>
                            )}
                            {order.shippingAddress.postalCode && (
                              <>{order.shippingAddress.postalCode}</>
                            )}
                            {order.shippingAddress.phone && (
                              <> ({order.shippingAddress.phone})</>
                            )}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </Typography>
                      <Chip
                        label={getDisplayStatus(order.status)}
                        icon={statusStyles[normalizeStatus(order.status)]?.icon}
                        sx={{
                          fontWeight: 600,
                          fontSize: "1rem",
                          px: 2,
                          py: 1,
                          mt: 1,
                          backgroundColor: statusStyles[normalizeStatus(order.status)]?.bg,
                          color: statusStyles[normalizeStatus(order.status)]?.color,
                          "& .MuiChip-icon": {
                            color: statusStyles[normalizeStatus(order.status)]?.color,
                          },
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        flexWrap: "wrap",
                        mt: 1,
                      }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        sx={{
                          fontWeight: 600,
                          minWidth: 120,
                          borderColor: mode === "dark" ? "#fff" : matteColors[900],
                          color: mode === "dark" ? "#fff" : matteColors[900],
                          backgroundColor: mode === "dark" ? "transparent" : "white",
                          py: { xs: 0.7, md: 1 },
                          px: { xs: 2, md: 3 },
                          fontSize: { xs: "0.92rem", md: "0.98rem" },
                          borderRadius: 10,
                          minHeight: { xs: 36, md: 42 },
                          textTransform: "none",
                          alignSelf: { xs: "stretch", md: "center" },
                          whiteSpace: "nowrap",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          "&:hover": {
                            backgroundColor: mode === "dark" ? "rgba(255,255,255,0.1)" : matteColors[100],
                            borderColor: mode === "dark" ? "#FFD700" : matteColors[800],
                            color: mode === "dark" ? "#FFD700" : matteColors[800],
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
                          },
                        }}
                        onClick={() => handleViewDetails(order)}
                        fullWidth={isMobile}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<ShippingIcon />}
                        sx={{
                          backgroundColor: mode === "dark" ? "#FFD700" : matteColors[900],
                          color: mode === "dark" ? "#000" : "white",
                          fontWeight: 600,
                          minWidth: 120,
                          py: { xs: 0.7, md: 1 },
                          px: { xs: 2, md: 3 },
                          fontSize: { xs: "0.92rem", md: "0.98rem" },
                          borderRadius: 10,
                          minHeight: { xs: 36, md: 42 },
                          textTransform: "none",
                          alignSelf: { xs: "stretch", md: "center" },
                          whiteSpace: "nowrap",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          "&:hover": {
                            backgroundColor: mode === "dark" ? "#FFC700" : matteColors[800],
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                        }}
                        onClick={() => handleTrackOrder(order)}
                        fullWidth={isMobile}
                      >
                        Track Order
                      </Button>
                      {(normalizeStatus(order.status) === "pending" ||
                        normalizeStatus(order.status) === "processing") && (
                        <Button
                          variant="contained"
                          startIcon={<CloseIcon />}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "white",
                            fontWeight: 600,
                            minWidth: 120,
                            py: { xs: 0.7, md: 1 },
                            px: { xs: 2, md: 3 },
                            fontSize: { xs: "0.92rem", md: "0.98rem" },
                            borderRadius: 10,
                            minHeight: { xs: 36, md: 42 },
                            textTransform: "none",
                            alignSelf: { xs: "stretch", md: "center" },
                            whiteSpace: "nowrap",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            "&:hover": {
                              backgroundColor: "#b71c1c",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            },
                          }}
                          onClick={() => handleCancelOrder(order._id)}
                          fullWidth={isMobile}
                        >
                          Cancel Order
                        </Button>
                      )}
                      {normalizeStatus(order.status) === "delivered" && (
                        <Button
                          variant="contained"
                          startIcon={<ExchangeIcon />}
                          sx={{
                            backgroundColor: mode === "dark" ? "#FFD700" : matteColors[900],
                            color: mode === "dark" ? "#000" : "white",
                            fontWeight: 600,
                            minWidth: 170,
                            py: { xs: 0.7, md: 1 },
                            px: { xs: 2, md: 3 },
                            fontSize: { xs: "0.92rem", md: "0.98rem" },
                            borderRadius: 10,
                            minHeight: { xs: 36, md: 42 },
                            textTransform: "none",
                            alignSelf: { xs: "stretch", md: "center" },
                            whiteSpace: "nowrap",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            "&:hover": {
                              backgroundColor: mode === "dark" ? "#FFC700" : matteColors[800],
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            },
                          }}
                          onClick={() =>
                            handleOpenReturnDialog(order._id, order.orderItems[0], 0)
                          }
                          disabled={order.orderItems[0].returnStatus}
                          fullWidth={isMobile}
                        >
                          Return
                        </Button>
                      )}
                    </Box>
                  </>
                )}
              </Paper>
            ) : (
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2.5, sm: 4 },
                  borderRadius: 3,
                  boxShadow: cardColors.shadow,
                  background: cardColors.cardBackground,
                  border: cardColors.border,
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { sm: "center" },
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: cardColors.textSecondary,
                        mb: 0.5,
                      }}
                    >
                      Order #{order._id}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: cardColors.textSecondary, mb: 0.5 }}
                    >
                      Placed on: {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: cardColors.textSecondary, mb: 0.5 }}
                    >
                      Total: <b style={{ color: cardColors.text }}>₹{order.totalPrice}</b>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: cardColors.textSecondary, mb: 0.5 }}
                    >
                      Payment Type:{" "}
                      {order.paymentInfo?.method
                        ? order.paymentInfo.method.toUpperCase()
                        : "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: cardColors.textSecondary, mb: 0.5 }}
                    >
                      Delivery Address:{" "}
                      {order.shippingAddress ? (
                        <>
                          {order.shippingAddress.name && (
                            <>{order.shippingAddress.name}, </>
                          )}
                          {order.shippingAddress.address && (
                            <>{order.shippingAddress.address}, </>
                          )}
                          {order.shippingAddress.city && (
                            <>{order.shippingAddress.city}, </>
                          )}
                          {order.shippingAddress.state && (
                            <>{order.shippingAddress.state}, </>
                          )}
                          {order.shippingAddress.postalCode && (
                            <>{order.shippingAddress.postalCode}</>
                          )}
                          {order.shippingAddress.phone && (
                            <> ({order.shippingAddress.phone})</>
                          )}
                        </>
                      ) : (
                        "N/A"
                      )}
                    </Typography>
                  </Box>
                  <Chip
                    label={getDisplayStatus(order.status)}
                    icon={statusStyles[normalizeStatus(order.status)]?.icon}
                    sx={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      px: 2,
                      py: 1,
                      mt: { xs: 2, sm: 0 },
                      backgroundColor: statusStyles[normalizeStatus(order.status)]?.bg,
                      color: statusStyles[normalizeStatus(order.status)]?.color,
                      "& .MuiChip-icon": {
                        color: statusStyles[normalizeStatus(order.status)]?.color,
                      },
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                    mb: 1,
                  }}
                >
                  {order.orderItems.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Avatar
                        src={getImageUrl(
                          item.image || (item.product && item.product.image)
                        )}
                        alt={item.name}
                        sx={{
                          width: { xs: 64, md: 56 },
                          height: { xs: 64, md: 56 },
                          borderRadius: 2,
                          bgcolor: "#fafafa",
                          border: "1px solid #eee",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: cardColors.text,
                          maxWidth: 100,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </Typography>
                      {item.returnStatus === "return_rejected" && (
                        <Chip
                          label="Return Rejected"
                          color="error"
                          size="small"
                          sx={{ ml: 1, fontWeight: 600 }}
                        />
                      )}
                      {item.returnStatus === "approved" && (
                        <Chip
                          label="Return Accepted"
                          color="success"
                          size="small"
                          sx={{ ml: 1, fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ViewIcon />}
                    sx={{
                      fontWeight: 600,
                      minWidth: 120,
                      borderColor: matteColors[900],
                      color: matteColors[900],
                      backgroundColor: "white",
                      py: { xs: 0.7, md: 1 },
                      px: { xs: 2, md: 3 },
                      fontSize: { xs: "0.92rem", md: "0.98rem" },
                      borderRadius: 10,
                      minHeight: { xs: 36, md: 42 },
                      textTransform: "none",
                      alignSelf: "center",
                      whiteSpace: "nowrap",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      "&:hover": {
                        backgroundColor: matteColors[100],
                        borderColor: matteColors[800],
                        color: matteColors[800],
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
                      },
                    }}
                    onClick={() => handleViewDetails(order)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ShippingIcon />}
                    sx={{
                      backgroundColor: matteColors[900],
                      color: "white",
                      fontWeight: 600,
                      minWidth: 120,
                      py: { xs: 0.7, md: 1 },
                      px: { xs: 2, md: 3 },
                      fontSize: { xs: "0.92rem", md: "0.98rem" },
                      borderRadius: 10,
                      minHeight: { xs: 36, md: 42 },
                      textTransform: "none",
                      alignSelf: "center",
                      whiteSpace: "nowrap",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      "&:hover": {
                        backgroundColor: matteColors[800],
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      },
                    }}
                    onClick={() => handleTrackOrder(order)}
                  >
                    Track Order
                  </Button>
                  {(normalizeStatus(order.status) === "pending" ||
                    normalizeStatus(order.status) === "processing") && (
                    <Button
                      variant="contained"
                      startIcon={<CloseIcon />}
                      sx={{
                        backgroundColor: "#d32f2f",
                        color: "white",
                        fontWeight: 600,
                        minWidth: 120,
                        py: { xs: 0.7, md: 1 },
                        px: { xs: 2, md: 3 },
                        fontSize: { xs: "0.92rem", md: "0.98rem" },
                        borderRadius: 10,
                        minHeight: { xs: 36, md: 42 },
                        textTransform: "none",
                        alignSelf: "center",
                        whiteSpace: "nowrap",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        "&:hover": {
                          backgroundColor: "#b71c1c",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                      }}
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {normalizeStatus(order.status) === "delivered" && (
                    <Button
                      variant="contained"
                      startIcon={<ExchangeIcon />}
                      sx={{
                        backgroundColor: matteColors[900],
                        color: "white",
                        fontWeight: 600,
                        minWidth: 170,
                        py: { xs: 0.7, md: 1 },
                        px: { xs: 2, md: 3 },
                        fontSize: { xs: "0.92rem", md: "0.98rem" },
                        borderRadius: 10,
                        minHeight: { xs: 36, md: 42 },
                        textTransform: "none",
                        alignSelf: "center",
                        whiteSpace: "nowrap",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        "&:hover": {
                          backgroundColor: matteColors[800],
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                      }}
                      onClick={() =>
                        handleOpenReturnDialog(order._id, order.orderItems[0], 0)
                      }
                      disabled={order.orderItems[0].returnStatus}
                    >
                      Return
                    </Button>
                  )}
                </Box>
              </Paper>
            )}
          </Grid>
        ))}
      </Grid>

      {/* View Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Order #{selectedOrder._id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Placed on: {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Delivery Address:{" "}
                {selectedOrder.shippingAddress ? (
                  <>
                    {selectedOrder.shippingAddress.name && (
                      <>{selectedOrder.shippingAddress.name}, </>
                    )}
                    {selectedOrder.shippingAddress.address && (
                      <>{selectedOrder.shippingAddress.address}, </>
                    )}
                    {selectedOrder.shippingAddress.city && (
                      <>{selectedOrder.shippingAddress.city}, </>
                    )}
                    {selectedOrder.shippingAddress.state && (
                      <>{selectedOrder.shippingAddress.state}, </>
                    )}
                    {selectedOrder.shippingAddress.postalCode && (
                      <>{selectedOrder.shippingAddress.postalCode}</>
                    )}
                    {selectedOrder.shippingAddress.phone && (
                      <> ({selectedOrder.shippingAddress.phone})</>
                    )}
                  </>
                ) : (
                  "N/A"
                )}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Products
              </Typography>
              {selectedOrder.orderItems.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
                >
                  <Avatar
                    src={getImageUrl(
                      item.image || (item.product && item.product.image)
                    )}
                    alt={item.name}
                    sx={{
                      width: { xs: 56, md: 48 },
                      height: { xs: 56, md: 48 },
                      borderRadius: 2,
                      bgcolor: "#fafafa",
                      border: "1px solid #eee",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qty: {item.qty} | Price: ₹{item.price}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Total: ₹{selectedOrder.totalPrice}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                Status:{" "}
                <Chip
                  label={getDisplayStatus(selectedOrder.status)}
                  icon={statusStyles[normalizeStatus(selectedOrder.status)]?.icon}
                  size="small"
                  sx={{
                    backgroundColor: statusStyles[normalizeStatus(selectedOrder.status)]?.bg,
                    color: statusStyles[normalizeStatus(selectedOrder.status)]?.color,
                    "& .MuiChip-icon": {
                      color: statusStyles[normalizeStatus(selectedOrder.status)]?.color,
                    },
                  }}
                />
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: matteColors[900],
              color: "white",
              fontWeight: 600,
              borderRadius: 10,
              py: { xs: 0.7, md: 1 },
              px: { xs: 2, md: 3 },
              fontSize: { xs: "0.92rem", md: "0.98rem" },
              minHeight: { xs: 36, md: 42 },
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: matteColors[800],
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Track Order Dialog */}
      <Dialog open={trackOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Track Order</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              {/* Log status for debugging */}
              {console.log("Tracking order status:", selectedOrder.status)}
              <Stepper
                activeStep={getStepperIndex(selectedOrder.status)}
                orientation="vertical"
              >
                {trackingSteps.map((label, idx) => (
                  <Step
                    key={label}
                    completed={idx <= getStepperIndex(selectedOrder.status)}
                  >
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Current Status:{" "}
                  <Chip
                    label={getDisplayStatus(selectedOrder.status)}
                    icon={statusStyles[normalizeStatus(selectedOrder.status)]?.icon}
                    size="small"
                    sx={{
                      backgroundColor: statusStyles[normalizeStatus(selectedOrder.status)]?.bg,
                      color: statusStyles[normalizeStatus(selectedOrder.status)]?.color,
                      "& .MuiChip-icon": {
                        color: statusStyles[normalizeStatus(selectedOrder.status)]?.color,
                      },
                    }}
                  />
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: matteColors[900],
              color: "white",
              fontWeight: 600,
              borderRadius: 10,
              py: { xs: 0.7, md: 1 },
              px: { xs: 2, md: 3 },
              fontSize: { xs: "0.92rem", md: "0.98rem" },
              minHeight: { xs: 36, md: 42 },
              textTransform: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: matteColors[800],
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return/Exchange Dialog */}
      <Dialog
        open={returnDialogOpen}
        onClose={handleCloseReturnDialog}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={handleSubmitReturn}>
          <DialogTitle>Return - {returnItem?.item?.name}</DialogTitle>
          <DialogContent dividers>
            <TextField
              select
              label="Reason"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="Wrong size">Wrong size</MenuItem>
              <MenuItem value="Damaged">Damaged</MenuItem>
              <MenuItem value="Not as described">Not as described</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Additional Comments"
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseReturnDialog}
              variant="outlined"
              sx={{
                borderColor: matteColors[900],
                color: matteColors[900],
                fontWeight: 600,
                borderRadius: 10,
                py: { xs: 0.7, md: 1 },
                px: { xs: 2, md: 3 },
                fontSize: { xs: "0.92rem", md: "0.98rem" },
                minHeight: { xs: 36, md: 42 },
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: matteColors[100],
                  borderColor: matteColors[800],
                  color: matteColors[800],
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: matteColors[900],
                color: "white",
                fontWeight: 600,
                borderRadius: 10,
                py: { xs: 0.7, md: 1 },
                px: { xs: 2, md: 3 },
                fontSize: { xs: "0.92rem", md: "0.98rem" },
                minHeight: { xs: 36, md: 42 },
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: matteColors[800],
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
                "&:disabled": {
                  backgroundColor: matteColors[600],
                  color: "white",
                  transform: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                },
              }}
              disabled={!returnReason}
            >
              Submit Return
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 2000 }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default Orders;